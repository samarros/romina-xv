export const defaultGroups = { intro: true, parallax: true, particles: true, reveals: true, gallery: true, ornaments: true };
export type MotionGroups = typeof defaultGroups;
export function motionPolicy(reduced: boolean, paused: boolean, desktop: boolean, groups: MotionGroups) {
  const enabled = !reduced && !paused;
  return { enabled, groups: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, enabled && value && (key !== 'parallax' || desktop)])) as MotionGroups, particleCount: enabled && groups.particles ? desktop ? 8 : 3 : 0 };
}
