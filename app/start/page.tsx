import Link from 'next/link'
import { StartForm } from '@/components/forms/start-form'
import { Logo } from '@/components/header'
import { WhatsAppIcon } from '@/components/icons'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Start your project — free quote',
  description: `Tell us about your space and get a free, tailored quote from a verified Fitin designer within ${site.claims.quoteHours} hours.`,
  path: '/start',
})

export default function StartPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1160px] items-center justify-between gap-3 px-5 md:min-h-[76px] md:px-10">
          <Logo size={36} />
          <div className="flex items-center gap-2 text-sm">
            <a href={`https://wa.me/${site.whatsapp}`} className="hidden items-center gap-2 rounded-full px-3.5 py-2.5 font-semibold no-underline sm:flex">
              <WhatsAppIcon className="size-[18px] text-teal-dark" />Questions? WhatsApp us
            </a>
            <Link href="/" className="rounded-full border border-line bg-white px-4 py-2.5 font-semibold no-underline">Exit</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-5 pb-20 pt-6 md:px-10 md:pt-12">
        <StartForm quoteHours={site.claims.quoteHours} />
      </main>
    </div>
  )
}
