import { openInvitation } from '../helpers/invitation';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const evidence = async (name: string, value: unknown) => { await mkdir('docs/phase04', { recursive: true }); await writeFile(`docs/phase05/${name}.json`, JSON.stringify(value, null, 2) + '\n'); };

for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1280, 900], [1440, 900]]) {
  test(`layout, fuentes y motion en ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await openInvitation(page, './');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
    await expect(page.getByRole('heading', { name: 'Lia Romina Santos Enriquez', exact: true })).toBeVisible();
    expect(await page.locator('#inicio img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => ['Great Vibes', 'Cormorant Garamond', 'Montserrat'].every(name => [...document.fonts].some(face => face.family.replaceAll('"', '') === name && face.status === 'loaded')))).toBe(true);
    for (const id of ['inicio', 'cuenta-regresiva', 'historia', 'galeria', 'itinerario', 'ubicaciones', 'vestimenta', 'confirmar', 'cierre']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await page.locator('#galeria').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#galeria img')].every(image => image.hasAttribute('src')));
    await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-triggers', '0');
    if ([320, 390, 768, 1440].includes(width)) {
      await page.evaluate(async () => { document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; }); await Promise.all([...document.images].map(img => img.decode().catch(() => undefined))); scrollTo({ top: 0, behavior: 'instant' }); });
      await page.screenshot({ path: `docs/screenshots/phase05-${info.project.name}-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('menú, orientación, carrusel y visor por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openInvitation(page, './');
  const toggle = page.getByRole('button', { name: 'Abrir menú', exact: true });
  await toggle.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cerrar menú', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'Galería', exact: true }).click();
  await expect(page.locator('#galeria')).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
  await expect(page.locator('#galeria [aria-live="polite"]')).toContainText('Fotografía 2 de 7');
  await page.getByRole('button', { name: 'Ir a fotografía 1', exact: true }).click();
  const trigger = page.getByRole('button', { name: /^Ampliar fotografía 1:/ });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar visor', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0); await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Confirmar', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});

test('accesibilidad automática de página y modal', async ({ page }, info) => {
  await openInvitation(page, './');
  await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  await evidence(`axe-${info.project.name}`, { violations: report.violations, incomplete: report.incomplete, passes: report.passes.length });
  expect(report.violations).toEqual([]);
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /^Ampliar fotografía 1:/ }).click();
  const modal = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  await evidence(`axe-modal-${info.project.name}`, { violations: modal.violations, incomplete: modal.incomplete });
  expect(modal.violations).toEqual([]);
});

test('reduce dinámico, reloj y enlaces exactos', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-12-21T12:00:00Z'));
  await openInvitation(page, './');
  await expect(page.locator('#cuenta-regresiva')).toContainText('¡Llegó el gran día!');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'reduced');
  await expect(page.locator('[data-motion-particle]')).toHaveCount(0);
  await expect(page.locator('#ubicaciones a').nth(0)).toHaveAttribute('href', 'https://maps.app.goo.gl/gkonoHcZCNkU6B46A');
  const url = new URL((await page.locator('#confirmar a[target="_blank"]').getAttribute('href'))!);
  expect(url.searchParams.get('text')).toBe('Confirmo asistencia para celebrar los XV de Romina');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
});

test('M4A voluntario: reproducción, teclado, reanudación y pestaña oculta', async ({ page, browser }, info) => {
  await openInvitation(page, './');
  const audio = page.locator('audio');
  await expect(audio).toHaveAttribute('src', /celebration-.*[.]m4a/);
  const supported = await audio.evaluate((element: HTMLAudioElement) => { element.muted = true; return element.canPlayType('audio/mp4'); });
  await page.getByRole('button', { name: 'Reproducir música', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect.poll(async () => await page.getByRole('button', { name: 'Pausar música', exact: true }).count() || await page.getByRole('button', { name: 'Reintentar música', exact: true }).count(), { timeout: 10000 }).toBe(1);
  const playing = await page.getByRole('button', { name: 'Pausar música', exact: true }).count() === 1;
  await evidence(`audio-${info.project.name}`, { browser: browser.version(), canPlayType: supported, playing, status: playing ? 'playback-success' : 'codec-or-playback-error-handled' });
  if (!playing) { await expect(page.getByText('No se pudo reproducir la música. Puedes reintentar.')).toBeVisible(); return; }
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(.1);
  // Una pausa externa (controles del sistema) también debe permitir reanudar al primer clic.
  await audio.evaluate((element: HTMLAudioElement) => element.pause());
  await expect(page.getByRole('button', { name: 'Reproducir música', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reproducir música', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar música', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar música', exact: true }).focus(); await page.keyboard.press('Enter');
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await page.getByRole('button', { name: 'Reproducir música', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar música', exact: true })).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('button', { name: 'Reproducir música', exact: true })).toBeVisible();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});
