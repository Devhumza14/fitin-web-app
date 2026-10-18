import Image from 'next/image'
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/journal'

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function ArticleCard({ a }: { a: ArticleMeta }) {
  return (
    <article>
      <Link href={`/journal/${a.slug}`} className="flex flex-col gap-3 text-navy no-underline">
        <span className="relative block aspect-[16/10] overflow-hidden rounded-card bg-navy-soft">
          <Image src={a.cover} alt={a.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[1px] text-teal-dark">{a.category}</span>
        <span className="text-xl font-bold leading-snug">{a.title}</span>
        <span className="text-[15px] text-ink-2">{a.description}</span>
        <time dateTime={a.date} className="text-sm text-muted">{formatDate(a.date)}</time>
      </Link>
    </article>
  )
}
