import Link from 'next/link'
import { Calculator } from '@/components/calculator'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Modular kitchen cost calculator (Pakistan, 2026)',
  description: 'Estimate your modular kitchen cost in PKR by running feet. Based on Fitin Comfort-tier rates; get an exact quote after a free site visit.',
  path: '/kitchen-cost-calculator',
})

export default function CalculatorPage() {
  return (
    <section className="bg-surface">
      <div className="wrap flex flex-col gap-8 py-14 md:py-20">
        <div className="flex max-w-[680px] flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Cost calculator</span>
          <h1 className="text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-1.6px] text-navy">What will my kitchen cost?</h1>
          <p className="text-[17px] text-ink-2">Slide to your kitchen&apos;s running length — measure along the wall where cabinets will go.</p>
        </div>
        <Calculator />
        <div className="flex max-w-[680px] flex-col gap-3 text-ink-2">
          <h2 className="text-xl font-bold text-navy">How this estimate works</h2>
          <p>The range uses Fitin&apos;s Comfort-tier rate for modular kitchens. Final prices depend on materials, hardware, appliances and your site, so your designer confirms an exact, itemised quote after a free visit.</p>
          <p>Planning a whole kitchen? See <Link href="/services/modular-kitchens-wardrobes">modular kitchens &amp; wardrobes</Link>.</p>
        </div>
      </div>
    </section>
  )
}
