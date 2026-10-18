import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '@/app/api/leads/route'

const SUPA = 'https://proj.supabase.co'
const ID = '11111111-1111-4111-8111-111111111111'
let calls: { url: string; body: string }[] = []

function mockFetch({ save = true, email = true } = {}) {
  calls = []
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, body: String(init?.body ?? '') })
    if (url === `${SUPA}/rest/v1/leads?select=id`) return save ? Response.json([{ id: ID }], { status: 201 }) : new Response('down', { status: 503 })
    if (url.startsWith(`${SUPA}/rest/v1/leads?id=eq.`)) return new Response(null, { status: 204 })
    if (url === 'https://api.resend.com/emails') return email ? Response.json({ id: 'e1' }) : new Response('err', { status: 500 })
    throw new Error(`unexpected fetch ${url}`)
  }))
}

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', SUPA)
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('LEADS_FROM', 'Fitin <leads@fitin.space>')
  vi.stubEnv('LEADS_TO', 'hello@fitin.space')
  mockFetch()
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

let ip = 0
const project = {
  type: 'project', space: 'Kitchen', city: 'Lahore', service: 'Renovation', size: '', style: 'Contemporary',
  budget: 'Not sure yet', name: 'Ayesha Khan', phone: '0300 1234567', email: '', whatsappUpdates: true,
  website: '', elapsedMs: 9000, sourcePath: '/start',
}
const contact = { type: 'contact', name: 'Ali', contact: 'ali@example.com', topic: 'Something else', message: 'Hello there, a question.', website: '', elapsedMs: 9000 }

function req(body: unknown, opts: { ip?: string; type?: string; raw?: string } = {}) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'content-type': opts.type ?? 'application/json', 'x-forwarded-for': opts.ip ?? `10.0.0.${++ip}` },
    body: opts.raw ?? JSON.stringify(body),
  })
}

describe('POST /api/leads', () => {
  test('saves first, then emails, then marks the email sent', async () => {
    const res = await POST(req(project))
    expect(res.status).toBe(200)
    expect(calls.map((c) => c.url)).toEqual([
      `${SUPA}/rest/v1/leads?select=id`, 'https://api.resend.com/emails', `${SUPA}/rest/v1/leads?id=eq.${ID}`,
    ])
    const saved = JSON.parse(calls[0].body)
    expect(saved).toMatchObject({ type: 'project', name: 'Ayesha Khan', phone: '+923001234567', city: 'Lahore', source_path: '/start' })
    expect(saved.payload).toMatchObject({ space: 'Kitchen', service: 'Renovation', style: 'Contemporary' })
    expect(JSON.parse(calls[1].body).subject).toBe('New project lead: Kitchen · Lahore')
  })

  test('keeps an Urdu name intact', async () => {
    await POST(req({ ...project, name: 'عائشہ خان' }))
    expect(JSON.parse(calls[0].body).name).toBe('عائشہ خان')
  })

  test('escapes HTML in the email and sets reply_to', async () => {
    await POST(req({ ...contact, message: '<script>alert(1)</script> hello there' }))
    const mail = JSON.parse(calls[1].body)
    expect(mail.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(mail.html).not.toContain('<script>')
    expect(mail.reply_to).toBe('ali@example.com')
  })

  test('400 with field errors on invalid input', async () => {
    const res = await POST(req({ ...project, phone: '042 35761234' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid', fieldErrors: { phone: 'Enter a Pakistani mobile number, e.g. 0300 1234567.' } })
    expect(calls).toHaveLength(0)
  })

  test('honeypot and too-fast submissions get a silent 200 and are not stored', async () => {
    expect((await POST(req({ ...project, website: 'spam.example' }))).status).toBe(200)
    expect((await POST(req({ ...project, elapsedMs: 800 }))).status).toBe(200)
    expect(calls).toHaveLength(0)
  })

  test('uses client-measured elapsedMs, not a timestamp (clock skew safe)', async () => {
    const res = await POST(req({ ...project, startedAt: Date.now() + 3_600_000, elapsedMs: 9000 }))
    expect(res.status).toBe(200)
    expect(calls.length).toBeGreaterThan(0)
  })

  test('still 200 when only the save or only the email works', async () => {
    mockFetch({ save: false })
    expect((await POST(req(project))).status).toBe(200)
    mockFetch({ email: false })
    expect((await POST(req(project))).status).toBe(200)
    expect(calls.some((c) => c.url.includes('id=eq.'))).toBe(false)
  })

  test('502 when both save and email fail', async () => {
    mockFetch({ save: false, email: false })
    const res = await POST(req(project))
    expect(res.status).toBe(502)
  })

  test('rejects wrong content type and oversized bodies', async () => {
    expect((await POST(req(project, { type: 'text/plain' }))).status).toBe(415)
    expect((await POST(req(null, { raw: JSON.stringify({ ...project, message: 'x'.repeat(11_000) }) }))).status).toBe(413)
    expect((await POST(req(null, { raw: '{not json' }))).status).toBe(400)
  })

  test('rate limits to 5 per 10 minutes per IP', async () => {
    for (let i = 0; i < 5; i++) expect((await POST(req(project, { ip: '9.9.9.9' }))).status).toBe(200)
    expect((await POST(req(project, { ip: '9.9.9.9' }))).status).toBe(429)
  })
})
