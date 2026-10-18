import Image from 'next/image'
import Link from 'next/link'
import { Bar, CheckList, Highlight, buttonClass } from '@/components/ui'
import { getServices } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design services: modular kitchens, full-home interiors & renovation',
  description: 'Modular kitchens and wardrobes, full-home interiors, Signature bespoke design and renovation — matched with verified designers and vendors across Pakistan.',
  path: '/services',
})

export default function ServicesPage() {
  const services = getServices()
  return (
    <>
      <section className="wrap flex flex-col gap-6 pb-12 pt-10 md:pt-[72px]">
        <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Services</span>
        <h1 className="max-w-[900px] text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">
          One corner or the <Highlight tone="lime">whole home</Highlight>.
        </h1>
        <p className="max-w-[600px] text-[19px] leading-[1.55] text-ink-2">Four ways to work with Fitin. Each one is designed, built and fitted by verified professionals, and tracked on one platform.</p>
        <nav aria-label="Jump to a service" className="-mx-5 flex gap-2.5 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {services.map((s) => <a key={s.slug} href={`#${s.slug}`} className="shrink-0 rounded-full border border-line px-5 py-3 text-[15px] font-semibold no-underline">{s.name}</a>)}
          <Link href="/kitchen-cost-calculator" className="shrink-0 rounded-full bg-lime-soft px-5 py-3 text-[15px] font-semibold no-underline">Cost calculator</Link>
        </nav>
      </section>
      <section className="wrap flex flex-col gap-24 pb-20">
        {services.map((s, i) => (
          <article key={s.slug} id={s.slug} className={`flex scroll-mt-24 flex-wrap items-center gap-14 ${i % 2 ? 'flex-wrap-reverse md:flex-row-reverse' : ''}`}>
            <div className="relative aspect-[4/3] min-w-0 flex-[1_1_480px] overflow-hidden rounded-feature bg-navy-soft">
              <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4.5">
              <Bar color={s.bar} className="h-7 w-16" />
              <h2 className="text-[clamp(30px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-1.2px] text-navy">{s.name}</h2>
              <p className="text-[17px] text-ink-2">{s.summary}</p>
              <CheckList items={s.includes} />
              <div className="mt-1.5 flex flex-wrap items-center gap-5">
                <Link href={`/services/${s.slug}`} className={buttonClass('dark')}>Learn more</Link>
                <Link href="/start" className="font-semibold underline underline-offset-4">Start this project</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
