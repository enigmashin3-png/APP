import { test, expect } from '@playwright/test';

test('manifest and icons are available', async ({ request, page, baseURL }) => {
  // Root loads
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();

  // Manifest fetch
  const mres = await request.get('/manifest.webmanifest');
  expect(mres.ok()).toBeTruthy();
  const manifest: { icons?: Array<{ src?: string }> } = await mres.json();
  expect(Array.isArray(manifest.icons)).toBeTruthy();
  const has192 = (manifest.icons || []).some((i: { src?: string }) => /icon-192/.test(i.src || ''));
  const has512 = (manifest.icons || []).some((i: { src?: string }) => /icon-512/.test(i.src || ''));
  expect(has192 && has512).toBeTruthy();

  // Icons fetch
  const i192 = await request.get('/icons/icon-192.png');
  expect(i192.ok()).toBeTruthy();
  const i512 = await request.get('/icons/icon-512.png');
  expect(i512.ok()).toBeTruthy();
});
