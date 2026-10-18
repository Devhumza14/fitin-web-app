import { test } from '@playwright/test'

test.setTimeout(180_000)

const PAGES = ['/', '/designs', '/designs/living-rooms/teal-accent-lounge', '/services', '/services/modular-kitchens-wardrobes',
  '/kitchen-cost-calculator', '/start', '/journal', '/journal/modular-kitchen-cost-pakistan', '/for-designers', '/about', '/contact', '/privacy', '/nope']

test('capture review screenshots', async ({ page }, info) => {
  test.skip(!process.env.REVIEW, 'set REVIEW=1 to capture')
  for (const p of PAGES) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `review/${info.project.name}${p.replace(/\//g, '_') || '_home'}.png`, fullPage: true })
  }
})
