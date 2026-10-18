'use client'
import Link from 'next/link'
import { useState } from 'react'
import { RFT_DEFAULT, RFT_MAX, RFT_MIN, kitchenEstimate } from '@/lib/calculator'
import { ArrowRightIcon } from './icons'

export function Calculator() {
  const [rft, setRft] = useState(RFT_DEFAULT)
  const est = kitchenEstimate(rft)
  return (
    <div className="flex flex-wrap items-center gap-12">
      <label className="flex min-w-0 flex-[1_1_400px] flex-col gap-3.5">
        <span className="flex justify-between text-[15px] font-bold text-navy">Kitchen length <span>{est.rft} rft</span></span>
        <input type="range" min={RFT_MIN} max={RFT_MAX} step={1} value={est.rft} aria-label="Kitchen length in running feet"
          onChange={(e) => setRft(Number(e.target.value))} className="h-8 w-full accent-navy" />
        <span className="flex justify-between text-[13px] text-muted"><span>{RFT_MIN} rft</span><span>{RFT_MAX} rft</span></span>
      </label>
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 rounded-feature bg-white p-7 shadow-float md:p-10">
        <span className="text-sm font-semibold text-ink-2">Estimated range · Comfort tier</span>
        <output data-testid="estimate" aria-live="polite" className="text-[clamp(34px,4vw,52px)] font-bold leading-none tracking-[-1.5px] text-navy">
          PKR {est.low}–{est.high} Lakh
        </output>
        <span className="text-[15px] text-ink-2">for a {est.rft} rft modular kitchen</span>
        <hr className="my-2 border-hairline" />
        <span className="text-[13px] text-muted">Based on Fitin&apos;s Comfort tier rates (a 12 rft kitchen is about PKR 7.55–9.19 Lakh). Your exact price comes after a free site visit.</span>
        <Link href={`/start?space=Kitchen&service=${encodeURIComponent('Modular kitchen & wardrobe')}`} className="mt-2 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime font-bold text-navy hover:text-navy">
          Get an exact quote<ArrowRightIcon className="size-5" />
        </Link>
      </div>
    </div>
  )
}
