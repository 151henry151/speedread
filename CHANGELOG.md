# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2026-04-03

### Changed

- Extension manifest: add `browser_specific_settings.gecko.data_collection_permissions` with `required: ["none"]` for AMO (Mozilla built-in data consent; extension does not transmit page or personal data to external servers).
- Extension manifest: set `browser_specific_settings.gecko.strict_min_version` to `140.0` so desktop Firefox supports `data_collection_permissions`.
- Extension manifest: add `browser_specific_settings.gecko_android` with `strict_min_version` `142.0` so the add-on is listed for **Firefox for Android** on AMO and meets Mozilla’s minimum for the same data consent fields on Android.

## [1.6.0] - 2026-04-03

### Changed

- Record extension testing status: the SpeedRead WebExtension has been tested on **Firefox** only; **Chrome** / **Chromium** / **Edge** and **Safari** have not been tested yet.

## [1.5.0] - 2026-04-03

### Added

- Browser extension in `extension/` (Manifest V3) for Chrome/Chromium/Edge and Firefox: toolbar action or shortcut opens a full-page overlay, extracts article content with Mozilla Readability (with fallbacks to `article` / `main` / page body), and loads the SpeedRead reader in an iframe with fullscreen and close controls.
- Extension PDF tabs: when the active tab URL is `http`/`https` and the path ends in `.pdf`, fetch PDF bytes in `background.js`, extract text with PDF.js (`disableWorker` in the service worker), pass text through `storage.session`, and open `reader/reader.html` in a new tab.
- Build step under `extension/` (`npm install` / `npm run build`) bundling the content script with esbuild, syncing `app.js` and `styles.css` into `extension/reader/`, and copying PDF.js legacy builds from `pdfjs-dist`.
- `extension/reader/boot.js` and `window.__SPEEDREAD_EXTENSION__` integration in `app.js` for iframe messaging (`SPEEDREAD_SET_TEXT`, `SPEEDREAD_CLOSE`), Escape-to-close behavior, and applying `speedreadPending` from `storage.session` when opening the reader from the PDF path.
- `storage` permission in the extension manifest for `chrome.storage.session` / `browser.storage.session`.
- Extension toolbar icons: add `icons/icon32.png` and `icons/icon96.png` and reference them in `manifest.json` for Firefox-friendly sizes; add `options_ui` with `options.html` explaining how to pin the extension to the Firefox toolbar.
- Extension HTML flow: open `reader/reader.html` in a new tab via `runtime.sendMessage` and `storage.session` instead of an iframe in the page, avoiding blank/black reader views when sites use CSP `frame-src` that blocks extension URLs.

### Changed

- Document Safari workflow via `xcrun safari-web-extension-converter` and Xcode in the README.

## [1.4.0] - 2025-02-26

### Fixed

- PDF upload: PDF.js is now self-hosted (same origin) so it loads reliably on desktop and mobile instead of failing when the CDN is blocked or slow.
- Center-letter highlight: the red center letter now stays in a fixed horizontal position for every word. Uses a strict monospace font (JetBrains Mono), a flex layout with a 1ch-wide center slot, and invisible character padding for even-length words so the center does not shift with word length or punctuation.

### Changed

- Word display uses JetBrains Mono (with monospace fallbacks) so every character has equal width.
- Even-length words are padded with an invisible character (transparent) so the center letter is truly centered; the previous trailing-space approach did not reserve width in all browsers.

## [1.3.0] - 2025-02-26

### Fixed

- PDF upload on mobile: PDF.js loaded on demand when not yet available.
- Center-letter positioning improvements (refined further in 1.4.0).

## [1.2.0] - 2025-02-26

### Changed

- Words-per-minute slider maximum increased from 600 to 1000 WPM.

### Added

- Project licensed under the GNU General Public License v3.0 (GPL-3.0); see [LICENSE](LICENSE).

## [1.1.0] - 2025-02-26

### Changed

- During playback, moving the mouse to show controls now shows only the reader controls (WPM, font size, highlight, play/pause, skip) in a bottom bar; the text input and file upload no longer appear.
- The word display stays visible when the playback controls are shown; controls appear as a semi-transparent bottom bar instead of covering the screen.

## [1.0.0] - 2025-02-26

### Added

- One-page speed-reading web app (SpeedRead).
- Text input for pasting large blocks of text.
- File upload for PDF, TXT, MD, HTML, XML, JSON, and CSV (text extracted in-browser; PDF via PDF.js).
- One-word-at-a-time display with word centered on screen.
- Optional highlight of the center letter of each word (toggle), in red (`#c44536`).
- Words-per-minute slider (60–600 WPM) and live value display.
- Font size slider (12–120 px).
- Play/Pause and Skip backward / Skip forward controls.
- Keyboard shortcuts: Space (play/pause), Left arrow (previous word), Right arrow (next word).
- Auto-hide controls during playback: controls fade out after a few seconds when the mouse is idle; they reappear on mouse move or any keypress.
