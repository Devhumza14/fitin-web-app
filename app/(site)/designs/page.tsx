import { Suspense } from 'react'
import { DesignGrid } from '@/components/design-card'
import { toCard } from '@/lib/cards'
import { ExploreGrid } from '@/components/explore-grid'
import { RoomTabs } from '@/components/room-tabs'
import { getDesigns } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design ideas for every room',
  description: 'Browse customisable living room, bedroom, kitchen, wardrobe, bathroom and home office designs by verified Fitin designers across Pakistan.',
  path: '/designs',
})

export default function DesignsPage() {
  const cards = getDesigns().map(toCard)
  return (
    <div className="wrap flex flex-col gap-7 pb-20 pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(30px,4vw,44px)] font-bold tracking-[-1.2px] text-navy">Popular designs across Pakistan</h1>
        <p className="text-ink-2">Every design adapts to your room, your materials and your budget.</p>
      </div>
      <RoomTabs active="all" />
      <Suspense fallback={<DesignGrid cards={cards} />}>
        <ExploreGrid cards={cards} />
      </Suspense>
    </div>
  )
}
