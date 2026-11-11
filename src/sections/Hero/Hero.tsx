import { event } from '../../data/event';
import { heroPhoto } from '../../data/gallery';
import { Crown, Divider } from '../../components/decorative/Ornaments';
import { DecorativeElements } from '../../components/decorative/DecorativeElements';
import styles from './Hero.module.css';
import { ChevronDown } from 'lucide-react';
import { eventDateLabel } from '../../data/presentation';
import { ParticleField } from '../../motion/ParticleField';


export function Hero() {
  const words = event.celebrant.split(' ');
  return <section id="inicio" className={styles.hero} aria-labelledby="hero-title" tabIndex={-1} data-animation="hero">
    <div className={styles.background} data-layer="hero-background" aria-hidden="true" />
    <picture className={styles.portrait} data-animation="hero-photo">
      {heroPhoto.sources.map(source => <source key={source.type} {...source} sizes="(min-width: 1248px) 620px, (min-width: 1024px) 50vw, 100vw" />)}
      <img src={heroPhoto.src} alt={heroPhoto.alt} width={heroPhoto.width} height={heroPhoto.height} fetchPriority="high" loading="eager" />
    </picture>
    <div className={styles.copy}>
      <Crown className={styles.crown} data-motion="crown" />
      <p className={styles.occasion} data-motion="occasion">Mis XV Años</p>
      <h1 id="hero-title" className={styles.name} aria-label={event.celebrant} data-animation="hero-name"><span>{words.slice(0, 2).join(' ')}</span><span>{words.slice(2).join(' ')}</span></h1>
      <Divider className={styles.divider} />
      <p className={styles.invitation} data-motion="hero-message">Con mucha ilusión, te invito a celebrar<br className={styles.desktopBreak} /> conmigo mis XV Años.</p>
      <div id="fecha" className={styles.date} tabIndex={-1}>
        <span className={styles.dateLabel}>Reserva la fecha</span>
        <time dateTime={event.date}>{eventDateLabel}</time>
      </div>
      <a className={styles.continue} data-motion="continue" href="#cuenta-regresiva" aria-label="Continuar a la cuenta regresiva"><ChevronDown aria-hidden="true" /></a>
    </div>
    <DecorativeElements />
    <ParticleField />
  </section>;
}
