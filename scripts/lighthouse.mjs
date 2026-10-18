import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

const BASE = process.env.LH_BASE ?? 'http://localhost:3100'
const PAGES = ['/', '/designs/kitchens', '/designs/living-rooms/teal-accent-lounge', '/journal/modular-kitchen-cost-pakistan', '/start']
const MIN = 95
const RUNS = 3 // scores vary a few points run to run; judge on the median

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] })
let failed = false
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
for (const p of PAGES) {
  const runs = []
  for (let i = 0; i < RUNS; i++) {
    const result = await lighthouse(`${BASE}${p}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] })
    runs.push(Object.fromEntries(Object.entries(result.lhr.categories).map(([k, c]) => [k, Math.round((c.score ?? 0) * 100)])))
  }
  const scores = Object.fromEntries(Object.keys(runs[0]).map((k) => [k, median(runs.map((r) => r[k]))]))
  const low = Object.entries(scores).filter(([, s]) => s < MIN)
  console.log(`${low.length ? 'FAIL' : 'ok  '} ${p}`, JSON.stringify(scores))
  if (low.length) failed = true
}
await chrome.kill()
process.exit(failed ? 1 : 0)
