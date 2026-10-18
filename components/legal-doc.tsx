import type { ReactNode } from 'react'
import { site } from '@/lib/content'
import { LegalTabs } from './legal-tabs'

export type LegalSection = { id: string; title: string; body: ReactNode }

export function LegalDoc({ title, active, sections }: { title: string; active: 'privacy' | 'terms'; sections: LegalSection[] }) {
  return (
    <div className="wrap flex max-w-[1160px] flex-col gap-8 pb-24 pt-14">
      <div className="flex flex-col gap-4">
        <h1 className="text-[clamp(36px,4.4vw,52px)] font-bold leading-[1.08] tracking-[-1.6px] text-navy">{title}</h1>
        <p className="text-[15px] text-muted">Last updated: {new Date(site.legalUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <LegalTabs active={active} />
      </div>
      <div className="flex flex-wrap items-start gap-14">
        <nav aria-label="On this page" className="sticky top-6 flex min-w-0 flex-[1_1_220px] flex-col gap-1">
          <span className="mb-2 text-[13px] font-bold uppercase tracking-[1px] text-muted">On this page</span>
          {sections.map((s, i) => <a key={s.id} href={`#${s.id}`} className="border-l-2 border-hairline px-3 py-2 text-[15px] text-ink no-underline">{i + 1}. {s.title}</a>)}
        </nav>
        <article className="flex min-w-0 max-w-[720px] flex-[999_1_560px] flex-col gap-10 leading-[1.7] text-[#3B4552] [&_a]:underline [&_p+p]:mt-3">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 text-2xl font-bold tracking-[-0.4px] text-navy">{i + 1}. {s.title}</h2>{s.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
