import { Phone } from 'lucide-react';
import { event, whatsappUrl } from '../../data/event';
import { ActionLink } from '../../components/ui/ActionLink';
import { ContactIcon } from '../../components/ui/ContactIcon';
import { SectionHeading } from '../../components/ui/SectionHeading';
import styles from '../EventSections.module.css';

export function RSVP() {
  return <section id="confirmar" className={styles.rsvp} aria-labelledby="rsvp-title" tabIndex={-1} data-animation="rsvp">
    <SectionHeading id="rsvp-title">¿Me acompañas?</SectionHeading>
    <p>Me encantará compartir este día contigo.</p>
    <div className={styles.rsvpActions} data-motion="rsvp-actions"><ActionLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Confirmar asistencia por WhatsApp (abre otra pestaña)"><ContactIcon />Confirmar asistencia</ActionLink><a href={`tel:+${event.rsvp.phone}`} className={styles.phone}><Phone aria-hidden="true" />{event.rsvp.displayPhone}</a></div>
    <p className={styles.hint}>Se abrirá WhatsApp con tu mensaje listo. Envíalo para confirmar tu asistencia.</p>
  </section>;
}
