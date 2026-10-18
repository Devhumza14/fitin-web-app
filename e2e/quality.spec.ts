import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.setTimeout(600_000)

async function sitemapPaths(request: import('@playwright/test').APIRequestContext) {
  const xml = await (await request.get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
}

test('every sitemap page loads, has one h1 and no serious accessibility issues', async ({ page, request }) => {
  const paths = await sitemapPaths(request)
  expect(paths.length).toBeGreaterThan(30)
  for (const p of paths) {
    const res = await page.goto(p)
    expect(res?.status(), p).toBe(200)
    await expect(page.locator('h1'), p).toHaveCount(1)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)
    expect(serious, p).toEqual([])
  }
})

test('no broken internal links', async ({ page, request }) => {
  const links = new Set<string>()
  for (const p of await sitemapPaths(request)) {
    await page.goto(p)
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      links.add(href.split('#')[0].split('?')[0] || '/')
    }
  }
  for (const href of links) {
    const res = await request.get(href)
    expect(res.status(), href).toBeLessThan(400)
  }
})
