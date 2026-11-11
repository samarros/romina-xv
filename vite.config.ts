import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Un solo manifiesto de integridad; el navegador recibe únicamente campos de presentación.
const photoManifest = new URL('./src/data/photo-manifest.json', import.meta.url);
type PhotoSource = { id: number; width: number; height: number; fallback: string; thumbnail: string; variants: { file: string; format: string; width: number }[] };

export default defineConfig({
  plugins: [{
    name: 'photo-sources',
    resolveId(id) { if (id === 'virtual:photo-sources') return '\0photo-sources'; },
    load(id) {
      if (id !== '\0photo-sources') return;
      this.addWatchFile(fileURLToPath(photoManifest));
      const photos = JSON.parse(readFileSync(photoManifest, 'utf8')) as PhotoSource[];
      return `export default ${JSON.stringify(photos.map(({ id, width, height, fallback, thumbnail, variants }) => ({ id, width, height, fallback, thumbnail, variants: variants.map(({ file, format, width }) => ({ file, format, width })) })))}`;
    },
  }, {
    name: 'release-version',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ repository: 'samarros/romina-xv', commit: process.env.GITHUB_SHA || 'local-preview' }) + '\n' });
    },
  }, react()],
  // Recursos relativos: compatible con la futura subruta de GitHub Pages.
  base: './',
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
