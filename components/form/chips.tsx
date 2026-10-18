'use client'
import { useId } from 'react'
import { ErrorText } from './field'

const chip = 'flex min-h-12 cursor-pointer items-center rounded-full border border-line bg-white px-5 text-[15px] font-semibold text-navy peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy'

type Base = { legend: string; name: string; options: readonly string[]; error?: string }

export function ChoiceChips({ legend, name, options, value, onChange, error }: Base & { value?: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-3 text-[15px] font-bold text-navy">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label key={o} className="relative block">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
            <span className={chip}>{o}</span>
          </label>
        ))}
      </div>
      {error && <div className="mt-2.5"><ErrorText id={`${id}-err`}>{error}</ErrorText></div>}
    </fieldset>
  )
}

export function MultiChips({ legend, name, options, values, onChange, error }: Base & { values: string[]; onChange: (v: string[]) => void }) {
  const id = useId()
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o])
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-3 text-sm font-bold text-navy">{legend} <span className="font-medium text-muted">(pick any)</span></legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label key={o} className="relative block">
            <input type="checkbox" name={name} value={o} checked={values.includes(o)} onChange={() => toggle(o)} className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
            <span className={chip}>{o}</span>
          </label>
        ))}
      </div>
      {error && <div className="mt-2.5"><ErrorText id={`${id}-err`}>{error}</ErrorText></div>}
    </fieldset>
  )
}
