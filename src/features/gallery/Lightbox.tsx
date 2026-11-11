import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { galleryPhotos } from '../../data/gallery';
import { Photo } from '../../components/ui/Photo';
import styles from './Lightbox.module.css';
import { useMotionAccent } from '../../motion/useMotionAccent';

interface Props {
  photo: typeof galleryPhotos[number];
  index: number;
  total: number;
  returnFocus: HTMLElement | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}
export function Lightbox({ photo, index, total, returnFocus, onClose, onPrevious, onNext }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useMotionAccent(dialogRef, 'dialog', photo.id);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return <dialog ref={dialogRef} className={styles.dialog} aria-label="Visor de fotografías de Romina"
    onCancel={e => { e.preventDefault(); onClose(); }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    onKeyDown={e => {
      if (e.key === 'Tab') {
        const buttons = dialogRef.current!.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrevious(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
    }}>
    <div className={styles.bar}><span aria-live="polite">Foto {index + 1} de {total}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar visor"><X aria-hidden="true" /></button></div>
    <figure className={styles.figure}>
      <Photo photo={photo} sizes="(min-width: 768px) 700px, 95vw" loading="eager" />
      <figcaption>{photo.alt}</figcaption>
    </figure>
    <div className={styles.controls}><button type="button" onClick={onPrevious} aria-label="Foto anterior"><ChevronLeft aria-hidden="true" /></button><button type="button" onClick={onNext} aria-label="Foto siguiente"><ChevronRight aria-hidden="true" /></button></div>
  </dialog>;
}
