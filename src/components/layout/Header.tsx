import { Crown } from '../decorative/Ornaments';
import { ActionLink } from '../ui/ActionLink';
import { ContactIcon } from '../ui/ContactIcon';
import { whatsappUrl } from '../../data/event';
import { Navigation } from './Navigation';
import { MusicPlayer } from '../../features/music/MusicPlayer';
import styles from './Header.module.css';
import { MotionControl } from '../../motion/MotionControl';

export function Header() {
  return <header className={styles.header}>
    <a className={styles.monogram} href="#inicio" aria-label="LR · Lia Romina, inicio"><Crown /><span>LR</span></a>
    <Navigation />
    <MusicPlayer />
    <MotionControl />
    <ActionLink className={styles.confirm} href={whatsappUrl} target="_blank" rel="noopener noreferrer"><ContactIcon />Confirmar asistencia<span className={styles.visuallyHidden}> (WhatsApp, abre otra pestaña)</span></ActionLink>
  </header>;
}
