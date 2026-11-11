import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const baseline = JSON.parse(await readFile(new URL('../docs/assets-manifest.json', import.meta.url), 'utf8'));
const dir = new URL('../dist/assets/', import.meta.url);
const files = await readdir(dir);
const audio = files.filter(file => file.endsWith('.m4a'));
assert.equal(audio.length, 1);
const bytes = await readFile(new URL(audio[0], dir));
const expected = baseline.find(asset => asset.name === 'thscientist.m4a');
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
assert.equal(hash(bytes), expected.sha256);
assert.equal(bytes.length, expected.bytes);
const originalImages = new Set(baseline.filter(asset => asset.width).map(asset => asset.sha256));
for (const file of files.filter(file => /\.(jpeg|webp|avif|png)$/.test(file))) {
  assert.ok(!originalImages.has(hash(await readFile(new URL(file, dir)))), `Se copió una imagen original: ${file}`);
}
console.log(`OK audio del build idéntico al original (${bytes.length} bytes, SHA-256 ${expected.sha256}); sin fotos originales ni propuesta en dist`);
