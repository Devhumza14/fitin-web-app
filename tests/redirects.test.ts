import type { NextConfig } from 'next'
import { expect, test } from 'vitest'
import config from '@/next.config'

test('old URLs and www redirect permanently', async () => {
  const resolved = typeof config === 'function' ? await (config as unknown as () => Promise<NextConfig>)() : config
  const rules = await resolved.redirects!()
  const find = (source: string) => rules.find((r) => r.source === source)
  expect(find('/services/modular')).toMatchObject({ destination: '/services/modular-kitchens-wardrobes', permanent: true })
  expect(find('/services/full-home')).toMatchObject({ destination: '/services/full-home-interiors', permanent: true })
  expect(find('/consultation')).toMatchObject({ destination: '/start', permanent: true })
  expect(find('/calculator')).toMatchObject({ destination: '/kitchen-cost-calculator', permanent: true })
  expect(find('/explore')).toMatchObject({ destination: '/designs', permanent: true })
  expect(find('/packages')).toMatchObject({ destination: '/services', permanent: true })
  expect(rules.find((r) => r.has?.some((h) => 'value' in h && h.value === 'www.fitin.space'))).toMatchObject({ destination: 'https://fitin.space/:path*', permanent: true })
})
