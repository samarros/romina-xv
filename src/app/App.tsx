import { Header } from '../components/layout/Header';
import { Hero } from '../sections/Hero/Hero';
import { Countdown } from '../sections/Countdown/Countdown';
import { Story } from '../sections/Story/Story';
import { Gallery } from '../sections/Gallery/Gallery';
import { Timeline } from '../sections/Timeline/Timeline';
import { Locations } from '../sections/Locations/Locations';
import { Details } from '../sections/Details/Details';
import { RSVP } from '../sections/RSVP/RSVP';
import { Closing } from '../sections/Closing/Closing';
import styles from './App.module.css';
import { useRef } from 'react';
import { useMotion } from '../motion/MotionProvider';
import { useCinematicMotion } from '../motion/useCinematicMotion';

export function App() {
  const root = useRef<HTMLDivElement>(null);
  const { enabled } = useMotion();
  useCinematicMotion(root);
  return (
    <>
      <a className={styles.skip} href="#contenido">Saltar al contenido</a>
      <div ref={root} className={styles.page} data-motion-root="" data-motion-enabled={enabled}>
        <Header />
        <main id="contenido" className={styles.main} tabIndex={-1}>
          <Hero />
          <Countdown />
          <Story />
          <Gallery />
          <div className={styles.eventGrid}><Timeline /><Locations /></div>
          <Details />
          <RSVP />
        </main>
        <Closing />
      </div>
    </>
  );
}
