import { describe, expect, it } from 'vitest';
import { event, whatsappUrl } from './event';

describe('contrato de los datos confirmados', () => {
  it('fija la misa en el instante UTC correcto, independientemente del dispositivo', () => {
    expect(new Date(event.ceremony.startsAt).toISOString()).toBe('2026-12-20T01:00:00.000Z');
    const local = new Intl.DateTimeFormat('en-CA', {
      timeZone: event.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(event.ceremony.startsAt));
    const parts = Object.fromEntries(local.map(({ type, value }) => [type, value]));
    expect([parts.year, parts.month, parts.day, parts.hour, parts.minute]).toEqual(['2026', '12', '19', '19', '00']);
    expect(new Intl.DateTimeFormat('es-MX', { timeZone: event.timeZone, weekday: 'long' }).format(new Date(event.ceremony.startsAt))).toBe('sábado');
  });
  it('conserva la fiesta de cinco horas cruzando al día siguiente', () => {
    expect(Date.parse(event.reception.endsAt) - Date.parse(event.reception.startsAt)).toBe(5 * 60 * 60 * 1000);
    expect(Date.parse(event.reception.startsAt)).toBeGreaterThan(Date.parse(event.ceremony.startsAt));
  });
  it('codifica el mensaje y número de WhatsApp sin perder información', () => {
    const url = new URL(whatsappUrl);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe('/528713776355');
    expect(url.searchParams.get('text')).toBe('Confirmo asistencia para celebrar los XV de Romina');
  });
  it('conserva ambos enlaces oficiales de ubicación', () => {
    expect(event.ceremony.mapsUrl).toBe('https://maps.app.goo.gl/gkonoHcZCNkU6B46A');
    expect(event.reception.mapsUrl).toBe('https://maps.app.goo.gl/4YQr1kB1zyykbiQs7');
  });
});
