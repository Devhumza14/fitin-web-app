import { expect, test } from '@playwright/test'

test('services overview links the four service pages', async ({ page }) => {
  await page.goto('/services')
  for (const slug of ['modular-kitchens-wardrobes', 'full-home-interiors', 'signature', 'renovation']) {
    await expect(page.locator(`a[href="/services/${slug}"]`).first()).toBeVisible()
  }
})

test('service page renders and unknown service is a 404', async ({ page }) => {
  await page.goto('/services/renovation')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Renovation')
  expect((await page.goto('/services/plumbing'))?.status()).toBe(404)
})

test('calculator updates the estimate from the slider and keyboard', async ({ page }) => {
  await page.goto('/kitchen-cost-calculator')
  const slider = page.getByRole('slider', { name: 'Kitchen length in running feet' })
  await expect(page.getByTestId('estimate')).toHaveText('PKR 7.55–9.19 Lakh')
  await slider.fill('24')
  await expect(page.getByTestId('estimate')).toHaveText('PKR 15.10–18.38 Lakh')
  await slider.press('ArrowRight')
  await expect(slider).toHaveValue('25')
})

test('modular service page embeds the calculator', async ({ page }) => {
  await page.goto('/services/modular-kitchens-wardrobes')
  await expect(page.getByTestId('estimate')).toBeVisible()
})
