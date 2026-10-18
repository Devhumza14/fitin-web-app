import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// "[Designer name]", "[Office address]" — capitalised words in brackets, not followed by "(" (markdown links).
export const PLACEHOLDER = /\[[A-Z][a-z]+(?: [A-Za-z]+)*\](?!\()/g

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (/\.(tsx?|mdx?|json)$/.test(e)) yield p
  }
}

export function findPlaceholders(dirs) {
  const hits = []
  for (const d of dirs) {
    for (const f of walk(d)) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(PLACEHOLDER)) hits.push(`${f}:${i + 1} ${m[0]}`)
      })
    }
  }
  return hits
}

export function checkSite(site) {
  const errors = []
  if (site.statsVerified !== true) errors.push('content/site.json: set "statsVerified": true once Fitin confirms the stats, install days and quote hours.')
  if (site.legalReviewed !== true) errors.push('content/site.json: set "legalReviewed": true once counsel approves the privacy policy and terms.')
  return errors
}

function publishedCount(dir, pattern) {
  return readdirSync(dir).filter((f) => pattern.test(readFileSync(path.join(dir, f), 'utf8'))).length
}

function main() {
  const site = JSON.parse(readFileSync('content/site.json', 'utf8'))
  const errors = [...findPlaceholders(['app', 'components', 'content']).map((h) => `placeholder: ${h}`), ...checkSite(site)]
  if (process.env.ALLOW_INDEXING !== '1') errors.push('env: set ALLOW_INDEXING=1 so search engines may index the live site (it is hidden by default).')
  const designs = publishedCount('content/designs', /"status":\s*"published"/)
  const articles = publishedCount('content/journal', /status:\s*'published'/)
  if (designs === 0) console.warn('warning: no published designs — /designs will show an empty state.')
  if (articles < 20) console.warn(`warning: ${articles} published articles; apply to AdSense at ~20.`)
  if (errors.length) {
    console.error(`Launch check failed:\n- ${errors.join('\n- ')}`)
    process.exit(1)
  }
  console.log('Launch check passed.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
