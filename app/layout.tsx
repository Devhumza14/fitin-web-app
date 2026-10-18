import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space'),
  title: { default: 'Fitin — Design, build and fit, all in one place', template: '%s | Fitin' },
  description:
    'Connect with verified interior designers, discover custom furniture and manage your entire home project from one platform. Serving Karachi, Lahore, Islamabad and more.',
}

export const viewport: Viewport = { themeColor: '#0E2340' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
