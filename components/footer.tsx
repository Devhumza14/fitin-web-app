import Image from 'next/image'
import Link from 'next/link'
import { getServices, site } from '@/lib/content'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="wrap flex flex-col gap-10 pb-6 pt-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Image src="/images/fitin-logo.png" alt="" width={32} height={32} className="mix-blend-multiply" />
              <span className="text-[22px] font-extrabold tracking-[-0.6px] text-navy">fitin</span>
            </div>
            <p className="max-w-60 text-sm text-ink-2">Design · Build · Fit. Interior design, custom furniture and project tracking on one platform.</p>
          </div>
          <nav aria-label="Services" className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Services</span>
            {getServices().map((s) => <Link key={s.slug} href={`/services/${s.slug}`} className="no-underline">{s.name}</Link>)}
            <Link href="/kitchen-cost-calculator" className="no-underline">Kitchen cost calculator</Link>
          </nav>
          <nav aria-label="Fitin" className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Fitin</span>
            <Link href="/about" className="no-underline">About</Link>
            <Link href="/contact" className="no-underline">Contact</Link>
            <Link href="/journal" className="no-underline">Journal</Link>
            <Link href="/for-designers" className="no-underline">For designers</Link>
            <a href={site.crmUrl} className="no-underline">Sign in</a>
          </nav>
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Contact</span>
            <a href={`mailto:${site.email}`} className="no-underline">{site.email}</a>
            <a href={`tel:${site.phone}`} className="no-underline">{site.phoneDisplay}</a>
            <a href={`https://wa.me/${site.whatsapp}`} className="no-underline">WhatsApp</a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-hairline pt-5 text-[13px] text-muted">
          <span>
            © {year} {site.legalName} · <Link href="/privacy" className="text-muted">Privacy</Link> ·{' '}
            <Link href="/terms" className="text-muted">Terms</Link>
          </span>
          <span>{site.cities.join(' · ')}</span>
        </div>
      </div>
    </footer>
  )
}
