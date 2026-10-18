'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const path = usePathname()
  const active = path === href || path.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 border-b-2 px-0.5 pb-3 pt-2.5 text-[15px] font-semibold ${
        active ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-navy'
      }`}
    >
      {children}
    </Link>
  )
}
