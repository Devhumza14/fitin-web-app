import Image from 'next/image'
import { Faq } from '@/components/faq'
import { PartnerForm } from '@/components/forms/partner-form'
import { WhatsAppIcon } from '@/components/icons'
import { Bar, Eyebrow, SectionHead, buttonClass } from '@/components/ui'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'For interior designers & furniture vendors',
  description: `Join Fitin's network of verified designers and vendors. Get matched with homeowners across ${site.cities.length} cities in Pakistan.`,
  path: '/for-designers',
})

const BENEFITS = [
  ['bg-navy-soft', 'Get matched with clients', 'Homeowners are matched to you by city, project type and style, so the requests you get fit the work you do.'],
  ['bg-teal-soft', 'Run projects in one place', 'Mood boards, quotes, vendors and delivery tracking, all shared with your client on one platform.'],
  ['bg-lime-soft', 'Earn on referrals', 'Refer a client and earn a 5% commission, paid out within 7 days.'],
] as const

const STEPS = [
  ['navy', 'Apply', 'Share your details, specialties and portfolio.'],
  ['teal', 'Get verified', 'Our team reviews your work and confirms your details.'],
  ['lime', 'Get matched', 'Receive project requests that fit your city and style.'],
  ['navy', 'Deliver & get paid', 'Run the project on Fitin and get paid as milestones complete.'],
] as const

const FAQ = [
  { q: 'Who can apply?', a: `Interior designers, furniture makers and material vendors working in ${site.cities.join(', ')}.` },
  { q: 'How are projects matched?', a: "By the homeowner's city, project type, style and budget, compared against your specialties and portfolio." },
  { q: 'How do referral payouts work?', a: 'When a client you refer starts a project, you earn a 5% commission, paid out within 7 days.' },
]

export default function ForDesignersPage() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="wrap flex flex-wrap items-center gap-14 py-14 md:py-[72px]">
          <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-6">
            <Eyebrow onNavy>For designers &amp; vendors</Eyebrow>
            <h1 className="text-[clamp(42px,5.6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px]">You design it.<br />We bring the <span className="text-lime">clients</span>.</h1>
            <p className="max-w-[520px] text-[19px] leading-[1.55] text-on-navy">Join Fitin&apos;s network of verified designers and vendors. Get matched with homeowners across {site.cities.length} cities, and run every project from one platform.</p>
            <div className="flex flex-wrap gap-3">
              <a href="#apply" className={buttonClass('primary')}>Apply to join</a>
              <a href="#steps" className="inline-flex min-h-14 items-center rounded-full border border-white/50 px-6 font-semibold text-white hover:text-white">How it works</a>
            </div>
            <dl className="mt-4 flex flex-wrap gap-7">
              {([[site.stats.designers, 'Designers already on Fitin', 'border-lime'], [site.stats.vendors, 'Trusted vendors', 'border-teal'], [String(site.cities.length), 'Cities', 'border-white']] as const).map(([n, l, b]) => (
                <div key={l} className={`flex flex-col-reverse border-t-2 pt-2.5 ${b}`}><dt className="text-sm text-on-navy">{l}</dt><dd className="text-[32px] font-bold tracking-[-1px]">{n}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/4.4] min-w-0 flex-[1_1_420px] overflow-hidden rounded-feature bg-navy-2">
            <Image src="/images/kitchen-green-glasshouse.jpg" alt="A green kitchen in a glass house filled with plants" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="wrap flex flex-col gap-10 py-20">
        <SectionHead title="Spend your time designing, not chasing leads." />
        <div className="grid gap-5 md:grid-cols-3">
          {BENEFITS.map(([bg, t, d]) => (
            <div key={t} className="flex flex-col gap-3.5 rounded-panel border border-hairline p-8">
              <span aria-hidden className={`size-[52px] rounded-2xl ${bg}`} />
              <h3 className="text-[21px] font-bold text-navy">{t}</h3><p className="text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="steps" className="scroll-mt-24 bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead eyebrow="How joining works" title="Four steps to your first project." />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([c, t, d], i) => (
              <li key={t} className="flex flex-col gap-2.5 rounded-panel bg-white p-7">
                <Bar color={c} /><span className="text-sm font-bold text-muted">Step {i + 1}</span>
                <h3 className="text-xl font-bold text-navy">{t}</h3><p className="text-[15px] text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" className="wrap flex scroll-mt-24 flex-wrap items-start gap-14 py-20">
        <div className="min-w-0 flex-[999_1_560px] rounded-feature border border-hairline bg-white p-6 shadow-float md:p-10"><PartnerForm /></div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <h2 className="mb-2 text-[26px] font-bold tracking-[-0.5px] text-navy">Questions</h2>
          <Faq items={FAQ} />
          <a href={`https://wa.me/${site.whatsapp}`} className="mt-2 flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4">
            <WhatsAppIcon className="size-[18px] text-teal-dark" />Ask our partnerships team on WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
