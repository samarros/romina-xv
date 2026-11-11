import { openInvitation } from '../helpers/invitation';
import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1280, 900], [1440, 900]]) {
  test(`invitación y recursos en ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const external: string[] = [];
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4180/')) external.push(request.url()); });
    await openInvitation(page, './');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1, name: 'Lia Romina Santos Enriquez' })).toBeVisible();
    const photo = page.locator('#inicio img');
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const frameWidth = await page.locator('header').evaluate(header => header.getBoundingClientRect().width);
    expect(frameWidth).toBeLessThanOrEqual(1248);
    const nameFits = await page.locator('h1 span').evaluateAll(spans => spans.every(span => span.scrollWidth <= span.clientWidth));
    expect(nameFits).toBe(true);
    expect(await page.evaluate(() => ['400 32px "Great Vibes"', '500 24px "Cormorant Garamond"', '400 16px "Montserrat"'].every(font => document.fonts.check(font, 'Romina Años')))).toBe(true);
    expect(await page.evaluate(() => ['Great Vibes', 'Cormorant Garamond', 'Montserrat'].every(name => [...document.fonts].some(face => face.family.replaceAll('"', '') === name && face.status === 'loaded')))).toBe(true);
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    const anchors = await page.locator('a[href^="#"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')!.slice(1)));
    expect(anchors.every(id => ids.includes(id))).toBe(true);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
    for (const id of ['inicio', 'cuenta-regresiva', 'historia', 'galeria', 'itinerario', 'ubicaciones', 'vestimenta', 'confirmar', 'cierre']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator('#galeria [aria-roledescription="diapositiva"]')).toHaveCount(7);
    await expect(page.locator('audio')).toHaveAttribute('src', /celebration-.*[.]m4a/);
    await page.locator('#galeria').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#galeria img')].every(image => image.hasAttribute('src')));
    await page.locator('#cierre').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      // Solo QA: cargar también slides fuera del viewport para una captura completa.
      document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      return Promise.all([...document.images].map(img => img.decode().catch(() => undefined)));
    });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await mkdir('docs/screenshots', { recursive: true });
    await page.screenshot({ path: `docs/screenshots/phase05-regression-${width}.png`, fullPage: true });
  });
}

test('menú móvil: teclado, Escape, ancla y cambio a escritorio', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openInvitation(page, './');
  const toggle = page.getByRole('button', { name: 'Abrir menú' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Inicio', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.getByRole('link', { name: 'Mi historia', exact: true }).click();
  await expect(page.locator('#historia')).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('link', { name: 'Mi historia', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('movimiento reducido mantiene hero visible y permite entrar sin música', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openInvitation(page, './');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.locator('#confirmar a[target="_blank"]').evaluate(link => getComputedStyle(link).transitionDuration.split(',').every(duration => parseFloat(duration) === 0))).toBe(true);
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('audio')).toHaveAttribute('src', /celebration-.*[.]m4a/);
  await expect(page.locator('[data-animation="hero-photo"] img')).toBeVisible();
  await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
  await expect(page.locator('#galeria [aria-live="polite"]')).toContainText('Fotografía 2 de 7');
});

test('Edge puede decodificar el M4A original sin modificarlo', async ({ page }, testInfo) => {
  const original = await readFile('src/assets/audio/celebration.m4a');
  await page.route('**/__qa/audio.m4a', route => route.fulfill({ contentType: 'audio/mp4', body: original }));
  await openInvitation(page, './');
  const result = await page.evaluate(async () => {
    const support = new Audio().canPlayType('audio/mp4');
    const context = new AudioContext({ sampleRate: 44100 });
    try {
      const response = await fetch('./__qa/audio.m4a');
      const audio = await context.decodeAudioData(await response.arrayBuffer());
      return { support, duration: audio.duration, channels: audio.numberOfChannels, sampleRate: audio.sampleRate };
    } finally { await context.close(); }
  });
  expect(result.support).not.toBe('');
  expect(result.duration).toBeGreaterThan(302);
  expect(result.duration).toBeLessThan(305);
  expect(result.channels).toBe(2);
  expect(result.sampleRate).toBe(44100);
  console.log(`Audio Edge: ${JSON.stringify(result)}`);
  await testInfo.attach('audio-decode.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
});
