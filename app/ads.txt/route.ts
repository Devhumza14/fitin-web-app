// app/ads.txt/route.ts
import { site } from '@/lib/content'

export const dynamic = 'force-static'

export function GET() {
  if (!site.adsenseId) return new Response('Not found', { status: 404 })
  const pub = site.adsenseId.replace(/^ca-/, '')
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
