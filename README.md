# SpeedRead

A simple one-page web app for speed-reading: paste text or upload a document, then read one word at a time with optional center-letter highlighting.

## How to use

1. Open `index.html` in a modern browser (or serve the folder with any static server).
2. Paste text into the text area, or upload a PDF, TXT, or other text file.
3. Optionally adjust **Words per minute**, **Font size**, and **Highlight center letter**.
4. Click **Play** (or press Space) to start. Use **Pause** / **Play** and **← Back** / **Forward →** (or Left/Right arrows) as needed.
5. During playback, controls auto-hide after a few seconds; move the mouse or press any key to bring them back.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ← | Previous word |
| → | Next word |

## Supported files

- **PDF** (text is extracted in-browser via PDF.js)
- **TXT, MD, HTML, XML, JSON, CSV** (read as plain text)

## Tech

- Plain HTML, CSS, and JavaScript.
- [PDF.js](https://mozilla.github.io/pdf.js/) (loaded from CDN) for PDF text extraction.

## License

GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE).

## Version

1.3.0 — see [CHANGELOG.md](CHANGELOG.md).
