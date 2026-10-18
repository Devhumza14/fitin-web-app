import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calculator } from '@/components/calculator'
import { Bar, CheckList, buttonClass } from '@/components/ui'
import { getService, getServices, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => getServices().map((s) => ({ service: s.slug }))

type Props = { params: Promise<{ service: string }> }

export async function generateMetadata({ params }: Props) {
  const s = getService((await params).service)
  if (!s) return {}
  return pageMetadata({ title: `${s.name} in Pakistan`, description: s.summary, path: `/services/${s.slug}` })
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).service)
  if (!s) notFound()
  const others = getServices().filter((x) => x.slug !== s.slug)
  return (
    <>
      <section className="wrap flex flex-wrap items-center gap-14 pb-16 pt-10 md:pt-16">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
          <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/services" className="text-muted">Services</Link></nav>
          <Bar color={s.bar} className="h-7 w-16" />
          <h1 className="text-[clamp(40px,5vw,64px)] font-bold leading-[1.04] tracking-[-2px] text-navy">{s.name}</h1>
          <p className="text-[19px] leading-[1.55] text-ink-2">{s.intro}</p>
          <CheckList items={s.includes} />
          <Link href={`/start?service=${encodeURIComponent(s.startService)}`} className={buttonClass('primary', 'mt-2 self-start')}>Start this project</Link>
        </div>
        <div className="relative aspect-[4/3] min-w-0 flex-[1_1_480px] overflow-hidden rounded-feature bg-navy-soft">
          <Image src={s.image} alt={s.imageAlt} fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
      {s.calculator && (
        <section id="calculator" className="bg-surface">
          <div className="wrap flex flex-col gap-8 py-20">
            <h2 className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">What will my kitchen cost?</h2>
            <Calculator />
          </div>
        </section>
      )}
      <section className="wrap flex flex-col gap-6 py-20">
        <h2 className="text-2xl font-bold text-navy">Other services</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}><Link href={`/services/${o.slug}`} className="flex h-full flex-col gap-1 rounded-panel border border-hairline p-6 no-underline">
              <span className="font-bold text-navy">{o.name}</span><span className="text-sm text-ink-2">{o.summary}</span>
            </Link></li>
          ))}
        </ul>
        <p className="text-sm text-ink-2">Questions? <a href={`https://wa.me/${site.whatsapp}`}>WhatsApp us</a>.</p>
      </section>
    </>
  )
}
