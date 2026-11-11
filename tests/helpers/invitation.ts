import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Las regresiones de contenido entran sin música; autoplay se prueba por separado.
export async function openInvitation(page: Page, url = './') {
  await mkdir('docs/phase05', { recursive: true });
  const response = await page.goto(url);
  const audio = page.locator('audio');
  await expect(audio).toHaveCount(1);
  await expect(audio).toHaveAttribute('data-autoplay-state', /^(allowed|blocked|error|skipped)$/, { timeout: 15000 });
  if (await page.locator('dialog[aria-labelledby="welcome-title"]').count()) {
    await page.getByRole('button', { name: 'Abrir sin música', exact: true }).click();
  } else if (await page.getByRole('button', { name: 'Pausar música', exact: true }).count()) {
    await page.getByRole('button', { name: 'Pausar música', exact: true }).click();
  }
  return response;
}
