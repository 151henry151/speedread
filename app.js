(function () {
  'use strict';

  const PDF_JS_LOCAL = 'pdf.min.js';
  const PDF_WORKER_LOCAL = 'pdf.worker.min.js';

  function waitForPdfJs(timeoutMs) {
    timeoutMs = timeoutMs || 6000;
    return new Promise(function (resolve) {
      if (typeof pdfjsLib !== 'undefined') return resolve(true);
      var start = Date.now();
      var t = setInterval(function () {
        if (typeof pdfjsLib !== 'undefined') {
          clearInterval(t);
          return resolve(true);
        }
        if (Date.now() - start >= timeoutMs) {
          clearInterval(t);
          resolve(false);
        }
      }, 50);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Failed to load PDF.js')); };
      document.head.appendChild(script);
    });
  }

  function ensurePdfJs() {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_LOCAL;
      return Promise.resolve();
    }
    return waitForPdfJs(5000).then(function (ready) {
      if (ready) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_LOCAL;
        return;
      }
      return loadScript(PDF_JS_LOCAL).then(function () {
        if (typeof pdfjsLib !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_LOCAL;
          return;
        }
        throw new Error('PDF.js did not load');
      });
    });
  }

  const textInput = document.getElementById('text-input');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const readerEl = document.getElementById('reader');
  const wordDisplay = document.getElementById('word-display');
  const highlightCenterCheck = document.getElementById('highlight-center');
  const wpmSlider = document.getElementById('wpm');
  const wpmValue = document.getElementById('wpm-value');
  const fontSizeSlider = document.getElementById('font-size');
  const fontSizeValue = document.getElementById('font-size-value');
  const skipBackBtn = document.getElementById('skip-back');
  const playPauseBtn = document.getElementById('play-pause');
  const skipForwardBtn = document.getElementById('skip-forward');

  let words = [];
  let index = 0;
  let timerId = null;
  let isPlaying = false;
  let hideControlsTimer = null;
  const HIDE_CONTROLS_DELAY_MS = 2500;

  function getWordsFromText(text) {
    if (!text || !text.trim()) return [];
    return text.trim().split(/\s+/).filter(Boolean);
  }

  function showReader() {
    readerEl.classList.remove('hidden');
  }

  function hideReader() {
    readerEl.classList.add('hidden');
  }

  var PAD_CHAR = 'a';

  function renderWord() {
    if (words.length === 0) return;
    let word = words[index];
    var padded = false;
    const highlight = highlightCenterCheck.checked && word.length > 0;
    if (highlight && word.length > 0 && word.length % 2 === 0) {
      word = word + PAD_CHAR;
      padded = true;
    }
    let html = '';
    if (highlight && word.length > 0) {
      const center = Math.floor(word.length / 2);
      const before = word.slice(0, center);
      const letter = word[center];
      const after = word.slice(center + 1);
      var afterHtml = padded
        ? escapeHtml(after.slice(0, -1)) + '<span class="word-pad">' + escapeHtml(after.slice(-1)) + '</span>'
        : escapeHtml(after);
      html = '<span class="word-before">' + escapeHtml(before) + '</span>' +
             '<span class="word-center"><span class="center-letter">' + escapeHtml(letter) + '</span></span>' +
             '<span class="word-after">' + afterHtml + '</span>';
    } else {
      html = escapeHtml(word);
    }
    wordDisplay.innerHTML = html;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function msPerWord() {
    const wpm = Number(wpmSlider.value) || 300;
    return (60 * 1000) / wpm;
  }

  function tick() {
    if (index >= words.length - 1) {
      stop();
      return;
    }
    index += 1;
    renderWord();
    if (isPlaying) scheduleNext();
  }

  function scheduleNext() {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(tick, msPerWord());
  }

  function play() {
    if (words.length === 0) return;
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    renderWord();
    scheduleNext();
    showReader();
    controls.classList.add('playback-overlay');
    scheduleHideControls();
  }

  function pause() {
    isPlaying = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    playPauseBtn.textContent = 'Play';
    controls.classList.remove('playback-overlay');
    showControls();
  }

  function stop() {
    pause();
  }

  function skipBack() {
    if (words.length === 0) return;
    if (timerId) clearTimeout(timerId);
    timerId = null;
    index = Math.max(0, index - 1);
    renderWord();
    if (isPlaying) scheduleNext();
    showControls();
  }

  function skipForward() {
    if (words.length === 0) return;
    if (timerId) clearTimeout(timerId);
    timerId = null;
    index = Math.min(words.length - 1, index + 1);
    renderWord();
    if (isPlaying) scheduleNext();
    showControls();
  }

  function startFromInput() {
    const text = textInput.value.trim();
    words = getWordsFromText(text);
    index = 0;
    if (words.length > 0) {
      renderWord();
      showReader();
      play();
    }
  }

  function applyFontSize() {
    const size = Number(fontSizeSlider.value) || 48;
    wordDisplay.style.fontSize = size + 'px';
    fontSizeValue.textContent = size;
  }

  function showControls() {
    controls.classList.remove('hidden');
    if (isPlaying) {
      controls.classList.add('playback-overlay');
    } else {
      controls.classList.remove('playback-overlay');
    }
    if (hideControlsTimer) {
      clearTimeout(hideControlsTimer);
      hideControlsTimer = null;
    }
  }

  function scheduleHideControls() {
    if (hideControlsTimer) clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
      if (isPlaying) {
        controls.classList.add('hidden');
        controls.classList.remove('playback-overlay');
      }
      hideControlsTimer = null;
    }, HIDE_CONTROLS_DELAY_MS);
  }

  // ----- Event listeners -----
  highlightCenterCheck.addEventListener('change', renderWord);

  wpmSlider.addEventListener('input', () => {
    wpmValue.textContent = wpmSlider.value;
    if (isPlaying && timerId) {
      clearTimeout(timerId);
      scheduleNext();
    }
  });

  fontSizeSlider.addEventListener('input', () => {
    applyFontSize();
    fontSizeValue.textContent = fontSizeSlider.value;
  });

  playPauseBtn.addEventListener('click', () => {
    if (words.length === 0) startFromInput();
    else if (isPlaying) pause();
    else play();
  });

  skipBackBtn.addEventListener('click', () => {
    if (words.length > 0) skipBack();
  });

  skipForwardBtn.addEventListener('click', () => {
    if (words.length > 0) skipForward();
  });

  document.addEventListener('keydown', (e) => {
    if (readerEl.classList.contains('hidden')) return;
    showControls();
    if (e.code === 'Space') {
      e.preventDefault();
      if (words.length === 0) startFromInput();
      else if (isPlaying) pause();
      else play();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      skipBack();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      skipForward();
    }
  });

  let lastMove = 0;
  document.addEventListener('mousemove', () => {
    if (!isPlaying) return;
    lastMove = Date.now();
    showControls();
    scheduleHideControls();
  });

  // File upload
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = (file.name || '').toLowerCase();
    try {
      if (name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPdf(arrayBuffer);
        textInput.value = text;
      } else {
        const text = await file.text();
        textInput.value = text;
      }
    } catch (err) {
      textInput.value = 'Error reading file: ' + (err.message || String(err));
    }
    fileInput.value = '';
  });

  async function extractTextFromPdf(arrayBuffer) {
    await ensurePdfJs();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const parts = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str || '');
      parts.push(strings.join(' '));
    }
    return parts.join('\n');
  }

  // Start with first word when we have content and user clicks play
  applyFontSize();
  wpmValue.textContent = wpmSlider.value;
})();
