export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="flex flex-col">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-b border-hairline">
          <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-bold text-navy [&::-webkit-details-marker]:hidden">
            {q}
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-xl transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="pb-4.5 text-[15px] text-ink-2">{a}</p>
        </details>
      ))}
    </div>
  )
}
