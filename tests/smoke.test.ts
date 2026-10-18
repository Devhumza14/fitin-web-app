import { expect, test } from 'vitest'

test('vitest runs with the @ alias', async () => {
  const mod = await import('@/next.config')
  expect(mod.default.poweredByHeader).toBe(false)
})
