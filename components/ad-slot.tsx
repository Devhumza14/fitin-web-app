'use client'
import { useEffect, useRef } from 'react'
import site from '@/content/site.json'

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdSlot() {
  const pushed = useRef(false)
  const enabled = Boolean(site.adsenseId && site.adSlot)
  useEffect(() => {
    if (!enabled || pushed.current) return
    pushed.current = true
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch { /* ad blocked: slot stays empty */ }
  }, [enabled])
  if (!enabled) return null
  return (
    <aside aria-label="Advertisement" className="my-10 flex min-h-[280px] flex-col items-center gap-2">
      <span className="text-[11px] uppercase tracking-[1px] text-muted">Advertisement</span>
      <ins className="adsbygoogle block w-full" style={{ display: 'block' }} data-ad-client={site.adsenseId}
        data-ad-slot={site.adSlot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  )
}
