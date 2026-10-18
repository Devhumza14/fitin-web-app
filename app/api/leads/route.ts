import { markEmailSent, saveLead, sendLeadEmail, toLead } from '@/lib/leads'
import { createRateLimiter } from '@/lib/rate-limit'
import { errorMap, leadSchema } from '@/lib/rules'

export const runtime = 'nodejs'

const MAX_BYTES = 10_000
const MIN_FILL_MS = 3000
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status })

export async function POST(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json')) return json({ error: 'unsupported' }, 415)
  const raw = await req.text()
  if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413)

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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
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
