import { readdirSync } from 'node:fs'
import path from 'node:path'
import type { ComponentType } from 'react'
import { z } from 'zod'
import { showDrafts } from './content'

export const CATEGORIES = ['Costs & budgets', 'Style guides', 'Planning'] as const

const metaSchema = z.object({
  title: z.string().min(10).max(70),
  description: z.string().min(50).max(160),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  category: z.enum(CATEGORIES),
  status: z.enum(['draft', 'published']),
  cover: z.string().startsWith('/images/'),
  coverAlt: z.string().min(5),
  relatedServices: z.array(z.string()).default([]),
  relatedDesigns: z.array(z.string()).default([]),
})
export type ArticleMeta = z.infer<typeof metaSchema> & { slug: string }

const DIR = path.join(process.cwd(), 'content/journal')
export const articleSlugs = () => readdirSync(DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.slice(0, -4)).sort()

async function load(slug: string) {
  const mod = (await import(`../content/journal/${slug}.mdx`)) as { default: ComponentType; meta: unknown }
  const parsed = metaSchema.safeParse(mod.meta)
  if (!parsed.success) throw new Error(`content/journal/${slug}.mdx: invalid meta — ${parsed.error.message}`)
  return { meta: { ...parsed.data, slug }, Content: mod.default }
}

const visible = (m: ArticleMeta) => m.status === 'published' || showDrafts()

export async function getArticles(): Promise<ArticleMeta[]> {
  const metas = await Promise.all(articleSlugs().map(async (s) => (await load(s)).meta))
  return metas.filter(visible).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getArticle(slug: string) {
  if (!articleSlugs().includes(slug)) return undefined
  const a = await load(slug)
  return visible(a.meta) ? a : undefined
}
