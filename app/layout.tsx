import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import Script from 'next/script'
import { site } from '@/lib/content'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

// EEA + UK + CH: consent denied until Google's certified consent message (loaded with AdSense) grants it.
const CONSENT_REGIONS = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']
const consentDefaults = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)},wait_for_update:500});
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});`

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space'),
  title: { default: 'Fitin — Design, build and fit, all in one place', template: '%s | Fitin' },
  description: 'Connect with verified interior designers, discover custom furniture and manage your entire home project from one platform. Serving Karachi, Lahore, Islamabad and more.',
  openGraph: { siteName: 'Fitin', locale: 'en_PK', type: 'website' },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = { themeColor: '#0E2340' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        {site.gaId && <Script id="consent-default" strategy="beforeInteractive">{consentDefaults}</Script>}
        {children}
      </body>
      {site.gaId && <GoogleAnalytics gaId={site.gaId} />}
    </html>
  )
}
