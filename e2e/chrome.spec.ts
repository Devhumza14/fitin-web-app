import { expect, test } from '@playwright/test'

test('footer links every page AdSense reviewers look for', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  for (const [name, href] of [['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']]) {
    await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(footer).toContainText('hello@fitin.space')
})

test('desktop header has primary nav, sign in and start project', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only')
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: /Explore/ })).toHaveAttribute('href', '/designs')
  await expect(nav.getByRole('link', { name: /Services/ })).toHaveAttribute('href', '/services')
  await expect(nav.getByRole('link', { name: /Journal/ })).toHaveAttribute('href', '/journal')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', 'https://crm.fitin.space')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Start project' })).toHaveAttribute('href', '/start')
})

test('phone menu opens as a dialog and closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: /Explore designs/ })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Start your project' })).toHaveAttribute('href', '/start')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
