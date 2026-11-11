import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useMotion } from './MotionProvider';
import type { createMotion } from './engine';

export function useCinematicMotion(ref: RefObject<HTMLDivElement | null>) {
  const { enabled, reduced, groups, desktop, revision } = useMotion();
  const played = useRef(false);
  const lastRevision = useRef(revision);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cancelled = false;
    let controller: ReturnType<typeof createMotion> | undefined;
    root.dataset.motionState = enabled ? 'loading' : reduced ? 'reduced' : 'off';
    root.dataset.motionContexts = '0';
    root.dataset.motionTriggers = '0';
    if (!enabled) { root.dataset.introState = 'done'; return; }
    const shouldPlay = !played.current || revision !== lastRevision.current;
    lastRevision.current = revision;
    Promise.all([import('./engine'), document.fonts.ready]).then(([module]) => {
      if (cancelled) return;
      controller = module.createMotion(root, groups, desktop, shouldPlay);
      played.current = true;
      root.dataset.motionState = 'active';
    }).catch(() => {
      controller?.dispose();
      if (!cancelled) { root.dataset.motionState = 'fallback'; root.dataset.introState = 'done'; root.dataset.motionContexts = '0'; root.dataset.motionTriggers = '0'; }
    });
    return () => { cancelled = true; controller?.dispose(); root.dataset.motionContexts = '0'; root.dataset.motionTriggers = '0'; };
  }, [ref, enabled, reduced, groups, desktop, revision]);
}
