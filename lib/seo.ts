import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space').replace(/\/$/, '')

export function pageMetadata({ title, description, path, noindex = false, article, ownImage = false }: {
  title: string; description: string; path: string; noindex?: boolean; article?: { published: string; modified?: string }
  ownImage?: boolean // the page has its own opengraph-image route, which must not be overridden
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: path, siteName: 'Fitin', locale: 'en_PK',
      // a page-level openGraph replaces the layout's, so restate the default image
      ...(!ownImage && { images: [{ url: '/opengraph-image', width: 1200, height: 630 }] }),
      ...(article ? { type: 'article', publishedTime: article.published, modifiedTime: article.modified ?? article.published } : { type: 'website' }),
    },
    twitter: { card: 'summary_large_image', title, description },
    ...(noindex && { robots: { index: false, follow: true } }),
  }
}
