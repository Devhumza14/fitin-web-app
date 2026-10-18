'use client'
import { useRef, useState } from 'react'

export type SubmitStatus = 'idle' | 'sending' | 'sent' | 'failed'

export function useLeadSubmit(type: 'project' | 'partner' | 'contact') {
  const sending = useRef(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})

  async function submit(data: Record<string, unknown>): Promise<boolean> {
    if (sending.current) return false // a second tap while sending is ignored
    sending.current = true
    setStatus('sending')
    setServerErrors({})
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data, type,
          website: honeypot.current?.value ?? '',
          elapsedMs: Math.round(performance.now()), // measured on this device, so clock skew can't drop real leads
          sourcePath: window.location.pathname,
        }),
      })
      if (res.ok) { setStatus('sent'); return true }
      if (res.status === 400) {
        const j = (await res.json().catch(() => ({}))) as { fieldErrors?: Record<string, string> }
        setServerErrors(j.fieldErrors ?? {})
        setStatus('idle')
        return false
      }
      setStatus('failed')
      return false
    } catch {
      setStatus('failed')
      return false
    } finally {
      sending.current = false
    }
  }

  const reset = () => { setStatus('idle'); setServerErrors({}) }

  return { status, submit, reset, serverErrors, honeypot }
}
