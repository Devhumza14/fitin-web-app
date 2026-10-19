import { expect, test } from '@playwright/test'

test('sitemap lists key routes and skips the API', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const p of ['/designs/kitchens', '/services/renovation', '/journal/modular-kitchen-cost-pakistan', '/kitchen-cost-calculator', '/privacy']) {
    expect(xml).toContain(`https://fitin.space${p}</loc>`)
  }
  expect(xml).not.toContain('/api/')
})

test('site is hidden from search engines unless ALLOW_INDEXING=1', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(await res.text()).toMatch(/^Disallow: \/$/m)
  expect((await request.get('/')).headers()['x-robots-tag']).toBe('noindex, nofollow')
})

test('ads.txt is 404 until a publisher id is configured', async ({ request }) => {
  expect((await request.get('/ads.txt')).status()).toBe(404)
})

test('OG image and icons are served', async ({ request }) => {
  const og = await request.get('/opengraph-image')
  expect(og.headers()['content-type']).toContain('image/png')
  expect((await request.get('/icon.svg')).status()).toBe(200)
})

test('pages without their own OG image fall back to the site image', async ({ page }) => {
  for (const path of ['/', '/designs', '/services']) {
    await page.goto(path)
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\/opengraph-image/)
  }
})

test('pages carry canonical, JSON-LD and OG tags', async ({ page }) => {
  await page.goto('/designs')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://fitin.space/designs')
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.join()).toContain('HomeAndConstructionBusiness')
  await page.goto('/journal/modular-kitchen-cost-pakistan')
  expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join()).toContain('"@type":"Article"')
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /opengraph-image/)
})
