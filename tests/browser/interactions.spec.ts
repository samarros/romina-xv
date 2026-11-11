import { openInvitation } from '../helpers/invitation';
import { expect, test } from '@playwright/test';

test('contador sincronizado, último segundo y mensaje final', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-12-20T00:59:57Z') });
  await openInvitation(page, './');
  await expect(page.locator('[data-unit="seconds"]')).toHaveText('03');
  await page.clock.fastForward(2000);
  await expect(page.locator('[data-unit="seconds"]')).toHaveText('01');
  await page.clock.fastForward(1000);
  await expect(page.locator('#cuenta-regresiva')).toContainText('¡Llegó el gran día!');
  await expect(page.getByRole('timer')).toHaveCount(0);
});

test('visita posterior al evento no muestra valores negativos', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-12-21T12:00:00Z'));
  await openInvitation(page, './');
  await expect(page.locator('#cuenta-regresiva [role="status"]')).toContainText('Celebremos los XV de Romina');
});

test('carrusel con flechas, indicadores, teclado y arrastre', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openInvitation(page, './');
  const status = page.locator('#galeria [aria-live="polite"]');
  await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
  await expect(status).toContainText('Fotografía 2 de 7');
  await page.getByRole('button', { name: 'Fotografía anterior', exact: true }).click();
  await expect(status).toContainText('Fotografía 1 de 7');
  await page.getByRole('button', { name: 'Ir a fotografía 4', exact: true }).click();
  await expect(status).toContainText('Fotografía 4 de 7');
  const viewport = page.getByLabel('Fotografías; usa las flechas del teclado para desplazarte', { exact: true });
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect(status).toContainText('Fotografía 5 de 7');
  await expect(page.getByRole('button', { name: 'Ir a fotografía 5', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // Esperar el asentamiento funcional de Embla antes de iniciar otro gesto.
  await page.waitForTimeout(900);
  const box = (await viewport.boundingBox())!;
  await page.mouse.move(box.x + box.width * .8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .15, box.y + box.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect(status).not.toContainText('Fotografía 5 de 7');
});

test('visor modal: foco contenido, Escape, botón y restauración de scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openInvitation(page, './');
  const trigger = page.getByRole('button', { name: /^Ampliar fotografía 1:/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Visor de fotografías de Romina' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar visor', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('Foto 2 de 7');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await trigger.click();
  await page.getByRole('button', { name: 'Cerrar visor', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Maps exactos y WhatsApp codificado con apertura de pestaña simulada', async ({ page, context }) => {
  await openInvitation(page, './');
  const mapLinks = page.locator('#ubicaciones a[target="_blank"]');
  await expect(mapLinks.nth(0)).toHaveAttribute('href', 'https://maps.app.goo.gl/gkonoHcZCNkU6B46A');
  await expect(mapLinks.nth(1)).toHaveAttribute('href', 'https://maps.app.goo.gl/4YQr1kB1zyykbiQs7');
  const rsvp = page.locator('#confirmar a[target="_blank"]');
  const url = new URL((await rsvp.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/528713776355');
  expect(url.searchParams.get('text')).toBe('Confirmo asistencia para celebrar los XV de Romina');
  await context.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Destino simulado</title>' }));
  const popupPromise = page.waitForEvent('popup');
  await rsvp.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(new URL(popup.url()).searchParams.get('text')).toBe(url.searchParams.get('text'));
  await popup.close();
  await expect(page.locator('form')).toHaveCount(0);
});

test('música tras entrada: play real y pausa conservando estado al navegar', async ({ page }) => {
  const audioRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('.m4a')) audioRequests.push(request.url()); });
  await openInvitation(page, './');
  const audio = page.locator('audio');
  await expect(audio).toHaveAttribute('src', /celebration-.*[.]m4a/);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await audio.evaluate((element: HTMLAudioElement) => { element.muted = true; });
  await page.getByRole('button', { name: 'Reproducir música', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar música', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-animate="true"] i')).toHaveCount(3);
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(.1);
  expect(audioRequests.length).toBeGreaterThan(0);
  await page.locator('#confirmar').scrollIntoViewIfNeeded();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pausar música', exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Reproducir música', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-animate="true"] i')).toHaveCount(0);
});

test('rechazo de play muestra error y permite reintentar sin afirmar reproducción', async ({ page }) => {
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Bloqueado para esta prueba', 'NotAllowedError')); });
  await openInvitation(page, './');
  await page.getByRole('button', { name: 'Reproducir música', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'No se pudo reproducir' })).toBeVisible();
  const retry = page.getByRole('button', { name: 'Reintentar música', exact: true });
  await expect(retry).toHaveAttribute('aria-pressed', 'false');
  await retry.click();
  await expect(retry).toBeVisible();
});

test('carrusel responde a un gesto táctil simulado en Edge', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await openInvitation(page, 'http://127.0.0.1:4180/romina-xv/');
    const viewport = page.getByLabel('Fotografías; usa las flechas del teclado para desplazarte', { exact: true });
    await viewport.scrollIntoViewIfNeeded();
    const box = (await viewport.boundingBox())!;
    const client = await context.newCDPSession(page);
    const point = (fraction: number) => ({ x: box.x + box.width * fraction, y: box.y + box.height / 2 });
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(.85)] });
    for (let step = 1; step <= 12; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(.85 - step * .06)] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('#galeria [aria-live="polite"]')).not.toContainText('Fotografía 1 de 7');
  } finally { await context.close(); }
});
