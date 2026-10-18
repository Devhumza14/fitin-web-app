'use client'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertIcon } from '../icons'

export const ErrorText = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} role="alert" className="flex items-center gap-2 text-sm font-semibold text-error">
    <AlertIcon className="size-4 shrink-0" />{children}
  </p>
)

type Extra = { label: string; error?: string; hint?: string; optional?: boolean }
const control = (error?: string) =>
  `w-full rounded-btn border bg-white px-4 text-ink placeholder:text-muted ${error ? 'border-error' : 'border-line'}`

function Wrap({ id, label, optional, hint, error, children }: Extra & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-bold text-navy">
        {label}{optional && <span className="font-medium text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && <span id={`${id}-hint`} className="text-[13px] text-muted">{hint}</span>}
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  )
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined

export function TextField({ label, error, hint, optional, ...rest }: InputHTMLAttributes<HTMLInputElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} h-14`} {...rest} />
    </Wrap>
  )
}

export function TextArea({ label, error, hint, optional, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <textarea id={id} rows={5} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} resize-y py-3.5`} {...rest} />
    </Wrap>
  )
}

export function SelectField({ label, error, hint, optional, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <select id={id} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} h-14`} {...rest}>{children}</select>
    </Wrap>
  )
}
