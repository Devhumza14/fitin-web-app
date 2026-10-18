import { expect, test, type Page } from '@playwright/test'

// Next adds an empty role=alert route announcer to every page; only count the form's alerts.
const alert = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)')

async function mockApi(page: Page, status = 200) {
  let calls = 0
  await page.route('**/api/leads', async (route) => {
    calls++
    await new Promise((r) => setTimeout(r, 300))
    await route.fulfill({ status, json: status === 200 ? { ok: true } : { error: 'unavailable' } })
  })
  return () => calls
}

async function fillToStep4(page: Page) {
  await page.getByRole('radio', { name: 'Kitchen' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: 'Lahore' }).check()
  await page.getByRole('radio', { name: 'Renovation' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: 'Contemporary' }).check()
  await page.getByRole('radio', { name: 'Not sure yet' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
}

test('shows errors only after Continue and clears them live', async ({ page }) => {
  await page.goto('/start')
  await expect(alert(page)).toHaveCount(0)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(alert(page)).toHaveText('Pick the space you want to work on.')
  await page.getByRole('radio', { name: 'Bedroom' }).check()
  await expect(alert(page)).toHaveCount(0)
})

test('prefills from the query string and keeps answers when going Back', async ({ page }) => {
  await page.goto('/start?space=Kitchen&city=Lahore')
  await expect(page.getByRole('radio', { name: 'Kitchen' })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('radio', { name: 'Lahore' })).toBeChecked()
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByRole('radio', { name: 'Kitchen' })).toBeChecked()
})

test('rejects a landline and accepts a mobile', async ({ page }) => {
  await mockApi(page)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('042 35761234')
  await page.getByRole('button', { name: 'Request my free quote' }).click()
  await expect(alert(page)).toHaveText('Enter a Pakistani mobile number, e.g. 0300 1234567.')
})

test('submits once on a double click and shows the confirmation', async ({ page }) => {
  const calls = await mockApi(page)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('0300 1234567')
  await page.getByRole('button', { name: 'Request my free quote' }).dblclick()
  await expect(page.getByRole('heading', { name: 'Request received, Ayesha.' })).toBeVisible()
  expect(calls()).toBe(1)
})

test('offers WhatsApp when the server cannot take the lead', async ({ page }) => {
  await mockApi(page, 502)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('0300 1234567')
  await page.getByRole('button', { name: 'Request my free quote' }).click()
  const wa = page.getByRole('link', { name: 'Send it on WhatsApp' })
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/923111555264\?text=/)
})
