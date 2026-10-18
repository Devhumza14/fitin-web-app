import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

function* files(dir: string): Generator<string> {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) yield* files(p)
    else if (/\.(tsx?|mdx)$/.test(e)) yield p
  }
}

test('the AdSense script is referenced only by the article page', () => {
  const hits = [...files('app'), ...files('components')].filter((f) => readFileSync(f, 'utf8').includes('pagead2.googlesyndication.com'))
  expect(hits).toEqual([path.join('app', '(site)', 'journal', '[article]', 'page.tsx')])
})
