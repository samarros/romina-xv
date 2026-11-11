import { Pause, Sparkles } from 'lucide-react';
import { useMotion } from './MotionProvider';
import styles from './motion.module.css';

export function MotionControl() {
  const motion = useMotion();
  const label = motion.reduced ? 'Movimiento reducido del sistema activo' : motion.paused ? 'Reanudar animaciones' : 'Pausar animaciones';
  return <button type="button" className={styles.control} onClick={motion.toggle} aria-label={label} title={label} aria-pressed={motion.enabled} disabled={motion.reduced}>{motion.enabled ? <Pause aria-hidden="true" /> : <Sparkles aria-hidden="true" />}</button>;
}
