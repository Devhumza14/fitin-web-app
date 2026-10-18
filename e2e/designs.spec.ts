import { expect, test } from '@playwright/test'

test('explore lists all draft designs and filters by style via the URL', async ({ page }) => {
  await page.goto('/designs')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(14)
  await page.getByLabel('Style').selectOption('Japandi Minimal')
  await expect(page).toHaveURL(/style=Japandi\+Minimal/)
  await expect(cards).toHaveCount(3)
})

test('room tab opens the room page with only that room', async ({ page }) => {
  await page.goto('/designs')
  await page.getByRole('link', { name: 'Kitchens', exact: true }).click()
  await expect(page).toHaveURL('/designs/kitchens')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kitchen designs')
  await expect(page.getByRole('article')).toHaveCount(4)
})

test('design detail shows the design, finishes and a prefilled quote link', async ({ page }) => {
  await page.goto('/designs/living-rooms/teal-accent-lounge')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Teal accent lounge')
  await page.getByRole('radio', { name: 'Teal linen' }).check()
  await expect(page.getByText('Upholstery · Teal linen')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Request a quote' }).first()).toHaveAttribute('href', '/start?space=Living+room&design=teal-accent-lounge')
})

test('save heart persists across reloads', async ({ page }) => {
  await page.goto('/designs')
  const heart = page.getByRole('button', { name: 'Save Teal accent lounge' })
  await heart.click()
  await expect(page.getByRole('button', { name: 'Remove Teal accent lounge from saved' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remove Teal accent lounge from saved' })).toBeVisible()
})

for (const url of ['/designs/kichens', '/designs/kitchens/nope', '/designs/living-rooms/open-white-kitchen']) {
  test(`unknown design URL ${url} returns 404`, async ({ page }) => {
    const res = await page.goto(url)
    expect(res?.status()).toBe(404)
  })
}
