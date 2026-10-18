'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CardDesign } from '@/lib/cards'
import { DesignGrid } from './design-card'
import { EmptyState } from './empty-state'

const STYLES = ['Warm Modern', 'Japandi Minimal', 'Contemporary', 'Classic']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']

export function ExploreGrid({ cards }: { cards: CardDesign[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const style = params.get('style') ?? ''
  const city = params.get('city') ?? ''
  const shown = cards.filter((d) => (!style || d.style === style) && (!city || d.city === city))

  const set = (key: 'style' | 'city', value: string) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const select = 'h-11 rounded-btn border border-line bg-white px-3 text-sm font-semibold text-navy'
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-2">Style
          <select className={select} value={style} onChange={(e) => set('style', e.target.value)}>
            <option value="">Any style</option>{STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-2">City
          <select className={select} value={city} onChange={(e) => set('city', e.target.value)}>
            <option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <span className="ml-auto text-sm text-ink-2" aria-live="polite">{shown.length} designs · every design is 100% customisable</span>
      </div>
      {shown.length ? (
        <DesignGrid cards={shown} />
      ) : (
        <EmptyState title="No designs match yet" text="Tell us about your space and a verified designer will create one around it." />
      )}
    </div>
  )
}
