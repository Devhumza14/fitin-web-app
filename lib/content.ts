import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import siteJson from '@/content/site.json'
import servicesJson from '@/content/services.json'
import { CITIES, SERVICE_OPTIONS } from '@/lib/rules'

export const ROOMS = [
  { slug: 'living-rooms', label: 'Living rooms', single: 'Living room', space: 'Living room' },
  { slug: 'bedrooms', label: 'Bedrooms', single: 'Bedroom', space: 'Bedroom' },
  { slug: 'kitchens', label: 'Kitchens', single: 'Kitchen', space: 'Kitchen' },
  { slug: 'wardrobes', label: 'Wardrobes', single: 'Wardrobe', space: 'Wardrobe' },
  { slug: 'bathrooms', label: 'Bathrooms', single: 'Bathroom', space: 'Bathroom' },
  { slug: 'home-offices', label: 'Home offices', single: 'Home office', space: 'Home office' },
  { slug: 'dining-areas', label: 'Dining areas', single: 'Dining area', space: 'Dining area' },
  { slug: 'commercial', label: 'Commercial', single: 'Commercial space', space: 'Commercial' },
] as const
export type Room = (typeof ROOMS)[number]
export type RoomSlug = Room['slug']
const ROOM_SLUGS = ROOMS.map((r) => r.slug) as [RoomSlug, ...RoomSlug[]]

export const DESIGN_STYLES = ['Warm Modern', 'Japandi Minimal', 'Contemporary', 'Classic'] as const

const swatch = z.object({ name: z.string(), hex: z.string().regex(/^#[0-9A-F]{6}$/i) })
const designSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(['draft', 'published']),
  title: z.string().min(3),
  room: z.enum(ROOM_SLUGS),
  style: z.enum(DESIGN_STYLES),
  city: z.enum(CITIES),
  image: z.string().startsWith('/images/'),
  imageAlt: z.string().min(5),
  badge: z.string().optional(),
  featured: z.boolean().default(false),
  summary: z.string().min(20).max(160),
  about: z.string().min(40),
  included: z.array(z.string()).min(1),
  finishes: z.object({ upholstery: z.array(swatch), wood: z.array(swatch) }).optional(),
})
export type Design = z.infer<typeof designSchema>

const serviceSchema = z.object({
  slug: z.string(), name: z.string(), startService: z.enum(SERVICE_OPTIONS), short: z.string(), bar: z.enum(['navy', 'teal', 'lime']),
  summary: z.string(), intro: z.string(), includes: z.array(z.string()).min(1),
  image: z.string().startsWith('/images/'), imageAlt: z.string(), calculator: z.boolean(),
})
export type Service = z.infer<typeof serviceSchema>

const siteSchema = z.object({
  name: z.string(), legalName: z.string(), tagline: z.string(), description: z.string(),
  email: z.email(), phone: z.string().regex(/^\+92\d{10}$/), phoneDisplay: z.string(), whatsapp: z.string().regex(/^\d+$/),
  crmUrl: z.url(), cities: z.array(z.enum(CITIES)).length(6),
  stats: z.object({ designs: z.string(), designers: z.string(), vendors: z.string() }),
  roomCounts: z.record(z.enum(ROOM_SLUGS), z.string()),
  claims: z.object({ installDays: z.number(), quoteHours: z.number() }),
  statsVerified: z.boolean(),
  legalReviewed: z.boolean(),
  legalUpdated: z.iso.date(),
  address: z.string(),
  adsenseId: z.string().regex(/^(ca-pub-\d{16})?$/),
  adSlot: z.string().regex(/^\d*$/),
  gaId: z.string().regex(/^(G-[A-Z0-9]+)?$/),
})
export type Site = z.infer<typeof siteSchema>

export const site: Site = siteSchema.parse(siteJson)
const services: Service[] = z.array(serviceSchema).parse(servicesJson)

export const showDrafts = () => process.env.NODE_ENV !== 'production' || process.env.INCLUDE_DRAFTS === '1'

let designCache: Design[] | undefined
function allDesigns(): Design[] {
  if (designCache) return designCache
  const dir = path.join(process.cwd(), 'content/designs')
  designCache = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const d = designSchema.parse(JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
      if (`${d.slug}.json` !== f) throw new Error(`content/designs/${f}: slug "${d.slug}" must match the file name`)
      return d
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured))
  return designCache
}

export const getDesigns = () => allDesigns().filter((d) => d.status === 'published' || showDrafts())
export const getDesign = (room: string, slug: string) => getDesigns().find((d) => d.room === room && d.slug === slug)
export const getRoom = (slug: string) => ROOMS.find((r) => r.slug === slug)
export const designsInRoom = (room: RoomSlug) => getDesigns().filter((d) => d.room === room)
export const designHref = (d: Pick<Design, 'room' | 'slug'>) => `/designs/${d.room}/${d.slug}`

export function similarDesigns(d: Design, n = 4): Design[] {
  const others = getDesigns().filter((x) => x.slug !== d.slug)
  return [...others.filter((x) => x.room === d.room), ...others.filter((x) => x.room !== d.room)].slice(0, n)
}

export const getServices = () => services
export const getService = (slug: string) => services.find((s) => s.slug === slug)
