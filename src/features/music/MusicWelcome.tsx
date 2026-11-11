import { useEffect, useRef } from 'react';
import { Crown, RoseBouquet } from '../../components/decorative/Ornaments';
import { Photo } from '../../components/ui/Photo';
import { heroPhoto } from '../../data/gallery';
import { event } from '../../data/event';
import { eventDateLabel } from '../../data/presentation';
import styles from './MusicWelcome.module.css';

export function MusicWelcome({ busy, onMusic, onSilent }: { busy: boolean; onMusic: () => void; onSilent: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal(); primaryRef.current?.focus();
    return () => { dialog.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="welcome-title" aria-describedby="welcome-message"
    onCancel={event => { event.preventDefault(); onSilent(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current!.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
    <div className={styles.card}>
      <div className={styles.portrait}>
        <Photo photo={heroPhoto} sizes="(min-width: 1248px) 620px, (min-width: 1024px) 50vw, 100vw" loading="eager" />
        <RoseBouquet className={styles.flowers} />
      </div>
      <div className={styles.copy}>
        <Crown className={styles.crown} />
        <p className={styles.occasion}>Mis XV Años</p>
        <h2 id="welcome-title">{event.celebrant}</h2>
        <p className={styles.date}>{eventDateLabel}</p>
        <p id="welcome-message">Una melodía para acompañar este momento especial.</p>
        <button ref={primaryRef} className={styles.primary} type="button" onClick={onMusic} disabled={busy}>{busy ? 'Abriendo…' : 'Abrir invitación con música'}</button>
        <button className={styles.silent} type="button" onClick={onSilent}>Abrir sin música</button>
      </div>
    </div>
  </dialog>;
}
