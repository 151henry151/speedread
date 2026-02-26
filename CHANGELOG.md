# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-02-26

### Fixed

- PDF upload on mobile: PDF.js is now loaded on demand if not yet available, fixing "PDF.js is not loaded" when selecting a PDF before the script has finished loading.
- Center-letter highlight: the highlighted letter is now fixed at the same horizontal position on screen for every word (no shift with word length or character width).

### Changed

- Word display uses a positioned wrapper so the center letter stays visually centered when "Highlight center letter" is on.

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
