import { Music2, Pause, Play, VolumeX } from 'lucide-react';
import { musicIntegration } from '../../data/sections';
import styles from './MusicPlayer.module.css';
import { useMotion } from '../../motion/MotionProvider';
import { useMusicPlayback } from './useMusicPlayback';
import { MusicWelcome } from './MusicWelcome';

export function MusicPlayer() {
  const { enabled } = useMotion();
  const music = useMusicPlayback();
  const { status } = music;
  const active = status === 'playing';
  const label = status === 'loading' ? 'Cargando música, cancelar carga' : active ? 'Pausar música' : status === 'error' ? 'Reintentar música' : 'Reproducir música';
  const Icon = active ? Pause : status === 'error' ? VolumeX : status === 'loading' ? Music2 : Play;
  return <><div className={styles.player}>
    <audio ref={music.audioRef} preload={musicIntegration.preload} data-autoplay-state={music.autoplay} aria-label="Música de la celebración"
      onPlaying={music.onPlaying} onWaiting={music.onWaiting} onPause={music.onPause} onEnded={music.onEnded} onError={music.onError} />
    <button type="button" onClick={music.toggle} aria-label={label} aria-pressed={active}>{active ? <span className={styles.bars} data-animate={enabled} aria-hidden="true"><i /><i /><i /></span> : <Icon aria-hidden="true" />}<span className={styles.label}>{status === 'loading' ? 'Cargando…' : active ? 'Pausar' : status === 'paused' ? 'Reproducir' : 'Música'}</span></button>
    <span className={styles.status} role="status">{status === 'error' ? 'No se pudo reproducir la música. Puedes reintentar.' : active ? 'Música en reproducción' : status === 'loading' ? 'Cargando música' : ''}</span>
  </div>{music.welcome && <MusicWelcome busy={status === 'loading'} onMusic={() => { void music.start(); }} onSilent={music.stop} />}</>;
}
