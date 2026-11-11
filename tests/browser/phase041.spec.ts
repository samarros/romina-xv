import { openInvitation } from '../helpers/invitation';
import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

test('Embla fuera de la ruta inicial; se activa antes de usar galería', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requested: string[] = [];
  page.on('request', request => requested.push(request.url()));
  await openInvitation(page, './');
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
  expect(requested.some(url => url.includes('CarouselController-'))).toBe(false);
  await expect(page.locator('#galeria')).toHaveAttribute('data-carousel-state', 'waiting');
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await expect(page.locator('#galeria')).toHaveAttribute('data-carousel-state', 'ready');
  await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
  await expect(page.locator('#galeria [aria-live]')).toContainText('Fotografía 2 de 7');
  expect(requested.filter(url => url.includes('CarouselController-'))).toHaveLength(1);
  const manifest = JSON.parse(await readFile('src/data/photo-manifest.json', 'utf8'));
  for (const file of (await readdir('dist/assets')).filter(file => file.endsWith('.js'))) {
    expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain(manifest[0].originalSha256);
    expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain(manifest[0].variants[0].sha256);
  }
});

test('red lenta al cargar Embla conserva marcado y visor accesible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/CarouselController-*.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });
  await openInvitation(page, './');
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await expect(page.getByRole('region', { name: 'Siete fotografías de Romina', exact: true })).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
  await expect(page.locator('#galeria [aria-roledescription="diapositiva"]')).toHaveCount(7);
  await page.getByRole('button', { name: /^Ampliar fotografía 1:/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#galeria')).toHaveAttribute('data-carousel-state', 'ready');
  await expect(page.locator('#galeria [aria-live]')).toContainText('Fotografía 2 de 7');
});

test('fallo del chunk Embla deja fotos desplazables, visor y datos', async ({ page }) => {
  await page.route('**/CarouselController-*.js', route => route.abort());
  await openInvitation(page, './');
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await expect(page.locator('#galeria')).toHaveAttribute('data-carousel-state', 'fallback');
  await expect(page.getByText('No se pudo activar el carrusel. Puedes desplazar las fotografías y ampliarlas.')).toBeVisible();
  expect(await page.locator('[data-motion="gallery-viewport"]').evaluate(element => getComputedStyle(element).overflowX)).toBe('auto');
  await page.getByRole('button', { name: /^Ampliar fotografía 7:/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Foto 7 de 7');
  await page.keyboard.press('Escape');
  await expect(page.locator('#ubicaciones a')).toHaveCount(2);
});
