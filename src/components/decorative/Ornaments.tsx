import { useId } from 'react';
import type { SVGProps } from 'react';

type OrnamentProps = SVGProps<SVGSVGElement>;

export function Crown(props: OrnamentProps) {
  return <svg viewBox="0 0 100 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false" {...props}>
    <path d="m14 18 12 25h48l12-25-22 15L50 9 36 33Z" /><path d="M26 49h48M32 38l-5-13m41 13 5-13M50 20v16" />
    <circle cx="14" cy="15" r="3" /><circle cx="86" cy="15" r="3" /><circle cx="50" cy="6" r="3" />
  </svg>;
}

export function Divider(props: OrnamentProps) {
  return <svg viewBox="0 0 300 36" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false" {...props}>
    <path d="M16 18h100m68 0h100M35 18c18-20 35 20 63 0m104 0c28 20 45-20 63 0" />
    <path d="m150 29-12-12c-9-10 6-18 12-7 6-11 21-3 12 7Z" /><path d="m12 18 4-4 4 4-4 4Zm268 0 4-4 4 4-4 4Z" fill="currentColor" />
  </svg>;
}

export function Sparkle(props: OrnamentProps) {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false" {...props}><path d="M20 1c1 14 5 18 19 19-14 1-18 5-19 19C19 25 15 21 1 20 15 19 19 15 20 1Z" fill="currentColor" /></svg>;
}

export function Butterfly(props: OrnamentProps) {
  return <svg viewBox="0 0 90 75" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false" {...props}>
    <path d="M45 36C29 5 4 4 9 27c2 12 17 15 33 15C15 33 7 57 21 62c11 4 17-8 24-18 7 10 13 22 24 18 14-5 6-29-21-20 16 0 31-3 33-15C86 4 61 5 45 36ZM44 35l-6-15m8 15 6-15M45 34v21" />
    <path d="M40 38 16 18m24 22L20 28m23 14-20 12m27-16 24-20M50 40l20-12M47 42l20 12" />
  </svg>;
}

export function Petal(props: OrnamentProps) {
  return <svg viewBox="0 0 40 60" aria-hidden="true" focusable="false" {...props}><path d="M32 3C4 4-6 35 19 56 36 44 45 20 32 3Z" fill="currentColor" /><path d="M19 51C13 33 22 14 29 8" fill="none" stroke="#fff8f5" strokeOpacity=".6" /></svg>;
}

// Ilustración vectorial original, independiente de las fotografías.
export function RoseBouquet(props: OrnamentProps) {
  const id = useId().replaceAll(':', '');
  return <svg viewBox="0 0 240 320" fill="none" aria-hidden="true" focusable="false" {...props}>
    <defs>
      <radialGradient id={`${id}-rose`} cx=".43" cy=".35" r=".7"><stop stopColor="#fff8f5" /><stop offset=".42" stopColor="#efb7c6" /><stop offset="1" stopColor="#bd718d" /></radialGradient>
      <linearGradient id={`${id}-leaf`} x2="1" y2="1"><stop stopColor="#c2c19c" /><stop offset="1" stopColor="#737b58" /></linearGradient>
    </defs>
    <g stroke="#9e986e" strokeWidth="1.4">
      <path d="M98 307c16-83 38-133 98-203M99 307C79 234 55 170 42 92M102 292c26-93 36-175 26-262M111 267c21-36 48-45 92-48" />
      {['M105 260C36 255 20 220 27 201c45 0 67 24 78 59Z','M117 230c49-40 75-29 93-10-23 27-53 27-93 10Z','M85 212C30 198 11 166 25 144c35 6 57 29 60 68Z','M139 166c8-50 37-69 58-58 4 35-16 54-58 58Z','M123 100C78 91 67 64 80 45c30 5 46 28 43 55Z','M68 151C34 133 24 100 37 79c26 14 39 40 31 72Z','M118 194c36-38 59-36 72-22-10 29-34 37-72 22Z'].map(d => <path key={d} d={d} fill={`url(#${id}-leaf)`} />)}
    </g>
    {[{ x: 77, y: 229, s: 1 }, { x: 128, y: 157, s: .79 }, { x: 73, y: 106, s: .55 }, { x: 146, y: 56, s: .36 }].map(({x,y,s}) => <g key={y} transform={`translate(${x} ${y}) scale(${s})`} fill={`url(#${id}-rose)`} stroke="#b5778c" strokeWidth=".7">
      <path d="M-5-45C14-59 39-42 40-26c28 1 30 27 15 40 6 28-22 42-40 34-19 18-45 5-45-11-28-4-32-30-16-44-10-24 12-42 41-38Z" />
      <path d="M-2-34c24-15 42 11 28 24 24 4 24 27 6 33-5 23-31 24-39 8-24 8-40-12-28-27-13-18 8-40 33-38Z" />
      <path d="M-20-16c10-23 36-15 35 3 25-5 32 23 8 31-14 16-36 5-32-11-20-1-23-14-11-23Z" />
      <path d="M-10-9C7-23 26-2 13 10-1 22-18 7-10-9Z" /><path d="M-3-5c12-5 17 10 5 12-8 0-10-7-5-12Z" />
      <path d="M-45 0c8 3 15 7 17 15M16-42c0 12-5 20-13 23M40 26c-13 0-19-5-23-11" fill="none" stroke="#fff8f5" strokeWidth="2" strokeOpacity=".65" />
    </g>)}
  </svg>;
}
