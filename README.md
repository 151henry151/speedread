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

## Browser extension (Chrome, Firefox, Safari)

The `extension/` folder is a **Manifest V3** WebExtension that speed-reads the **current tab**.

- **HTML articles:** main text is extracted with Mozilla [**Readability**](https://github.com/mozilla/readability) (with fallbacks), then the reader opens in a **new tab** (text is passed via `storage.session`). Embedding the reader in an iframe was blocked on many sites by **Content-Security-Policy** (`frame-src`), which showed a blank/black area.
- **PDF files (direct `http`/`https` URL ending in `.pdf`):** the built-in PDF viewer does not run normal content scripts, so the extension **fetches the PDF from the tab URL** in the background, extracts text with PDF.js, and opens the reader in a **new tab** (text is passed via `storage.session`). Scanned/image-only PDFs may yield little or no text. PDFs without `.pdf` in the URL (or opened from `file://`) can still be read via **Upload** in the reader.

Use the toolbar button or the shortcut **Alt+Shift+S** (configurable under extension shortcuts).

**Firefox / Firefox for Android (AMO listing):** the manifest targets **Firefox 140+** on desktop and **Firefox for Android 142+** (required for Mozilla’s data consent fields and Android listing).

**Firefox toolbar icon:** new extensions appear in the **extensions menu** (puzzle piece on the right), not on the bar, until you pin them. Open that menu → find **SpeedRead** → click the **pin** beside it (or use **⋯** / gear → **Pin to Toolbar**). Optional: **Add-ons** → SpeedRead → **Preferences** opens a short page with the same steps.

**Build the extension** (copies the latest `app.js` / `styles.css` from the repo root and bundles the content script):

```bash
cd extension && npm install && npm run build
```

Then load the unpacked folder:

- **Chrome / Chromium / Edge:** `chrome://extensions` → Developer mode → **Load unpacked** → choose the `extension/` directory.
- **Firefox:** `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `extension/manifest.json`.

**Safari** does not load unpacked WebExtensions directly. On a Mac with Xcode, convert the same `extension/` folder:

```bash
xcrun safari-web-extension-converter /path/to/speedread-1/extension
```

Open the generated Xcode project, enable the Safari extension target, and run to sign and install (Apple Developer account required for distribution outside your machine).

Restricted pages (e.g. `chrome://`, `about:`, the browser store) cannot run the extension; use the standalone web app there. **PDFs** must be reachable at an **http(s) URL whose path ends in `.pdf`** for automatic extraction; otherwise use upload in the reader.

## License

GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE).

## Version

1.6.1 — see [CHANGELOG.md](CHANGELOG.md).
