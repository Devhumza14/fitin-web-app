import { ContactForm } from '@/components/forms/contact-form'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Contact Fitin',
  description: `WhatsApp, call or email Fitin. We serve ${site.cities.join(', ')}.`,
  path: '/contact',
})

const card = 'flex items-center gap-4 rounded-card px-5 py-4.5 no-underline'

export default function ContactPage() {
  return (
    <section className="wrap flex flex-wrap items-start gap-14 py-14 md:py-20">
      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Contact</span>
          <h1 className="text-[clamp(36px,4.4vw,52px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">Talk to a real person.</h1>
          <p className="text-[17px] text-ink-2">WhatsApp is the quickest way to reach us.</p>
        </div>
        <div className="flex flex-col gap-3">
          <a href={`https://wa.me/${site.whatsapp}`} className={`${card} bg-lime-soft`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-lime"><WhatsAppIcon className="size-[22px] text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">WhatsApp</b><span className="text-sm text-ink-2">{site.phoneDisplay}</span></span>
          </a>
          <a href={`tel:${site.phone}`} className={`${card} border border-hairline`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-soft"><PhoneIcon className="size-5 text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">Call us</b><span className="text-sm text-ink-2">{site.phoneDisplay}</span></span>
          </a>
          <a href={`mailto:${site.email}`} className={`${card} border border-hairline`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-soft"><MailIcon className="size-5 text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">Email</b><span className="text-sm text-ink-2">{site.email}</span></span>
          </a>
        </div>
        <div className="flex flex-col gap-2.5 pt-2">
          <span className="text-[15px] font-bold text-navy">Cities we serve</span>
          <ul className="flex flex-wrap gap-2">{site.cities.map((c) => <li key={c} className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold">{c}</li>)}</ul>
          {site.address && <p className="text-sm text-muted">Office: {site.address}</p>}
        </div>
      </div>
      <div className="min-w-0 flex-[1_1_520px] rounded-feature border border-hairline bg-white p-6 shadow-float md:p-10"><ContactForm /></div>
    </section>
  )
}
