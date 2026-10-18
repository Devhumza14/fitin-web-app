import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0E2340', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="104" height="125" viewBox="0 0 150 180"><path d="M10 46L140 10v44L10 90z" fill="#fff" /><path d="M10 104L118 76v40L10 144z" fill="#229E9F" /><path d="M10 156L96 134v28L10 176z" fill="#B6D22A" /></svg>
      </div>
    ),
    size,
  )
}
