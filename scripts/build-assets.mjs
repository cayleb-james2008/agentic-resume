import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'js/build');
const fonts = resolve(root, 'assets/fonts');
const licenses = resolve(root, 'assets/licenses');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(fonts, { recursive: true });
await mkdir(licenses, { recursive: true });

const inputs = [
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2'],
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2'],
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-700-normal.woff2'],
  ['@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2'],
  ['@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2'],
];
for (const [packageName, file] of inputs) {
  await copyFile(resolve(root, 'node_modules', packageName, 'files', file), resolve(fonts, file));
}

for (const [packageName, file, outputName] of [
  ['animejs', 'LICENSE.md', 'animejs-MIT.md'],
  ['@awesome.me/webawesome', 'LICENSE.md', 'webawesome-MIT.md'],
  ['@fontsource/ibm-plex-sans', 'LICENSE', 'ibm-plex-sans-OFL.txt'],
  ['@fontsource/ibm-plex-mono', 'LICENSE', 'ibm-plex-mono-OFL.txt'],
]) {
  await copyFile(resolve(root, 'node_modules', packageName, file), resolve(licenses, outputName));
}

const result = await build({
  entryPoints: [resolve(root, 'js/motion.js'), resolve(root, 'js/ui.js')],
  outdir: output,
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning',
});
for (const file of Object.keys(result.metafile.outputs)) {
  const size = (await stat(file)).size;
  console.log(`${file.replace(root + '/', '')}: ${(size / 1024).toFixed(1)} KiB`);
}
