import manifest from 'virtual:photo-sources';

const assets = import.meta.glob<string>('../assets/photos/*', { eager: true, query: '?url', import: 'default' });
function url(file: string) {
  const resolved = assets[`../assets/photos/${file}`];
  if (!resolved) throw new Error(`Falta derivado fotográfico: ${file}`);
  return resolved;
}
const descriptions = [
  'Romina de pie en una escalera con azulejos',
  'Retrato de Romina junto a una columna de ladrillo',
  'Romina mirando hacia arriba junto a una columna de ladrillo',
  'Romina sentada en una silla de madera',
  'Romina sentada en un columpio en el jardín',
  'Romina junto a un barandal de madera',
  'Primer plano de Romina junto a una columna de ladrillo',
];
export const galleryPhotos = manifest.map(photo => ({
  id: photo.id, alt: descriptions[photo.id - 1], width: photo.width, height: photo.height,
  src: url(photo.fallback), thumbnail: url(photo.thumbnail),
  sources: (['avif', 'webp'] as const).map(format => ({
    type: `image/${format}`,
    srcSet: photo.variants.filter(v => v.format === format && !v.file.includes('thumb'))
      .map(v => `${url(v.file)} ${v.width}w`).join(', '),
  })),
}));
export const heroPhoto = galleryPhotos.find(photo => photo.id === 2)!;
