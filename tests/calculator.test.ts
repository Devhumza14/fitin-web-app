import { expect, test } from 'vitest'
import { kitchenEstimate } from '@/lib/calculator'

test.each([
  [12, '7.55', '9.19'],
  [6, '3.77', '4.59'],
  [24, '15.10', '18.38'],
  [30, '18.88', '22.97'],
])('%i rft → PKR %s–%s Lakh', (rft, low, high) => {
  expect(kitchenEstimate(rft)).toEqual({ rft, low, high })
})

test('clamps and rounds out-of-range input', () => {
  expect(kitchenEstimate(100).rft).toBe(30)
  expect(kitchenEstimate(1).rft).toBe(6)
  expect(kitchenEstimate(12.4).rft).toBe(12)
  expect(kitchenEstimate(Number.NaN).rft).toBe(12)
})
