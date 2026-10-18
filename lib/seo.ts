import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space').replace(/\/$/, '')

export function pageMetadata({ title, description, path, noindex = false, article }: {
  title: string; description: string; path: string; noindex?: boolean; article?: { published: string; modified?: string }
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: path, siteName: 'Fitin', locale: 'en_PK',
      ...(article ? { type: 'article', publishedTime: article.published, modifiedTime: article.modified ?? article.published } : { type: 'website' }),
    },
    twitter: { card: 'summary_large_image', title, description },
    ...(noindex && { robots: { index: false, follow: true } }),
  }
}
