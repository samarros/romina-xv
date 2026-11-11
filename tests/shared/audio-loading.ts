import { test, expect } from '@playwright/test';

export function registerLoadingTest() {
  test('carga pendiente simulada: nombre accesible, cancelación y contenido disponible', async ({ page }) => {
    // Play controlado para representar una espera sin depender del transporte de
    // medios del motor; la reproducción del archivo real se prueba por separado.
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => new Promise<void>(() => {}); });
    await page.goto('./');
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-intro-state', 'done');
    const cancel = page.getByRole('button', { name: 'Cargando música, cancelar carga', exact: true });
    await expect(cancel).toBeVisible();
    await expect(page.locator('dialog')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-motion-root]')).toHaveAttribute('data-motion-state', 'reduced');
    await expect(cancel).toContainText('Cargando');
    await cancel.click();
    await expect(page.getByRole('button', { name: 'Reproducir música', exact: true })).toBeVisible();
    await expect(page.locator('audio')).toHaveAttribute('data-autoplay-state', 'skipped');
    expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Axe completo se ejecuta en las pruebas dedicadas de página, visor y bienvenida.
  });
}
