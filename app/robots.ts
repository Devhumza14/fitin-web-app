// app/robots.ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Hidden from search engines until ALLOW_INDEXING=1 is set at build time (launch).
  if (process.env.ALLOW_INDEXING !== '1') return { rules: [{ userAgent: '*', disallow: '/' }] }
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${SITE_URL}/sitemap.xml` }
}
