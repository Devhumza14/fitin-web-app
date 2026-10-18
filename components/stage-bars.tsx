import { site } from '@/lib/content'

const STAGES = [
  { n: '01', label: 'Design', text: 'Matched with verified designers', box: 'w-full bg-navy text-white', kicker: 'text-sky' },
  { n: '02', label: 'Build', text: 'Custom furniture, made to measure', box: 'w-[88%] bg-teal-dark text-white', kicker: 'text-lime-pale' },
  { n: '03', label: 'Fit', text: `Installed in ${site.claims.installDays} days`, box: 'w-[76%] bg-lime text-navy', kicker: 'text-navy' },
] as const

export function StageBars({ compact = false }: { compact?: boolean }) {
  return (
    <ol aria-label="Design, build, fit" className="flex flex-col gap-2.5">
      {STAGES.map((s) => (
        <li key={s.n} className={`${s.box} flex origin-bottom-left -rotate-3 items-center gap-3.5 rounded-[22px] shadow-[0_10px_24px_rgb(14_35_64/0.18)] ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
          <span className={`shrink-0 text-xs font-bold uppercase tracking-[1px] ${s.kicker}`}>{s.n} {s.label}</span>
          <span className={`font-semibold leading-tight ${compact ? 'text-sm' : 'text-base'}`}>{s.text}</span>
        </li>
      ))}
    </ol>
  )
}
