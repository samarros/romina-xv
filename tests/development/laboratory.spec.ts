import { openInvitation } from '../helpers/invitation';
import { expect, test } from '@playwright/test';

test('laboratorio alterna grupos, limpia instancias reales y permite repetir apertura', async ({ page }) => {
  await openInvitation(page, '/?debugAnimations=1');
  const lab = page.getByRole('complementary', { name: 'Laboratorio de animaciones' });
  const root = page.locator('[data-motion-root]');
  await expect(lab).toBeVisible();
  await expect(root).toHaveAttribute('data-motion-state', 'active');
  const actualTriggers = () => page.evaluate(async () => { const path = '/src/motion/runtime.ts'; const runtime = await import(path); return runtime.ScrollTrigger.getAll().length as number; });
  const baseline = await actualTriggers();
  expect(baseline).toBeGreaterThan(0);
  const hiddenLoopsPaused = await page.evaluate(async () => {
    const path = '/src/motion/runtime.ts'; const { gsap } = await import(path);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    const petal = document.querySelector('[data-motion-particle]');
    const paused = gsap.getTweensOf(petal).every((tween: { paused: () => boolean }) => tween.paused());
    delete (document as unknown as Record<string, unknown>).hidden;
    document.dispatchEvent(new Event('visibilitychange'));
    return paused;
  });
  expect(hiddenLoopsPaused).toBe(true);
  for (const name of ['Intro', 'Parallax', 'Partículas', 'Scroll reveals', 'Galería', 'Ornamentación']) {
    await lab.getByRole('checkbox', { name, exact: true }).uncheck();
  }
  await expect(page.locator('[data-motion-particle]')).toHaveCount(0);
  expect(await actualTriggers()).toBe(0);
  await lab.getByRole('checkbox', { name: 'Activar animaciones globalmente' }).uncheck();
  await expect(root).toHaveAttribute('data-motion-state', 'off');
  expect(await actualTriggers()).toBe(0);
  await lab.getByRole('checkbox', { name: 'Intro', exact: true }).check();
  await lab.getByRole('checkbox', { name: 'Activar animaciones globalmente' }).check();
  await lab.getByRole('button', { name: 'Repetir apertura' }).click();
  await expect(root).toHaveAttribute('data-motion-state', 'active');
  await expect(root).toHaveAttribute('data-intro-state', 'done');
  expect(await actualTriggers()).toBeLessThanOrEqual(baseline);
});

test('capturas controladas de estados de la apertura real', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openInvitation(page, '/?debugAnimations=1');
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
  await page.getByRole('complementary', { name: 'Laboratorio de animaciones' }).evaluate(element => { element.style.visibility = 'hidden'; });
  for (const [name, progress] of [['initial', 0], ['middle', .5], ['end', 1]] as const) {
    await page.evaluate(async position => {
      const path = '/src/motion/runtime.ts'; const { gsap } = await import(path);
      gsap.getById('romina-intro')?.pause().progress(position);
    }, progress);
    await page.locator('#inicio').screenshot({ path: `docs/screenshots/phase05-intro-${name}.png` });
  }
});
