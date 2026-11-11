import { expect, it } from 'vitest';
import { defaultGroups, motionPolicy } from './policy';

it('movimiento reducido tiene prioridad sobre cualquier configuración de laboratorio', () => {
  const policy = motionPolicy(true, false, true, defaultGroups);
  expect(policy.enabled).toBe(false);
  expect(Object.values(policy.groups).every(active => !active)).toBe(true);
  expect(policy.particleCount).toBe(0);
});
it('pausa global detiene todos los grupos y partículas', () => {
  expect(motionPolicy(false, true, true, defaultGroups)).toEqual(motionPolicy(true, false, true, defaultGroups));
});
it('móvil mantiene motion ligero y desactiva parallax', () => {
  const mobile = motionPolicy(false, false, false, defaultGroups);
  expect(mobile.groups.parallax).toBe(false);
  expect(mobile.particleCount).toBe(3);
  expect(mobile.groups.intro).toBe(true);
});
it('escritorio limita partículas y respeta cada grupo individual', () => {
  expect(motionPolicy(false, false, true, defaultGroups).particleCount).toBe(8);
  const policy = motionPolicy(false, false, true, { ...defaultGroups, particles: false, intro: false });
  expect(policy.groups.intro).toBe(false);
  expect(policy.particleCount).toBe(0);
  expect(policy.groups.parallax).toBe(true);
});
