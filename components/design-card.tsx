import Image from 'next/image'
import Link from 'next/link'
import type { CardDesign } from '@/lib/cards'
import { SaveHeart } from './save-heart'

export function DesignCard({ d, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw', preload = false }: { d: CardDesign; sizes?: string; preload?: boolean }) {
  return (
    <article className="relative">
      <Link href={d.href} className="flex flex-col gap-3 text-navy no-underline">
        <span className="relative block aspect-[1/0.95] overflow-hidden rounded-card bg-navy-soft">
          <Image src={d.image} alt={d.imageAlt} fill sizes={sizes} preload={preload} className="object-cover" />
        </span>
        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="flex justify-between gap-3">
            <span className="font-bold">{d.title}</span>
            <span className="whitespace-nowrap text-sm text-ink-2">{d.city}</span>
          </span>
          <span className="text-sm text-ink-2">{d.roomLabel} · {d.style}</span>
        </span>
      </Link>
      {d.badge && (
        <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-[0_2px_8px_rgb(14_35_64/0.1)]">{d.badge}</span>
      )}
      <SaveHeart id={d.slug} title={d.title} />
    </article>
  )
}

// preloadFirst: how many leading cards are above the fold and should load eagerly (the LCP candidates)
export function DesignGrid({ cards, preloadFirst = 0 }: { cards: CardDesign[]; preloadFirst?: number }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((d, i) => <DesignCard key={d.slug} d={d} preload={i < preloadFirst} />)}
    </div>
  )
}
