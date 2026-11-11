interface Venue {
  readonly name: string;
  readonly locality: string;
  readonly startsAt: string;
  readonly mapsUrl: `https://${string}`;
}
export interface EventConfig {
  readonly celebrant: string;
  readonly date: string;
  readonly timeZone: string;
  readonly parents: readonly [string, string];
  readonly godparents: readonly [string, string];
  readonly ceremony: Venue;
  readonly reception: Venue & { readonly endsAt: string };
  readonly dressCode: string;
  readonly gift: string;
  readonly rsvp: { readonly displayPhone: string; readonly phone: string; readonly message: string };
}
