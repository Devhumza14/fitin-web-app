'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SelectField, TextArea, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { TOPICS, contactSchema, fieldErrors } from '@/lib/rules'
import { useLeadSubmit } from '@/lib/use-lead-submit'

const EMPTY = { name: '', contact: '', topic: TOPICS[0] as string, message: '' }

export function ContactForm() {
  const [v, setV] = useState(EMPTY)
  const [tried, setTried] = useState(false)
  const { status, submit, reset, serverErrors, honeypot } = useLeadSubmit('contact')
  const set = (k: keyof typeof EMPTY, val: string) => setV((s) => ({ ...s, [k]: val }))
  const errors = { ...(tried ? fieldErrors(contactSchema, v) : {}), ...serverErrors }
  const onSubmit = async () => {
    if (Object.keys(fieldErrors(contactSchema, v)).length) return setTried(true)
    await submit(v)
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-4 py-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-lime"><CheckIcon className="size-8 text-navy" /></span>
        <h2 className="text-[30px] font-bold tracking-[-0.8px] text-navy">Message sent.</h2>
        <p className="text-ink-2">We&apos;ll get back to you soon. For anything urgent, WhatsApp is fastest.</p>
        <button type="button" onClick={() => { setV(EMPTY); setTried(false); reset() }} className="font-semibold text-navy underline underline-offset-4">Send another message</button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="relative flex flex-col gap-4.5">
      <Honeypot ref={honeypot} />
      <h2 className="text-2xl font-bold text-navy">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <TextField label="Phone or email" autoComplete="email" value={v.contact} onChange={(e) => set('contact', e.target.value)} error={errors.contact} />
      </div>
      <SelectField label="What's it about?" value={v.topic} onChange={(e) => set('topic', e.target.value)} error={errors.topic}>
        {TOPICS.map((t) => <option key={t}>{t}</option>)}
      </SelectField>
      <TextArea label="Message" value={v.message} onChange={(e) => set('message', e.target.value)} error={errors.message} />
      {status === 'failed' && <WhatsAppFallback summary={`Hi Fitin, ${v.message} — ${v.name} (${v.contact})`} />}
      <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
      <button type="submit" disabled={status === 'sending'} className={buttonClass('primary', 'self-start disabled:opacity-60')}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
