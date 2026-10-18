import { expect, test } from 'vitest'

test('vitest runs with the @ alias', async () => {
  expect((await import('@/next.config')).default).toBeTruthy()
})
