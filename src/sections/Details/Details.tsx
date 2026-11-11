import { Shirt, Mail } from 'lucide-react';
import { event } from '../../data/event';
import { editorial } from '../../data/editorial';
import styles from '../EventSections.module.css';

export function Details() {
  return <section id="vestimenta" className={styles.details} aria-label="Detalles especiales" tabIndex={-1} data-animation="details">
    <article className={styles.detail}><Shirt aria-hidden="true" /><div><h2>Código de vestimenta: {event.dressCode}</h2><p>Para compartir una noche muy especial.</p></div></article>
    <article className={styles.detail}><Mail aria-hidden="true" /><div><h2>Habrá {event.gift}</h2><p>{editorial.giftNote}</p></div></article>
  </section>;
}
