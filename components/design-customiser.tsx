'use client'
import { useState } from 'react'

type Swatch = { name: string; hex: string }

function SwatchGroup({ label, swatches }: { label: string; swatches: Swatch[] }) {
  const [picked, setPicked] = useState(swatches[0].name)
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-bold text-navy">{label} · <span className="font-medium text-ink-2">{picked}</span></legend>
      <div className="flex flex-wrap gap-3">
        {swatches.map((s) => (
          <label key={s.name} className="relative block cursor-pointer">
            <input type="radio" name={label} value={s.name} checked={picked === s.name} onChange={() => setPicked(s.name)} aria-label={s.name} className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
            <span aria-hidden className="block size-12 rounded-full border-[3px] border-white shadow-[0_0_0_1px_#D5DAE0] peer-checked:shadow-[0_0_0_2px_#0E2340] peer-focus-visible:outline-2 peer-focus-visible:outline-navy" style={{ background: s.hex }} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function DesignCustomiser({ upholstery, wood }: { upholstery: Swatch[]; wood: Swatch[] }) {
  return (
    <div className="flex flex-col gap-5">
      <SwatchGroup label="Upholstery" swatches={upholstery} />
      <SwatchGroup label="Wood finish" swatches={wood} />
    </div>
  )
}
