import type { LeadInput } from './rules'

export type Lead = {
  type: 'project' | 'partner' | 'contact'
  name: string
  phone?: string
  email?: string
  city?: string
  payload: Record<string, unknown>
  sourcePath?: string
}
type Env = Record<string, string | undefined>

const cleanPath = (p: unknown) => (typeof p === 'string' && /^\/[\w\-/]{0,199}$/.test(p) ? p : undefined)

export function toLead(input: LeadInput, sourcePath?: unknown): Lead {
  const path = cleanPath(sourcePath)
  switch (input.type) {
    case 'project': {
      const { type, name, phone, email, city, ...payload } = input
      return { type, name, phone, email, city, payload, sourcePath: path }
    }
    case 'partner': {
      const { type, name, phone, city, ...payload } = input
      return { type, name, phone, city, payload, sourcePath: path }
    }
    case 'contact': {
      const { type, name, contact, ...payload } = input
      return { type, name, ...(contact.startsWith('+92') ? { phone: contact } : { email: contact }), payload, sourcePath: path }
    }
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const oneLine = (s: unknown) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim()

export function leadSubject(l: Lead): string {
  const p = l.payload
  if (l.type === 'project') return oneLine(`New project lead: ${p.space} · ${l.city}`)
  if (l.type === 'partner') return oneLine(`New ${String(p.role).toLowerCase()} application: ${l.name} · ${l.city}`)
  return oneLine(`New message: ${p.topic}`)
}

const LABELS: Record<string, string> = {
  space: 'Space', service: 'Service', size: 'Size (sq ft)', style: 'Style', budget: 'Budget', whatsappUpdates: 'WhatsApp updates',
  design: 'Design', role: 'Role', business: 'Studio / business', portfolio: 'Portfolio', specialties: 'Specialties', topic: 'Topic', message: 'Message',
}

export function leadEmailHtml(l: Lead): string {
  const fmt = (v: unknown) => (Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v))
  const rows: [string, unknown][] = [
    ['Name', l.name], ['Phone', l.phone], ['Email', l.email], ['City', l.city],
    ...Object.entries(l.payload).map(([k, v]) => [LABELS[k] ?? k, v] as [string, unknown]),
    ['Page', l.sourcePath],
  ]
  const body = rows
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5B6573;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;color:#1F2733">${escapeHtml(fmt(v)).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><h2 style="color:#0E2340;margin:0 0 12px">${escapeHtml(leadSubject(l))}</h2><table cellpadding="0" cellspacing="0">${body}</table></div>`
}

function supabaseHeaders(key: string): Record<string, string> {
  const h: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}` // legacy service_role JWT; new sb_secret_ keys go in apikey only
  return h
}

export async function saveLead(l: Lead, env: Env = process.env): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return null
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/leads?select=id`, {
      method: 'POST',
      headers: { ...supabaseHeaders(env.SUPABASE_SECRET_KEY), Prefer: 'return=representation' },
      body: JSON.stringify({
        type: l.type, name: l.name, phone: l.phone ?? null, email: l.email ?? null, city: l.city ?? null,
        payload: l.payload, source_path: l.sourcePath ?? null,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const rows = (await res.json()) as { id: string }[]
    return rows[0]?.id ?? null
  } catch {
    return null
  }
}

export async function markEmailSent(id: string, env: Env = process.env): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: supabaseHeaders(env.SUPABASE_SECRET_KEY), body: JSON.stringify({ email_sent: true }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    /* best effort: the lead is already saved and emailed */
  }
}

export async function sendLeadEmail(l: Lead, env: Env = process.env): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.LEADS_FROM || !env.LEADS_TO) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEADS_FROM, to: [env.LEADS_TO], subject: leadSubject(l), html: leadEmailHtml(l),
        ...(l.email && { reply_to: l.email }),
      }),
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}
