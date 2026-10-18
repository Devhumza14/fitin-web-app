'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChoiceChips, MultiChips } from '@/components/form/chips'
import { SelectField, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { CITIES, ROLES, SPECIALTIES, fieldErrors, partnerSchema } from '@/lib/rules'
import { useLeadSubmit } from '@/lib/use-lead-submit'

export function PartnerForm() {
  const [v, setV] = useState({ role: 'Designer', name: '', business: '', city: '', phone: '', portfolio: '', specialties: [] as string[] })
  const [tried, setTried] = useState(false)
  const { status, submit, serverErrors, honeypot } = useLeadSubmit('partner')
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const errors = { ...(tried ? fieldErrors(partnerSchema, v) : {}), ...serverErrors }

  const onSubmit = async () => {
    if (Object.keys(fieldErrors(partnerSchema, v)).length) return setTried(true)
    await submit(v)
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-9 text-navy" /></span>
        <h2 className="text-[34px] font-bold tracking-[-1px] text-navy">Application received.</h2>
        <p className="max-w-md text-[17px] text-ink-2">Our partnerships team will review your work and contact you on WhatsApp or by phone.</p>
        <Link href="/" className={buttonClass('dark')}>Back to home</Link>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="relative flex flex-col gap-6">
      <Honeypot ref={honeypot} />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[32px] font-bold tracking-[-0.8px] text-navy">Apply to join Fitin</h2>
        <p className="text-ink-2">Takes about three minutes.</p>
      </div>
      <ChoiceChips legend="I am a" name="role" options={ROLES} value={v.role} onChange={(x) => set('role', x)} error={errors.role} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <TextField label={v.role === 'Vendor' ? 'Business name' : 'Studio name'} optional autoComplete="organization" value={v.business} onChange={(e) => set('business', e.target.value)} />
        <SelectField label="City" value={v.city} onChange={(e) => set('city', e.target.value)} error={errors.city}>
          <option value="" disabled>Choose a city</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </SelectField>
        <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" value={v.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
        <div className="sm:col-span-2">
          <TextField label="Portfolio or Instagram link" inputMode="url" placeholder="instagram.com/yourstudio" value={v.portfolio} onChange={(e) => set('portfolio', e.target.value)} error={errors.portfolio} />
        </div>
      </div>
      <MultiChips legend="Specialties" name="specialties" options={SPECIALTIES} values={v.specialties} onChange={(x) => set('specialties', x)} error={errors.specialties} />
      {status === 'failed' && <WhatsAppFallback summary={`Hi Fitin, I'd like to join as a ${v.role.toLowerCase()}. Name: ${v.name}. City: ${v.city}. Phone: ${v.phone}. Work: ${v.portfolio}.`} />}
      <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
      <button type="submit" disabled={status === 'sending'} className={buttonClass('primary', 'self-start disabled:opacity-60')}>
        {status === 'sending' ? 'Sending…' : 'Submit application'}
      </button>
    </form>
  )
}
