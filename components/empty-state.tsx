import Link from 'next/link'
import { Bar, buttonClass } from './ui'

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-line px-6 py-16 text-center">
      <Bar color="teal" />
      <h2 className="text-[22px] font-bold text-navy">{title}</h2>
      <p className="max-w-md text-ink-2">{text}</p>
      <Link href="/start" className={buttonClass('dark', 'mt-2')}>Start a project</Link>
    </div>
  )
}
