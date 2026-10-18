import { expect, test } from 'vitest'
import { jsonLdString } from '@/components/json-ld'
import { breadcrumbLd, organizationLd } from '@/lib/jsonld'

test('organization lists all six cities and contact details', () => {
  const org = organizationLd()
  expect(org['@type']).toBe('HomeAndConstructionBusiness')
  expect(org.areaServed).toHaveLength(6)
  expect(org.telephone).toBe('+923111555264')
})

test('breadcrumb positions and absolute URLs', () => {
  const b = breadcrumbLd([['Explore', '/designs'], ['Kitchens', '/designs/kitchens']])
  expect(b.itemListElement[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Kitchens', item: 'https://fitin.space/designs/kitchens' })
})

test('JSON-LD cannot break out of its script tag', () => {
  expect(jsonLdString({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>')
})
