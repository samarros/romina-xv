import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { defaultGroups, motionPolicy } from './policy';
import type { MotionGroups } from './policy';

function useMedia(query: string) {
  const media = useMemo(() => matchMedia(query), [query]);
  const subscribe = useCallback((callback: () => void) => {
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, [media]);
  return useSyncExternalStore(subscribe, () => media.matches, () => false);
}
const Lab = import.meta.env.DEV ? lazy(() => import('./dev/AnimationLab')) : null;
type MotionContextValue = ReturnType<typeof motionPolicy> & {
  reduced: boolean; paused: boolean; desktop: boolean; revision: number; settings: MotionGroups;
  toggle: () => void; setGroup: (group: keyof MotionGroups, value: boolean) => void; replay: () => void;
};
const MotionContext = createContext<MotionContextValue | null>(null);
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const desktop = useMedia('(min-width: 64rem)');
  const [paused, setPaused] = useState(false);
  const [settings, setSettings] = useState(defaultGroups);
  const [revision, setRevision] = useState(0);
  const value = useMemo(() => ({ ...motionPolicy(reduced, paused, desktop, settings), reduced, paused, desktop, settings, revision,
    toggle: () => setPaused(current => !current),
    setGroup: (group: keyof MotionGroups, active: boolean) => setSettings(current => ({ ...current, [group]: active })),
    replay: () => setRevision(current => current + 1),
  }), [reduced, paused, desktop, settings, revision]);
  useEffect(() => {
    document.documentElement.dataset.motionEnabled = String(value.enabled);
    return () => { delete document.documentElement.dataset.motionEnabled; };
  }, [value.enabled]);
  const showLab = import.meta.env.DEV && new URLSearchParams(location.search).get('debugAnimations') === '1';
  return <MotionContext.Provider value={value}>{children}{showLab && Lab && <Suspense fallback={null}><Lab /></Suspense>}</MotionContext.Provider>;
}
export function useMotion() {
  const value = useContext(MotionContext);
  if (!value) throw new Error('MotionProvider requerido');
  return value;
}
