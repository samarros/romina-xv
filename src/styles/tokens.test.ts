import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
function color(token: string) {
  const hex = css.match(new RegExp(`--color-${token}:\\s*#([0-9a-f]{6})`, 'i'))?.[1];
  if (!hex) throw new Error(`Falta token ${token}`);
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
}
function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}
it('los pares de texto y controles de la paleta cumplen contraste AA', () => {
  for (const [foreground, background] of [['ink', 'pastel'], ['ink', 'ivory'], ['wine', 'pastel'], ['wine', 'ivory'], ['ivory', 'wine'], ['ivory', 'action-hover']]) {
    const values = [luminance(color(foreground)), luminance(color(background))].sort((a, b) => a - b);
    expect((values[1] + .05) / (values[0] + .05), `${foreground}/${background}`).toBeGreaterThanOrEqual(4.5);
  }
});
