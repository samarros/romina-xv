import { CalendarDays } from 'lucide-react';
import { event } from '../../data/event';
import { editorial } from '../../data/editorial';
import { useCountdown } from '../../hooks/useCountdown';
import styles from './Countdown.module.css';
import { MotionDigit } from '../../motion/MotionDigit';

export function Countdown() {
  const remaining = useCountdown(event.ceremony.startsAt);
  const units = [['days', 'Días'], ['hours', 'Horas'], ['minutes', 'Minutos'], ['seconds', 'Segundos']] as const;
  return <section id="cuenta-regresiva" className={styles.section} aria-labelledby="countdown-title" tabIndex={-1} data-animation="countdown">
    <div className={styles.intro}><CalendarDays aria-hidden="true" /><h2 id="countdown-title">Falta poco<br />para mis XV Años</h2></div>
    {remaining.complete ? <p className={styles.celebration} role="status">{editorial.celebration}</p> :
      <div className={styles.numbers} role="timer" aria-label="Tiempo restante para el 19 de diciembre de 2026 a las 19:00, America/Monterrey" aria-live="off">
        {units.map(([key, label]) => <div className={styles.unit} key={key}><MotionDigit className={styles.value} value={remaining[key]} unit={key} /><span className={styles.label}>{label}</span></div>)}
      </div>}
  </section>;
}
