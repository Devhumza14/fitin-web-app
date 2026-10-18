import { expect, test } from '@playwright/test'

test('journal index links to articles', async ({ page }) => {
  await page.goto('/journal')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Fitin Journal')
  await page.getByRole('link', { name: /Modular kitchen cost in Pakistan/ }).first().click()
  await expect(page).toHaveURL('/journal/modular-kitchen-cost-pakistan')
})

test('article renders content, related links and no ads without an AdSense id', async ({ page }) => {
  await page.goto('/journal/modular-kitchen-cost-pakistan')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Modular kitchen cost in Pakistan')
  await expect(page.getByRole('link', { name: 'kitchen cost calculator' }).first()).toHaveAttribute('href', '/kitchen-cost-calculator')
  await expect(page.locator('script[src*="googlesyndication"]')).toHaveCount(0)
  await expect(page.getByRole('complementary', { name: 'Advertisement' })).toHaveCount(0)
})

test('unknown article is a 404', async ({ page }) => {
  expect((await page.goto('/journal/nope'))?.status()).toBe(404)
})
