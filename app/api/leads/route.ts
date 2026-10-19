import { markEmailSent, saveLead, sendLeadEmail, toLead } from '@/lib/leads'
import { createRateLimiter } from '@/lib/rate-limit'
import { errorMap, leadSchema } from '@/lib/rules'

export const runtime = 'nodejs'

const MAX_BYTES = 16_384
const MIN_FILL_MS = 3000
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status })

// Stops reading as soon as the cap is passed, so an oversized body is never held in memory.
async function readCapped(req: Request): Promise<string | null> {
  if (Number(req.headers.get('content-length')) > MAX_BYTES) return null
  const reader = req.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BYTES) { await reader.cancel(); return null }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function POST(req: Request) {
  // Exact media type: 'text/plain; application/json' would pass a substring test and skip the CORS preflight.
  if (!/^application\/json\s*(;|$)/i.test(req.headers.get('content-type') ?? '')) return json({ error: 'unsupported' }, 415)
  const raw = await readCapped(req)
  if (raw === null) return json({ error: 'too_large' }, 413)

  let body: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'bad_json' }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return json({ error: 'bad_json' }, 400)
  }

  // Bots: answer like a success so they don't adapt, and store nothing.
  // ponytail: a browser autofilling the hidden field would be dropped silently; the field name avoids common autofill keys.
  if (typeof body.website === 'string' && body.website !== '') return json({ ok: true })
  if (typeof body.elapsedMs !== 'number' || body.elapsedMs < MIN_FILL_MS) return json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 64) || 'unknown'
  if (!limiter(ip)) return json({ error: 'rate_limited' }, 429)

  const result = leadSchema.safeParse(body)
  if (!result.success) return json({ error: 'invalid', fieldErrors: errorMap(result.error) }, 400)

  const lead = toLead(result.data, body.sourcePath)
  const id = await saveLead(lead)
  const emailed = await sendLeadEmail(lead)
  if (id && emailed) await markEmailSent(id)

  if (!id && !emailed) {
    console.error('[leads] save and email both failed', lead.type)
    return json({ error: 'unavailable' }, 502)
  }
  if (!id) console.error('[leads] save failed; lead was emailed only', lead.type)
  if (!emailed) console.error('[leads] email failed; lead saved', id)
  return json({ ok: true })
}
