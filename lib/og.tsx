import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

export async function ogImage({ title, kicker, image }: { title: string; kicker?: string; image: string }) {
  const [font, photo] = await Promise.all([
    readFile(path.join(process.cwd(), 'node_modules/@fontsource/figtree/files/figtree-latin-700-normal.woff')),
    readFile(path.join(process.cwd(), 'public', image)),
  ])
  // the "*.jpg" files are WebP on disk, so sniff the type instead of trusting the extension
  const mime = photo.subarray(8, 12).toString('ascii') === 'WEBP' ? 'image/webp' : 'image/jpeg'
  const src = `data:${mime};base64,${photo.toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0E2340', color: '#fff', fontFamily: 'Figtree' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, padding: '56px 56px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="46" height="58" viewBox="0 0 48 58"><path d="M0 14L48 0v12L0 26z" fill="#fff" /><path d="M0 30L40 18v12L0 42z" fill="#229E9F" /><path d="M0 46L32 36v12L0 58z" fill="#B6D22A" /></svg>
            <span style={{ fontSize: 44, letterSpacing: -1.4 }}>fitin</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {kicker && <span style={{ fontSize: 22, color: '#9ED6D6', textTransform: 'uppercase', letterSpacing: 1.5 }}>{kicker}</span>}
            <span style={{ fontSize: title.length > 48 ? 52 : 62, lineHeight: 1.05, letterSpacing: -2 }}>{title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22 }}>
            <span style={{ padding: '10px 20px', borderRadius: 999, background: '#B6D22A', color: '#0E2340' }}>fitin.space</span>
            <span style={{ color: '#C9D2DE' }}>Karachi · Lahore · Islamabad +3</span>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, padding: '24px 24px 24px 0' }}>
          {/* next/og renders plain elements, so next/image does not apply */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width={536} height={582} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 32 }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Figtree', data: font, weight: 700, style: 'normal' }] },
  )
}
