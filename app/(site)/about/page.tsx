import Image from 'next/image'
import Link from 'next/link'
import { Highlight, SectionHead, buttonClass } from '@/components/ui'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About Fitin',
  description: 'Fitin is a Pakistani platform that brings homeowners, interior designers and furniture vendors together to design, build and fit homes.',
  path: '/about',
})

const PILLARS = [
  ['bg-navy text-white', 'text-sky', '01 · Design', 'The right designer, quickly', 'Every designer on Fitin is verified, and matched to you by city, style and budget.', 'text-on-navy'],
  ['bg-teal-dark text-white', 'text-lime-pale', '02 · Build', 'Vendors you can trust', 'Custom furniture and fit-out from vetted vendors, with quotes and timelines in one place.', 'text-[#E2F2F2]'],
  ['bg-lime text-navy', 'text-navy', '03 · Fit', 'A finished room', 'Delivered, installed and styled, so you walk into a home rather than a pile of boxes.', 'text-[#22300A]'],
] as const

export default function AboutPage() {
  return (
    <>
      <section className="wrap flex flex-wrap items-center gap-16 pb-20 pt-10 md:pt-[72px]">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">About Fitin</span>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">
            Connecting <Highlight tone="teal">spaces</Highlight>.<br />Building <Highlight tone="lime">possibilities</Highlight>.
          </h1>
          <p className="max-w-[540px] text-[19px] leading-[1.6] text-ink-2">
            Fitin is a Pakistani platform that brings homeowners, interior designers and furniture vendors together. One place to find the right people, shape the design, and see it built and fitted.
          </p>
        </div>
        <div className="grid min-w-0 flex-[1_1_460px] grid-cols-2 items-start gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-navy-soft"><Image src="/images/bedroom-warm-timber.jpg" alt="Warm timber bedroom" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
          <div className="mt-14 flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-navy-soft"><Image src="/images/kitchen-open-white.jpg" alt="Open white kitchen" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
            <div className="flex flex-col gap-2.5 rounded-[28px] bg-navy p-6 text-white">
              <svg aria-hidden viewBox="0 0 48 58" className="h-[58px] w-12"><path d="M0 14L48 0v12L0 26z" fill="#fff" /><path d="M0 30L40 18v12L0 42z" fill="#229E9F" /><path d="M0 46L32 36v12L0 58z" fill="#B6D22A" /></svg>
              <span className="text-[15px] font-semibold">Design · Build · Fit</span>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead title="Doing up a home shouldn't mean managing ten strangers." />
          <div className="grid gap-5 md:grid-cols-3">
            {PILLARS.map(([box, kick, k, t, d, sub]) => (
              <div key={k} className={`flex flex-col gap-3 rounded-panel p-8 ${box}`}>
                <span className={`text-[13px] font-bold uppercase tracking-[1px] ${kick}`}>{k}</span>
                <h2 className="text-[22px] font-bold">{t}</h2><p className={sub}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap flex flex-wrap items-center justify-between gap-6 py-20">
        <p className="text-2xl font-bold text-navy">Serving {site.cities.join(', ')}.</p>
        <Link href="/contact" className={buttonClass('dark')}>Contact us</Link>
      </section>
    </>
  )
}
