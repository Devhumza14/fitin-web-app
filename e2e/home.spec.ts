import { expect, test } from '@playwright/test'

test('hero, room links and how-it-works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Design, build and fit — all in one place\./)
  await expect(page.getByRole('link', { name: /Living rooms/ }).first()).toHaveAttribute('href', '/designs/living-rooms')
  await expect(page.locator('#how').getByRole('listitem')).toHaveCount(4)
  await expect(page.getByText('Free quote in under 24 hours')).toBeVisible()
})

test('desktop start form submits its choices to /start', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop form')
  await page.goto('/')
  const form = page.getByRole('form', { name: 'Start your project' })
  await form.getByLabel('Space').selectOption('Kitchen')
  await form.getByLabel('City').selectOption('Lahore')
  await form.getByRole('button', { name: 'Start project' }).click()
  await page.waitForURL(/\/start\?space=Kitchen&city=Lahore&service=/)
})

test('phone start pill links to /start', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone pill')
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Start your project/ }).first()).toHaveAttribute('href', '/start')
})
