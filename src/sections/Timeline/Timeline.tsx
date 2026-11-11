import { Church, Wine } from 'lucide-react';
import { eventDateLabel, venueCards } from '../../data/presentation';
import { SectionHeading } from '../../components/ui/SectionHeading';
import styles from '../EventSections.module.css';

export function Timeline() {
  return <section id="itinerario" className={styles.eventSection} aria-labelledby="timeline-title" tabIndex={-1} data-animation="timeline">
    <SectionHeading id="timeline-title">Itinerario del evento</SectionHeading>
    <p className={styles.sectionDate}>{eventDateLabel}</p>
    <div className={styles.timeline}>
      <svg className={styles.line} viewBox="0 0 12 200" preserveAspectRatio="none" aria-hidden="true"><path d="M6 8v184" data-animation="timeline-path" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="6" cy="20" r="4" fill="var(--color-ivory)" stroke="currentColor" /><circle cx="6" cy="121" r="4" fill="var(--color-ivory)" stroke="currentColor" /></svg>
      <ol>{venueCards.map((venue, i) => { const Icon = i === 0 ? Church : Wine; return <li key={venue.kind} className={styles.card} data-animation="timeline-card"><Icon className={styles.icon} aria-hidden="true" /><div><h3>{venue.kind}</h3><p>{venue.name}</p><p className={styles.secondary}>{venue.locality}</p><p className={styles.schedule}>{venue.schedule}</p></div></li>; })}</ol>
    </div>
  </section>;
}
