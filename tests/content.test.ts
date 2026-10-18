import { existsSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ROOMS, designHref, getDesign, getDesigns, getService, getServices, site, similarDesigns } from '@/lib/content'

afterEach(() => vi.unstubAllEnvs())

describe('designs', () => {
  test('all 14 seeded designs load in development', () => {
    expect(getDesigns()).toHaveLength(14)
  })
  test('every image exists in public/', () => {
    for (const d of getDesigns()) expect(existsSync(path.join('public', d.image)), d.image).toBe(true)
  })
  test('slugs are unique and match their file names', () => {
    const slugs = getDesigns().map((d) => d.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  test('drafts are hidden in production unless INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(getDesigns()).toHaveLength(0)
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(getDesigns()).toHaveLength(14)
  })
  test('lookup by room + slug and href', () => {
    const d = getDesign('living-rooms', 'teal-accent-lounge')
    expect(d?.title).toBe('Teal accent lounge')
    expect(designHref(d!)).toBe('/designs/living-rooms/teal-accent-lounge')
    expect(getDesign('kitchens', 'teal-accent-lounge')).toBeUndefined()
  })
  test('similar designs exclude the design itself', () => {
    const d = getDesign('living-rooms', 'teal-accent-lounge')!
    const s = similarDesigns(d)
    expect(s).toHaveLength(4)
    expect(s.some((x) => x.slug === d.slug)).toBe(false)
  })
})

test('8 rooms, 4 services, valid site data', () => {
  expect(ROOMS.map((r) => r.slug)).toEqual([
    'living-rooms', 'bedrooms', 'kitchens', 'wardrobes', 'bathrooms', 'home-offices', 'dining-areas', 'commercial',
  ])
  expect(getServices().map((s) => s.slug)).toEqual(['modular-kitchens-wardrobes', 'full-home-interiors', 'signature', 'renovation'])
  expect(getService('signature')?.name).toBe('Signature')
  expect(site.email).toBe('hello@fitin.space')
  expect(site.cities).toHaveLength(6)
})
