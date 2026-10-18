import { expect, test } from '@playwright/test'

test('partner application validates and submits', async ({ page }) => {
  let body: Record<string, unknown> = {}
  await page.route('**/api/leads', async (route) => { body = route.request().postDataJSON(); await route.fulfill({ json: { ok: true } }) })
  await page.goto('/for-designers')
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByText('Pick at least one specialty.')).toBeVisible()
  await expect(page.getByText('Add a link to your work so we can review it.')).toBeVisible()

  await page.getByRole('radio', { name: 'Vendor' }).check()
  await expect(page.getByLabel('Business name')).toBeVisible()
  await page.getByLabel('Full name').fill('Sara Khan')
  await page.getByLabel('City').selectOption('Lahore')
  await page.getByLabel('Phone').fill('0321 1234567')
  await page.getByLabel('Portfolio or Instagram link').fill('@sara.designs')
  await page.getByRole('checkbox', { name: 'Kitchens' }).check()
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByRole('heading', { name: 'Application received.' })).toBeVisible()
  expect(body).toMatchObject({ type: 'partner', role: 'Vendor', specialties: ['Kitchens'] })
})

test('FAQ answers expand natively', async ({ page }) => {
  await page.goto('/for-designers')
  await page.getByText('How do referral payouts work?').click()
  await expect(page.getByText(/When a client you refer starts a project, you earn a 5% commission/)).toBeVisible()
})
