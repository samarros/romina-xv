import { useEffect, useRef, useState } from 'react';
import { navigationItems } from '../../data/sections';
import { whatsappUrl } from '../../data/event';
import styles from './Header.module.css';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    }
    const desktop = matchMedia('(min-width: 64rem)');
    function onResize(e: MediaQueryListEvent) { if (e.matches) setOpen(false); }
    function onOutside(e: PointerEvent) { if (!navigationRef.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('keydown', onEscape);
    desktop.addEventListener('change', onResize);
    document.addEventListener('pointerdown', onOutside);
    return () => { document.removeEventListener('keydown', onEscape); desktop.removeEventListener('change', onResize); document.removeEventListener('pointerdown', onOutside); };
  }, [open]);
  return <nav ref={navigationRef} className={styles.navigation} aria-label="Navegación principal">
    <button ref={toggleRef} type="button" className={styles.toggle} aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
    </button>
    <ul id="main-navigation" className={`${styles.links} ${open ? styles.open : ''}`} onBlur={e => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false); }}>
      {navigationItems.map(item => <li key={item.id}><a href={`#${item.id}`} onClick={() => { setOpen(false); document.getElementById(item.id)?.focus({ preventScroll: true }); }}>{item.label}</a></li>)}
      <li className={styles.mobileContact}><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => { setOpen(false); toggleRef.current?.focus(); }}>Confirmar asistencia <span className={styles.visuallyHidden}>(WhatsApp, abre otra pestaña)</span></a></li>
    </ul>
  </nav>;
}
