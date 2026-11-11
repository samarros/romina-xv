// Puntos de integración. Solo se navega a contenido realmente implementado.
export const sectionRegistry = [
  { id: 'inicio', label: 'Inicio', component: 'Hero', available: true },
  { id: 'fecha', label: 'La fecha', component: 'HeroDate', available: true },
  { id: 'cuenta-regresiva', label: 'Cuenta regresiva', component: 'Countdown', available: true },
  { id: 'historia', label: 'Mi historia', component: 'Story', available: true },
  { id: 'galeria', label: 'Galería', component: 'Gallery', available: true },
  { id: 'itinerario', label: 'Itinerario', component: 'Timeline', available: true },
  { id: 'ubicaciones', label: 'Ubicaciones', component: 'Locations', available: true },
  { id: 'vestimenta', label: 'Vestimenta y regalos', component: 'Details', available: true },
  { id: 'confirmar', label: 'Confirmar', component: 'RSVP', available: true },
  { id: 'cierre', label: 'Gracias', component: 'Closing', available: true },
] as const;
export const navigationItems = sectionRegistry.filter(section => section.available && ['inicio', 'historia', 'galeria', 'itinerario', 'ubicaciones', 'confirmar'].includes(section.id));
export const musicIntegration = {
  component: 'MusicPlayer', original: 'referencias/thscientist.m4a',
  preload: 'none', autoplay: true, enabled: true,
} as const;
