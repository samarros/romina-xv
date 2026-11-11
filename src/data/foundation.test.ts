import { describe, expect, it } from 'vitest';
import { galleryPhotos, heroPhoto } from './gallery';
import { musicIntegration, navigationItems, sectionRegistry } from './sections';
import { event } from './event';

describe('fundamentos de la invitación', () => {
  it('prepara las siete fotos y el retrato aprobado con fuentes responsivas', () => {
    expect(galleryPhotos.map(p => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(heroPhoto.id).toBe(2);
    for (const photo of galleryPhotos) {
      expect(photo.alt.length).toBeGreaterThan(10);
      expect(photo.src).toMatch(/\.jpeg/);
      expect(photo.thumbnail).toContain('thumb.webp');
      expect(photo.sources.map(s => s.type)).toEqual(['image/avif', 'image/webp']);
      expect(photo.sources.every(s => s.srcSet.split(', ').length === 3)).toBe(true);
    }
  });
  it('expone las secciones implementadas y música con intento de autoplay', () => {
    expect(navigationItems.map(item => item.id)).toEqual(['inicio', 'historia', 'galeria', 'itinerario', 'ubicaciones', 'confirmar']);
    expect(new Set(sectionRegistry.map(item => item.id)).size).toBe(sectionRegistry.length);
    expect(musicIntegration.enabled).toBe(true);
    expect(musicIntegration.autoplay).toBe(true);
    expect(musicIntegration.preload).toBe('none');
  });
  it('preserva la identidad y los datos familiares confirmados', () => {
    expect(event.celebrant).toBe('Lia Romina Santos Enriquez');
    expect(event.parents).toEqual(['Miguel Santos Ramírez', 'Montserrat Enriquez González']);
    expect(event.godparents).toEqual(['César de Jesús Tonche Flores', 'Karen Mireya Santos Ramírez']);
    expect(event.dressCode).toBe('Negro');
    expect(event.gift).toBe('lluvia de sobres');
  });
});
