// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { ROOMS, designHref, designsInRoom, getDesigns, getServices } from '@/lib/content'
import { getArticles } from '@/lib/journal'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = (path: string, lastModified: Date | string = now) => ({ url: `${SITE_URL}${path}`, lastModified })
  const fixed = ['', '/designs', '/services', '/kitchen-cost-calculator', '/journal', '/start', '/for-designers', '/about', '/contact', '/privacy', '/terms']
  return [
    ...fixed.map((p) => url(p)),
    ...ROOMS.filter((r) => designsInRoom(r.slug).length > 0).map((r) => url(`/designs/${r.slug}`)),
    ...getDesigns().map((d) => url(designHref(d))),
    ...getServices().map((s) => url(`/services/${s.slug}`)),
    ...(await getArticles()).map((a) => url(`/journal/${a.slug}`, a.updated ?? a.date)),
  ]
}
