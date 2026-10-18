import { expect, test } from '@playwright/test'

test('home renders the hero heading in Figtree', async ({ page }) => {
  await page.goto('/')
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toContainText('Design, build and fit')
  const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily)
  expect(font.toLowerCase()).toContain('figtree')
  const color = await h1.evaluate((el) => getComputedStyle(el).color)
  expect(color).toBe('rgb(14, 35, 64)')
})
