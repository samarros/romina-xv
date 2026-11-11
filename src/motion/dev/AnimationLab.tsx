import { useMotion } from '../MotionProvider';
import type { MotionGroups } from '../policy';
import './lab.css';

const labels: Record<keyof MotionGroups, string> = { intro: 'Intro', parallax: 'Parallax', particles: 'Partículas', reveals: 'Scroll reveals', gallery: 'Galería', ornaments: 'Ornamentación' };
export default function AnimationLab() {
  const motion = useMotion();
  return <aside className="animation-lab" aria-label="Laboratorio de animaciones">
    <strong>Laboratorio de animaciones</strong>
    <p>Solo desarrollo{motion.reduced ? ' · movimiento reducido activo' : ''}</p>
    <label><input type="checkbox" checked={!motion.paused} onChange={motion.toggle} />Activar animaciones globalmente</label>
    {Object.entries(labels).map(([group, label]) => <label key={group}><input type="checkbox" checked={motion.settings[group as keyof MotionGroups]} onChange={e => motion.setGroup(group as keyof MotionGroups, e.target.checked)} />{label}</label>)}
    <button type="button" onClick={motion.replay}>Repetir apertura</button>
  </aside>;
}
