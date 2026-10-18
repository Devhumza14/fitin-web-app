import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/content'
import { BuildIcon, DesignIcon, JournalIcon } from './icons'
import { MobileMenu } from './mobile-menu'
import { NavLink } from './nav-link'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-navy hover:text-navy" aria-label="Fitin home">
      <Image src="/images/fitin-logo.png" alt="" width={size} height={size} />
      <span className="text-[26px] font-extrabold tracking-[-0.8px]">fitin</span>
    </Link>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white md:static">
      <div className="wrap flex min-h-16 items-center justify-between gap-4 md:min-h-[84px]">
        <Logo />
        <nav aria-label="Main" className="hidden items-end gap-9 md:flex">
          <NavLink href="/designs"><DesignIcon className="size-[30px]" />Explore</NavLink>
          <NavLink href="/services"><BuildIcon className="size-[30px]" />Services</NavLink>
          <NavLink href="/journal"><JournalIcon className="size-[30px]" />Journal</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/for-designers" className="hidden px-3.5 py-3 text-sm font-semibold no-underline lg:inline">For designers</Link>
          <a href={site.crmUrl} className="hidden px-3.5 py-3 text-sm font-semibold lg:inline">Sign in</a>
          <Link href="/start" className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-2 hover:text-white md:h-11 md:px-5">
            <span className="md:hidden">Start</span><span className="hidden md:inline">Start project</span>
          </Link>
          <MobileMenu crmUrl={site.crmUrl} whatsapp={site.whatsapp} />
        </div>
      </div>
    </header>
  )
}
