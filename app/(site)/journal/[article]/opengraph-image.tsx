import { getArticle, getArticles } from '@/lib/journal'
import { OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Fitin Journal article'

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ article: a.slug }))
}

export default async function Image({ params }: { params: Promise<{ article: string }> }) {
  const a = await getArticle((await params).article)
  return ogImage({ title: a?.meta.title ?? 'Fitin Journal', kicker: a?.meta.category ?? 'Journal', image: a?.meta.cover ?? '/images/kitchen-open-white.jpg' })
}
