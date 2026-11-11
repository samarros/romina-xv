import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const rootFiles = new Set(['index.html', 'favicon.svg', 'share-preview.png', 'version.json']);
const licenseFiles = new Set(['licenses/gsap-notice.txt', 'licenses/fonts/great-vibes-OFL.txt', 'licenses/fonts/cormorant-garamond-OFL.txt', 'licenses/fonts/montserrat-OFL.txt']);
async function walk(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await walk(`${dir}/${entry.name}`, `${path}/`));
    else { assert.ok(entry.isFile(), `Enlace/archivo especial no permitido: ${path}`); files.push(path); }
  }
  return files;
}
const files = await walk('dist');
for (const file of files) assert.ok(rootFiles.has(file) || licenseFiles.has(file) || /^assets\/[\w.-]+\.(?:js|css|woff2|avif|webp|jpeg|m4a)$/.test(file), `Archivo no permitido: ${file}`);
for (const required of [...rootFiles, ...licenseFiles]) assert.ok(files.includes(required), `Falta ${required}`);
const html = await readFile('dist/index.html', 'utf8');
assert.ok(html.includes('rel="canonical" href="https://samarros.github.io/romina-xv/"'));
assert.ok(html.includes('property="og:image" content="https://samarros.github.io/romina-xv/share-preview.png"'));
for (const match of html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)) await stat(`dist/${match[1].slice(2)}`);
const manifest = JSON.parse(await readFile('docs/assets-manifest.json', 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const music = await readFile('src/assets/audio/celebration.m4a');
assert.equal(hash(music), manifest.find(asset => asset.name === 'thscientist.m4a').sha256);
const audioFiles = files.filter(file => file.endsWith('.m4a'));
assert.equal(audioFiles.length, 1);
assert.equal(hash(await readFile(`dist/${audioFiles[0]}`)), hash(music));
const originalImages = new Set(manifest.filter(asset => asset.width).map(asset => asset.sha256));
for (const file of files.filter(file => /\.(avif|webp|jpeg|png)$/.test(file))) assert.ok(!originalImages.has(hash(await readFile(`dist/${file}`))), `Imagen original en dist: ${file}`);
for (const file of files.filter(file => file.endsWith('.js') || file.endsWith('.html'))) {
  const code = await readFile(`dist/${file}`, 'utf8');
  assert.ok(!code.includes('Laboratorio de animaciones'), `Laboratorio incluido: ${file}`);
  assert.ok(!/(?:github_pat_|ghp_)[A-Za-z0-9_]{20,}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/.test(code), `Posible credencial en ${file}`);
}
const release = JSON.parse(await readFile('dist/version.json', 'utf8'));
assert.equal(release.repository, 'samarros/romina-xv');
if (process.env.GITHUB_SHA) assert.equal(release.commit, process.env.GITHUB_SHA);
console.log(`OK producción: ${files.length} archivos permitidos; un M4A íntegro; OG/canonical y recursos relativos; sin originales, auditorías, sourcemaps ni laboratorio`);
