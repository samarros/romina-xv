import { describe, expect, it } from 'vitest';
import { getCountdown } from './countdown';
import { event } from '../data/event';
import { formatEventTime, venueCards } from '../data/presentation';

const target = Date.parse(event.ceremony.startsAt);
describe('cuenta regresiva real', () => {
  it('separa días, horas, minutos y segundos a partir del instante actual', () => {
    expect(getCountdown(event.ceremony.startsAt, target - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, complete: false });
  });
  it('no anuncia el evento antes de agotar el último segundo', () => {
    expect(getCountdown(event.ceremony.startsAt, target - 1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1, complete: false });
  });
  it.each([0, 1, 86400000])('no produce negativos en o después de la fecha (+%i ms)', offset => {
    expect(getCountdown(event.ceremony.startsAt, target + offset)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, complete: true });
  });
  it('rechaza fechas inválidas en lugar de mostrar NaN', () => {
    expect(() => getCountdown('fecha inválida')).toThrow();
  });
  it('presenta horas del evento en Monterrey, aunque el dispositivo use otra zona', () => {
    expect(formatEventTime(event.ceremony.startsAt)).toBe('7:00 p. m.');
    expect(venueCards[1].schedule).toBe('9:00 p. m. a 2:00 a. m. del día siguiente');
  });
});
