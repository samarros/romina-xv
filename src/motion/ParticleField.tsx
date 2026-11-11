import { Petal, Sparkle } from '../components/decorative/Ornaments';
import { useMotion } from './MotionProvider';
import styles from './motion.module.css';

export function ParticleField({ closing = false }: { closing?: boolean }) {
  const { particleCount, desktop } = useMotion();
  const count = closing ? Math.min(desktop ? 2 : 1, particleCount) : particleCount;
  return <div className={styles.particles} data-particle-field="" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => {
      // Solo bordes laterales, fuera de nombre, rostro y texto central.
      const position = { left: `${index % 2 ? 94 : 2 + index % 3}%`, top: `${8 + index * 8}%` };
      return <span key={index} style={position} className={styles.particle} data-motion-particle="">{index % 3 === 2 ? <Sparkle /> : <Petal />}</span>;
    })}
  </div>;
}
