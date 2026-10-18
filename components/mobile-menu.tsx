'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { ChevronRightIcon, CloseIcon, MenuIcon, WhatsAppIcon } from './icons'
import { buttonClass } from './ui'

const LINKS = [
  { href: '/designs', label: 'Explore designs' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/for-designers', label: 'For designers & vendors' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function MobileMenu({ crmUrl, whatsapp }: { crmUrl: string; whatsapp: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) ref.current?.close()
  }
  return (
    <>
      <button type="button" aria-label="Open menu" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}
        className="flex size-11 items-center justify-center rounded-full border border-line md:hidden">
        <MenuIcon className="size-[18px]" />
      </button>
      <dialog ref={ref} aria-label="Menu" onClick={closeOnLink}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-ink backdrop:bg-navy/40 open:flex open:flex-col">
        <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
          <span className="text-[22px] font-extrabold tracking-[-0.7px] text-navy">fitin</span>
          <button type="button" aria-label="Close menu" onClick={() => ref.current?.close()}
            className="flex size-11 items-center justify-center rounded-full bg-surface"><CloseIcon className="size-[18px]" /></button>
        </div>
        <nav aria-label="Menu links" className="flex-1 px-5 py-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-16 items-center justify-between border-b border-hairline text-xl font-bold text-navy">
              {l.label}<ChevronRightIcon className="size-[18px] text-muted" />
            </Link>
          ))}
          <a href={crmUrl} className="flex min-h-16 items-center text-[17px] font-semibold text-navy">Sign in</a>
        </nav>
        <div className="flex flex-col gap-3 border-t border-hairline px-5 pb-7 pt-4">
          <Link href="/start" className={buttonClass('primary', 'w-full')}>Start your project</Link>
          <a href={`https://wa.me/${whatsapp}`} className={buttonClass('outline', 'w-full rounded-full')}>
            <WhatsAppIcon className="size-[18px] text-teal-dark" />WhatsApp us
          </a>
        </div>
      </dialog>
    </>
  )
}
