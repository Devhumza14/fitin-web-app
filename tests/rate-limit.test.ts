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

test('keeps at most 10,000 keys, even when every key is live', () => {
  const hit = createRateLimiter({ limit: 1, windowMs: 1000 })
  for (let i = 0; i < 12_000; i++) hit(`k${i}`, 0)
  expect(hit('k0', 1)).toBe(true) // evicted oldest-first, so it starts fresh
  expect(hit('k11999', 1)).toBe(false) // newest key is still counted
})
