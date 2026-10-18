import Link from 'next/link'

export function LegalTabs({ active }: { active: 'privacy' | 'terms' }) {
  const tab = (key: 'privacy' | 'terms', label: string) => (
    <Link href={`/${key}`} aria-current={active === key ? 'page' : undefined}
      className={`flex min-h-11 items-center rounded-full px-5 text-[15px] font-semibold no-underline ${active === key ? 'bg-navy text-white hover:text-white' : 'text-navy'}`}>
      {label}
    </Link>
  )
  return <nav aria-label="Legal documents" className="inline-flex self-start rounded-full bg-surface p-1">{tab('privacy', 'Privacy policy')}{tab('terms', 'Terms of service')}</nav>
}
