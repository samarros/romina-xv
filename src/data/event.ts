import type { EventConfig } from './types';
// Única fuente de datos del evento. No agregar datos ni textos biográficos supuestos.
export const event = {
  celebrant: 'Lia Romina Santos Enriquez',
  date: '2026-12-19',
  timeZone: 'America/Monterrey',
  parents: ['Miguel Santos Ramírez', 'Montserrat Enriquez González'],
  godparents: ['César de Jesús Tonche Flores', 'Karen Mireya Santos Ramírez'],
  ceremony: {
    name: 'Parroquia San Miguel Arcángel',
    locality: 'Ejido San Miguel',
    startsAt: '2026-12-19T19:00:00-06:00',
    mapsUrl: 'https://maps.app.goo.gl/gkonoHcZCNkU6B46A',
  },
  reception: {
    name: 'Casino Hacienda Los Ángeles',
    locality: 'Ejido El Olivo',
    startsAt: '2026-12-19T21:00:00-06:00',
    endsAt: '2026-12-20T02:00:00-06:00',
    mapsUrl: 'https://maps.app.goo.gl/4YQr1kB1zyykbiQs7',
  },
  dressCode: 'Negro',
  gift: 'lluvia de sobres',
  rsvp: {
    displayPhone: '+52 871 377 6355',
    phone: '528713776355',
    message: 'Confirmo asistencia para celebrar los XV de Romina',
  },
} as const satisfies EventConfig;

export const whatsappUrl = `https://wa.me/${event.rsvp.phone}?text=${encodeURIComponent(event.rsvp.message)}`;
