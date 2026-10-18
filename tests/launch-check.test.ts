import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { checkSite, findPlaceholders } from '../scripts/launch-check.mjs'

test('finds bracketed placeholders but not markdown links, arrays or Tailwind', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lc-'))
  writeFileSync(path.join(dir, 'a.tsx'), "const x = ['Living rooms']\n<p>Designed by [Designer name]</p>\nclass='[&_a]:underline max-w-[1360px]'\n")
  writeFileSync(path.join(dir, 'b.mdx'), 'See the [Kitchen cost calculator](/kitchen-cost-calculator).\nOffice: [Office address]\n')
  const hits = findPlaceholders([dir])
  expect(hits).toHaveLength(2)
  expect(hits[0]).toMatch(/a\.tsx:2 \[Designer name\]$/)
  expect(hits[1]).toMatch(/b\.mdx:2 \[Office address\]$/)
})

test('site must be verified and legally reviewed', () => {
  expect(checkSite({ statsVerified: false, legalReviewed: false })).toHaveLength(2)
  expect(checkSite({ statsVerified: true, legalReviewed: true })).toEqual([])
})

test('the real project has no placeholders in shipped code', () => {
  expect(findPlaceholders(['app', 'components', 'content'])).toEqual([])
})
