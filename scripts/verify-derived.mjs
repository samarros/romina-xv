import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const photos = JSON.parse(await readFile(new URL('../src/data/photo-manifest.json', import.meta.url), 'utf8'));
let count = 0;
for (const photo of photos) {
  for (const variant of photo.variants) {
    const bytes = await readFile(new URL(`../src/assets/photos/${variant.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
    assert.equal(bytes.length, variant.bytes);
    const info = await sharp(bytes).metadata();
    assert.equal(info.width, variant.width);
    assert.equal(info.height, variant.height);
    assert.ok(info.width <= photo.width);
    assert.ok(Math.abs(info.width / info.height - photo.width / photo.height) < .002);
    assert.ok(!info.exif && !info.xmp, `Metadatos privados en ${variant.file}`);
    await sharp(bytes).raw().toBuffer(); // Decodificar realmente cada derivado.
    count++;
  }
}
console.log(`OK ${photos.length} fotografías, ${count} derivados: hashes, decodificación, dimensiones, proporción y ausencia de EXIF/XMP`);
const fontsDir = new URL('../src/assets/fonts/', import.meta.url);
const fonts = JSON.parse(await readFile(new URL('manifest.json', fontsDir), 'utf8'));
for (const font of fonts) {
  const bytes = await readFile(new URL(font.file, fontsDir));
  assert.equal(bytes.toString('ascii', 0, 4), 'wOF2');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256);
  const license = await readFile(new URL(`${font.key}-OFL.txt`, fontsDir), 'utf8');
  assert.ok(license.includes('SIL OPEN FONT LICENSE Version 1.1'));
  assert.equal(await readFile(new URL(`../public/licenses/fonts/${font.key}-OFL.txt`, import.meta.url), 'utf8'), license);
}
console.log('OK 3 fuentes WOFF2 locales, hashes y licencias OFL 1.1');
