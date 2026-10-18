'use client'
import { useState } from 'react'

const BARS = [
  { d: 'M0 50L240 0v60L0 110z', fill: '#0E2340', w: 240, h: 110, top: 40, off: 'translate(-30px,150px) rotate(-28deg)' },
  { d: 'M0 46L210 0v54L0 100z', fill: '#229E9F', w: 210, h: 100, top: 150, off: 'translate(60px,120px) rotate(18deg)' },
  { d: 'M0 42L180 0v50L0 92z', fill: '#B6D22A', w: 180, h: 92, top: 255, off: 'translate(-10px,-210px) rotate(-62deg)' },
]

export function NotFoundBars() {
  const [fixed, setFixed] = useState(false)
  return (
    <div className="flex flex-col items-center gap-6">
      <div aria-hidden className="relative h-[360px] w-[340px] max-w-full origin-top scale-75 md:scale-100">
        {BARS.map((b) => (
          <svg key={b.fill} viewBox={`0 0 ${b.w} ${b.h}`} width={b.w} height={b.h}
            className="absolute left-[50px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ top: b.top, transform: fixed ? 'none' : b.off }}>
            <path d={b.d} fill={b.fill} />
          </svg>
        ))}
      </div>
      <button type="button" onClick={() => setFixed(!fixed)} className="h-12 rounded-full border border-navy bg-white px-5.5 text-[15px] font-semibold text-navy">
        {fixed ? 'Knock it over again' : 'Put it back together'}
      </button>
    </div>
  )
}
