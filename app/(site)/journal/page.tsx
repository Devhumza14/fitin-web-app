import { ArticleCard } from '@/components/article-card'
import { getArticles } from '@/lib/journal'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Journal: interior design costs, styles and planning guides',
  description: 'Practical guides to planning, styling and budgeting your home interior in Pakistan, from the Fitin team.',
  path: '/journal',
})

export default async function JournalPage() {
  const articles = await getArticles()
  return (
    <div className="wrap flex flex-col gap-10 pb-20 pt-10 md:pt-16">
      <div className="flex max-w-[680px] flex-col gap-3">
        <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Journal</span>
        <h1 className="text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-1.6px] text-navy">The Fitin Journal</h1>
        <p className="text-[17px] text-ink-2">Practical guides to planning, styling and budgeting your home.</p>
      </div>
      {articles.length ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{articles.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
      ) : (
        <p className="text-ink-2">New guides are on their way.</p>
      )}
    </div>
  )
}
