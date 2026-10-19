import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DesignGrid } from '@/components/design-card'
import { toCard } from '@/lib/cards'
import { DesignCustomiser } from '@/components/design-customiser'
import { JsonLd } from '@/components/json-ld'
import { PlayIcon, WhatsAppIcon } from '@/components/icons'
import { SaveHeart } from '@/components/save-heart'
import { buttonClass } from '@/components/ui'
import { getDesign, getDesigns, getRoom, similarDesigns, site } from '@/lib/content'
import { breadcrumbLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => getDesigns().map((d) => ({ room: d.room, design: d.slug }))

type Props = { params: Promise<{ room: string; design: string }> }

export async function generateMetadata({ params }: Props) {
  const { room, design } = await params
  const d = getDesign(room, design)
  if (!d) return {}
  return pageMetadata({ title: `${d.title} — ${d.style} ${getRoom(d.room)!.single.toLowerCase()} design`, description: d.summary, path: `/designs/${d.room}/${d.slug}`, ownImage: true })
}

const STAGES = [
  ['01 Design', 'Site visit, layout and your material board', 'bg-navy text-white', 'text-sky'],
  ['02 Build', 'Pieces made to measure by verified vendors', 'bg-teal-dark text-white', 'text-white'],
  ['03 Fit', 'Delivered, installed and styled', 'bg-lime text-navy', 'text-navy'],
] as const

export default async function DesignPage({ params }: Props) {
  const { room: roomSlug, design } = await params
  const d = getDesign(roomSlug, design)
  if (!d) notFound()
  const room = getRoom(d.room)!
  const quoteHref = `/start?${new URLSearchParams({ space: room.space, design: d.slug })}`

  return (
    <div className="wrap flex max-w-[1180px] flex-col gap-7 pb-28 pt-7 md:pb-20">
      <JsonLd data={breadcrumbLd([['Explore', '/designs'], [room.label, `/designs/${room.slug}`], [d.title, `/designs/${room.slug}/${d.slug}`]])} />
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
        <Link href="/designs" className="text-muted">Explore</Link><span aria-hidden>/</span>
        <Link href={`/designs/${room.slug}`} className="text-muted">{room.label}</Link>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-1px] text-navy">{d.title}</h1>
          <p className="flex flex-wrap gap-2 text-[15px] text-ink-2">
            <span>{room.single}</span>·<span>{d.style}</span>·<span>{d.city}</span>·<span className="font-semibold text-teal-dark">100% customisable</span>
          </p>
        </div>
        <SaveHeart id={d.slug} title={d.title} variant="inline" />
      </div>

      <div className="grid gap-2.5 overflow-hidden rounded-panel md:grid-cols-2">
        <div className="relative min-h-[340px] bg-navy-soft md:min-h-[440px]">
          <Image src={d.image} alt={d.imageAlt} fill preload sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {d.finishes && (
            <div className="flex min-h-[150px] flex-col justify-between gap-3 bg-surface p-5">
              <span className="text-[13px] font-bold uppercase tracking-[1px] text-muted">Material board</span>
              <div className="grid grid-cols-2 gap-2">
                {[...d.finishes.upholstery.slice(0, 2), ...d.finishes.wood.slice(0, 2)].map((s) => (
                  <span key={s.name} title={s.name} className="aspect-[1.6] rounded-[10px]" style={{ background: s.hex }} />
                ))}
              </div>
            </div>
          )}
          <div className="flex min-h-[150px] flex-col justify-between gap-3 bg-teal-soft p-5">
            <span className="text-[13px] font-bold uppercase tracking-[1px] text-[#0E4F51]">Made for you</span>
            <span className="text-sm font-semibold text-navy">Sizes, fabrics and finishes adjusted to your room and budget.</span>
          </div>
          <div className={`flex min-h-[150px] flex-col justify-between gap-3 bg-navy p-5 text-white ${d.finishes ? 'col-span-2' : ''}`}>
            <span className="flex size-11 items-center justify-center rounded-full bg-lime text-navy"><PlayIcon className="size-[18px]" /></span>
            <span className="text-[15px] font-semibold leading-snug">3D walkthrough of your own room, after your consultation</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-14">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col divide-y divide-hairline">
          <section className="flex flex-col gap-3 pb-7">
            <h2 className="text-[22px] font-bold text-navy">About this design</h2>
            <p className="text-[#3B4552]">{d.about}</p>
          </section>
          <section className="flex flex-col gap-4 py-7">
            <h2 className="text-[22px] font-bold text-navy">What&apos;s included</h2>
            <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {d.included.map((item, i) => (
                <li key={item} className="flex items-center gap-3">
                  <span aria-hidden className="size-2 -skew-y-[20deg] rounded-[2px]" style={{ background: ['#0E2340', '#229E9F', '#B6D22A'][i % 3] }} />{item}
                </li>
              ))}
            </ul>
          </section>
          {d.finishes && (
            <section className="flex flex-col gap-5 py-7">
              <div>
                <h2 className="text-[22px] font-bold text-navy">Make it yours</h2>
                <p className="text-[15px] text-ink-2">Starting choices. Your designer brings real samples to your site visit.</p>
              </div>
              <DesignCustomiser upholstery={d.finishes.upholstery} wood={d.finishes.wood} />
            </section>
          )}
          <section className="flex flex-col gap-4 pt-7">
            <h2 className="text-[22px] font-bold text-navy">How it comes together</h2>
            <ol className="grid gap-3 sm:grid-cols-3">
              {STAGES.map(([k, t, box, kick]) => (
                <li key={k} className={`flex flex-col gap-1.5 rounded-card p-5 ${box}`}>
                  <span className={`text-xs font-bold uppercase tracking-[1px] ${kick}`}>{k}</span><span className="text-[15px]">{t}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside aria-label="Request a quote" className="sticky top-6 flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-panel border border-hairline bg-white p-7 shadow-float">
          <div>
            <p className="text-[22px] font-bold text-navy">Get a tailored quote</p>
            <p className="text-sm text-ink-2">Free, in under {site.claims.quoteHours} hours</p>
          </div>
          <Link href={quoteHref} className={buttonClass('primary', 'w-full')}>Request a quote</Link>
          <p className="text-center text-[13px] text-muted">No payment needed to get a quote</p>
          <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi Fitin, I'm interested in the ${d.title} design.`)}`}
            className="flex items-center justify-center gap-2 border-t border-hairline pt-4 text-sm font-semibold underline underline-offset-4">
            <WhatsAppIcon className="size-[18px] text-teal-dark" />Ask about this design on WhatsApp
          </a>
        </aside>
      </div>

      <section className="flex flex-col gap-5 border-t border-hairline pt-10">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold text-navy">You might also like</h2>
          <Link href="/designs" className="text-[15px] font-semibold underline underline-offset-4">See all</Link>
        </div>
        <DesignGrid cards={similarDesigns(d).map(toCard)} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-hairline bg-white px-5 pb-5 pt-3 shadow-[0_-4px_12px_rgb(14_35_64/0.06)] md:hidden">
        <span className="flex flex-col leading-tight"><b className="text-navy">Free quote</b><span className="text-[13px] text-ink-2">in under {site.claims.quoteHours} hours</span></span>
        <Link href={quoteHref} className={buttonClass('primary', 'min-h-[52px]')}>Request a quote</Link>
      </div>
    </div>
  )
}
