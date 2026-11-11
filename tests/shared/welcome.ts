import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

export async function blockAutoplay(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const nativePlay = HTMLMediaElement.prototype.play;
    let firstAttempt = true;
    HTMLMediaElement.prototype.play = function () {
      if (firstAttempt) { firstAttempt = false; return Promise.reject(new DOMException('Primer intento bloqueado para QA', 'NotAllowedError')); }
      return nativePlay.call(this);
    };
  });
}

export function registerWelcomeTests() {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900]]) {
    test(`bienvenida con autoplay bloqueado, reduce y Axe ${width}px`, async ({ page }, info) => {
      await blockAutoplay(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height });
      await page.goto('./');
      const dialog = page.getByRole('dialog', { name: 'Lia Romina Santos Enriquez', exact: true });
      await expect(dialog).toBeVisible();
      await expect(page.locator('audio')).toHaveCount(1);
      await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'reduced');
      await expect(page.getByRole('button', { name: 'Abrir invitación con música', exact: true })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => document.fonts.ready);
      await dialog.locator('img').evaluate((image: HTMLImageElement) => image.decode());
      await mkdir('docs/phase05', { recursive: true });
      const engine = info.project.name || 'edge';
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      await writeFile(`docs/phase05/welcome-axe-${engine}-${width}.json`, JSON.stringify({ violations: axe.violations, incomplete: axe.incomplete }, null, 2));
      expect(axe.violations).toEqual([]);
      await page.screenshot({ path: `docs/screenshots/phase05-welcome-${engine}-${width}.png` });
      await page.getByRole('button', { name: 'Abrir sin música', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
      await expect(page.getByRole('heading', { level: 1, name: 'Lia Romina Santos Enriquez' })).toBeVisible();
    });
  }

  test('bloqueo gestionado: un gesto reproduce el M4A y no repite la apertura', async ({ page }, info) => {
    await blockAutoplay(page);
    await page.goto('./');
    await expect(page.locator('audio')).toHaveAttribute('data-autoplay-state', 'blocked');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
    const button = page.getByRole('button', { name: 'Abrir invitación con música', exact: true });
    await button.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Pausar música', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.locator('audio')).toHaveCount(1);
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
    await expect.poll(() => page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(.1);
    const state = await page.locator('audio').evaluate((audio: HTMLAudioElement) => ({ muted: audio.muted, volume: audio.volume, paused: audio.paused, src: audio.currentSrc }));
    expect(state.muted).toBe(false); expect(state.paused).toBe(false); expect(state.volume).toBeGreaterThan(0);
    await mkdir('docs/phase05', { recursive: true });
    await writeFile(`docs/phase05/gesture-audio-${info.project.name || 'edge'}.json`, JSON.stringify(state, null, 2));
    await page.getByRole('button', { name: 'Pausar música', exact: true }).click();
    expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  });

  test('autoplay permitido simulado: sin bienvenida, una sola instancia y un intento', async ({ page }) => {
    await page.addInitScript(() => {
      let calls = 0;
      HTMLMediaElement.prototype.play = function () {
        this.dataset.playCalls = String(++calls);
        Object.defineProperty(this, 'paused', { configurable: true, get: () => false });
        this.dispatchEvent(new Event('playing'));
        return Promise.resolve();
      };
    });
    await page.goto('./');
    await expect(page.locator('audio')).toHaveAttribute('data-autoplay-state', 'allowed');
    await expect(page.locator('audio')).toHaveAttribute('data-play-calls', '1');
    await expect(page.locator('audio')).toHaveCount(1);
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pausar música', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.muted)).toBe(false);
  });

  test('formato no disponible: error accesible, reintento y contenido sin modal', async ({ page }) => {
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Formato no disponible para QA', 'NotSupportedError')); });
    await page.goto('./');
    await expect(page.locator('audio')).toHaveAttribute('data-autoplay-state', 'error');
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reintentar música', exact: true })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'No se pudo reproducir' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar música', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reintentar música', exact: true })).toBeVisible();
  });

  test('Escape abre sin música y el retorno de pestaña no reproduce solo', async ({ page }) => {
    await blockAutoplay(page);
    await page.goto('./');
    await expect(page.getByRole('button', { name: 'Abrir sin música', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
    await expect(page.getByRole('button', { name: 'Reproducir música', exact: true })).toBeVisible();
  });
}
