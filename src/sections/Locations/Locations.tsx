import { MapPin } from 'lucide-react';
import { venueCards } from '../../data/presentation';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ActionLink } from '../../components/ui/ActionLink';
import styles from '../EventSections.module.css';

export function Locations() {
  return <section id="ubicaciones" className={styles.eventSection} aria-labelledby="locations-title" tabIndex={-1} data-animation="locations">
    <SectionHeading id="locations-title">Ubicaciones</SectionHeading>
    <div className={styles.locations}>{venueCards.map(venue => <article className={`${styles.card} ${styles.location}`} key={venue.kind}>
      <MapPin className={styles.icon} aria-hidden="true" />
      <div><p className={styles.kicker}>{venue.description}</p><h3 className={styles.venueName}>{venue.name}</h3><p>{venue.locality}</p><p className={styles.secondary}>{venue.schedule}</p>
        <ActionLink href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver en Google Maps: ${venue.name} (abre otra pestaña)`}>Ver en Google Maps</ActionLink>
      </div>
    </article>)}</div>
  </section>;
}
