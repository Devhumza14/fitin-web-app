import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { AdSlot } from '@/components/ad-slot'
import { formatDate } from '@/components/article-card'
import { DesignGrid } from '@/components/design-card'
import { toCard } from '@/lib/cards'
import { JsonLd } from '@/components/json-ld'
import { buttonClass } from '@/components/ui'
import { getDesigns, getService, site } from '@/lib/content'
import { getArticle, getArticles } from '@/lib/journal'
import { articleLd, breadcrumbLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ article: a.slug }))
}

type Props = { params: Promise<{ article: string }> }

export async function generateMetadata({ params }: Props) {
  const a = await getArticle((await params).article)
  if (!a) return {}
  return pageMetadata({ title: a.meta.title, description: a.meta.description, path: `/journal/${a.meta.slug}`, article: { published: a.meta.date, modified: a.meta.updated } })
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).article)
  if (!a) notFound()
  const { meta, Content } = a
  const services = meta.relatedServices.map(getService).filter((s) => s !== undefined)
  const designs = getDesigns().filter((d) => meta.relatedDesigns.includes(d.slug)).map(toCard)

  return (
    <article className="wrap flex max-w-[760px] flex-col gap-6 pb-20 pt-8 md:pt-12">
      <JsonLd data={articleLd(meta)} />
      <JsonLd data={breadcrumbLd([['Journal', '/journal'], [meta.title, `/journal/${meta.slug}`]])} />
      {site.adsenseId && (
        <Script async strategy="afterInteractive" crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseId}`} />
      )}
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
        <Link href="/journal" className="text-muted">Journal</Link><span aria-hidden>/</span><span>{meta.category}</span>
      </nav>
      <h1 className="text-[clamp(32px,4.4vw,48px)] font-bold leading-[1.1] tracking-[-1.4px] text-navy">{meta.title}</h1>
      <p className="text-[15px] text-muted">
        By Fitin Editorial · <time dateTime={meta.date}>{formatDate(meta.date)}</time>
        {meta.updated && <> · Updated <time dateTime={meta.updated}>{formatDate(meta.updated)}</time></>}
      </p>
      <div className="relative aspect-[16/9] overflow-hidden rounded-panel bg-navy-soft">
        <Image src={meta.cover} alt={meta.coverAlt} fill preload sizes="(min-width: 800px) 760px, 100vw" className="object-cover" />
      </div>
      <div className="pt-2"><Content /></div>
      <AdSlot />
      {services.length > 0 && (
        <aside aria-label="Related services" className="flex flex-col gap-3 rounded-panel bg-surface p-6">
          <h2 className="text-lg font-bold text-navy">Related services</h2>
          <ul className="flex flex-col gap-2">{services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.name}</Link></li>)}</ul>
        </aside>
      )}
      {designs.length > 0 && (
        <section className="flex flex-col gap-5 pt-6">
          <h2 className="text-2xl font-bold text-navy">Designs to start from</h2>
          <DesignGrid cards={designs} />
        </section>
      )}
      <div className="mt-6 flex flex-col items-start gap-3 rounded-feature bg-lime-soft p-7">
        <h2 className="text-2xl font-bold text-navy">Planning something similar?</h2>
        <p className="text-[#3B4552]">Get a tailored quote from a verified designer in under {site.claims.quoteHours} hours.</p>
        <Link href="/start" className={buttonClass('dark')}>Start your project</Link>
      </div>
    </article>
  )
}
