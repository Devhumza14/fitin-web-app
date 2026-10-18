import { ROOMS, designHref, site, type Design } from '@/lib/content'

export type CardDesign = {
  slug: string; href: string; title: string; city: string; style: string
  roomLabel: string; image: string; imageAlt: string; badge?: string; quoteHours: number
}

export const toCard = (d: Design): CardDesign => ({
  slug: d.slug, href: designHref(d), title: d.title, city: d.city, style: d.style,
  roomLabel: ROOMS.find((r) => r.slug === d.room)!.single, image: d.image, imageAlt: d.imageAlt, badge: d.badge,
  quoteHours: site.claims.quoteHours,
})
