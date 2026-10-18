import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from '@/components/icons'
import { StageBars } from '@/components/stage-bars'
import { Bar, Highlight, SectionHead, buttonClass } from '@/components/ui'
import { ROOMS, getServices, site } from '@/lib/content'
import { CITIES, SERVICE_OPTIONS, SPACES } from '@/lib/rules'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design, custom furniture & fit-out in Pakistan',
  description: `Connect with verified interior designers and furniture vendors in ${site.cities.slice(0, 3).join(', ')} and more. Free quote in under ${site.claims.quoteHours} hours.`,
  path: '/',
})

const FEATURED_ROOMS = [
  { slug: 'living-rooms', image: '/images/living-navy-sofa-teal-cushions.jpg', alt: 'Navy sofa with teal cushions', badge: 'Most popular' },
  { slug: 'bedrooms', image: '/images/bedroom-pendant-light.jpg', alt: 'Warm bedroom with a pendant light' },
  { slug: 'kitchens', image: '/images/kitchen-open-white.jpg', alt: 'Open white kitchen' },
  { slug: 'home-offices', image: '/images/office-sunlit-desk.jpg', alt: 'Bright home office with a white desk' },
] as const

const STEPS = [
  { color: 'navy', title: 'Tell us about your space', text: 'Your room, your city, your budget. It takes a couple of minutes.' },
  { color: 'teal', title: 'Get matched with experts', text: 'We pair you with verified designers and vendors near you.' },
  { color: 'lime', title: 'Design & customise', text: 'Pick materials, finishes and sizes. Every piece can be changed.' },
  { color: 'navy', title: 'Track your project', text: 'See production, delivery and installation in one place.' },
] as const

const selectCls = 'w-full appearance-none bg-transparent text-[15px] text-ink-2 outline-none'

export default function Home() {
  const roomLabel = (slug: string) => ROOMS.find((r) => r.slug === slug)!.label
  const otherRooms = ROOMS.filter((r) => !FEATURED_ROOMS.some((f) => f.slug === r.slug))
  return (
    <>
      {/* HERO */}
      <section className="wrap flex flex-wrap items-center gap-14 pb-16 pt-7 md:pt-16">
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-7">
          <p className="inline-flex items-center gap-2.5 self-start rounded-full bg-lime-soft py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-navy">
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.6px] text-white">6 cities</span>
            Karachi · Lahore · Islamabad and more
          </p>
          <h1 className="text-[clamp(44px,6vw,76px)] font-bold leading-[1.02] tracking-[-2.4px] text-navy">
            <Highlight tone="navy">Design</Highlight>, <Highlight tone="teal">build</Highlight> and <Highlight tone="lime">fit</Highlight> — all in one place.
          </h1>
          <p className="max-w-[520px] text-[19px] leading-[1.55] text-ink-2">{site.description}</p>

          <form action="/start" method="get" aria-label="Start your project"
            className="hidden max-w-[680px] flex-wrap items-center gap-y-1 rounded-[40px] border border-line bg-white p-2 shadow-float md:flex">
            {([['space', 'Space', SPACES], ['city', 'City', CITIES], ['service', 'Service', SERVICE_OPTIONS]] as const).map(([name, label, opts], i) => (
              <div key={name} className="flex flex-[1_1_140px] items-center">
                {i > 0 && <span aria-hidden className="h-8 w-px bg-hairline" />}
                <label className="flex flex-1 cursor-pointer flex-col gap-0.5 px-5 py-2.5">
                  <span className="text-xs font-bold text-navy">{label}</span>
                  <select name={name} className={selectCls} defaultValue={opts[0]}>
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              </div>
            ))}
            <button type="submit" className="flex h-14 items-center gap-2.5 rounded-full bg-lime pl-[18px] pr-6 font-bold text-navy">
              <ArrowRightIcon className="size-5" />Start project
            </button>
          </form>

          <Link href="/start" className="flex items-center gap-3 rounded-full border border-line py-2 pl-5 pr-2 no-underline shadow-float md:hidden">
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-bold text-navy">Start your project</span>
              <span className="text-[13px] text-ink-2">Space · City · Service</span>
            </span>
            <span className="flex size-[52px] items-center justify-center rounded-full bg-lime"><ArrowRightIcon className="size-5 text-navy" /></span>
          </Link>

          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-2">
            {[`Free quote in under ${site.claims.quoteHours} hours`, 'Verified designers & vendors', 'Track every step in one place'].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckIcon className="size-[18px] text-teal-dark" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 flex-[1_1_500px] pb-10">
          <div className="relative ml-0 aspect-[4/4.3] overflow-hidden rounded-feature bg-navy-soft md:ml-14">
            <Image src="/images/bedroom-navy-city-view.jpg" alt="A bright bedroom with navy bedding and a city view" fill preload
              sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <p className="absolute right-5 top-6 flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-bold text-navy shadow-float">
            <span className="flex size-9 items-center justify-center rounded-full bg-lime">
              <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="#0E2340" strokeWidth={2.2} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            Quote in under {site.claims.quoteHours} hours
          </p>
          <div className="absolute bottom-0 left-0 w-[80%] md:w-[76%]"><StageBars /></div>
        </div>
      </section>

      {/* EXPLORE BY ROOM */}
      <section className="wrap flex flex-col gap-7 pb-20 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[32px] font-bold tracking-[-0.8px] text-navy">Explore by room</h2>
            <p className="text-ink-2">{site.stats.designs} furniture designs, all 100% customisable.</p>
          </div>
          <Link href="/designs" className="text-[15px] font-semibold underline underline-offset-4">Browse all designs</Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {FEATURED_ROOMS.map((r) => (
            <Link key={r.slug} href={`/designs/${r.slug}`} className="flex w-60 shrink-0 snap-start flex-col gap-3 text-navy no-underline md:w-auto">
              <span className="relative block aspect-[4/3.8] overflow-hidden rounded-card bg-navy-soft">
                <Image src={r.image} alt={r.alt} fill sizes="(min-width: 768px) 25vw, 240px" className="object-cover" />
                {'badge' in r && <span className="absolute left-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-[0_2px_8px_rgb(14_35_64/0.1)]">{r.badge}</span>}
              </span>
              <span className="flex flex-col gap-0.5 px-0.5 md:flex-row md:justify-between md:gap-3">
                <span className="text-[17px] font-bold">{roomLabel(r.slug)}</span>
                <span className="text-sm text-ink-2">{site.roomCounts[r.slug]} designs</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {otherRooms.map((r) => (
            <Link key={r.slug} href={`/designs/${r.slug}`} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold no-underline">
              {r.label} <span className="font-medium text-muted">{site.roomCounts[r.slug]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead eyebrow="Services" title="One corner or the whole home." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {getServices().map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="flex flex-col overflow-hidden rounded-panel bg-white text-navy no-underline">
                <span className="relative block aspect-[16/10] bg-navy-soft">
                  <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </span>
                <span className="flex flex-col gap-2 p-6">
                  <span className="text-[21px] font-bold tracking-[-0.3px]">{s.name}</span>
                  <span className="text-[15px] text-ink-2">{s.summary}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="wrap flex scroll-mt-24 flex-col gap-10 py-20">
        <SectionHead eyebrow="How it works" title="From first idea to finished room." />
        <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 border-t border-hairline pt-6">
              <Bar color={s.color} />
              <span className="text-sm font-bold text-muted">Step {i + 1}</span>
              <h3 className="text-[22px] font-bold text-navy">{s.title}</h3>
              <p className="text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* NAVY BAND */}
      <section className="bg-navy text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-12 py-20">
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
            <h2 className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px]">
              Connecting spaces.<br /><span className="text-lime">Building possibilities.</span>
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {site.cities.map((c) => <li key={c} className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold">{c}</li>)}
            </ul>
          </div>
          <dl className="grid min-w-0 flex-[1_1_520px] grid-cols-3 gap-4">
            {([['Furniture designs', site.stats.designs, 'border-lime'], ['Verified designers', site.stats.designers, 'border-teal'], ['Trusted vendors', site.stats.vendors, 'border-white']] as const).map(([label, value, border]) => (
              <div key={label} className={`flex flex-col-reverse gap-1 border-t-2 pt-4 ${border}`}>
                <dt className="text-sm text-on-navy">{label}</dt>
                <dd className="text-[clamp(30px,4vw,48px)] font-bold leading-none tracking-[-1.5px]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-20">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-feature bg-lime-soft p-7 md:p-14">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
            <h2 className="text-4xl font-bold tracking-[-1px] text-navy">Start your project today.</h2>
            <p className="text-[17px] text-[#3B4552]">Get a tailored quote in under {site.claims.quoteHours} hours.</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <Link href="/start" className={buttonClass('dark', 'w-full sm:w-auto')}>Request a free quote</Link>
            <a href={`https://wa.me/${site.whatsapp}`} className={buttonClass('outline', 'w-full sm:w-auto')}>
              <WhatsAppIcon className="size-[18px]" />Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
