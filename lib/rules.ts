import { z } from 'zod'

export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'] as const
export const SPACES = ['Living room', 'Kitchen', 'Bedroom', 'Bathroom', 'Wardrobe', 'Home office', 'Dining area', 'Full home', 'Commercial'] as const
export const SERVICE_OPTIONS = ['Modular kitchen & wardrobe', 'Full-home interior', 'Signature', 'Renovation', 'Furniture only'] as const
export const STYLE_OPTIONS = ['Warm Modern', 'Japandi Minimal', 'Contemporary', 'Classic', 'Help me choose'] as const
export const BUDGETS = ['Under PKR 5 Lakh', 'PKR 5–10 Lakh', 'PKR 10–25 Lakh', 'PKR 25 Lakh+', 'Not sure yet'] as const
export const SPECIALTIES = ['Living rooms', 'Kitchens', 'Bedrooms', 'Wardrobes', 'Bathrooms', 'Home offices', 'Commercial', 'Custom furniture'] as const
export const TOPICS = ['Starting a new project', 'An existing project', 'Joining as a designer or vendor', 'Partnerships & press', 'Something else'] as const
export const ROLES = ['Designer', 'Vendor'] as const

export const MSG = {
  space: 'Pick the space you want to work on.',
  city: 'Choose your city.',
  service: 'Choose a service.',
  size: 'Enter a size in square feet, or leave it blank.',
  style: 'Pick a style, or "Help me choose".',
  budget: 'Pick a budget, or "Not sure yet".',
  fullName: 'Enter your full name.',
  name: 'Enter your name.',
  phoneRequired: 'Enter your phone number so we can call you.',
  phoneInvalid: 'Enter a Pakistani mobile number, e.g. 0300 1234567.',
  email: 'Enter a valid email address, or leave it blank.',
  portfolioRequired: 'Add a link to your work so we can review it.',
  portfolioInvalid: 'Enter a link like instagram.com/yourstudio, or an @handle.',
  specialties: 'Pick at least one specialty.',
  contactRequired: 'Add a phone number or email so we can reply.',
  contactInvalid: 'Enter a valid email, or a mobile number like 0300 1234567.',
  message: 'Tell us a little more (at least 10 characters).',
  topic: 'Choose a topic.',
  role: 'Choose Designer or Vendor.',
} as const

export function normalizePkMobile(input: string): string | null {
  if (/[a-z]/i.test(input)) return null
  const digits = input.replace(/\D/g, '').replace(/^00/, '')
  const m = digits.match(/^(?:92|0)?(3\d{9})$/)
  return m ? `+92${m[1]}` : null
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
export const isPortfolio = (s: string) => /^@[\w.]{2,}$/.test(s) || /^(https?:\/\/)?[^\s./]+\.[^\s]{2,}$/.test(s)

const nameField = (msg: string) =>
  z.string({ error: msg }).trim().min(2, { error: msg }).max(100, { error: 'Keep it under 100 characters.' })

const pkPhone = z.string({ error: MSG.phoneRequired }).transform((raw, ctx) => {
  const v = raw.trim()
  if (!v) { ctx.issues.push({ code: 'custom', message: MSG.phoneRequired, input: raw }); return z.NEVER }
  const n = normalizePkMobile(v)
  if (!n) { ctx.issues.push({ code: 'custom', message: MSG.phoneInvalid, input: raw }); return z.NEVER }
  return n
})

const optionalEmail = z.string().optional().transform((raw, ctx) => {
  const v = (raw ?? '').trim().toLowerCase()
  if (!v) return undefined
  if (!isEmail(v)) { ctx.issues.push({ code: 'custom', message: MSG.email, input: raw }); return z.NEVER }
  return v
})

const sizeField = z.string().optional().transform((raw, ctx) => {
  const v = (raw ?? '').trim()
  if (!v) return undefined
  const n = Number(v)
  if (!(n > 0 && n < 100_000)) { ctx.issues.push({ code: 'custom', message: MSG.size, input: raw }); return z.NEVER }
  return Math.round(n)
})

export const projectStep1 = z.object({ space: z.enum(SPACES, { error: MSG.space }) })
export const projectStep2 = z.object({
  city: z.enum(CITIES, { error: MSG.city }),
  service: z.enum(SERVICE_OPTIONS, { error: MSG.service }),
  size: sizeField,
})
export const projectStep3 = z.object({
  style: z.enum(STYLE_OPTIONS, { error: MSG.style }),
  budget: z.enum(BUDGETS, { error: MSG.budget }),
})
export const projectStep4 = z.object({
  name: nameField(MSG.fullName),
  phone: pkPhone,
  email: optionalEmail,
  whatsappUpdates: z.boolean().default(true),
})
export const projectSchema = z.object({
  ...projectStep1.shape, ...projectStep2.shape, ...projectStep3.shape, ...projectStep4.shape,
  design: z.string().max(100).regex(/^[a-z0-9-]*$/).optional(),
})

export const partnerSchema = z.object({
  role: z.enum(ROLES, { error: MSG.role }),
  name: nameField(MSG.fullName),
  business: z.string().trim().max(120).optional(),
  city: z.enum(CITIES, { error: MSG.city }),
  phone: pkPhone,
  portfolio: z.string({ error: MSG.portfolioRequired }).transform((raw, ctx) => {
    const v = raw.trim()
    if (!v) { ctx.issues.push({ code: 'custom', message: MSG.portfolioRequired, input: raw }); return z.NEVER }
    if (!isPortfolio(v)) { ctx.issues.push({ code: 'custom', message: MSG.portfolioInvalid, input: raw }); return z.NEVER }
    return v
  }),
  specialties: z.array(z.enum(SPECIALTIES)).min(1, { error: MSG.specialties }),
})

export const contactSchema = z.object({
  name: nameField(MSG.name),
  contact: z.string({ error: MSG.contactRequired }).transform((raw, ctx) => {
    const v = raw.trim()
    if (!v) { ctx.issues.push({ code: 'custom', message: MSG.contactRequired, input: raw }); return z.NEVER }
    if (isEmail(v)) return v.toLowerCase()
    const phone = normalizePkMobile(v)
    if (phone) return phone
    ctx.issues.push({ code: 'custom', message: MSG.contactInvalid, input: raw })
    return z.NEVER
  }),
  topic: z.enum(TOPICS, { error: MSG.topic }),
  message: z.string({ error: MSG.message }).trim().min(10, { error: MSG.message }).max(2000),
})

export const leadSchema = z.discriminatedUnion('type', [
  projectSchema.extend({ type: z.literal('project') }),
  partnerSchema.extend({ type: z.literal('partner') }),
  contactSchema.extend({ type: z.literal('contact') }),
])

export type ProjectInput = z.infer<typeof projectSchema>
export type PartnerInput = z.infer<typeof partnerSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type LeadInput = z.infer<typeof leadSchema>

export function errorMap(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_form')
    out[key] ??= issue.message
  }
  return out
}

export function fieldErrors(schema: z.ZodType, data: unknown): Record<string, string> {
  const r = schema.safeParse(data)
  return r.success ? {} : errorMap(r.error)
}
