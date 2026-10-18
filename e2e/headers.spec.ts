import { expect, test } from '@playwright/test'

test('security headers are set', async ({ request }) => {
  const h = (await request.get('/')).headers()
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(h['content-security-policy']).toContain("object-src 'none'")
  expect(h['strict-transport-security']).toContain('max-age=63072000')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['permissions-policy']).toContain('camera=()')
  expect(h['x-powered-by']).toBeUndefined()
})

test('no CSP violations while using the site', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()) })
  for (const p of ['/', '/designs/living-rooms/teal-accent-lounge', '/start', '/journal/modular-kitchen-cost-pakistan', '/kitchen-cost-calculator']) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
  }
  expect(violations).toEqual([])
})
