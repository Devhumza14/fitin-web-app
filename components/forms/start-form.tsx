'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChoiceChips } from '@/components/form/chips'
import { ErrorText, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { useLeadSubmit } from '@/lib/use-lead-submit'
import {
  BUDGETS, CITIES, SERVICE_OPTIONS, SPACES, STYLE_OPTIONS,
  fieldErrors, projectStep1, projectStep2, projectStep3, projectStep4,
} from '@/lib/rules'

const SPACE_IMAGES: Record<(typeof SPACES)[number], string> = {
  'Living room': '/images/living-navy-sofa-teal-cushions.jpg', Kitchen: '/images/kitchen-open-white.jpg',
  Bedroom: '/images/bedroom-pendant-light.jpg', Bathroom: '/images/bathroom-double-vanity.jpg',
  Wardrobe: '/images/wardrobe-built-in.jpg', 'Home office': '/images/office-sunlit-desk.jpg',
  'Dining area': '/images/dining-classic.jpg', 'Full home': '/images/bedroom-navy-city-view.jpg',
  Commercial: '/images/hallway-built-in-storage.jpg',
}
const STEP_NAMES = ['Space', 'Location & service', 'Style & budget', 'Contact']
const SEG = ['bg-navy', 'bg-teal', 'bg-lime', 'bg-navy']
const STEP_SCHEMAS = [projectStep1, projectStep2, projectStep3, projectStep4]

type Values = {
  space?: string; city?: string; service?: string; size: string; style?: string; budget?: string
  name: string; phone: string; email: string; whatsappUpdates: boolean; design?: string
}

const pick = <T extends readonly string[]>(list: T, v: string | null) => (v && (list as readonly string[]).includes(v) ? v : undefined)

export function StartForm({ quoteHours }: { quoteHours: number }) {
  const [values, setValues] = useState<Values>({ size: '', name: '', phone: '', email: '', whatsappUpdates: true })
  // Prefill from the query string after mount. Reading it during render (useSearchParams) would opt this static page
  // out of server rendering, delaying the first paint until the JS has loaded.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const design = params.get('design') ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off prefill from the URL
    setValues((v) => ({
      ...v, space: pick(SPACES, params.get('space')), city: pick(CITIES, params.get('city')),
      service: pick(SERVICE_OPTIONS, params.get('service')), design: /^[a-z0-9-]{1,100}$/.test(design) ? design : undefined,
    }))
  }, [])
  const [step, setStep] = useState(1)
  const [tried, setTried] = useState(false)
  const { status, submit, serverErrors, honeypot } = useLeadSubmit('project')
  const top = useRef<HTMLHeadingElement>(null)

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((s) => ({ ...s, [k]: v }))
  const errors = { ...(tried ? fieldErrors(STEP_SCHEMAS[step - 1], values) : {}), ...serverErrors }

  const go = (n: number) => { setStep(n); setTried(false); requestAnimationFrame(() => top.current?.focus()) }
  const next = () => (Object.keys(fieldErrors(STEP_SCHEMAS[step - 1], values)).length ? setTried(true) : go(step + 1))
  const send = async () => {
    if (Object.keys(fieldErrors(projectStep4, values)).length) return setTried(true)
    await submit(values)
  }

  const summaryRows: [string, string | undefined][] = [
    ['Space', values.space], ['City', values.city], ['Service', values.service],
    ['Size', values.size ? `${values.size} sq ft` : undefined], ['Style', values.style], ['Budget', values.budget],
  ]
  const summaryText = `Hi Fitin, I'd like a quote. ${summaryRows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}. Name: ${values.name}. Phone: ${values.phone}.`

  if (status === 'sent') {
    const first = values.name.trim().split(/\s+/)[0]
    return (
      <section className="flex flex-col items-start gap-5 rounded-panel border border-hairline bg-white p-7 md:p-10">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-9 text-navy" /></span>
        <h1 className="text-[clamp(32px,4vw,40px)] font-bold leading-tight tracking-[-1.2px] text-navy">Request received{first ? `, ${first}` : ''}.</h1>
        <p className="max-w-[520px] text-lg text-ink-2">A Fitin advisor will call you within {quoteHours} hours to talk through your {values.space?.toLowerCase() ?? 'project'} and book a site visit.</p>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Link href="/designs" className={buttonClass('dark', 'w-full sm:w-auto')}>Browse designs meanwhile</Link>
          <Link href="/" className={buttonClass('outline', 'w-full sm:w-auto')}>Back to home</Link>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-wrap items-start gap-8">
      <section className="relative flex min-w-0 flex-[999_1_560px] flex-col gap-8 rounded-panel border border-hairline bg-white p-5 md:p-10">
        <Honeypot ref={honeypot} />
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm font-semibold text-muted"><span>Step {step} of 4</span><span>{STEP_NAMES[step - 1]}</span></div>
          <div aria-hidden className="grid grid-cols-4 gap-1.5">
            {SEG.map((c, i) => <span key={i} className={`h-1.5 rounded-full ${i < step ? c : 'bg-hairline'}`} />)}
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Which space are we working on?</h1>
              <p className="text-ink-2">Pick the main one. You can add more rooms with your designer later.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Space</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SPACES.map((s) => (
                  <label key={s} className="relative block cursor-pointer">
                    <input type="radio" name="space" value={s} checked={values.space === s} onChange={() => set('space', s)} className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
                    <span className="block rounded-[18px] border-2 border-hairline bg-white p-2 peer-checked:border-navy peer-checked:shadow-[0_0_0_4px_#E8ECF2] peer-focus-visible:outline-2 peer-focus-visible:outline-navy">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-navy-soft">
                        <Image src={SPACE_IMAGES[s]} alt="" fill sizes="(min-width: 640px) 200px, 45vw" className="object-cover" />
                      </span>
                      <span className="flex items-center justify-between px-1 pb-0.5 pt-2.5 text-[15px] font-bold text-navy">
                        {s}{values.space === s && <span className="flex size-[22px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-3" /></span>}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.space && <ErrorText id="space-err">{errors.space}</ErrorText>}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-7">
            <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Where is it, and what do you need?</h1>
            <ChoiceChips legend="City" name="city" options={CITIES} value={values.city} onChange={(v) => set('city', v)} error={errors.city} />
            <ChoiceChips legend="Service" name="service" options={SERVICE_OPTIONS} value={values.service} onChange={(v) => set('service', v)} error={errors.service} />
            <div className="max-w-80">
              <TextField label="Approximate size (sq ft)" optional inputMode="numeric" placeholder="e.g. 220" value={values.size}
                onChange={(e) => set('size', e.target.value)} hint="Not sure? Leave it blank and we'll measure on site." error={errors.size} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Your style and budget</h1>
              <p className="text-ink-2">A starting point only. Everything stays 100% customisable.</p>
            </div>
            <ChoiceChips legend="Style" name="style" options={STYLE_OPTIONS} value={values.style} onChange={(v) => set('style', v)} error={errors.style} />
            <ChoiceChips legend="Budget" name="budget" options={BUDGETS} value={values.budget} onChange={(v) => set('budget', v)} error={errors.budget} />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Where should we send your quote?</h1>
              <p className="text-ink-2">A Fitin advisor will call you within {quoteHours} hours. No spam, no commitment.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Full name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
              <div className="sm:col-span-2">
                <TextField label="Email" optional type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
              </div>
            </div>
            <label className="flex items-center gap-3 text-[15px]">
              <input type="checkbox" checked={values.whatsappUpdates} onChange={(e) => set('whatsappUpdates', e.target.checked)} className="size-5 accent-navy" />
              Send me project updates on WhatsApp
            </label>
            {status === 'failed' && <WhatsAppFallback summary={summaryText} />}
            <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
          </div>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-between gap-3 border-t border-hairline bg-white px-5 pb-5 pt-4 md:static md:m-0 md:p-0 md:pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => go(step - 1)} className="h-12 px-2 font-semibold text-navy underline underline-offset-4">Back</button>
          ) : <span className="text-sm text-muted md:invisible">Step 1 of 4</span>}
          {step < 4 ? (
            <button type="button" onClick={next} className={buttonClass('dark')}>Continue</button>
          ) : (
            <button type="button" onClick={send} disabled={status === 'sending'} className={buttonClass('primary', 'disabled:opacity-60')}>
              {status === 'sending' ? 'Sending…' : 'Request my free quote'}
            </button>
          )}
        </div>
      </section>

      <aside aria-label="Your project summary" className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-panel bg-white p-7 shadow-float">
          <h2 className="text-xl font-bold text-navy">Your project</h2>
          <dl>
            {summaryRows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-hairline py-2.5 text-[15px]">
                <dt className="text-muted">{k}</dt><dd className={`text-right font-semibold ${v ? 'text-navy' : 'text-muted'}`}>{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4 rounded-panel bg-navy p-7 text-white">
          <h2 className="text-lg font-bold">What happens next</h2>
          <ol className="flex flex-col gap-3.5 text-[15px]">
            {([['#9ED6D6', `We call you within ${quoteHours} hours`], ['#229E9F', "You're matched with a verified designer near you"], ['#B6D22A', 'You get a tailored, itemised quote']] as const).map(([c, t]) => (
              <li key={t} className="flex items-start gap-3">
                <svg aria-hidden viewBox="0 0 64 28" className="mt-1 h-4 w-9 shrink-0"><path d="M0 14L64 0v14L0 28z" fill={c} /></svg>{t}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  )
}
