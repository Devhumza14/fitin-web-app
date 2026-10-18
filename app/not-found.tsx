import Link from 'next/link'
import { Logo } from '@/components/header'
import { NotFoundBars } from '@/components/not-found-bars'
import { Highlight } from '@/components/ui'

const LINKS = [
  ['/designs', 'Explore designs', 'Ideas for every room', ''],
  ['/services', 'Services', 'and the cost calculator', ''],
  ['/start', 'Start a project', 'Free quote', 'bg-lime-soft border-transparent'],
  ['/contact', 'Contact us', 'WhatsApp, phone or email', ''],
] as const

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-hairline"><div className="wrap flex min-h-[76px] items-center"><Logo size={36} /></div></header>
      <main className="wrap flex flex-1 flex-wrap-reverse items-center gap-14 py-16">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-5.5">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Error 404</span>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">This page doesn&apos;t <Highlight tone="lime">fit</Highlight>.</h1>
          <p className="max-w-[480px] text-[19px] text-ink-2">It may have moved, or the link was mistyped. Here are some good places to start.</p>
          <div className="grid max-w-[520px] grid-cols-2 gap-3">
            {LINKS.map(([href, t, d, extra]) => (
              <Link key={href} href={href} className={`flex flex-col gap-0.5 rounded-[18px] border border-hairline px-5 py-4.5 no-underline ${extra}`}>
                <b className="text-navy">{t}</b><span className="text-sm text-ink-2">{d}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_420px]"><NotFoundBars /></div>
      </main>
    </div>
  )
}
