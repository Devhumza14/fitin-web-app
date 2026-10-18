import { getDesign, getDesigns } from '@/lib/content'
import { OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Fitin design'

export const generateStaticParams = () => getDesigns().map((d) => ({ room: d.room, design: d.slug }))

export default async function Image({ params }: { params: Promise<{ room: string; design: string }> }) {
  const { room, design } = await params
  const d = getDesign(room, design)
  return ogImage({ title: d?.title ?? 'Fitin design', kicker: d ? `${d.style} · ${d.city}` : undefined, image: d?.image ?? '/images/living-navy-sofa-teal-cushions.jpg' })
}
