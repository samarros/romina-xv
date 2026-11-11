import { useRef } from 'react';
import { useMotionAccent } from './useMotionAccent';

export function MotionDigit({ value, unit, className }: { value: number; unit: string; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useMotionAccent(ref, 'digit', value);
  return <span ref={ref} className={className} data-unit={unit}>{String(value).padStart(2, '0')}</span>;
}
