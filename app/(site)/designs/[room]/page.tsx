import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { DesignGrid } from '@/components/design-card'
import { toCard } from '@/lib/cards'
import { ExploreGrid } from '@/components/explore-grid'
import { RoomTabs } from '@/components/room-tabs'
import { ROOMS, designsInRoom, getRoom } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => ROOMS.map((r) => ({ room: r.slug }))

type Props = { params: Promise<{ room: string }> }

export async function generateMetadata({ params }: Props) {
  const room = getRoom((await params).room)
  if (!room) return {}
  return pageMetadata({
    title: `${room.single} designs & ideas in Pakistan`,
    description: `Customisable ${room.label.toLowerCase()} designs by verified Fitin designers in Karachi, Lahore, Islamabad and more. Get a free quote.`,
    path: `/designs/${room.slug}`,
    noindex: designsInRoom(room.slug).length === 0,
  })
}

export default async function RoomPage({ params }: Props) {
  const room = getRoom((await params).room)
  if (!room) notFound()
  const cards = designsInRoom(room.slug).map(toCard)
  return (
    <div className="wrap flex flex-col gap-7 pb-20 pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(30px,4vw,44px)] font-bold tracking-[-1.2px] text-navy">{room.single} designs</h1>
        <p className="text-ink-2">Ideas to start from. Your designer adapts every one to your space.</p>
      </div>
      <RoomTabs active={room.slug} />
      <Suspense fallback={<DesignGrid cards={cards} />}>
        <ExploreGrid cards={cards} />
      </Suspense>
    </div>
  )
}
