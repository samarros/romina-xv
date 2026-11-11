import { useCallback, useEffect, useRef, useState } from 'react';
import musicUrl from '../../assets/audio/celebration.m4a?url';
import { musicIntegration } from '../../data/sections';

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
type Autoplay = 'pending' | 'allowed' | 'blocked' | 'error' | 'skipped';

export function useMusicPlayback() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const intent = useRef(false);
  const request = useRef(0);
  const frame = useRef(0);
  const attempted = useRef(false);
  const currentStatus = useRef<Status>('idle');
  const [status, setStatus] = useState<Status>('idle');
  const [autoplay, setAutoplay] = useState<Autoplay>('pending');
  const [welcome, setWelcome] = useState(false);
  const updateStatus = useCallback((next: Status) => { currentStatus.current = next; setStatus(next); }, []);
  const cancelFade = useCallback(() => { cancelAnimationFrame(frame.current); frame.current = 0; }, []);

  const stop = useCallback(() => {
    intent.current = false; request.current++; cancelFade(); audioRef.current?.pause();
    updateStatus(currentStatus.current === 'error' ? 'error' : 'paused');
    setAutoplay(current => current === 'pending' ? 'skipped' : current);
    setWelcome(false);
  }, [cancelFade, updateStatus]);

  const start = useCallback(async (automatic = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade(); intent.current = true;
    const id = ++request.current;
    if (!audio.getAttribute('src')) audio.src = musicUrl;
    else if (currentStatus.current === 'error') audio.load();
    // Volumen audible desde el inicio: nunca iniciar en mute para eludir autoplay.
    let fadeSupported = false;
    try { audio.volume = .05; fadeSupported = Math.abs(audio.volume - .05) < .01; } catch { /* El volumen puede depender del dispositivo. */ }
    updateStatus('loading');
    try {
      // Debe permanecer antes del primer await para conservar el gesto del botón.
      await audio.play();
      if (id !== request.current || !intent.current) { if (!intent.current) audio.pause(); return; }
      updateStatus('playing'); setWelcome(false);
      if (automatic) setAutoplay('allowed');
      if (fadeSupported) {
        const beginning = performance.now();
        const tick = (now: number) => {
          if (id !== request.current || audio.paused || !intent.current) return;
          const progress = Math.min(1, (now - beginning) / 1200);
          try { audio.volume = .05 + .6 * progress; } catch { return; }
          if (progress < 1) frame.current = requestAnimationFrame(tick);
        };
        frame.current = requestAnimationFrame(tick);
      }
    } catch (error) {
      if (id !== request.current) return;
      intent.current = false; cancelFade();
      const blocked = error instanceof DOMException && error.name === 'NotAllowedError';
      if (automatic && blocked) {
        updateStatus('paused'); setAutoplay('blocked'); setWelcome(true);
      } else {
        updateStatus('error'); setWelcome(false);
        if (automatic) setAutoplay('error');
      }
    }
  }, [cancelFade, updateStatus]);

  useEffect(() => {
    const audio = audioRef.current!;
    let disposed = false;
    queueMicrotask(() => {
      if (disposed || attempted.current) return;
      attempted.current = true;
      if (musicIntegration.autoplay && !document.hidden) void start(true);
      else setAutoplay('skipped');
    });
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; document.removeEventListener('visibilitychange', visibility);
      intent.current = false; request.current++; cancelFade(); audio.pause();
      audio.removeAttribute('src'); audio.load();
    };
  }, [cancelFade, start, stop]);

  return {
    audioRef, status, autoplay, welcome, start, stop,
    toggle: () => { if (intent.current) stop(); else void start(); },
    onPlaying: () => { if (intent.current) updateStatus('playing'); else audioRef.current?.pause(); },
    onWaiting: () => { if (intent.current) updateStatus('loading'); },
    onPause: () => { if (audioRef.current?.paused) { intent.current = false; request.current++; cancelFade(); updateStatus(currentStatus.current === 'error' ? 'error' : 'paused'); } },
    onEnded: () => { intent.current = false; cancelFade(); updateStatus('paused'); },
    onError: () => { intent.current = false; request.current++; cancelFade(); updateStatus('error'); setWelcome(false); setAutoplay(current => current === 'pending' ? 'error' : current); },
  };
}
