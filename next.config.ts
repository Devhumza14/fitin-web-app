import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'
const GOOGLE_SCRIPT = 'https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.com'
const GOOGLE_CONNECT = 'https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com'
const GOOGLE_FRAME = 'https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google'

// 'unsafe-inline' is required for statically generated pages (a nonce CSP would force dynamic rendering).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${GOOGLE_SCRIPT}`,
  `connect-src 'self' ${GOOGLE_CONNECT}`,
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `frame-src ${GOOGLE_FRAME}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
}

export default createMDX({})(nextConfig)
