import type { ReactNode } from 'react'
import { CheckIcon } from './icons'

const BUTTON = {
  primary: 'inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-6 font-bold text-navy hover:text-navy hover:brightness-95',
  dark: 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-btn bg-navy px-7 font-semibold text-white hover:bg-navy-2 hover:text-white',
  outline: 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-btn border border-navy bg-white px-6 font-semibold text-navy hover:bg-navy-soft',
} as const

export const buttonClass = (variant: keyof typeof BUTTON = 'dark', extra = '') => `${BUTTON[variant]} ${extra}`.trim()

export const Eyebrow = ({ children, onNavy = false }: { children: ReactNode; onNavy?: boolean }) => (
  <span className={`text-[13px] font-bold uppercase tracking-[1.2px] ${onNavy ? 'text-sky' : 'text-teal-dark'}`}>{children}</span>
)

export function SectionHead({ eyebrow, title, intro, as: H = 'h2' }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div className="flex max-w-[680px] flex-col gap-3">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <H className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">{title}</H>
      {intro && <p className="text-[17px] text-ink-2">{intro}</p>}
    </div>
  )
}

export const BAR_FILL = { navy: '#0E2340', teal: '#229E9F', lime: '#B6D22A' } as const
export const Bar = ({ color, className = 'h-6 w-14' }: { color: keyof typeof BAR_FILL; className?: string }) => (
  <svg aria-hidden viewBox="0 0 64 28" className={className}><path d="M0 14L64 0v14L0 28z" fill={BAR_FILL[color]} /></svg>
)

const UNDERLINE = { navy: '#C9D6E8', teal: '#9ED6D6', lime: '#B6D22A' } as const
export const Highlight = ({ tone, children }: { tone: keyof typeof UNDERLINE; children: ReactNode }) => (
  <span style={{ boxShadow: `inset 0 -${tone === 'lime' ? '0.22em' : '0.16em'} 0 ${UNDERLINE[tone]}` }}>{children}</span>
)

export const CheckList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-2.5">
    {items.map((item) => (
      <li key={item} className="flex gap-3"><CheckIcon className="mt-0.5 size-5 shrink-0 text-teal-dark" />{item}</li>
    ))}
  </ul>
)
