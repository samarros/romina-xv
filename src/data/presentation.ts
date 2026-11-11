import { event } from './event';

export const eventDateLabel = new Intl.DateTimeFormat('es-MX', { timeZone: event.timeZone, day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(event.ceremony.startsAt));
export function formatEventTime(iso: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: event.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const hour = Number(parts.find(p => p.type === 'hour')!.value);
  const minute = parts.find(p => p.type === 'minute')!.value;
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'p. m.' : 'a. m.'}`;
}
export const venueCards = [
  { ...event.ceremony, kind: 'Misa', description: 'Ceremonia religiosa', schedule: formatEventTime(event.ceremony.startsAt) },
  { ...event.reception, kind: 'Fiesta', description: 'Recepción y celebración', schedule: `${formatEventTime(event.reception.startsAt)} a ${formatEventTime(event.reception.endsAt)} del día siguiente` },
] as const;
