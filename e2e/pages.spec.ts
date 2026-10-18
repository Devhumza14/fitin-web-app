import { expect, test } from '@playwright/test'

test('contact form validates phone-or-email and sends', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ json: { ok: true } }))
  await page.goto('/contact')
  await page.getByLabel('Name').fill('Ali')
  await page.getByLabel('Phone or email').fill('ali at home')
  await page.getByLabel('Message').fill('Hi')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Enter a valid email, or a mobile number like 0300 1234567.')).toBeVisible()
  await expect(page.getByText('Tell us a little more (at least 10 characters).')).toBeVisible()
  await page.getByLabel('Phone or email').fill('ali@example.com')
  await page.getByLabel('Message').fill('Do you work in Multan?')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
})

test('privacy policy carries the AdSense disclosures', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy policy')
  await expect(page.getByText(/third-party vendors, including Google, use cookies/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Google Ads Settings' })).toHaveAttribute('href', 'https://adssettings.google.com')
  await page.getByRole('link', { name: 'Terms of service' }).click()
  await expect(page).toHaveURL('/terms')
})

test('about page and 404 page', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Connecting')
  const res = await page.goto('/this-does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page doesn't fit.")
  await page.getByRole('button', { name: 'Put it back together' }).click()
  await expect(page.getByRole('button', { name: 'Knock it over again' })).toBeVisible()
})
