import { describe, expect, it } from 'vitest';
import photos from 'virtual:photo-sources';
import manifest from './photo-manifest.json';
import { galleryPhotos } from './gallery';

describe('fuentes fotográficas de ejecución', () => {
  it('conserva exactamente todas las resoluciones sin distribuir metadatos de auditoría', () => {
    for (const original of manifest) {
      const photo = galleryPhotos.find(candidate => candidate.id === original.id)!;
      expect([photo.width, photo.height]).toEqual([original.width, original.height]);
      expect(photo.src).toContain(original.fallback);
      expect(photo.thumbnail).toContain(original.thumbnail);
      for (const variant of original.variants) {
        if (!['avif', 'webp'].includes(variant.format) || variant.file.includes('thumb')) continue;
        const source = photo.sources.find(candidate => candidate.type === `image/${variant.format}`);
        expect(source?.srcSet).toContain(`${variant.file} ${variant.width}w`);
      }
    }
    expect(JSON.stringify(photos)).not.toContain('sha256');
    expect(JSON.stringify(photos)).not.toContain('bytes');
  });
});
