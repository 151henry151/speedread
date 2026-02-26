# SpeedRead

A simple one-page web app for speed-reading: paste text or upload a document, then read one word at a time with optional center-letter highlighting.

**Live app:** [https://hromp.com/speedread/](https://hromp.com/speedread/)

---

## How to use

1. Open the [live app](https://hromp.com/speedread/) or run `index.html` locally (in a modern browser or via any static server).
2. Paste text into the text area, or upload a PDF, TXT, or other supported file.
3. Adjust **Words per minute** (60–1000 WPM), **Font size**, and **Highlight center letter** if you like.
4. Click **Play** (or press Space) to start. Use **Pause** / **Play** and **← Back** / **Forward →** (or arrow keys) as needed.
5. During playback, controls auto-hide after a few seconds; move the mouse or press a key to bring them back.

## Keyboard shortcuts

| Key     | Action        |
|--------|----------------|
| Space  | Play / Pause   |
| ←      | Previous word  |
| →      | Next word      |

## Supported files

- **PDF** — text extracted in-browser (PDF.js, self-hosted or on-demand)
- **TXT, MD, HTML, XML, JSON, CSV** — read as plain text

## Tech

- Plain HTML, CSS, and JavaScript; no build step.
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF text extraction (bundled as `pdf.min.js` / `pdf.worker.min.js` in deployment, or load from CDN).
- Monospace font (JetBrains Mono) for the reader so the highlighted center letter stays in a fixed position at high WPM.

## License

GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE).

## Version

1.4.0 — see [CHANGELOG.md](CHANGELOG.md).
