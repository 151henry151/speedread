import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function main() {
  await esbuild.build({
    entryPoints: [join(__dirname, 'src', 'content.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    outfile: join(__dirname, 'content.js'),
    legalComments: 'none',
  });

  const readerDir = join(__dirname, 'reader');
  mkdirSync(readerDir, { recursive: true });

  copyFileSync(join(root, 'app.js'), join(readerDir, 'app.js'));
  copyFileSync(join(root, 'styles.css'), join(readerDir, 'styles.css'));

  const pdfDir = join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build');
  const pdfMin = join(pdfDir, 'pdf.min.js');
  const worker = join(pdfDir, 'pdf.worker.min.js');
  if (!existsSync(pdfMin)) {
    console.error('Run npm install in extension/ first.');
    process.exit(1);
  }
  copyFileSync(pdfMin, join(readerDir, 'pdf.min.js'));
  copyFileSync(worker, join(readerDir, 'pdf.worker.min.js'));

  console.log('Build OK: content.js + reader assets synced.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
