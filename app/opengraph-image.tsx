import { OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Fitin — Design, build and fit, all in one place'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogImage({ title: 'Design, build and fit — all in one place.', image: '/images/bedroom-navy-city-view.jpg' })
}
