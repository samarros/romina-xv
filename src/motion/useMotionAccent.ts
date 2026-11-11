import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useMotion } from './MotionProvider';

// Efectos cortos independientes del cálculo del contador y de los transforms de Embla.
export function useMotionAccent(ref: RefObject<HTMLElement | null>, kind: 'digit' | 'gallery' | 'dialog', value: string | number, ready = true) {
  const { enabled, groups } = useMotion();
  const previous = useRef(value);
  useEffect(() => {
    const changed = previous.current !== value;
    previous.current = value;
    const element = ref.current;
    if (!element || !ready || !enabled || (kind !== 'digit' && !groups.gallery) || (kind === 'digit' && !changed)) return;
    let cancelled = false;
    let context: gsap.Context | undefined;
    import('./runtime').then(({ gsap }) => {
      if (cancelled) return;
      context = gsap.context(() => {
        if (kind === 'digit') gsap.fromTo(element, { y: 3, opacity: .65 }, { y: 0, opacity: 1, duration: .18, clearProps: 'transform,opacity' });
        else if (kind === 'dialog') gsap.fromTo(element, { opacity: .7, y: 6, scale: .99 }, { opacity: 1, y: 0, scale: 1, duration: .22, clearProps: 'transform,opacity' });
        else element.querySelectorAll<HTMLElement>('[data-gallery-photo]').forEach((card, index) => gsap.to(card, { scale: index === Number(value) ? 1 : .985, opacity: index === Number(value) ? 1 : .94, duration: .28, overwrite: 'auto' }));
      }, element);
    }).catch(() => { context?.revert(); });
    return () => { cancelled = true; context?.revert(); };
  }, [ref, kind, value, enabled, groups.gallery, ready]);
}
