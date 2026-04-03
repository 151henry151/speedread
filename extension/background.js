/**
 * SpeedRead background: HTML pages use injected content.js; PDF tabs are fetched
 * here (browser PDF viewers do not run normal content scripts) and text is sent
 * to the reader via chrome.storage.session.
 */
(function () {
  'use strict';

  function getApi() {
    return typeof browser !== 'undefined' ? browser : chrome;
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(url || '');
  }

  /** True when the tab URL clearly points at a PDF resource. */
  function urlLooksLikePdf(url) {
    if (!url || !isHttpUrl(url)) return false;
    try {
      var u = new URL(url);
      var path = u.pathname || '';
      return /\.pdf$/i.test(path) || /[/.]pdf(?:$|[?#])/i.test(path + (u.search || ''));
    } catch (e) {
      return /\.pdf($|[?#])/i.test(url);
    }
  }

  function ensurePdfJsLoaded() {
    return new Promise(function (resolve, reject) {
      if (typeof pdfjsLib !== 'undefined') {
        var api = getApi();
        pdfjsLib.GlobalWorkerOptions.workerSrc = api.runtime.getURL('reader/pdf.worker.min.js');
        return resolve();
      }
      if (typeof importScripts === 'function' && typeof document === 'undefined') {
        try {
          importScripts('reader/pdf.min.js');
        } catch (err) {
          return reject(err);
        }
        if (typeof pdfjsLib !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = getApi().runtime.getURL('reader/pdf.worker.min.js');
          return resolve();
        }
        return reject(new Error('PDF.js did not load in service worker'));
      }
      if (typeof document !== 'undefined' && document.createElement) {
        var s = document.createElement('script');
        s.src = getApi().runtime.getURL('reader/pdf.min.js');
        s.onload = function () {
          if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = getApi().runtime.getURL('reader/pdf.worker.min.js');
            resolve();
          } else {
            reject(new Error('pdfjsLib missing'));
          }
        };
        s.onerror = function () {
          reject(new Error('Failed to load PDF.js'));
        };
        document.head.appendChild(s);
        return;
      }
      reject(new Error('Cannot load PDF.js in this background context'));
    });
  }

  function extractTextFromPdfBuffer(arrayBuffer) {
    return ensurePdfJsLoaded().then(function () {
      return pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var parts = [];
      var i = 1;
      function nextPage() {
        if (i > numPages) {
          return parts.join('\n');
        }
        return pdf
          .getPage(i)
          .then(function (page) {
            return page.getTextContent();
          })
          .then(function (content) {
            var strings = content.items.map(function (item) {
              return item.str || '';
            });
            parts.push(strings.join(' '));
            i += 1;
            return nextPage();
          });
      }
      return nextPage();
    });
  }

  function storageSessionSet(data) {
    var api = getApi();
    if (api.storage && api.storage.session) {
      return api.storage.session.set(data);
    }
    return Promise.resolve();
  }

  function openReaderWithPending(pending) {
    var api = getApi();
    return storageSessionSet({ speedreadPending: pending }).then(function () {
      return api.tabs.create({ url: api.runtime.getURL('reader/reader.html') });
    });
  }

  function looksLikePdfBytes(buf) {
    if (!buf || buf.byteLength < 4) return false;
    var a = new Uint8Array(buf.slice(0, 4));
    return a[0] === 0x25 && a[1] === 0x50 && a[2] === 0x44 && a[3] === 0x46;
  }

  function fetchPdfArrayBuffer(url) {
    return fetch(url, { credentials: 'include', mode: 'cors', cache: 'no-store' }).then(function (res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return res.arrayBuffer();
    }).then(function (buf) {
      if (!looksLikePdfBytes(buf)) {
        throw new Error('The response does not look like a PDF file.');
      }
      return buf;
    });
  }

  /**
   * PDF tab: fetch bytes from tab URL (works with activeTab temporary host access on user gesture).
   */
  function handlePdfTab(tab) {
    var url = tab.url || '';
    var title = tab.title || 'PDF';
    return fetchPdfArrayBuffer(url)
      .then(function (buf) {
        return extractTextFromPdfBuffer(buf);
      })
      .then(function (text) {
        var trimmed = (text || '').trim();
        if (trimmed.length < 20) {
          throw new Error('Almost no text found in this PDF (it may be scanned images only).');
        }
        return openReaderWithPending({
          title: title,
          text: trimmed,
          source: 'pdf',
        });
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : String(err);
        return openReaderWithPending({
          title: 'PDF',
          text: 'SpeedRead could not read this PDF: ' + msg + '\n\nYou can download the file and use Upload in the reader, or open the PDF in a tab whose address bar shows a direct http(s) link to the .pdf file.',
          source: 'pdf-error',
        });
      });
  }

  function maybePdfThenHtml(tab) {
    if (!tab || tab.id == null) return;
    var url = tab.url || '';

    if (isHttpUrl(url) && urlLooksLikePdf(url)) {
      handlePdfTab(tab);
      return;
    }

    runOnTab(tab.id);
  }

  function runOnTab(tabId) {
    var api = getApi();
    api.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
    }).catch(function (err) {
      console.error('SpeedRead:', err);
    });
  }

  function onMessage(msg, _sender, sendResponse) {
    if (!msg || msg.type !== 'SPEEDREAD_HTML') {
      return false;
    }
    var title = msg.title || 'SpeedRead';
    var text = msg.text != null ? String(msg.text) : '';
    openReaderWithPending({
      title: title,
      text: text,
      source: 'html',
    })
      .then(function () {
        if (sendResponse) {
          sendResponse({ ok: true });
        }
      })
      .catch(function (err) {
        console.error('SpeedRead:', err);
        if (sendResponse) {
          sendResponse({ ok: false, error: String(err && err.message ? err.message : err) });
        }
      });
    return true;
  }

  var api = getApi();
  if (api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener(onMessage);
  }

  function onClicked(tab) {
    maybePdfThenHtml(tab);
  }

  if (typeof browser !== 'undefined' && browser.action && browser.action.onClicked) {
    browser.action.onClicked.addListener(onClicked);
  } else if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener(onClicked);
  }
})();
