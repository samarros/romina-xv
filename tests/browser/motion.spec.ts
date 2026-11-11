import { openInvitation } from '../helpers/invitation';
import { expect, test } from '@playwright/test';
import { readFile, readdir, writeFile } from 'node:fs/promises';

test('inicializa una raíz, limpia al pausar y reconstruye sin acumular contextos', async ({ page }) => {
  await openInvitation(page, './');
  const root = page.locator('[data-motion-root]');
  await expect(root).toHaveAttribute('data-motion-state', 'active');
  await expect(root).toHaveAttribute('data-motion-contexts', '1');
  expect(Number(await root.getAttribute('data-motion-triggers'))).toBeGreaterThan(0);
  const count = await root.getAttribute('data-motion-triggers');
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
    await expect(root).toHaveAttribute('data-motion-state', 'off');
    await expect(root).toHaveAttribute('data-motion-triggers', '0');
    await expect(page.locator('#hero-title > span > span')).toHaveCount(0);
    await expect(page.locator('[data-motion-particle]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reanudar animaciones', exact: true }).click();
    await expect(root).toHaveAttribute('data-motion-state', 'active');
    await expect(root).toHaveAttribute('data-motion-contexts', '1');
    await expect(root).toHaveAttribute('data-motion-triggers', count!);
  }
});

test('cambio dinámico a reduce revierte SplitText y conserva navegación', async ({ page }) => {
  await openInvitation(page, './');
  const root = page.locator('[data-motion-root]');
  await expect(root).toHaveAttribute('data-motion-state', 'active');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-motion-state', 'reduced');
  await expect(root).toHaveAttribute('data-motion-triggers', '0');
  await expect(page.locator('[data-motion-particle]')).toHaveCount(0);
  await expect(page.locator('#hero-title > span > span')).toHaveCount(0);
  await page.getByRole('link', { name: 'Mi historia', exact: true }).click();
  await expect(page.locator('#historia')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Mi historia', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-motion-state', 'active');
});

test('fallback si no carga GSAP deja datos y enlaces disponibles', async ({ page }) => {
  await page.route('**/assets/runtime-*.js', route => route.abort());
  await openInvitation(page, './');
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'fallback');
  await expect(page.locator('#hero-title')).toBeVisible();
  expect(await page.locator('#hero-title').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  await expect(page.locator('#ubicaciones a')).toHaveCount(2);
  await page.getByRole('link', { name: 'Confirmar', exact: true }).click();
  await expect(page.locator('#confirmar')).toBeFocused();
});

test('laboratorio y su texto no se distribuyen en producción incluso con query', async ({ page }) => {
  await openInvitation(page, './?debugAnimations=1');
  await expect(page.getByRole('complementary', { name: 'Laboratorio de animaciones' })).toHaveCount(0);
  for (const file of (await readdir('dist/assets')).filter(file => file.endsWith('.js'))) {
    expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain('Laboratorio de animaciones');
  }
});

test('anclas con motion activo y pausado mantienen el contenido legible', async ({ page }) => {
  await openInvitation(page, './');
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
  for (const label of ['Mi historia', 'Galería', 'Itinerario', 'Ubicaciones', 'Confirmar']) {
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator('main')).toBeVisible();
    const section = await page.locator('section:focus').getAttribute('id');
    expect(section).toBeTruthy();
    expect(await page.locator(`#${section} h2`).evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  }
  await page.getByRole('button', { name: 'Pausar animaciones' }).click();
  await page.getByRole('link', { name: 'Inicio', exact: true }).click();
  await expect(page.locator('#inicio')).toBeFocused();
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'off');
});

for (const width of [320, 390, 768, 1440]) {
  test(`captura final después de recorrer todas las secciones ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openInvitation(page, './');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
    await page.locator('#galeria').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#galeria img')].every(image => image.hasAttribute('src')));
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
    });
    for (const id of ['cuenta-regresiva', 'historia', 'galeria', 'itinerario', 'ubicaciones', 'vestimenta', 'confirmar', 'cierre']) {
      await page.locator(`#${id}`).focus();
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
    await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `docs/screenshots/phase05-motion-final-${width}.png`, fullPage: true });
  });
}

test('muestra de frames, long tasks y CLS durante scroll real', async ({ page }) => {
  await page.addInitScript(() => {
    const data = { cls: 0, longTasks: [] as number[], epoch: 0 };
    (window as unknown as { motionPerf: typeof data }).motionPerf = data;
    new PerformanceObserver(list => list.getEntries().forEach(entry => {
      const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!shift.hadRecentInput && entry.startTime >= data.epoch) data.cls += shift.value;
    })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => list.getEntries().forEach(entry => { if (entry.startTime >= data.epoch) data.longTasks.push(entry.duration); })).observe({ type: 'longtask', buffered: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openInvitation(page, './');
  await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'active');
  const startup = await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const data = (window as unknown as { motionPerf: { cls: number; longTasks: number[]; epoch: number } }).motionPerf;
    const before = { cls: data.cls, longTasks: [...data.longTasks] };
    data.cls = 0; data.longTasks = []; data.epoch = performance.now();
    return before;
  });
  const frames = await page.evaluate(() => new Promise<number[]>(resolve => {
    const deltas: number[] = []; let first = 0; let previous = 0;
    function tick(now: number) {
      if (!first) first = previous = now;
      deltas.push(now - previous); previous = now;
      window.scrollTo({ top: Math.min((now - first) * .65, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' });
      if (now - first < 6000) requestAnimationFrame(tick); else resolve(deltas.slice(1));
    }
    requestAnimationFrame(tick);
  }));
  const observed = await page.evaluate(() => (window as unknown as { motionPerf: { cls: number; longTasks: number[] } }).motionPerf);
  const sorted = [...frames].sort((a, b) => a - b);
  const metrics = { environment: 'Edge headless Windows, 1440x900; muestra de 6 s tras fuentes e inicialización, sin garantía de FPS en dispositivos reales', startup, frames: frames.length, medianFrameMs: sorted[Math.floor(sorted.length / 2)], p95FrameMs: sorted[Math.floor(sorted.length * .95)], framesOver50ms: frames.filter(value => value > 50).length, duringMotion: observed };
  await writeFile('docs/phase05/motion-performance.json', JSON.stringify(metrics, null, 2) + '\n');
  console.log(`Motion performance: ${JSON.stringify(metrics)}`);
  expect(frames.length).toBeGreaterThan(0);
});
