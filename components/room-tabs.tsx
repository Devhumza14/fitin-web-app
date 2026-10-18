import Link from 'next/link'
import { ROOMS, type RoomSlug } from '@/lib/content'

export function RoomTabs({ active }: { active: RoomSlug | 'all' }) {
  const tabs = [{ slug: 'all', label: 'All', href: '/designs' }, ...ROOMS.map((r) => ({ slug: r.slug, label: r.label, href: `/designs/${r.slug}` }))]
  return (
    <nav aria-label="Rooms" className="-mx-5 flex gap-1 overflow-x-auto border-b border-hairline px-5 md:mx-0 md:px-0">
      {tabs.map((t) => (
        <Link key={t.slug} href={t.href} aria-current={t.slug === active ? 'page' : undefined}
          className={`flex min-h-14 shrink-0 items-center px-3.5 text-sm font-semibold no-underline ${
            t.slug === active ? 'text-navy shadow-[inset_0_-2px_0_#0E2340]' : 'text-muted hover:text-navy'
          }`}>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
