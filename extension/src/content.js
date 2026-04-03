import { Readability } from '@mozilla/readability';

/**
 * Extract article text and ask the background to open the reader in a new tab.
 * We do not embed reader/reader.html in an iframe: many sites use CSP frame-src that
 * blocks moz-extension:/chrome-extension: URLs, which produces a blank/black iframe.
 */
function extractArticleText() {
  var title = document.title || '';
  var text = '';
  try {
    var clone = document.cloneNode(true);
    var article = new Readability(clone).parse();
    if (article && article.textContent && article.textContent.trim().length > 80) {
      title = article.title || title;
      text = article.textContent.trim();
      return { title: title, text: text, source: 'readability' };
    }
  } catch (e) {
    /* fall through */
  }
  var el =
    document.querySelector('article') ||
    document.querySelector('main') ||
    document.querySelector('[role="main"]');
  if (el && el.innerText && el.innerText.trim().length > 80) {
    return { title: title, text: el.innerText.trim(), source: 'main-article' };
  }
  var body = document.body;
  if (body && body.innerText) {
    text = body.innerText.trim();
    if (text.length > 500000) text = text.slice(0, 500000);
    return { title: title, text: text, source: 'body' };
  }
  return { title: title, text: '', source: 'empty' };
}

function run() {
  var payload = extractArticleText();
  if (!payload.text || payload.text.length < 20) {
    alert(
      'SpeedRead could not find enough article text on this page. Try a page with a main article or use Upload in the reader.'
    );
    return;
  }

  var ext =
    typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage
      ? browser
      : typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage
        ? chrome
        : null;

  if (!ext) {
    alert('SpeedRead: extension API unavailable.');
    return;
  }

  var p = ext.runtime.sendMessage({
    type: 'SPEEDREAD_HTML',
    title: payload.title || document.title || 'SpeedRead',
    text: payload.text,
  });

  if (p && typeof p.then === 'function') {
    p.catch(function (err) {
      console.error('SpeedRead:', err);
      alert('SpeedRead could not open the reader tab. Try again.');
    });
  }
}

run();
