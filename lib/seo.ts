import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space').replace(/\/$/, '')

export function pageMetadata({ title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Fitin', type: 'website', locale: 'en_PK' },
    twitter: { card: 'summary_large_image', title, description },
    ...(noindex && { robots: { index: false, follow: true } }),
  }
}
