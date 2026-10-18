import { expect, test } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

test('allows `limit` hits per window per key', () => {
  const hit = createRateLimiter({ limit: 2, windowMs: 1000 })
  expect(hit('a', 0)).toBe(true)
  expect(hit('a', 10)).toBe(true)
  expect(hit('a', 20)).toBe(false)
  expect(hit('b', 20)).toBe(true)
  expect(hit('a', 1011)).toBe(true)
})
