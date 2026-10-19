# Fitin Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build fitin.space as a lean, statically generated Next.js 16 site from the approved canvas designs, with SEO, AdSense compliance, leads saved to Supabase and emailed via Resend.

**Architecture:** App Router with every page statically generated from JSON/MDX content files validated by Zod. The only server code is `POST /api/leads`, which validates with the same rules the browser uses, saves to Supabase over REST, then emails via Resend over REST. Server Components by default; client components only for forms, filters, calculator, mobile menu, save hearts and the 404 animation.

**Tech Stack:** Next.js 16.4 · React 19 · TypeScript (strict) · Tailwind CSS 4 · Zod 4 · @next/mdx · @next/third-parties · Supabase (Postgres + CLI) · Resend · Vitest · Playwright + @axe-core/playwright · Lighthouse

**Spec:** `docs/superpowers/specs/2026-10-17-fitin-website-design.md` — read it before starting. Visual source of truth: `design/pages/*.dc.html` (inline styles are the exact spec), `design/FITIN-DESIGN.md`, canvas https://claude.ai/artifact/XW6cjh4viAsRZL1dwUcFLP.

## Global Constraints

- Node 22; `next@16.4.x`, `react@19`, `tailwindcss@4`, `zod@4`. TypeScript `strict: true`.
- Runtime dependencies are limited to: `next`, `react`, `react-dom`, `zod`, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@next/third-parties`. Supabase and Resend are called with `fetch` (no SDKs). Adding any other runtime dependency needs the user's approval.
- Colours, type and radii come only from the `@theme` tokens in `app/globals.css` (Task 1), copied from `design/FITIN-DESIGN.md`. Lime `#B6D22A` and brand teal `#229E9F` are never used as text on white; text teal is `teal-dark #167A7C`. One lime (primary) action per view.
- Contact facts: `hello@fitin.space`, `+92 311 1555264`, `https://wa.me/923111555264`, CRM sign-in `https://crm.fitin.space`. They live only in `content/site.json`.
- Cities: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan.
- Form error copy is verbatim from §8 of the spec and `lib/rules.ts` (Task 2). Errors appear only after Continue/Submit, then clear live.
- Ads (AdSense script and slots) appear only on `/journal/[article]`.
- Content items have `status: 'draft' | 'published'`. Drafts render only when `NODE_ENV !== 'production'` or `INCLUDE_DRAFTS=1`. All seeded designs and articles start as `draft` — the 14 designs are stock photos and must not be presented as Fitin work until the user replaces or approves them.
- The launch build (`npm run build:launch`, Task 17) fails on any `[Bracketed Placeholder]` in `content/`, `app/`, `components/` or on `site.json.statsVerified !== true`. Plain `npm run build` does not run the guard (needed for local testing). **Interpretation note:** the spec says "production build fails"; this plan enforces it on the deploy build command so local production builds stay possible.
- Touch targets ≥ 44 px; every input has a `<label>`; icon-only buttons have `aria-label`; one `h1` per page.
- Commit after every task with a conventional message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Client/server clock skew** — the spam timer must use client-measured `elapsedMs` (performance.now), never a client timestamp compared with the server clock, or users with wrong phone clocks are silently dropped. Pinned in Task 9 (`elapsedMs` test) and Task 10 (hook sends `elapsedMs`).
2. **Double tap on Submit on a slow connection** — exactly one lead is sent; the button is disabled while sending. Pinned in Task 10 (`sends once on double click`).
3. **Unknown or mistyped URLs** (`/designs/kichens`, `/designs/kitchens/nope`, `/services/x`) — return the 404 page, not a 500. Pinned in Tasks 7 and 8.
4. **Non-English and hostile input** (Urdu names, `<script>` in a message, phone typed as `+92 300-123 4567`) — stored intact, phone normalised to `+923001234567`, HTML escaped in the email. Pinned in Tasks 2 and 9.
5. **Going Back in the Start form** — earlier answers are kept; prefilled query params (`/start?space=Kitchen&city=Lahore`) are respected. Pinned in Task 10.

---

## File Map

```
app/
  globals.css                     tokens (@theme), base styles, `wrap` utility
  layout.tsx                      <html>, font, root metadata, analytics + consent
  not-found.tsx                   404 (own minimal header)
  icon.svg · apple-icon.tsx · opengraph-image.tsx
  sitemap.ts · robots.ts · ads.txt/route.ts
  api/leads/route.ts              the only server endpoint
  start/page.tsx                  focused layout (no site header/footer)
  (site)/layout.tsx               Header + Footer + Organization JSON-LD
  (site)/page.tsx                 Home
  (site)/designs/page.tsx · [room]/page.tsx · [room]/[design]/page.tsx (+ opengraph-image.tsx)
  (site)/services/page.tsx · [service]/page.tsx
  (site)/kitchen-cost-calculator/page.tsx
  (site)/journal/page.tsx · [article]/page.tsx (+ opengraph-image.tsx)
  (site)/for-designers/page.tsx · about/page.tsx · contact/page.tsx · privacy/page.tsx · terms/page.tsx
components/
  icons.tsx  ui.tsx  header.tsx  nav-link.tsx  mobile-menu.tsx  footer.tsx
  stage-bars.tsx  design-card.tsx  save-heart.tsx  explore-grid.tsx  empty-state.tsx
  calculator.tsx  json-ld.tsx  ad-slot.tsx  article-card.tsx  room-tabs.tsx  design-customiser.tsx  faq.tsx
  legal-tabs.tsx  legal-doc.tsx  not-found-bars.tsx
  form/field.tsx  form/chips.tsx  form/honeypot.tsx  form/whatsapp-fallback.tsx
  forms/start-form.tsx  forms/partner-form.tsx  forms/contact-form.tsx
content/  site.json  services.json  designs/*.json  journal/*.mdx
lib/      rules.ts  calculator.ts  content.ts  journal.ts  seo.ts  jsonld.ts  og.tsx
          leads.ts  rate-limit.ts  use-lead-submit.ts  whatsapp.ts
mdx-components.tsx  next.config.ts  vitest.config.ts  playwright.config.ts
scripts/  launch-check.mjs  lighthouse.mjs
supabase/ config.toml  migrations/20261017000000_create_leads.sql
tests/    *.test.ts (Vitest)         e2e/  *.spec.ts (Playwright)
public/images/  photos + logo copied from design/assets
DEPLOY.md  .env.example
```

---

### Task 1: Scaffold Next.js, design tokens and test tooling

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css`, `app/(site)/page.tsx` (temporary), `vitest.config.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `tests/smoke.test.ts`, `public/images/*`
- Modify: `.gitignore`

**Interfaces:**
- Produces: Tailwind token classes used by every later task — colours `navy navy-2 teal teal-dark lime ink ink-2 muted hairline line surface navy-soft teal-soft lime-soft sky lime-pale on-navy error`; radii `rounded-btn rounded-card rounded-panel rounded-feature`; `shadow-float`; utility `wrap` (centred 1360 px container with 20/40 px gutters). Font CSS variable `--font-figtree`. npm scripts `dev build start lint test e2e`. Images at `/images/<name>.jpg`.

- [x] **Step 1: Scaffold into a temp folder (the repo root is not empty) and move it in**

```bash
cd "/home/humza/Desktop/Fitin website"
npx create-next-app@16.4.2 scaffold-tmp --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
rsync -a --exclude .git --exclude .gitignore --exclude README.md scaffold-tmp/ ./
cat scaffold-tmp/.gitignore >> .gitignore
rm -rf scaffold-tmp app/page.tsx public/*.svg
sort -u .gitignore -o .gitignore
```

Expected: `package.json`, `app/`, `node_modules/` now at the repo root; `design/` and `docs/` untouched.

- [x] **Step 2: Install dev tooling and copy images**

```bash
npm i zod@4
npm i -D vitest @playwright/test @axe-core/playwright @fontsource/figtree
npx playwright install chromium
mkdir -p public/images && cp design/assets/*.jpg public/images/ && cp design/assets/fitin-logo.png public/images/fitin-logo.png
```

- [x] **Step 3: Replace `app/globals.css` with the design tokens**

```css
@import "tailwindcss";

@theme {
  --color-navy: #0E2340;
  --color-navy-2: #1D2F4F;
  --color-teal: #229E9F;
  --color-teal-dark: #167A7C;
  --color-lime: #B6D22A;
  --color-ink: #1F2733;
  --color-ink-2: #4A5462;
  --color-muted: #5B6573;
  --color-hairline: #E4E7EB;
  --color-line: #D5DAE0;
  --color-surface: #F6F7F8;
  --color-navy-soft: #E8ECF2;
  --color-teal-soft: #DDF0F0;
  --color-lime-soft: #F2F7E3;
  --color-sky: #9ED6D6;
  --color-lime-pale: #E3F1B4;
  --color-on-navy: #C9D2DE;
  --color-error: #B42318;

  --font-sans: var(--font-figtree), -apple-system, system-ui, sans-serif;

  --radius-btn: 12px;
  --radius-card: 20px;
  --radius-panel: 24px;
  --radius-feature: 32px;

  --shadow-float: 0 0 0 1px rgb(14 35 64 / 0.04), 0 4px 10px rgb(14 35 64 / 0.08), 0 10px 24px rgb(14 35 64 / 0.14);
}

@utility wrap {
  margin-inline: auto;
  width: 100%;
  max-width: 1360px;
  padding-inline: 1.25rem;
  @media (width >= 48rem) {
    padding-inline: 2.5rem;
  }
}

@layer base {
  html { color: var(--color-ink); background: #fff; }
  body { font-family: var(--font-sans); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  a { color: var(--color-navy); }
  a:hover { color: var(--color-teal-dark); }
  :focus-visible { outline: 2px solid var(--color-navy); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
}
```

- [x] **Step 4: Write `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fitin.space'),
  title: { default: 'Fitin — Design, build and fit, all in one place', template: '%s | Fitin' },
  description:
    'Connect with verified interior designers, discover custom furniture and manage your entire home project from one platform. Serving Karachi, Lahore, Islamabad and more.',
}

export const viewport: Viewport = { themeColor: '#0E2340' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [x] **Step 5: Temporary home page `app/(site)/page.tsx`** (replaced in Task 6)

```tsx
export default function Home() {
  return (
    <main className="wrap py-20">
      <h1 className="text-5xl font-bold tracking-tight text-navy">Design, build and fit — all in one place.</h1>
    </main>
  )
}
```

- [x] **Step 6: Configure Next, Vitest and Playwright**

`next.config.ts`:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
}

export default nextConfig
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
})
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3100' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npx next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { INCLUDE_DRAFTS: '1' },
  },
})
```

Add scripts to `package.json` (keep the scaffolded ones):
```json
"test": "vitest run",
"e2e": "playwright test",
"check": "npm run lint && npm run test && npm audit --omit=dev --audit-level=high"
```

- [x] **Step 7: Write the smoke tests**

`tests/smoke.test.ts`:
```ts
import { expect, test } from 'vitest'

test('vitest runs with the @ alias', async () => {
  const mod = await import('@/next.config')
  expect(mod.default.poweredByHeader).toBe(false)
})
```

`e2e/smoke.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

test('home renders the hero heading in Figtree', async ({ page }) => {
  await page.goto('/')
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toContainText('Design, build and fit')
  const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily)
  expect(font.toLowerCase()).toContain('figtree')
  const color = await h1.evaluate((el) => getComputedStyle(el).color)
  expect(color).toBe('rgb(14, 35, 64)')
})
```

- [x] **Step 8: Run both suites**

Run: `npm test && npm run e2e`
Expected: Vitest 1 passed; Playwright 2 passed (desktop + phone).

- [x] **Step 9: Index the codebase and get tool recommendations**

- Invoke the `graphify` skill on the repo root, excluding `node_modules`, `.next`, `design/`. Keep `graphify-out/` (git-ignored) for later queries.
- Invoke `claude-code-setup:claude-automation-recommender`. Show the user its recommendations; install only the ones they approve. Do not change project code in this step.

- [x] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 with Fitin tokens, Vitest and Playwright

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared form rules

**Files:**
- Create: `lib/rules.ts`, `tests/rules.test.ts`

**Interfaces:**
- Produces (used by Tasks 9–12):
  - Option lists: `CITIES, SPACES, SERVICE_OPTIONS, STYLE_OPTIONS, BUDGETS, SPECIALTIES, TOPICS, ROLES` (readonly string tuples).
  - `MSG` (error copy record).
  - `normalizePkMobile(input: string): string | null` → `'+923XXXXXXXXX'`.
  - `isEmail(s: string): boolean`, `isPortfolio(s: string): boolean`.
  - Step schemas: `projectStep1, projectStep2, projectStep3, projectStep4`; full schemas `projectSchema, partnerSchema, contactSchema`; API schema `leadSchema` (discriminated on `type`); types `ProjectInput, PartnerInput, ContactInput, LeadInput`.
  - `errorMap(error: z.ZodError): Record<string, string>` (first message per field), `fieldErrors(schema: z.ZodType, data: unknown): Record<string, string>`.

- [x] **Step 1: Write the failing tests** — `tests/rules.test.ts`

```ts
import { describe, expect, test } from 'vitest'
import {
  MSG, contactSchema, fieldErrors, isPortfolio, leadSchema, normalizePkMobile,
  partnerSchema, projectStep1, projectStep2, projectStep3, projectStep4,
} from '@/lib/rules'

describe('normalizePkMobile', () => {
  test.each([
    ['0300 1234567', '+923001234567'],
    ['+92 300 1234567', '+923001234567'],
    ['0092-311-1555264', '+923111555264'],
    ['3001234567', '+923001234567'],
    ['+92 300-123 4567', '+923001234567'],
  ])('accepts %s', (input, out) => expect(normalizePkMobile(input)).toBe(out))

  test.each(['03001234', '042 35761234', '+1 415 555 0100', '', '0300 abc 1234567'])('rejects %s', (input) =>
    expect(normalizePkMobile(input)).toBeNull())
})

describe('isPortfolio', () => {
  test.each(['instagram.com/yourstudio', 'https://behance.net/sara', '@sara.designs', 'www.studio.pk'])('accepts %s', (s) =>
    expect(isPortfolio(s)).toBe(true))
  test.each(['my portfolio', 'hello', '@a', 'http://'])('rejects %s', (s) => expect(isPortfolio(s)).toBe(false))
})

describe('project steps', () => {
  test('step 1 requires a space', () => {
    expect(fieldErrors(projectStep1, {})).toEqual({ space: MSG.space })
    expect(fieldErrors(projectStep1, { space: 'Kitchen' })).toEqual({})
  })
  test('step 2 requires city and service; size optional but sane', () => {
    expect(fieldErrors(projectStep2, { size: '' })).toEqual({ city: MSG.city, service: MSG.service })
    expect(fieldErrors(projectStep2, { city: 'Lahore', service: 'Renovation', size: '-4' })).toEqual({ size: MSG.size })
    expect(fieldErrors(projectStep2, { city: 'Lahore', service: 'Renovation', size: '' })).toEqual({})
  })
  test('step 3 requires style and budget', () => {
    expect(fieldErrors(projectStep3, {})).toEqual({ style: MSG.style, budget: MSG.budget })
  })
  test('step 4 requires name and a PK mobile, email optional', () => {
    expect(fieldErrors(projectStep4, { name: ' ', phone: '', email: '', whatsappUpdates: true })).toEqual({
      name: MSG.fullName, phone: MSG.phoneRequired,
    })
    expect(fieldErrors(projectStep4, { name: 'Ayesha Khan', phone: '0300 12', email: '', whatsappUpdates: true })).toEqual({
      phone: MSG.phoneInvalid,
    })
    expect(fieldErrors(projectStep4, { name: 'Ayesha', phone: '03001234567', email: 'nope', whatsappUpdates: false })).toEqual({
      email: MSG.email,
    })
  })
  test('accepts an Urdu name unchanged', () => {
    const r = projectStep4.safeParse({ name: 'عائشہ خان', phone: '0300 1234567', email: '', whatsappUpdates: true })
    expect(r.success && r.data.name).toBe('عائشہ خان')
  })
})

describe('partner and contact', () => {
  test('partner needs at least one specialty and a portfolio', () => {
    const e = fieldErrors(partnerSchema, { role: 'Designer', name: 'Sara', business: '', city: 'Lahore', phone: '03001234567', portfolio: '', specialties: [] })
    expect(e).toEqual({ portfolio: MSG.portfolioRequired, specialties: MSG.specialties })
  })
  test('contact accepts an email or a phone, normalised', () => {
    const base = { name: 'Ali', topic: 'Something else', message: 'Hello there, a question.' }
    const a = contactSchema.parse({ ...base, contact: 'Ali@Example.com ' })
    expect(a.contact).toBe('ali@example.com')
    const b = contactSchema.parse({ ...base, contact: '0300 1234567' })
    expect(b.contact).toBe('+923001234567')
    expect(fieldErrors(contactSchema, { ...base, contact: 'ali at home' })).toEqual({ contact: MSG.contactInvalid })
    expect(fieldErrors(contactSchema, { ...base, contact: 'a@b.co', message: 'short' })).toEqual({ message: MSG.message })
  })
})

test('leadSchema discriminates on type and strips unknown keys', () => {
  const r = leadSchema.parse({
    type: 'contact', name: 'Ali', contact: 'ali@example.com', topic: 'Something else',
    message: 'Hello there, a question.', admin: true,
  })
  expect(r.type).toBe('contact')
  expect('admin' in r).toBe(false)
})
```

- [x] **Step 2: Run to verify failure**

Run: `npx vitest run tests/rules.test.ts`
Expected: FAIL — `Cannot find module '@/lib/rules'`.

- [x] **Step 3: Implement `lib/rules.ts`**

```ts
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
```

- [x] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/rules.test.ts`
Expected: PASS (all). If a `z.enum` message test fails because Zod reports `invalid_type` for `undefined` with a default message, keep `{ error: MSG.x }` and pass `''` instead of omitting the key in that test — then re-run; the UI always sends every key.

- [x] **Step 5: Commit**

```bash
git add lib/rules.ts tests/rules.test.ts
git commit -m "feat: shared form validation rules for browser and server

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Kitchen cost calculator maths

**Files:**
- Create: `lib/calculator.ts`, `tests/calculator.test.ts`

**Interfaces:**
- Produces: `RFT_MIN = 6`, `RFT_MAX = 30`, `RFT_DEFAULT = 12`, `kitchenEstimate(rft: number): { rft: number; low: string; high: string }` (Lakh, 2 decimals, rft clamped and rounded).

- [x] **Step 1: Write the failing test** — `tests/calculator.test.ts`

```ts
import { expect, test } from 'vitest'
import { kitchenEstimate } from '@/lib/calculator'

test.each([
  [12, '7.55', '9.19'],
  [6, '3.77', '4.59'],
  [24, '15.10', '18.38'],
  [30, '18.88', '22.97'],
])('%i rft → PKR %s–%s Lakh', (rft, low, high) => {
  expect(kitchenEstimate(rft)).toEqual({ rft, low, high })
})

test('clamps and rounds out-of-range input', () => {
  expect(kitchenEstimate(100).rft).toBe(30)
  expect(kitchenEstimate(1).rft).toBe(6)
  expect(kitchenEstimate(12.4).rft).toBe(12)
  expect(kitchenEstimate(Number.NaN).rft).toBe(12)
})
```

- [x] **Step 2: Run to verify failure**

Run: `npx vitest run tests/calculator.test.ts` — Expected: FAIL (module not found).

- [x] **Step 3: Implement `lib/calculator.ts`**

```ts
// Comfort tier, from fitin.space: a 12 rft kitchen = PKR 7.55–9.19 Lakh. Scaled linearly per running foot.
const RATE_LOW = 7.55 / 12
const RATE_HIGH = 9.19 / 12

export const RFT_MIN = 6
export const RFT_MAX = 30
export const RFT_DEFAULT = 12

export function kitchenEstimate(input: number) {
  const rft = Number.isFinite(input) ? Math.min(RFT_MAX, Math.max(RFT_MIN, Math.round(input))) : RFT_DEFAULT
  return { rft, low: (rft * RATE_LOW).toFixed(2), high: (rft * RATE_HIGH).toFixed(2) }
}
```

- [x] **Step 4: Run tests** — `npx vitest run tests/calculator.test.ts` — Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add lib/calculator.ts tests/calculator.test.ts
git commit -m "feat: kitchen cost estimate from Fitin Comfort-tier rate

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Content system — site, services, designs

**Files:**
- Create: `lib/content.ts`, `content/site.json`, `content/services.json`, `content/designs/*.json` (14 files), `tests/content.test.ts`

**Interfaces:**
- Consumes: `CITIES`, `SERVICE_OPTIONS` from `lib/rules.ts`.
- Produces:
  - `ROOMS: readonly { slug: RoomSlug; label: string; single: string; space: Space }[]` and `type RoomSlug`.
  - `DESIGN_STYLES` tuple; `type Design`, `type Service`, `type Site`.
  - `site: Site` (parsed `content/site.json`).
  - `getDesigns(): Design[]` (respects drafts), `getDesign(room: string, slug: string): Design | undefined`, `getRoom(slug: string)`, `designsInRoom(room: RoomSlug): Design[]`, `similarDesigns(d: Design, n = 4): Design[]`.
  - `getServices(): Service[]`, `getService(slug: string): Service | undefined`.
  - `showDrafts(): boolean`.
  - `designHref(d: Design): string` → `/designs/<room>/<slug>`.

- [x] **Step 1: Write the failing test** — `tests/content.test.ts`

```ts
import { existsSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ROOMS, designHref, getDesign, getDesigns, getService, getServices, site, similarDesigns } from '@/lib/content'

afterEach(() => vi.unstubAllEnvs())

describe('designs', () => {
  test('all 14 seeded designs load in development', () => {
    expect(getDesigns()).toHaveLength(14)
  })
  test('every image exists in public/', () => {
    for (const d of getDesigns()) expect(existsSync(path.join('public', d.image)), d.image).toBe(true)
  })
  test('slugs are unique and match their file names', () => {
    const slugs = getDesigns().map((d) => d.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  test('drafts are hidden in production unless INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(getDesigns()).toHaveLength(0)
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(getDesigns()).toHaveLength(14)
  })
  test('lookup by room + slug and href', () => {
    const d = getDesign('living-rooms', 'teal-accent-lounge')
    expect(d?.title).toBe('Teal accent lounge')
    expect(designHref(d!)).toBe('/designs/living-rooms/teal-accent-lounge')
    expect(getDesign('kitchens', 'teal-accent-lounge')).toBeUndefined()
  })
  test('similar designs exclude the design itself', () => {
    const d = getDesign('living-rooms', 'teal-accent-lounge')!
    const s = similarDesigns(d)
    expect(s).toHaveLength(4)
    expect(s.some((x) => x.slug === d.slug)).toBe(false)
  })
})

test('8 rooms, 4 services, valid site data', () => {
  expect(ROOMS.map((r) => r.slug)).toEqual([
    'living-rooms', 'bedrooms', 'kitchens', 'wardrobes', 'bathrooms', 'home-offices', 'dining-areas', 'commercial',
  ])
  expect(getServices().map((s) => s.slug)).toEqual(['modular-kitchens-wardrobes', 'full-home-interiors', 'signature', 'renovation'])
  expect(getService('signature')?.name).toBe('Signature')
  expect(site.email).toBe('hello@fitin.space')
  expect(site.cities).toHaveLength(6)
})
```

- [x] **Step 2: Run to verify failure** — `npx vitest run tests/content.test.ts` — Expected: FAIL (module not found).

- [x] **Step 3: Write `content/site.json`**

```json
{
  "name": "Fitin",
  "legalName": "Fitin Pakistan",
  "tagline": "Connecting spaces. Building possibilities.",
  "description": "Connect with interior designers, discover custom furniture, and manage your entire project from one platform.",
  "email": "hello@fitin.space",
  "phone": "+923111555264",
  "phoneDisplay": "+92 311 1555264",
  "whatsapp": "923111555264",
  "crmUrl": "https://crm.fitin.space",
  "cities": ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"],
  "stats": { "designs": "500+", "designers": "50+", "vendors": "25+" },
  "roomCounts": {
    "living-rooms": "180+", "bedrooms": "150+", "kitchens": "120+", "wardrobes": "90+",
    "bathrooms": "75+", "home-offices": "60+", "dining-areas": "55+", "commercial": "40+"
  },
  "claims": { "installDays": 14, "quoteHours": 24 },
  "statsVerified": false,
  "address": "",
  "adsenseId": "",
  "adSlot": "",
  "gaId": ""
}
```

- [x] **Step 4: Write `content/services.json`** (copy from `design/pages/Services.dc.html`)

```json
[
  {
    "slug": "modular-kitchens-wardrobes",
    "name": "Modular kitchens & wardrobes",
    "startService": "Modular kitchen & wardrobe",
    "short": "Modular",
    "bar": "navy",
    "summary": "Made-to-measure kitchens and storage, planned around how you cook, store and live.",
    "intro": "A modular kitchen or wardrobe is built in your space's exact measurements, with the cabinets, counters and hardware you choose. Fitin matches you with a verified designer, who plans the layout, and a trusted vendor, who builds and installs it.",
    "includes": ["Layout planning and on-site measurements", "Cabinets, counters and hardware", "Built-in and walk-in wardrobes", "Installation by verified vendors"],
    "image": "/images/kitchen-modular-cream.jpg",
    "imageAlt": "Modular kitchen with cream cabinets and timber accents",
    "calculator": true
  },
  {
    "slug": "full-home-interiors",
    "name": "Full-home interiors",
    "startService": "Full-home interior",
    "short": "Full home",
    "bar": "teal",
    "summary": "Every room planned together by one designer, so your home feels like one idea.",
    "intro": "For a new home or a complete refresh, one designer plans every room together — layouts, materials, furniture and lighting — so the whole home is consistent. You get one plan, one schedule and one point of contact.",
    "includes": ["Whole-home plan and material board", "Furniture, lighting and soft furnishings", "Kitchens, wardrobes and storage", "One point of contact from start to finish"],
    "image": "/images/dining-classic.jpg",
    "imageAlt": "Light dining room with grey upholstered chairs",
    "calculator": false
  },
  {
    "slug": "signature",
    "name": "Signature",
    "startService": "Signature",
    "short": "Signature",
    "bar": "lime",
    "summary": "Our most bespoke tier, for homes where every surface is a decision.",
    "intro": "Signature is Fitin's most bespoke tier: premium materials, fully custom furniture and 3D walkthroughs before anything is built.",
    "includes": ["Premium materials and finishes", "Fully custom furniture pieces", "3D walkthroughs before anything is built"],
    "image": "/images/bathroom-tub-window.jpg",
    "imageAlt": "Bathroom with a freestanding tub and a window view",
    "calculator": false
  },
  {
    "slug": "renovation",
    "name": "Renovation",
    "startService": "Renovation",
    "short": "Renovation",
    "bar": "navy",
    "summary": "Give an older home a new layout and new finishes, coordinated by one team.",
    "intro": "Renovation covers layout changes, built-ins, flooring, ceilings and finishes. Fitin coordinates trusted vendors and keeps every step tracked in one place.",
    "includes": ["Layout changes and built-ins", "Flooring, ceilings and finishes", "Trusted vendors, tracked on one platform"],
    "image": "/images/hallway-built-in-storage.jpg",
    "imageAlt": "Freshly renovated hallway with built-in storage",
    "calculator": false
  }
]
```

- [x] **Step 5: Write the 14 design files** in `content/designs/`. All `"status": "draft"` (stock photos — see Global Constraints). File name = `<slug>.json`.

`teal-accent-lounge.json`:
```json
{
  "slug": "teal-accent-lounge",
  "status": "draft",
  "title": "Teal accent lounge",
  "room": "living-rooms",
  "style": "Warm Modern",
  "city": "Lahore",
  "image": "/images/living-navy-sofa-teal-cushions.jpg",
  "imageAlt": "Navy sofa with teal textured cushions",
  "badge": "Most saved",
  "featured": true,
  "summary": "A calm, deep-navy lounge lifted by teal textures and warm oak.",
  "about": "A calm, deep-navy lounge lifted by teal textures and warm oak. Low, generous seating faces a slim media wall, with layered lighting so the room works for a family evening and for guests.",
  "included": ["Three-seater sofa", "Accent armchair", "Coffee table", "Media wall unit", "Rug & cushions", "Lighting plan"],
  "finishes": {
    "upholstery": [
      { "name": "Navy velvet", "hex": "#1D2F4F" },
      { "name": "Teal linen", "hex": "#2B9C9B" },
      { "name": "Oat bouclé", "hex": "#E4DCCB" },
      { "name": "Charcoal weave", "hex": "#3D4148" }
    ],
    "wood": [
      { "name": "Natural oak", "hex": "#C8A27A" },
      { "name": "Walnut", "hex": "#6B4A33" },
      { "name": "White wash", "hex": "#ECE6DA" }
    ]
  }
}
```

The other 13 follow the same schema (`finishes` omitted, `featured: false`, no `badge` unless listed). Values:

| file / slug | title | room | style | city | image (`/images/…`) | imageAlt | badge | summary | about | included |
|---|---|---|---|---|---|---|---|---|---|---|
| navy-white-suite | Navy & white suite | bedrooms | Contemporary | Karachi | bedroom-navy-city-view.jpg | Bright bedroom with navy bedding and a city view | — | Crisp white walls, navy bedding and full-height glass for a calm city bedroom. | A bright bedroom built around a full-height window: crisp white walls, navy bedding and warm bedside lamps keep it calm by day and cosy at night. | King bed and headboard; Bedside tables; Reading lamps; Blackout curtains; Rug |
| open-white-kitchen | Open white kitchen | kitchens | Contemporary | Lahore | kitchen-open-white.jpg | Open white kitchen with an island and dining nook | Fitin pick | An open white kitchen with a long counter run and a bright breakfast corner. | A long run of handle-free white cabinets with a warm wood counter, opening onto a breakfast corner so cooking and family time share one space. | Base and wall cabinets; Counter tops; Breakfast table; Pendant lighting |
| garden-green-kitchen | Garden-green kitchen | kitchens | Warm Modern | Islamabad | kitchen-green-glasshouse.jpg | Green kitchen in a glass house filled with plants | — | Sage-green cabinetry and open shelving in a light-filled garden setting. | Sage-green cabinetry, open shelving and a copper-toned work area bring the garden indoors in this light-filled kitchen. | Green cabinetry; Open shelving; Work island; Plant shelving |
| warm-timber-bedroom | Warm timber bedroom | bedrooms | Japandi Minimal | Islamabad | bedroom-warm-timber.jpg | Bedroom with a warm timber wall and recessed lighting | — | A low bed, a full timber wall and soft hidden lighting. | A Japandi bedroom with a full timber feature wall, a low bed and hidden lighting that washes the wood at night. | Low platform bed; Timber feature wall; Recessed lighting; Bedside shelves |
| sunlit-study-nook | Sunlit study nook | home-offices | Japandi Minimal | Karachi | office-sunlit-desk.jpg | Bright home office with a white desk by a window | — | A bright white desk by the window, made for focused work at home. | A compact home office by a big window: a clean white desk, a task lamp and just enough storage to keep the surface clear. | Desk; Task chair; Desk lamp; Wall storage |
| spa-bath-with-a-view | Spa bath with a view | bathrooms | Contemporary | Karachi | bathroom-tub-window.jpg | Bathroom with a freestanding tub beside a window | Fitin pick | A freestanding tub, stone tones and a window view. | A spa-style bathroom with a freestanding tub set beside a tall window, stone-toned surfaces and a vanity with generous storage. | Freestanding tub; Vanity unit; Mirror and lighting; Tiling |
| cream-modular-kitchen | Cream modular kitchen | kitchens | Warm Modern | Faisalabad | kitchen-modular-cream.jpg | Modular kitchen with cream cabinets and timber accents | — | Cream cabinets, timber accents and every appliance built in. | A U-shaped modular kitchen in cream with timber accents, built-in oven and hob, and storage planned for every pot and pan. | Modular cabinets; Built-in appliances housing; Counter tops; Under-cabinet lighting |
| built-in-wardrobe-wall | Built-in wardrobe wall | wardrobes | Japandi Minimal | Lahore | wardrobe-built-in.jpg | Built-in wardrobe with open hanging and drawers | — | Floor-to-ceiling storage with hanging, drawers and shoe shelves. | A floor-to-ceiling built-in wardrobe that mixes long hanging, drawers and shoe shelves behind light-toned doors. | Wardrobe carcass; Hanging rails; Drawers; Shoe shelves |
| classic-family-dining | Classic family dining | dining-areas | Classic | Multan | dining-classic.jpg | Light dining room with grey upholstered chairs | — | A long table, upholstered chairs and a statement chandelier. | A classic dining room for big family meals: a long table, grey upholstered chairs, a sideboard and a statement chandelier. | Dining table; Upholstered chairs; Sideboard; Chandelier |
| pendant-lit-bedroom | Pendant-lit bedroom | bedrooms | Warm Modern | Rawalpindi | bedroom-pendant-light.jpg | Warm bedroom with a sculptural pendant light | — | Warm wood, soft linen and a sculptural pendant overhead. | A warm modern bedroom with a sculptural pendant, timber flooring and soft linen layers, with a reading corner by the window. | Bed and headboard; Pendant light; Reading chair; Side tables |
| marble-double-vanity | Marble double vanity | bathrooms | Classic | Lahore | bathroom-double-vanity.jpg | Bathroom with a marble double vanity and wide mirror | — | A wide marble double vanity with a full-width mirror. | A classic bathroom with a marble-topped double vanity, a full-width mirror and white cabinetry for everyday storage. | Double vanity; Marble top; Wide mirror; Cabinet storage |
| patterned-tile-galley | Patterned-tile galley | kitchens | Contemporary | Karachi | kitchen-patterned-tile.jpg | Galley kitchen with a patterned tile splashback | — | A compact galley lifted by a bold patterned splashback. | A compact galley kitchen that makes the most of a narrow space, lifted by a bold patterned tile splashback and dark counters. | Galley cabinets; Patterned splashback; Counter tops; Built-in oven |
| entry-storage-wall | Entry & storage wall | wardrobes | Contemporary | Islamabad | hallway-built-in-storage.jpg | Hallway with built-in storage and a bench | — | A hallway storage wall with a bench, hooks and a mirror. | A hallway turned into useful storage: a built-in bench, coat hooks, a mirror and a walk-in closet beyond. | Built-in bench; Coat hooks; Mirror; Closet shelving |

`included` cells are `;`-separated lists → JSON string arrays. Example row as JSON (`navy-white-suite.json`):
```json
{
  "slug": "navy-white-suite", "status": "draft", "title": "Navy & white suite", "room": "bedrooms",
  "style": "Contemporary", "city": "Karachi", "image": "/images/bedroom-navy-city-view.jpg",
  "imageAlt": "Bright bedroom with navy bedding and a city view", "featured": false,
  "summary": "Crisp white walls, navy bedding and full-height glass for a calm city bedroom.",
  "about": "A bright bedroom built around a full-height window: crisp white walls, navy bedding and warm bedside lamps keep it calm by day and cosy at night.",
  "included": ["King bed and headboard", "Bedside tables", "Reading lamps", "Blackout curtains", "Rug"]
}
```

- [x] **Step 6: Implement `lib/content.ts`**

```ts
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
```

Note: `resolveJsonModule` is on in the scaffolded `tsconfig.json`; if `import siteJson from '@/content/site.json'` errors, set `"resolveJsonModule": true`.

- [x] **Step 7: Run tests** — `npx vitest run tests/content.test.ts` — Expected: PASS.

- [x] **Step 8: Commit**

```bash
git add lib/content.ts content tests/content.test.ts
git commit -m "feat: validated content for site, services and draft designs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Site chrome — icons, UI primitives, header, mobile menu, footer, page metadata helper

**Files:**
- Create: `components/icons.tsx`, `components/ui.tsx`, `components/header.tsx`, `components/nav-link.tsx`, `components/mobile-menu.tsx`, `components/footer.tsx`, `app/(site)/layout.tsx`, `lib/seo.ts`, `e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `site`, `getServices` from `lib/content.ts`.
- Produces:
  - Icons (all accept `{ className?: string }`): `DesignIcon, BuildIcon, JournalIcon, ArrowRightIcon, CheckIcon, AlertIcon, WhatsAppIcon, HeartIcon ({ filled?: boolean }), MenuIcon, CloseIcon, SearchIcon, PhoneIcon, MailIcon, ChevronRightIcon, PlayIcon`.
  - `buttonClass(variant: 'primary' | 'dark' | 'outline', extra?: string): string`; `Eyebrow`, `SectionHead({ eyebrow?, title, intro?, as? })`, `Bar({ color: 'navy'|'teal'|'lime', className? })`, `Highlight({ tone: 'navy'|'teal'|'lime', children })`, `CheckList({ items: string[] })`.
  - `Logo({ size? })`, `Header()`, `Footer()`, `NAV` array.
  - `pageMetadata({ title, description, path, noindex? }): Metadata` and `SITE_URL`.

- [x] **Step 1: Write the failing e2e test** — `e2e/chrome.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('footer links every page AdSense reviewers look for', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  for (const [name, href] of [['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']]) {
    await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(footer).toContainText('hello@fitin.space')
})

test('desktop header has primary nav, sign in and start project', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only')
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: /Explore/ })).toHaveAttribute('href', '/designs')
  await expect(nav.getByRole('link', { name: /Services/ })).toHaveAttribute('href', '/services')
  await expect(nav.getByRole('link', { name: /Journal/ })).toHaveAttribute('href', '/journal')
  await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', 'https://crm.fitin.space')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Start project' })).toHaveAttribute('href', '/start')
})

test('phone menu opens as a dialog and closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: /Explore designs/ })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Start your project' })).toHaveAttribute('href', '/start')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/chrome.spec.ts` — Expected: FAIL (no footer / navigation).

- [x] **Step 3: Write `components/icons.tsx`** (paths copied from the canvas designs)

```tsx
type P = { className?: string }
const line = { 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const DesignIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <rect x="5" y="5" width="22" height="22" rx="3" /><path d="M5 14h9v13" /><path d="M19 5v6h8" />
    <circle cx="21" cy="20" r="2.5" fill="#B6D22A" stroke="none" />
  </svg>
)
export const BuildIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <path d="M4 27h24" /><rect x="7" y="18" width="8" height="9" rx="1" /><rect x="17" y="18" width="8" height="9" rx="1" />
    <rect x="12" y="9" width="8" height="9" rx="1" fill="#229E9F" stroke="#229E9F" />
  </svg>
)
export const JournalIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <path d="M6 6h9a3 3 0 0 1 3 3v17a2 2 0 0 0-2-2H6z" /><path d="M26 6h-5a3 3 0 0 0-3 3v17a2 2 0 0 1 2-2h6z" />
    <path d="M9 11h5M9 15h5" stroke="#B6D22A" />
  </svg>
)
export const ArrowRightIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const CheckIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><path d="M5 12l5 5L20 7" /></svg>
)
export const AlertIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.2} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5h.01" /></svg>
)
export const WhatsAppIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12z" /></svg>
)
export const HeartIcon = ({ className, filled }: P & { filled?: boolean }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={className} fill={filled ? '#229E9F' : 'rgba(14,35,64,0.45)'} stroke="#fff" strokeWidth={2} strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.7 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.2 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
)
export const MenuIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const CloseIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.2} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const SearchIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
)
export const PhoneIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
)
export const MailIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
)
export const ChevronRightIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M9 6l6 6-6 6" /></svg>
)
export const PlayIcon = ({ className }: P) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z" /></svg>
)
```

- [x] **Step 4: Write `components/ui.tsx`**

```tsx
import type { ReactNode } from 'react'
import { CheckIcon } from './icons'

const BUTTON = {
  primary: 'inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-6 font-bold text-navy hover:text-navy hover:brightness-95',
  dark: 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-btn bg-navy px-7 font-semibold text-white hover:bg-navy-2 hover:text-white',
  outline: 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-btn border border-navy bg-white px-6 font-semibold text-navy hover:bg-navy-soft',
} as const

export const buttonClass = (variant: keyof typeof BUTTON = 'dark', extra = '') => `${BUTTON[variant]} ${extra}`.trim()

export const Eyebrow = ({ children, onNavy = false }: { children: ReactNode; onNavy?: boolean }) => (
  <span className={`text-[13px] font-bold uppercase tracking-[1.2px] ${onNavy ? 'text-sky' : 'text-teal-dark'}`}>{children}</span>
)

export function SectionHead({ eyebrow, title, intro, as: H = 'h2' }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div className="flex max-w-[680px] flex-col gap-3">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <H className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">{title}</H>
      {intro && <p className="text-[17px] text-ink-2">{intro}</p>}
    </div>
  )
}

export const BAR_FILL = { navy: '#0E2340', teal: '#229E9F', lime: '#B6D22A' } as const
export const Bar = ({ color, className = 'h-6 w-14' }: { color: keyof typeof BAR_FILL; className?: string }) => (
  <svg aria-hidden viewBox="0 0 64 28" className={className}><path d="M0 14L64 0v14L0 28z" fill={BAR_FILL[color]} /></svg>
)

const UNDERLINE = { navy: '#C9D6E8', teal: '#9ED6D6', lime: '#B6D22A' } as const
export const Highlight = ({ tone, children }: { tone: keyof typeof UNDERLINE; children: ReactNode }) => (
  <span style={{ boxShadow: `inset 0 -${tone === 'lime' ? '0.22em' : '0.16em'} 0 ${UNDERLINE[tone]}` }}>{children}</span>
)

export const CheckList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-2.5">
    {items.map((item) => (
      <li key={item} className="flex gap-3"><CheckIcon className="mt-0.5 size-5 shrink-0 text-teal-dark" />{item}</li>
    ))}
  </ul>
)
```

- [x] **Step 5: Write `components/nav-link.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const path = usePathname()
  const active = path === href || path.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 border-b-2 px-0.5 pb-3 pt-2.5 text-[15px] font-semibold ${
        active ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-navy'
      }`}
    >
      {children}
    </Link>
  )
}
```

- [x] **Step 6: Write `components/mobile-menu.tsx`** (native `<dialog>` gives focus trap and Escape for free)

```tsx
'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { ChevronRightIcon, CloseIcon, MenuIcon, WhatsAppIcon } from './icons'
import { buttonClass } from './ui'

const LINKS = [
  { href: '/designs', label: 'Explore designs' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/for-designers', label: 'For designers & vendors' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function MobileMenu({ crmUrl, whatsapp }: { crmUrl: string; whatsapp: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) ref.current?.close()
  }
  return (
    <>
      <button type="button" aria-label="Open menu" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}
        className="flex size-11 items-center justify-center rounded-full border border-line md:hidden">
        <MenuIcon className="size-[18px]" />
      </button>
      <dialog ref={ref} aria-label="Menu" onClick={closeOnLink}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-ink backdrop:bg-navy/40 open:flex open:flex-col">
        <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
          <span className="text-[22px] font-extrabold tracking-[-0.7px] text-navy">fitin</span>
          <button type="button" aria-label="Close menu" onClick={() => ref.current?.close()}
            className="flex size-11 items-center justify-center rounded-full bg-surface"><CloseIcon className="size-[18px]" /></button>
        </div>
        <nav aria-label="Menu links" className="flex-1 px-5 py-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-16 items-center justify-between border-b border-hairline text-xl font-bold text-navy">
              {l.label}<ChevronRightIcon className="size-[18px] text-muted" />
            </Link>
          ))}
          <a href={crmUrl} className="flex min-h-16 items-center text-[17px] font-semibold text-navy">Sign in</a>
        </nav>
        <div className="flex flex-col gap-3 border-t border-hairline px-5 pb-7 pt-4">
          <Link href="/start" className={buttonClass('primary', 'w-full')}>Start your project</Link>
          <a href={`https://wa.me/${whatsapp}`} className={buttonClass('outline', 'w-full rounded-full')}>
            <WhatsAppIcon className="size-[18px] text-teal-dark" />WhatsApp us
          </a>
        </div>
      </dialog>
    </>
  )
}
```

- [x] **Step 7: Write `components/header.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/content'
import { BuildIcon, DesignIcon, JournalIcon } from './icons'
import { MobileMenu } from './mobile-menu'
import { NavLink } from './nav-link'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-navy hover:text-navy" aria-label="Fitin home">
      <Image src="/images/fitin-logo.png" alt="" width={size} height={size} />
      <span className="text-[26px] font-extrabold tracking-[-0.8px]">fitin</span>
    </Link>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white md:static">
      <div className="wrap flex min-h-16 items-center justify-between gap-4 md:min-h-[84px]">
        <Logo />
        <nav aria-label="Main" className="hidden items-end gap-9 md:flex">
          <NavLink href="/designs"><DesignIcon className="size-[30px]" />Explore</NavLink>
          <NavLink href="/services"><BuildIcon className="size-[30px]" />Services</NavLink>
          <NavLink href="/journal"><JournalIcon className="size-[30px]" />Journal</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/for-designers" className="hidden px-3.5 py-3 text-sm font-semibold no-underline lg:inline">For designers</Link>
          <a href={site.crmUrl} className="hidden px-3.5 py-3 text-sm font-semibold lg:inline">Sign in</a>
          <Link href="/start" className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-2 hover:text-white md:h-11 md:px-5">
            <span className="md:hidden">Start</span><span className="hidden md:inline">Start project</span>
          </Link>
          <MobileMenu crmUrl={site.crmUrl} whatsapp={site.whatsapp} />
        </div>
      </div>
    </header>
  )
}
```

Note: the e2e test looks up `getByRole('link', { name: 'Start project' })` on desktop; on phone the visible label is "Start". Both live in one `<a>`, so its accessible name differs per breakpoint (hidden spans are excluded). That is intended.

- [x] **Step 8: Write `components/footer.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { getServices, site } from '@/lib/content'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="wrap flex flex-col gap-10 pb-6 pt-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Image src="/images/fitin-logo.png" alt="" width={32} height={32} className="mix-blend-multiply" />
              <span className="text-[22px] font-extrabold tracking-[-0.6px] text-navy">fitin</span>
            </div>
            <p className="max-w-60 text-sm text-ink-2">Design · Build · Fit. Interior design, custom furniture and project tracking on one platform.</p>
          </div>
          <nav aria-label="Services" className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Services</span>
            {getServices().map((s) => <Link key={s.slug} href={`/services/${s.slug}`} className="no-underline">{s.name}</Link>)}
            <Link href="/kitchen-cost-calculator" className="no-underline">Kitchen cost calculator</Link>
          </nav>
          <nav aria-label="Fitin" className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Fitin</span>
            <Link href="/about" className="no-underline">About</Link>
            <Link href="/contact" className="no-underline">Contact</Link>
            <Link href="/journal" className="no-underline">Journal</Link>
            <Link href="/for-designers" className="no-underline">For designers</Link>
            <a href={site.crmUrl} className="no-underline">Sign in</a>
          </nav>
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-[15px] font-bold text-navy">Contact</span>
            <a href={`mailto:${site.email}`} className="no-underline">{site.email}</a>
            <a href={`tel:${site.phone}`} className="no-underline">{site.phoneDisplay}</a>
            <a href={`https://wa.me/${site.whatsapp}`} className="no-underline">WhatsApp</a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-hairline pt-5 text-[13px] text-muted">
          <span>
            © {year} {site.legalName} · <Link href="/privacy" className="text-muted">Privacy</Link> ·{' '}
            <Link href="/terms" className="text-muted">Terms</Link>
          </span>
          <span>{site.cities.join(' · ')}</span>
        </div>
      </div>
    </footer>
  )
}
```

`no-underline` keeps links clean; base styles colour them navy.

- [x] **Step 9: Write `app/(site)/layout.tsx` and `lib/seo.ts`**

```tsx
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
```

Remove the `<main>` wrapper from the temporary `app/(site)/page.tsx` (make it a `<section>`), since the layout now provides `<main>`.

`lib/seo.ts`:
```ts
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
```

- [x] **Step 10: Run the tests** — `npx playwright test e2e/chrome.spec.ts e2e/smoke.spec.ts` — Expected: PASS (6 tests across desktop + phone; skips count as passed).

- [x] **Step 11: Commit**

```bash
git add components app lib/seo.ts e2e/chrome.spec.ts
git commit -m "feat: header, phone menu, footer and page metadata helper

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Home page

**Files:**
- Create: `components/stage-bars.tsx`, `e2e/home.spec.ts`
- Modify: `app/(site)/page.tsx` (replace the temporary page)

**Interfaces:**
- Consumes: `site, getServices, ROOMS` (`lib/content`), `SPACES, CITIES, SERVICE_OPTIONS` (`lib/rules`), `buttonClass, SectionHead, Bar, Highlight, Eyebrow` (`components/ui`), icons, `pageMetadata`.
- Produces: `StageBars({ compact?: boolean })` (used again by the OG image in Task 15 only as a visual reference, not imported).
- Visual source: `design/pages/Main.dc.html` (desktop) and `design/pages/PhoneHome.dc.html` (phone).

- [x] **Step 1: Write the failing test** — `e2e/home.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('hero, room links and how-it-works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Design, build and fit — all in one place\./)
  await expect(page.getByRole('link', { name: /Living rooms/ }).first()).toHaveAttribute('href', '/designs/living-rooms')
  await expect(page.locator('#how').getByRole('listitem')).toHaveCount(4)
  await expect(page.getByText('Free quote in under 24 hours')).toBeVisible()
})

test('desktop start form submits its choices to /start', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop form')
  await page.goto('/')
  const form = page.getByRole('form', { name: 'Start your project' })
  await form.getByLabel('Space').selectOption('Kitchen')
  await form.getByLabel('City').selectOption('Lahore')
  await form.getByRole('button', { name: 'Start project' }).click()
  await page.waitForURL(/\/start\?space=Kitchen&city=Lahore&service=/)
})

test('phone start pill links to /start', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone pill')
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Start your project/ }).first()).toHaveAttribute('href', '/start')
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/home.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `components/stage-bars.tsx`**

```tsx
import { site } from '@/lib/content'

const STAGES = [
  { n: '01', label: 'Design', text: 'Matched with verified designers', box: 'w-full bg-navy text-white', kicker: 'text-sky' },
  { n: '02', label: 'Build', text: 'Custom furniture, made to measure', box: 'w-[88%] bg-teal-dark text-white', kicker: 'text-lime-pale' },
  { n: '03', label: 'Fit', text: `Installed in ${site.claims.installDays} days`, box: 'w-[76%] bg-lime text-navy', kicker: 'text-navy' },
] as const

export function StageBars({ compact = false }: { compact?: boolean }) {
  return (
    <ol aria-label="Design, build, fit" className="flex flex-col gap-2.5">
      {STAGES.map((s) => (
        <li key={s.n} className={`${s.box} flex origin-bottom-left -rotate-3 items-center gap-3.5 rounded-[22px] shadow-[0_10px_24px_rgb(14_35_64/0.18)] ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
          <span className={`shrink-0 text-xs font-bold uppercase tracking-[1px] ${s.kicker}`}>{s.n} {s.label}</span>
          <span className={`font-semibold leading-tight ${compact ? 'text-sm' : 'text-base'}`}>{s.text}</span>
        </li>
      ))}
    </ol>
  )
}
```

- [x] **Step 4: Write `app/(site)/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from '@/components/icons'
import { StageBars } from '@/components/stage-bars'
import { Bar, Highlight, SectionHead, buttonClass } from '@/components/ui'
import { ROOMS, getServices, site } from '@/lib/content'
import { CITIES, SERVICE_OPTIONS, SPACES } from '@/lib/rules'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design, custom furniture & fit-out in Pakistan',
  description: `Connect with verified interior designers and furniture vendors in ${site.cities.slice(0, 3).join(', ')} and more. Free quote in under ${site.claims.quoteHours} hours.`,
  path: '/',
})

const FEATURED_ROOMS = [
  { slug: 'living-rooms', image: '/images/living-navy-sofa-teal-cushions.jpg', alt: 'Navy sofa with teal cushions', badge: 'Most popular' },
  { slug: 'bedrooms', image: '/images/bedroom-pendant-light.jpg', alt: 'Warm bedroom with a pendant light' },
  { slug: 'kitchens', image: '/images/kitchen-open-white.jpg', alt: 'Open white kitchen' },
  { slug: 'home-offices', image: '/images/office-sunlit-desk.jpg', alt: 'Bright home office with a white desk' },
] as const

const STEPS = [
  { color: 'navy', title: 'Tell us about your space', text: 'Your room, your city, your budget. It takes a couple of minutes.' },
  { color: 'teal', title: 'Get matched with experts', text: 'We pair you with verified designers and vendors near you.' },
  { color: 'lime', title: 'Design & customise', text: 'Pick materials, finishes and sizes. Every piece can be changed.' },
  { color: 'navy', title: 'Track your project', text: 'See production, delivery and installation in one place.' },
] as const

const selectCls = 'w-full appearance-none bg-transparent text-[15px] text-ink-2 outline-none'

export default function Home() {
  const roomLabel = (slug: string) => ROOMS.find((r) => r.slug === slug)!.label
  const otherRooms = ROOMS.filter((r) => !FEATURED_ROOMS.some((f) => f.slug === r.slug))
  return (
    <>
      {/* HERO */}
      <section className="wrap flex flex-wrap items-center gap-14 pb-16 pt-7 md:pt-16">
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-7">
          <p className="inline-flex items-center gap-2.5 self-start rounded-full bg-lime-soft py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-navy">
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.6px] text-white">6 cities</span>
            Karachi · Lahore · Islamabad and more
          </p>
          <h1 className="text-[clamp(44px,6vw,76px)] font-bold leading-[1.02] tracking-[-2.4px] text-navy">
            <Highlight tone="navy">Design</Highlight>, <Highlight tone="teal">build</Highlight> and <Highlight tone="lime">fit</Highlight> — all in one place.
          </h1>
          <p className="max-w-[520px] text-[19px] leading-[1.55] text-ink-2">{site.description}</p>

          <form action="/start" method="get" aria-label="Start your project"
            className="hidden max-w-[680px] flex-wrap items-center gap-y-1 rounded-[40px] border border-line bg-white p-2 shadow-float md:flex">
            {([['space', 'Space', SPACES], ['city', 'City', CITIES], ['service', 'Service', SERVICE_OPTIONS]] as const).map(([name, label, opts], i) => (
              <div key={name} className="flex flex-[1_1_140px] items-center">
                {i > 0 && <span aria-hidden className="h-8 w-px bg-hairline" />}
                <label className="flex flex-1 cursor-pointer flex-col gap-0.5 px-5 py-2.5">
                  <span className="text-xs font-bold text-navy">{label}</span>
                  <select name={name} className={selectCls} defaultValue={opts[0]}>
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              </div>
            ))}
            <button type="submit" className="flex h-14 items-center gap-2.5 rounded-full bg-lime pl-[18px] pr-6 font-bold text-navy">
              <ArrowRightIcon className="size-5" />Start project
            </button>
          </form>

          <Link href="/start" className="flex items-center gap-3 rounded-full border border-line py-2 pl-5 pr-2 no-underline shadow-float md:hidden">
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-bold text-navy">Start your project</span>
              <span className="text-[13px] text-ink-2">Space · City · Service</span>
            </span>
            <span className="flex size-[52px] items-center justify-center rounded-full bg-lime"><ArrowRightIcon className="size-5 text-navy" /></span>
          </Link>

          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-2">
            {[`Free quote in under ${site.claims.quoteHours} hours`, 'Verified designers & vendors', 'Track every step in one place'].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckIcon className="size-[18px] text-teal-dark" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 flex-[1_1_500px] pb-10">
          <div className="relative ml-0 aspect-[4/4.3] overflow-hidden rounded-feature bg-navy-soft md:ml-14">
            <Image src="/images/bedroom-navy-city-view.jpg" alt="A bright bedroom with navy bedding and a city view" fill preload
              sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <p className="absolute right-5 top-6 flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-bold text-navy shadow-float">
            <span className="flex size-9 items-center justify-center rounded-full bg-lime">
              <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="#0E2340" strokeWidth={2.2} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            Quote in under {site.claims.quoteHours} hours
          </p>
          <div className="absolute bottom-0 left-0 w-[80%] md:w-[76%]"><StageBars /></div>
        </div>
      </section>

      {/* EXPLORE BY ROOM */}
      <section className="wrap flex flex-col gap-7 pb-20 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[32px] font-bold tracking-[-0.8px] text-navy">Explore by room</h2>
            <p className="text-ink-2">{site.stats.designs} furniture designs, all 100% customisable.</p>
          </div>
          <Link href="/designs" className="text-[15px] font-semibold underline underline-offset-4">Browse all designs</Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {FEATURED_ROOMS.map((r) => (
            <Link key={r.slug} href={`/designs/${r.slug}`} className="flex w-60 shrink-0 snap-start flex-col gap-3 text-navy no-underline md:w-auto">
              <span className="relative block aspect-[4/3.8] overflow-hidden rounded-card bg-navy-soft">
                <Image src={r.image} alt={r.alt} fill sizes="(min-width: 768px) 25vw, 240px" className="object-cover" />
                {'badge' in r && <span className="absolute left-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-[0_2px_8px_rgb(14_35_64/0.1)]">{r.badge}</span>}
              </span>
              <span className="flex justify-between gap-3 px-0.5">
                <span className="text-[17px] font-bold">{roomLabel(r.slug)}</span>
                <span className="text-sm text-ink-2">{site.roomCounts[r.slug]} designs</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {otherRooms.map((r) => (
            <Link key={r.slug} href={`/designs/${r.slug}`} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold no-underline">
              {r.label} <span className="font-medium text-muted">{site.roomCounts[r.slug]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead eyebrow="Services" title="One corner or the whole home." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {getServices().map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="flex flex-col overflow-hidden rounded-panel bg-white text-navy no-underline">
                <span className="relative block aspect-[16/10] bg-navy-soft">
                  <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </span>
                <span className="flex flex-col gap-2 p-6">
                  <span className="text-[21px] font-bold tracking-[-0.3px]">{s.name}</span>
                  <span className="text-[15px] text-ink-2">{s.summary}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="wrap flex scroll-mt-24 flex-col gap-10 py-20">
        <SectionHead eyebrow="How it works" title="From first idea to finished room." />
        <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 border-t border-hairline pt-6">
              <Bar color={s.color} />
              <span className="text-sm font-bold text-muted">Step {i + 1}</span>
              <h3 className="text-[22px] font-bold text-navy">{s.title}</h3>
              <p className="text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* NAVY BAND */}
      <section className="bg-navy text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-12 py-20">
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
            <h2 className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px]">
              Connecting spaces.<br /><span className="text-lime">Building possibilities.</span>
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {site.cities.map((c) => <li key={c} className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold">{c}</li>)}
            </ul>
          </div>
          <dl className="grid min-w-0 flex-[1_1_520px] grid-cols-3 gap-4">
            {([['Furniture designs', site.stats.designs, 'border-lime'], ['Verified designers', site.stats.designers, 'border-teal'], ['Trusted vendors', site.stats.vendors, 'border-white']] as const).map(([label, value, border]) => (
              <div key={label} className={`flex flex-col-reverse gap-1 border-t-2 pt-4 ${border}`}>
                <dt className="text-sm text-on-navy">{label}</dt>
                <dd className="text-[clamp(30px,4vw,48px)] font-bold leading-none tracking-[-1.5px]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-20">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-feature bg-lime-soft p-7 md:p-14">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
            <h2 className="text-4xl font-bold tracking-[-1px] text-navy">Start your project today.</h2>
            <p className="text-[17px] text-[#3B4552]">Get a tailored quote in under {site.claims.quoteHours} hours.</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <Link href="/start" className={buttonClass('dark', 'w-full sm:w-auto')}>Request a free quote</Link>
            <a href={`https://wa.me/${site.whatsapp}`} className={buttonClass('outline', 'w-full sm:w-auto')}>
              <WhatsAppIcon className="size-[18px]" />Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
```

- [x] **Step 5: Run the tests** — `npx playwright test e2e/home.spec.ts` — Expected: PASS. Then open `http://localhost:3100` at 1440 px and 390 px and compare against the canvas Home and Phone · Home artboards; fix spacing drift before committing.

- [x] **Step 6: Commit**

```bash
git add app/\(site\)/page.tsx components/stage-bars.tsx e2e/home.spec.ts
git commit -m "feat: home page from the approved design

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Designs — explore, room pages, design detail, save hearts

**Files:**
- Create: `components/design-card.tsx`, `components/save-heart.tsx`, `components/explore-grid.tsx`, `components/room-tabs.tsx`, `components/empty-state.tsx`, `components/design-customiser.tsx`, `app/(site)/designs/page.tsx`, `app/(site)/designs/[room]/page.tsx`, `app/(site)/designs/[room]/[design]/page.tsx`, `e2e/designs.spec.ts`

**Interfaces:**
- Consumes: `getDesigns, getDesign, getRoom, designsInRoom, similarDesigns, designHref, ROOMS, DESIGN_STYLES, site` (`lib/content`), `CITIES` (`lib/rules`), `pageMetadata`, UI + icons.
- Produces:
  - `type CardDesign = { slug: string; href: string; title: string; city: string; style: string; roomLabel: string; image: string; imageAlt: string; badge?: string; quoteHours: number }` and `toCard(d: Design): CardDesign` (exported from `components/design-card.tsx`; `toCard` must only be called in Server Components).
  - `DesignCard({ d, sizes? })`, `DesignGrid({ cards })`, `SaveHeart({ id, title, variant?: 'overlay' | 'inline' })`, `ExploreGrid({ cards })`, `RoomTabs({ active: RoomSlug | 'all' })`, `EmptyState({ title, text })`.
- Visual source: `design/pages/Explore.dc.html`, `Detail.dc.html`, `PhoneExplore.dc.html`, `PhoneDetail.dc.html`.
- Deviation from design: the Explore "Budget" filter is dropped — designs carry no price data, so it would filter nothing.

- [x] **Step 1: Write the failing test** — `e2e/designs.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('explore lists all draft designs and filters by style via the URL', async ({ page }) => {
  await page.goto('/designs')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(14)
  await page.getByLabel('Style').selectOption('Japandi Minimal')
  await expect(page).toHaveURL(/style=Japandi\+Minimal/)
  await expect(cards).toHaveCount(3)
})

test('room tab opens the room page with only that room', async ({ page }) => {
  await page.goto('/designs')
  await page.getByRole('link', { name: 'Kitchens', exact: true }).click()
  await expect(page).toHaveURL('/designs/kitchens')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kitchen designs')
  await expect(page.getByRole('article')).toHaveCount(4)
})

test('design detail shows the design, finishes and a prefilled quote link', async ({ page }) => {
  await page.goto('/designs/living-rooms/teal-accent-lounge')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Teal accent lounge')
  await page.getByRole('radio', { name: 'Teal linen' }).check()
  await expect(page.getByText('Upholstery · Teal linen')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Request a quote' }).first()).toHaveAttribute('href', '/start?space=Living+room&design=teal-accent-lounge')
})

test('save heart persists across reloads', async ({ page }) => {
  await page.goto('/designs')
  const heart = page.getByRole('button', { name: 'Save Teal accent lounge' })
  await heart.click()
  await expect(page.getByRole('button', { name: 'Remove Teal accent lounge from saved' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remove Teal accent lounge from saved' })).toBeVisible()
})

for (const url of ['/designs/kichens', '/designs/kitchens/nope', '/designs/living-rooms/open-white-kitchen']) {
  test(`unknown design URL ${url} returns 404`, async ({ page }) => {
    const res = await page.goto(url)
    expect(res?.status()).toBe(404)
  })
}
```

Counts come from Task 4's data: 3 Japandi Minimal designs (warm-timber-bedroom, sunlit-study-nook, built-in-wardrobe-wall) and 4 kitchens.

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/designs.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `components/save-heart.tsx`**

```tsx
'use client'
import { useSyncExternalStore } from 'react'
import { HeartIcon } from './icons'

const KEY = 'fitin:saved'
const EVENT = 'fitin:saved'

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[] } catch { return [] }
}
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENT, cb)
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENT, cb) }
}

export function SaveHeart({ id, title, variant = 'overlay' }: { id: string; title: string; variant?: 'overlay' | 'inline' }) {
  const saved = useSyncExternalStore(subscribe, () => read().includes(id), () => false)
  const toggle = () => {
    const list = read()
    const next = saved ? list.filter((x) => x !== id) : [...list, id]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: heart still toggles for this view */ }
    window.dispatchEvent(new Event(EVENT))
  }
  const label = saved ? `Remove ${title} from saved` : `Save ${title}`
  if (variant === 'inline') {
    return (
      <button type="button" onClick={toggle} aria-pressed={saved} aria-label={label}
        className="flex h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-navy underline underline-offset-4">
        <HeartIcon filled={saved} className="size-4 [&_path]:stroke-navy" />{saved ? 'Saved' : 'Save'}
      </button>
    )
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={label}
      className="absolute right-2 top-2 flex size-11 items-center justify-center">
      <HeartIcon filled={saved} className="size-[26px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
    </button>
  )
}
```

- [x] **Step 4: Write `components/design-card.tsx` and `components/empty-state.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Design } from '@/lib/content'
import { ROOMS, designHref, site } from '@/lib/content'
import { SaveHeart } from './save-heart'

export type CardDesign = {
  slug: string; href: string; title: string; city: string; style: string
  roomLabel: string; image: string; imageAlt: string; badge?: string; quoteHours: number
}

export const toCard = (d: Design): CardDesign => ({
  slug: d.slug, href: designHref(d), title: d.title, city: d.city, style: d.style,
  roomLabel: ROOMS.find((r) => r.slug === d.room)!.single, image: d.image, imageAlt: d.imageAlt, badge: d.badge,
  quoteHours: site.claims.quoteHours,
})

export function DesignCard({ d, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw' }: { d: CardDesign; sizes?: string }) {
  return (
    <article className="relative">
      <Link href={d.href} className="flex flex-col gap-3 text-navy no-underline">
        <span className="relative block aspect-[1/0.95] overflow-hidden rounded-card bg-navy-soft">
          <Image src={d.image} alt={d.imageAlt} fill sizes={sizes} className="object-cover" />
        </span>
        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="flex justify-between gap-3">
            <span className="font-bold">{d.title}</span>
            <span className="whitespace-nowrap text-sm text-ink-2">{d.city}</span>
          </span>
          <span className="text-sm text-ink-2">{d.roomLabel} · {d.style}</span>
          <span className="mt-1 text-sm"><b>Free quote</b> in {d.quoteHours} hours</span>
        </span>
      </Link>
      {d.badge && (
        <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-[0_2px_8px_rgb(14_35_64/0.1)]">{d.badge}</span>
      )}
      <SaveHeart id={d.slug} title={d.title} />
    </article>
  )
}

export function DesignGrid({ cards }: { cards: CardDesign[] }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((d) => <DesignCard key={d.slug} d={d} />)}
    </div>
  )
}
```

Note: `toCard` imports `lib/content`, which uses `node:fs`. That is fine because `design-card.tsx` has no `'use client'`; `explore-grid.tsx` (client) imports only the `CardDesign` type and `DesignGrid`. If the bundler complains that `lib/content` reaches a client bundle, move `toCard` into `lib/content.ts`.

`components/empty-state.tsx`:
```tsx
import Link from 'next/link'
import { Bar, buttonClass } from './ui'

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-line px-6 py-16 text-center">
      <Bar color="teal" />
      <h2 className="text-[22px] font-bold text-navy">{title}</h2>
      <p className="max-w-md text-ink-2">{text}</p>
      <Link href="/start" className={buttonClass('dark', 'mt-2')}>Start a project</Link>
    </div>
  )
}
```

- [x] **Step 5: Write `components/room-tabs.tsx` and `components/explore-grid.tsx`**

```tsx
import Link from 'next/link'
import { ROOMS, type RoomSlug } from '@/lib/content'

export function RoomTabs({ active }: { active: RoomSlug | 'all' }) {
  const tabs = [{ slug: 'all', label: 'All', href: '/designs' }, ...ROOMS.map((r) => ({ slug: r.slug, label: r.label, href: `/designs/${r.slug}` }))]
  return (
    <nav aria-label="Rooms" className="-mx-5 flex gap-1 overflow-x-auto border-b border-hairline px-5 md:mx-0 md:px-0">
      {tabs.map((t) => (
        <Link key={t.slug} href={t.href} aria-current={t.slug === active ? 'page' : undefined}
          className={`flex min-h-14 shrink-0 items-center px-3.5 text-sm font-semibold no-underline ${
            t.slug === active ? 'text-navy shadow-[inset_0_-2px_0_#0E2340]' : 'text-muted hover:text-navy'
          }`}>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
```

```tsx
'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DesignGrid, type CardDesign } from './design-card'
import { EmptyState } from './empty-state'

const STYLES = ['Warm Modern', 'Japandi Minimal', 'Contemporary', 'Classic']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']

export function ExploreGrid({ cards }: { cards: CardDesign[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const style = params.get('style') ?? ''
  const city = params.get('city') ?? ''
  const shown = cards.filter((d) => (!style || d.style === style) && (!city || d.city === city))

  const set = (key: 'style' | 'city', value: string) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const select = 'h-11 rounded-btn border border-line bg-white px-3 text-sm font-semibold text-navy'
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-2">Style
          <select className={select} value={style} onChange={(e) => set('style', e.target.value)}>
            <option value="">Any style</option>{STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-2">City
          <select className={select} value={city} onChange={(e) => set('city', e.target.value)}>
            <option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <span className="ml-auto text-sm text-ink-2" aria-live="polite">{shown.length} designs · every design is 100% customisable</span>
      </div>
      {shown.length ? (
        <DesignGrid cards={shown} />
      ) : (
        <EmptyState title="No designs match yet" text="Tell us about your space and a verified designer will create one around it." />
      )}
    </div>
  )
}
```

Keep the `STYLES`/`CITIES` copies in this client file (importing `lib/content` would pull `node:fs` into the browser bundle); add a Vitest in Step 8 that asserts they equal `DESIGN_STYLES` and `CITIES`.

- [x] **Step 6: Write the three routes**

`app/(site)/designs/page.tsx`:
```tsx
import { Suspense } from 'react'
import { DesignGrid, toCard } from '@/components/design-card'
import { ExploreGrid } from '@/components/explore-grid'
import { RoomTabs } from '@/components/room-tabs'
import { getDesigns } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design ideas for every room',
  description: 'Browse customisable living room, bedroom, kitchen, wardrobe, bathroom and home office designs by verified Fitin designers across Pakistan.',
  path: '/designs',
})

export default function DesignsPage() {
  const cards = getDesigns().map(toCard)
  return (
    <div className="wrap flex flex-col gap-7 pb-20 pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(30px,4vw,44px)] font-bold tracking-[-1.2px] text-navy">Popular designs across Pakistan</h1>
        <p className="text-ink-2">Every design adapts to your room, your materials and your budget.</p>
      </div>
      <RoomTabs active="all" />
      <Suspense fallback={<DesignGrid cards={cards} />}>
        <ExploreGrid cards={cards} />
      </Suspense>
    </div>
  )
}
```

`app/(site)/designs/[room]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { DesignGrid, toCard } from '@/components/design-card'
import { ExploreGrid } from '@/components/explore-grid'
import { RoomTabs } from '@/components/room-tabs'
import { ROOMS, designsInRoom, getRoom } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => ROOMS.map((r) => ({ room: r.slug }))

type Props = { params: Promise<{ room: string }> }

export async function generateMetadata({ params }: Props) {
  const room = getRoom((await params).room)
  if (!room) return {}
  return pageMetadata({
    title: `${room.single} designs & ideas in Pakistan`,
    description: `Customisable ${room.label.toLowerCase()} designs by verified Fitin designers in Karachi, Lahore, Islamabad and more. Get a free quote.`,
    path: `/designs/${room.slug}`,
    noindex: designsInRoom(room.slug).length === 0,
  })
}

export default async function RoomPage({ params }: Props) {
  const room = getRoom((await params).room)
  if (!room) notFound()
  const cards = designsInRoom(room.slug).map(toCard)
  return (
    <div className="wrap flex flex-col gap-7 pb-20 pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(30px,4vw,44px)] font-bold tracking-[-1.2px] text-navy">{room.single} designs</h1>
        <p className="text-ink-2">Ideas to start from. Your designer adapts every one to your space.</p>
      </div>
      <RoomTabs active={room.slug} />
      <Suspense fallback={<DesignGrid cards={cards} />}>
        <ExploreGrid cards={cards} />
      </Suspense>
    </div>
  )
}
```

`components/design-customiser.tsx`:
```tsx
'use client'
import { useState } from 'react'

type Swatch = { name: string; hex: string }

function SwatchGroup({ label, swatches }: { label: string; swatches: Swatch[] }) {
  const [picked, setPicked] = useState(swatches[0].name)
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-bold text-navy">{label} · <span className="font-medium text-ink-2">{picked}</span></legend>
      <div className="flex flex-wrap gap-3">
        {swatches.map((s) => (
          <label key={s.name} className="cursor-pointer">
            <input type="radio" name={label} value={s.name} checked={picked === s.name} onChange={() => setPicked(s.name)} aria-label={s.name} className="peer sr-only" />
            <span aria-hidden className="block size-12 rounded-full border-[3px] border-white shadow-[0_0_0_1px_#D5DAE0] peer-checked:shadow-[0_0_0_2px_#0E2340] peer-focus-visible:outline-2 peer-focus-visible:outline-navy" style={{ background: s.hex }} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function DesignCustomiser({ upholstery, wood }: { upholstery: Swatch[]; wood: Swatch[] }) {
  return (
    <div className="flex flex-col gap-5">
      <SwatchGroup label="Upholstery" swatches={upholstery} />
      <SwatchGroup label="Wood finish" swatches={wood} />
    </div>
  )
}
```

The e2e test expects the text `Upholstery · Teal linen`; the legend renders `Upholstery · ` + `Teal linen` in one element, so `getByText` matches on normalised text.

`app/(site)/designs/[room]/[design]/page.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DesignGrid, toCard } from '@/components/design-card'
import { DesignCustomiser } from '@/components/design-customiser'
import { PlayIcon, WhatsAppIcon } from '@/components/icons'
import { SaveHeart } from '@/components/save-heart'
import { buttonClass } from '@/components/ui'
import { getDesign, getDesigns, getRoom, similarDesigns, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => getDesigns().map((d) => ({ room: d.room, design: d.slug }))

type Props = { params: Promise<{ room: string; design: string }> }

export async function generateMetadata({ params }: Props) {
  const { room, design } = await params
  const d = getDesign(room, design)
  if (!d) return {}
  return pageMetadata({ title: `${d.title} — ${d.style} ${getRoom(d.room)!.single.toLowerCase()} design`, description: d.summary, path: `/designs/${d.room}/${d.slug}` })
}

const STAGES = [
  ['01 Design', 'Site visit, layout and your material board', 'bg-navy text-white', 'text-sky'],
  ['02 Build', 'Pieces made to measure by verified vendors', 'bg-teal-dark text-white', 'text-lime-pale'],
  ['03 Fit', 'Delivered, installed and styled', 'bg-lime text-navy', 'text-navy'],
] as const

export default async function DesignPage({ params }: Props) {
  const { room: roomSlug, design } = await params
  const d = getDesign(roomSlug, design)
  if (!d) notFound()
  const room = getRoom(d.room)!
  const quoteHref = `/start?${new URLSearchParams({ space: room.space, design: d.slug })}`

  return (
    <div className="wrap flex max-w-[1180px] flex-col gap-7 pb-28 pt-7 md:pb-20">
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
        <Link href="/designs" className="text-muted">Explore</Link><span aria-hidden>/</span>
        <Link href={`/designs/${room.slug}`} className="text-muted">{room.label}</Link>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[34px] font-bold leading-tight tracking-[-1px] text-navy">{d.title}</h1>
          <p className="flex flex-wrap gap-2 text-[15px] text-ink-2">
            <span>{room.single}</span>·<span>{d.style}</span>·<span>{d.city}</span>·<span className="font-semibold text-teal-dark">100% customisable</span>
          </p>
        </div>
        <SaveHeart id={d.slug} title={d.title} variant="inline" />
      </div>

      <div className="grid gap-2.5 overflow-hidden rounded-panel md:grid-cols-2">
        <div className="relative min-h-[340px] bg-navy-soft md:min-h-[440px]">
          <Image src={d.image} alt={d.imageAlt} fill preload sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {d.finishes && (
            <div className="flex min-h-[200px] flex-col justify-between gap-3 bg-surface p-5">
              <span className="text-[13px] font-bold uppercase tracking-[1px] text-muted">Material board</span>
              <div className="grid grid-cols-2 gap-2">
                {[...d.finishes.upholstery.slice(0, 2), ...d.finishes.wood.slice(0, 2)].map((s) => (
                  <span key={s.name} title={s.name} className="aspect-[1.6] rounded-[10px]" style={{ background: s.hex }} />
                ))}
              </div>
            </div>
          )}
          <div className="flex min-h-[200px] flex-col justify-between gap-3 bg-teal-soft p-5">
            <span className="text-[13px] font-bold uppercase tracking-[1px] text-[#0E4F51]">Made for you</span>
            <span className="text-sm font-semibold text-navy">Sizes, fabrics and finishes adjusted to your room and budget.</span>
          </div>
          <div className={`flex min-h-[200px] flex-col justify-between gap-3 bg-navy p-5 text-white ${d.finishes ? 'col-span-2' : ''}`}>
            <span className="flex size-11 items-center justify-center rounded-full bg-lime text-navy"><PlayIcon className="size-[18px]" /></span>
            <span className="text-[15px] font-semibold leading-snug">3D walkthrough of your own room, after your consultation</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-14">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col divide-y divide-hairline">
          <section className="flex flex-col gap-3 pb-7">
            <h2 className="text-[22px] font-bold text-navy">About this design</h2>
            <p className="text-[#3B4552]">{d.about}</p>
          </section>
          <section className="flex flex-col gap-4 py-7">
            <h2 className="text-[22px] font-bold text-navy">What&apos;s included</h2>
            <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {d.included.map((item, i) => (
                <li key={item} className="flex items-center gap-3">
                  <span aria-hidden className="size-2 -skew-y-[20deg] rounded-[2px]" style={{ background: ['#0E2340', '#229E9F', '#B6D22A'][i % 3] }} />{item}
                </li>
              ))}
            </ul>
          </section>
          {d.finishes && (
            <section className="flex flex-col gap-5 py-7">
              <div>
                <h2 className="text-[22px] font-bold text-navy">Make it yours</h2>
                <p className="text-[15px] text-ink-2">Starting choices. Your designer brings real samples to your site visit.</p>
              </div>
              <DesignCustomiser upholstery={d.finishes.upholstery} wood={d.finishes.wood} />
            </section>
          )}
          <section className="flex flex-col gap-4 pt-7">
            <h2 className="text-[22px] font-bold text-navy">How it comes together</h2>
            <ol className="grid gap-3 sm:grid-cols-3">
              {STAGES.map(([k, t, box, kick]) => (
                <li key={k} className={`flex flex-col gap-1.5 rounded-card p-5 ${box}`}>
                  <span className={`text-xs font-bold uppercase tracking-[1px] ${kick}`}>{k}</span><span className="text-[15px]">{t}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside aria-label="Request a quote" className="sticky top-6 flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-panel border border-hairline bg-white p-7 shadow-float">
          <div>
            <p className="text-[22px] font-bold text-navy">Get a tailored quote</p>
            <p className="text-sm text-ink-2">Free, in under {site.claims.quoteHours} hours</p>
          </div>
          <Link href={quoteHref} className={buttonClass('primary', 'w-full')}>Request a quote</Link>
          <p className="text-center text-[13px] text-muted">No payment needed to get a quote</p>
          <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi Fitin, I'm interested in the ${d.title} design.`)}`}
            className="flex items-center justify-center gap-2 border-t border-hairline pt-4 text-sm font-semibold underline underline-offset-4">
            <WhatsAppIcon className="size-[18px] text-teal-dark" />Ask about this design on WhatsApp
          </a>
        </aside>
      </div>

      <section className="flex flex-col gap-5 border-t border-hairline pt-10">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold text-navy">You might also like</h2>
          <Link href="/designs" className="text-[15px] font-semibold underline underline-offset-4">See all</Link>
        </div>
        <DesignGrid cards={similarDesigns(d).map(toCard)} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-hairline bg-white px-5 pb-5 pt-3 shadow-[0_-4px_12px_rgb(14_35_64/0.06)] md:hidden">
        <span className="flex flex-col leading-tight"><b className="text-navy">Free quote</b><span className="text-[13px] text-ink-2">in under {site.claims.quoteHours} hours</span></span>
        <Link href={quoteHref} className={buttonClass('primary', 'min-h-[52px]')}>Request a quote</Link>
      </div>
    </div>
  )
}
```

`pb-28 md:pb-20` on the wrapper keeps the phone's fixed bottom bar from covering content.

- [x] **Step 7: Run the e2e tests** — `npx playwright test e2e/designs.spec.ts` — Expected: PASS (both projects). On phone, "Request a quote" exists twice (aside + sticky bar); the test uses `.first()`.

- [x] **Step 8: Add the drift guard unit test** — append to `tests/content.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { DESIGN_STYLES } from '@/lib/content'
import { CITIES } from '@/lib/rules'

test('explore-grid filter options match the content enums', () => {
  const src = readFileSync('components/explore-grid.tsx', 'utf8')
  for (const s of [...DESIGN_STYLES, ...CITIES]) expect(src).toContain(`'${s}'`)
})
```

Run: `npx vitest run tests/content.test.ts` — Expected: PASS.

- [x] **Step 9: Commit**

```bash
git add components app/\(site\)/designs e2e/designs.spec.ts tests/content.test.ts
git commit -m "feat: explore, room and design detail pages with saved designs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Services, service pages and the kitchen cost calculator

**Files:**
- Create: `components/calculator.tsx`, `app/(site)/services/page.tsx`, `app/(site)/services/[service]/page.tsx`, `app/(site)/kitchen-cost-calculator/page.tsx`, `e2e/services.spec.ts`

**Interfaces:**
- Consumes: `getServices, getService, site` and `Service.startService` (`lib/content`), `kitchenEstimate, RFT_MIN, RFT_MAX, RFT_DEFAULT` (`lib/calculator`), UI, `pageMetadata`.
- Produces: `Calculator()` client component (self-contained card with slider and result).
- Visual source: `design/pages/Services.dc.html`, `PhoneServices.dc.html`.

- [x] **Step 1: Write the failing test** — `e2e/services.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('services overview links the four service pages', async ({ page }) => {
  await page.goto('/services')
  for (const slug of ['modular-kitchens-wardrobes', 'full-home-interiors', 'signature', 'renovation']) {
    await expect(page.locator(`a[href="/services/${slug}"]`).first()).toBeVisible()
  }
})

test('service page renders and unknown service is a 404', async ({ page }) => {
  await page.goto('/services/renovation')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Renovation')
  expect((await page.goto('/services/plumbing'))?.status()).toBe(404)
})

test('calculator updates the estimate from the slider and keyboard', async ({ page }) => {
  await page.goto('/kitchen-cost-calculator')
  const slider = page.getByRole('slider', { name: 'Kitchen length in running feet' })
  await expect(page.getByTestId('estimate')).toHaveText('PKR 7.55–9.19 Lakh')
  await slider.fill('24')
  await expect(page.getByTestId('estimate')).toHaveText('PKR 15.10–18.38 Lakh')
  await slider.press('ArrowRight')
  await expect(slider).toHaveValue('25')
})

test('modular service page embeds the calculator', async ({ page }) => {
  await page.goto('/services/modular-kitchens-wardrobes')
  await expect(page.getByTestId('estimate')).toBeVisible()
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/services.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `components/calculator.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { RFT_DEFAULT, RFT_MAX, RFT_MIN, kitchenEstimate } from '@/lib/calculator'
import { ArrowRightIcon } from './icons'

export function Calculator() {
  const [rft, setRft] = useState(RFT_DEFAULT)
  const est = kitchenEstimate(rft)
  return (
    <div className="flex flex-wrap items-center gap-12">
      <label className="flex min-w-0 flex-[1_1_400px] flex-col gap-3.5">
        <span className="flex justify-between text-[15px] font-bold text-navy">Kitchen length <span>{est.rft} rft</span></span>
        <input type="range" min={RFT_MIN} max={RFT_MAX} step={1} value={est.rft} aria-label="Kitchen length in running feet"
          onChange={(e) => setRft(Number(e.target.value))} className="h-8 w-full accent-navy" />
        <span className="flex justify-between text-[13px] text-muted"><span>{RFT_MIN} rft</span><span>{RFT_MAX} rft</span></span>
      </label>
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 rounded-feature bg-white p-7 shadow-float md:p-10">
        <span className="text-sm font-semibold text-ink-2">Estimated range · Comfort tier</span>
        <output data-testid="estimate" aria-live="polite" className="text-[clamp(34px,4vw,52px)] font-bold leading-none tracking-[-1.5px] text-navy">
          PKR {est.low}–{est.high} Lakh
        </output>
        <span className="text-[15px] text-ink-2">for a {est.rft} rft modular kitchen</span>
        <hr className="my-2 border-hairline" />
        <span className="text-[13px] text-muted">Based on Fitin&apos;s Comfort tier rates (a 12 rft kitchen is about PKR 7.55–9.19 Lakh). Your exact price comes after a free site visit.</span>
        <Link href={`/start?space=Kitchen&service=${encodeURIComponent('Modular kitchen & wardrobe')}`} className="mt-2 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime font-bold text-navy hover:text-navy">
          Get an exact quote<ArrowRightIcon className="size-5" />
        </Link>
      </div>
    </div>
  )
}
```

- [x] **Step 4: Write `app/(site)/services/page.tsx`** (alternating rows per design)

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Bar, CheckList, Highlight, buttonClass } from '@/components/ui'
import { getServices } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Interior design services: modular kitchens, full-home interiors & renovation',
  description: 'Modular kitchens and wardrobes, full-home interiors, Signature bespoke design and renovation — matched with verified designers and vendors across Pakistan.',
  path: '/services',
})

export default function ServicesPage() {
  const services = getServices()
  return (
    <>
      <section className="wrap flex flex-col gap-6 pb-12 pt-10 md:pt-[72px]">
        <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Services</span>
        <h1 className="max-w-[900px] text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">
          One corner or the <Highlight tone="lime">whole home</Highlight>.
        </h1>
        <p className="max-w-[600px] text-[19px] leading-[1.55] text-ink-2">Four ways to work with Fitin. Each one is designed, built and fitted by verified professionals, and tracked on one platform.</p>
        <nav aria-label="Jump to a service" className="-mx-5 flex gap-2.5 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {services.map((s) => <a key={s.slug} href={`#${s.slug}`} className="shrink-0 rounded-full border border-line px-5 py-3 text-[15px] font-semibold no-underline">{s.name}</a>)}
          <Link href="/kitchen-cost-calculator" className="shrink-0 rounded-full bg-lime-soft px-5 py-3 text-[15px] font-semibold no-underline">Cost calculator</Link>
        </nav>
      </section>
      <section className="wrap flex flex-col gap-24 pb-20">
        {services.map((s, i) => (
          <article key={s.slug} id={s.slug} className={`flex scroll-mt-24 flex-wrap items-center gap-14 ${i % 2 ? 'flex-wrap-reverse md:flex-row-reverse' : ''}`}>
            <div className="relative aspect-[4/3] min-w-0 flex-[1_1_480px] overflow-hidden rounded-feature bg-navy-soft">
              <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4.5">
              <Bar color={s.bar} className="h-7 w-16" />
              <h2 className="text-[clamp(30px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-1.2px] text-navy">{s.name}</h2>
              <p className="text-[17px] text-ink-2">{s.summary}</p>
              <CheckList items={s.includes} />
              <div className="mt-1.5 flex flex-wrap items-center gap-5">
                <Link href={`/services/${s.slug}`} className={buttonClass('dark')}>Learn more</Link>
                <Link href="/start" className="font-semibold underline underline-offset-4">Start this project</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
```

`gap-4.5` is a valid Tailwind v4 spacing step (18 px).

- [x] **Step 5: Write `app/(site)/services/[service]/page.tsx` and the calculator page**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calculator } from '@/components/calculator'
import { Bar, CheckList, buttonClass } from '@/components/ui'
import { getService, getServices, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export const generateStaticParams = () => getServices().map((s) => ({ service: s.slug }))

type Props = { params: Promise<{ service: string }> }

export async function generateMetadata({ params }: Props) {
  const s = getService((await params).service)
  if (!s) return {}
  return pageMetadata({ title: `${s.name} in Pakistan`, description: s.summary, path: `/services/${s.slug}` })
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).service)
  if (!s) notFound()
  const others = getServices().filter((x) => x.slug !== s.slug)
  return (
    <>
      <section className="wrap flex flex-wrap items-center gap-14 pb-16 pt-10 md:pt-16">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
          <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/services" className="text-muted">Services</Link></nav>
          <Bar color={s.bar} className="h-7 w-16" />
          <h1 className="text-[clamp(40px,5vw,64px)] font-bold leading-[1.04] tracking-[-2px] text-navy">{s.name}</h1>
          <p className="text-[19px] leading-[1.55] text-ink-2">{s.intro}</p>
          <CheckList items={s.includes} />
          <Link href={`/start?service=${encodeURIComponent(s.startService)}`} className={buttonClass('primary', 'mt-2 self-start')}>Start this project</Link>
        </div>
        <div className="relative aspect-[4/3] min-w-0 flex-[1_1_480px] overflow-hidden rounded-feature bg-navy-soft">
          <Image src={s.image} alt={s.imageAlt} fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
      {s.calculator && (
        <section id="calculator" className="bg-surface">
          <div className="wrap flex flex-col gap-8 py-20">
            <h2 className="text-[clamp(32px,4vw,48px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">What will my kitchen cost?</h2>
            <Calculator />
          </div>
        </section>
      )}
      <section className="wrap flex flex-col gap-6 py-20">
        <h2 className="text-2xl font-bold text-navy">Other services</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}><Link href={`/services/${o.slug}`} className="flex h-full flex-col gap-1 rounded-panel border border-hairline p-6 no-underline">
              <span className="font-bold text-navy">{o.name}</span><span className="text-sm text-ink-2">{o.summary}</span>
            </Link></li>
          ))}
        </ul>
        <p className="text-sm text-ink-2">Questions? <a href={`https://wa.me/${site.whatsapp}`}>WhatsApp us</a>.</p>
      </section>
    </>
  )
}
```

`startService` (Task 4) maps each service to the matching Start-form option, so the form pre-selects it.

`app/(site)/kitchen-cost-calculator/page.tsx`:
```tsx
import Link from 'next/link'
import { Calculator } from '@/components/calculator'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Modular kitchen cost calculator (Pakistan, 2026)',
  description: 'Estimate your modular kitchen cost in PKR by running feet. Based on Fitin Comfort-tier rates; get an exact quote after a free site visit.',
  path: '/kitchen-cost-calculator',
})

export default function CalculatorPage() {
  return (
    <section className="bg-surface">
      <div className="wrap flex flex-col gap-8 py-14 md:py-20">
        <div className="flex max-w-[680px] flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Cost calculator</span>
          <h1 className="text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-1.6px] text-navy">What will my kitchen cost?</h1>
          <p className="text-[17px] text-ink-2">Slide to your kitchen&apos;s running length — measure along the wall where cabinets will go.</p>
        </div>
        <Calculator />
        <div className="flex max-w-[680px] flex-col gap-3 text-ink-2">
          <h2 className="text-xl font-bold text-navy">How this estimate works</h2>
          <p>The range uses Fitin&apos;s Comfort-tier rate for modular kitchens. Final prices depend on materials, hardware, appliances and your site, so your designer confirms an exact, itemised quote after a free visit.</p>
          <p>Planning a whole kitchen? See <Link href="/services/modular-kitchens-wardrobes">modular kitchens &amp; wardrobes</Link>.</p>
        </div>
      </div>
    </section>
  )
}
```

- [x] **Step 6: Run the tests** — `npx playwright test e2e/services.spec.ts && npx vitest run` — Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add components/calculator.tsx app/\(site\)/services app/\(site\)/kitchen-cost-calculator e2e/services.spec.ts
git commit -m "feat: services, service pages and kitchen cost calculator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Lead pipeline — rate limiter, Supabase + Resend, `/api/leads`, migration

**Files:**
- Create: `lib/rate-limit.ts`, `lib/leads.ts`, `app/api/leads/route.ts`, `supabase/migrations/20261017000000_create_leads.sql`, `.env.example`, `tests/rate-limit.test.ts`, `tests/api-leads.test.ts`
- Generated: `supabase/config.toml` (via `supabase init`)

**Interfaces:**
- Consumes: `leadSchema, errorMap, type LeadInput` from `lib/rules.ts`.
- Produces:
  - `createRateLimiter({ limit, windowMs }): (key: string, now?: number) => boolean`.
  - `type Lead = { type: 'project'|'partner'|'contact'; name: string; phone?: string; email?: string; city?: string; payload: Record<string, unknown>; sourcePath?: string }`.
  - `toLead(input: LeadInput, sourcePath?: unknown): Lead`, `escapeHtml(s: string): string`, `leadSubject(l: Lead): string`, `leadEmailHtml(l: Lead): string`, `saveLead(l, env?) → Promise<string | null>`, `markEmailSent(id, env?) → Promise<void>`, `sendLeadEmail(l, env?) → Promise<boolean>`.
  - HTTP contract used by Task 10: `POST /api/leads` JSON body = form values + `type` + `website` (honeypot, must be `''`) + `elapsedMs` (client-measured ms since page load) + `sourcePath`. Responses: `200 {ok:true}`; `400 {error:'invalid', fieldErrors: Record<string,string>}`; `413`; `415`; `429 {error:'rate_limited'}`; `502 {error:'unavailable'}`.
- Before writing the migration, invoke the `supabase:supabase-postgres-best-practices` skill.

- [x] **Step 1: Write the failing rate-limiter test** — `tests/rate-limit.test.ts`

```ts
import { expect, test } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

test('allows `limit` hits per window per key', () => {
  const hit = createRateLimiter({ limit: 2, windowMs: 1000 })
  expect(hit('a', 0)).toBe(true)
  expect(hit('a', 10)).toBe(true)
  expect(hit('a', 20)).toBe(false)
  expect(hit('b', 20)).toBe(true)
  expect(hit('a', 1011)).toBe(true)
})
```

- [x] **Step 2: Write the failing API test** — `tests/api-leads.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '@/app/api/leads/route'

const SUPA = 'https://proj.supabase.co'
const ID = '11111111-1111-4111-8111-111111111111'
let calls: { url: string; body: string }[] = []

function mockFetch({ save = true, email = true } = {}) {
  calls = []
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, body: String(init?.body ?? '') })
    if (url === `${SUPA}/rest/v1/leads?select=id`) return save ? Response.json([{ id: ID }], { status: 201 }) : new Response('down', { status: 503 })
    if (url.startsWith(`${SUPA}/rest/v1/leads?id=eq.`)) return new Response(null, { status: 204 })
    if (url === 'https://api.resend.com/emails') return email ? Response.json({ id: 'e1' }) : new Response('err', { status: 500 })
    throw new Error(`unexpected fetch ${url}`)
  }))
}

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', SUPA)
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('LEADS_FROM', 'Fitin <leads@fitin.space>')
  vi.stubEnv('LEADS_TO', 'hello@fitin.space')
  mockFetch()
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

let ip = 0
const project = {
  type: 'project', space: 'Kitchen', city: 'Lahore', service: 'Renovation', size: '', style: 'Contemporary',
  budget: 'Not sure yet', name: 'Ayesha Khan', phone: '0300 1234567', email: '', whatsappUpdates: true,
  website: '', elapsedMs: 9000, sourcePath: '/start',
}
const contact = { type: 'contact', name: 'Ali', contact: 'ali@example.com', topic: 'Something else', message: 'Hello there, a question.', website: '', elapsedMs: 9000 }

function req(body: unknown, opts: { ip?: string; type?: string; raw?: string } = {}) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'content-type': opts.type ?? 'application/json', 'x-forwarded-for': opts.ip ?? `10.0.0.${++ip}` },
    body: opts.raw ?? JSON.stringify(body),
  })
}

describe('POST /api/leads', () => {
  test('saves first, then emails, then marks the email sent', async () => {
    const res = await POST(req(project))
    expect(res.status).toBe(200)
    expect(calls.map((c) => c.url)).toEqual([
      `${SUPA}/rest/v1/leads?select=id`, 'https://api.resend.com/emails', `${SUPA}/rest/v1/leads?id=eq.${ID}`,
    ])
    const saved = JSON.parse(calls[0].body)
    expect(saved).toMatchObject({ type: 'project', name: 'Ayesha Khan', phone: '+923001234567', city: 'Lahore', source_path: '/start' })
    expect(saved.payload).toMatchObject({ space: 'Kitchen', service: 'Renovation', style: 'Contemporary' })
    expect(JSON.parse(calls[1].body).subject).toBe('New project lead: Kitchen · Lahore')
  })

  test('keeps an Urdu name intact', async () => {
    await POST(req({ ...project, name: 'عائشہ خان' }))
    expect(JSON.parse(calls[0].body).name).toBe('عائشہ خان')
  })

  test('escapes HTML in the email and sets reply_to', async () => {
    await POST(req({ ...contact, message: '<script>alert(1)</script> hello there' }))
    const mail = JSON.parse(calls[1].body)
    expect(mail.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(mail.html).not.toContain('<script>')
    expect(mail.reply_to).toBe('ali@example.com')
  })

  test('400 with field errors on invalid input', async () => {
    const res = await POST(req({ ...project, phone: '042 35761234' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid', fieldErrors: { phone: 'Enter a Pakistani mobile number, e.g. 0300 1234567.' } })
    expect(calls).toHaveLength(0)
  })

  test('honeypot and too-fast submissions get a silent 200 and are not stored', async () => {
    expect((await POST(req({ ...project, website: 'spam.example' }))).status).toBe(200)
    expect((await POST(req({ ...project, elapsedMs: 800 }))).status).toBe(200)
    expect(calls).toHaveLength(0)
  })

  test('uses client-measured elapsedMs, not a timestamp (clock skew safe)', async () => {
    const res = await POST(req({ ...project, startedAt: Date.now() + 3_600_000, elapsedMs: 9000 }))
    expect(res.status).toBe(200)
    expect(calls.length).toBeGreaterThan(0)
  })

  test('still 200 when only the save or only the email works', async () => {
    mockFetch({ save: false })
    expect((await POST(req(project))).status).toBe(200)
    mockFetch({ email: false })
    expect((await POST(req(project))).status).toBe(200)
    expect(calls.some((c) => c.url.includes('id=eq.'))).toBe(false)
  })

  test('502 when both save and email fail', async () => {
    mockFetch({ save: false, email: false })
    const res = await POST(req(project))
    expect(res.status).toBe(502)
  })

  test('rejects wrong content type and oversized bodies', async () => {
    expect((await POST(req(project, { type: 'text/plain' }))).status).toBe(415)
    expect((await POST(req(null, { raw: JSON.stringify({ ...project, message: 'x'.repeat(11_000) }) }))).status).toBe(413)
    expect((await POST(req(null, { raw: '{not json' }))).status).toBe(400)
  })

  test('rate limits to 5 per 10 minutes per IP', async () => {
    for (let i = 0; i < 5; i++) expect((await POST(req(project, { ip: '9.9.9.9' }))).status).toBe(200)
    expect((await POST(req(project, { ip: '9.9.9.9' }))).status).toBe(429)
  })
})
```

- [x] **Step 3: Run to verify failure** — `npx vitest run tests/rate-limit.test.ts tests/api-leads.test.ts` — Expected: FAIL (modules not found).

- [x] **Step 4: Implement `lib/rate-limit.ts`**

```ts
// ponytail: in-memory and per-process, so it resets on restart and isn't shared between instances.
// Fine for one Hostinger Node process; move to a Supabase table or Redis if the site is scaled out.
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    const allowed = recent.length < limit
    if (allowed) recent.push(now)
    hits.set(key, recent)
    if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
    return allowed
  }
}
```

- [x] **Step 5: Implement `lib/leads.ts`**

```ts
import type { LeadInput } from './rules'

export type Lead = {
  type: 'project' | 'partner' | 'contact'
  name: string
  phone?: string
  email?: string
  city?: string
  payload: Record<string, unknown>
  sourcePath?: string
}
type Env = Record<string, string | undefined>

const cleanPath = (p: unknown) => (typeof p === 'string' && /^\/[\w\-/]{0,199}$/.test(p) ? p : undefined)

export function toLead(input: LeadInput, sourcePath?: unknown): Lead {
  const path = cleanPath(sourcePath)
  switch (input.type) {
    case 'project': {
      const { type, name, phone, email, city, ...payload } = input
      return { type, name, phone, email, city, payload, sourcePath: path }
    }
    case 'partner': {
      const { type, name, phone, city, ...payload } = input
      return { type, name, phone, city, payload, sourcePath: path }
    }
    case 'contact': {
      const { type, name, contact, ...payload } = input
      return { type, name, ...(contact.startsWith('+92') ? { phone: contact } : { email: contact }), payload, sourcePath: path }
    }
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const oneLine = (s: unknown) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim()

export function leadSubject(l: Lead): string {
  const p = l.payload
  if (l.type === 'project') return oneLine(`New project lead: ${p.space} · ${l.city}`)
  if (l.type === 'partner') return oneLine(`New ${String(p.role).toLowerCase()} application: ${l.name} · ${l.city}`)
  return oneLine(`New message: ${p.topic}`)
}

const LABELS: Record<string, string> = {
  space: 'Space', service: 'Service', size: 'Size (sq ft)', style: 'Style', budget: 'Budget', whatsappUpdates: 'WhatsApp updates',
  design: 'Design', role: 'Role', business: 'Studio / business', portfolio: 'Portfolio', specialties: 'Specialties', topic: 'Topic', message: 'Message',
}

export function leadEmailHtml(l: Lead): string {
  const fmt = (v: unknown) => (Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v))
  const rows: [string, unknown][] = [
    ['Name', l.name], ['Phone', l.phone], ['Email', l.email], ['City', l.city],
    ...Object.entries(l.payload).map(([k, v]) => [LABELS[k] ?? k, v] as [string, unknown]),
    ['Page', l.sourcePath],
  ]
  const body = rows
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5B6573;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;color:#1F2733">${escapeHtml(fmt(v)).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><h2 style="color:#0E2340;margin:0 0 12px">${escapeHtml(leadSubject(l))}</h2><table cellpadding="0" cellspacing="0">${body}</table></div>`
}

function supabaseHeaders(key: string): Record<string, string> {
  const h: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}` // legacy service_role JWT; new sb_secret_ keys go in apikey only
  return h
}

export async function saveLead(l: Lead, env: Env = process.env): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return null
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/leads?select=id`, {
      method: 'POST',
      headers: { ...supabaseHeaders(env.SUPABASE_SECRET_KEY), Prefer: 'return=representation' },
      body: JSON.stringify({
        type: l.type, name: l.name, phone: l.phone ?? null, email: l.email ?? null, city: l.city ?? null,
        payload: l.payload, source_path: l.sourcePath ?? null,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const rows = (await res.json()) as { id: string }[]
    return rows[0]?.id ?? null
  } catch {
    return null
  }
}

export async function markEmailSent(id: string, env: Env = process.env): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: supabaseHeaders(env.SUPABASE_SECRET_KEY), body: JSON.stringify({ email_sent: true }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    /* best effort: the lead is already saved and emailed */
  }
}

export async function sendLeadEmail(l: Lead, env: Env = process.env): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.LEADS_FROM || !env.LEADS_TO) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEADS_FROM, to: [env.LEADS_TO], subject: leadSubject(l), html: leadEmailHtml(l),
        ...(l.email && { reply_to: l.email }),
      }),
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}
```

- [x] **Step 6: Implement `app/api/leads/route.ts`**

```ts
import { markEmailSent, saveLead, sendLeadEmail, toLead } from '@/lib/leads'
import { createRateLimiter } from '@/lib/rate-limit'
import { errorMap, leadSchema } from '@/lib/rules'

export const runtime = 'nodejs'

const MAX_BYTES = 10_000
const MIN_FILL_MS = 3000
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status })

export async function POST(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json')) return json({ error: 'unsupported' }, 415)
  const raw = await req.text()
  if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413)

  let body: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'bad_json' }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return json({ error: 'bad_json' }, 400)
  }

  // Bots: answer like a success so they don't adapt, and store nothing.
  // ponytail: a browser autofilling the hidden field would be dropped silently; the field name avoids common autofill keys.
  if (typeof body.website === 'string' && body.website !== '') return json({ ok: true })
  if (typeof body.elapsedMs !== 'number' || body.elapsedMs < MIN_FILL_MS) return json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!limiter(ip)) return json({ error: 'rate_limited' }, 429)

  const result = leadSchema.safeParse(body)
  if (!result.success) return json({ error: 'invalid', fieldErrors: errorMap(result.error) }, 400)

  const lead = toLead(result.data, body.sourcePath)
  const id = await saveLead(lead)
  const emailed = await sendLeadEmail(lead)
  if (id && emailed) await markEmailSent(id)

  if (!id && !emailed) {
    console.error('[leads] save and email both failed', lead.type)
    return json({ error: 'unavailable' }, 502)
  }
  if (!id) console.error('[leads] save failed; lead was emailed only', lead.type)
  if (!emailed) console.error('[leads] email failed; lead saved', id)
  return json({ ok: true })
}
```

- [x] **Step 7: Run tests** — `npx vitest run tests/rate-limit.test.ts tests/api-leads.test.ts` — Expected: PASS.

- [x] **Step 8: Supabase CLI, config and migration**

```bash
npm i -D supabase
npx supabase init
```

`supabase/migrations/20261017000000_create_leads.sql`:
```sql
-- Leads from the website forms. Written only by the website server with the secret key.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('project', 'partner', 'contact')),
  name text not null check (char_length(name) between 2 and 100),
  phone text check (phone is null or phone ~ '^\+923\d{9}$'),
  email text check (email is null or char_length(email) <= 254),
  city text,
  payload jsonb not null default '{}'::jsonb,
  email_sent boolean not null default false,
  source_path text
);

comment on table public.leads is 'Website form submissions (project, partner, contact). Future CRM reads from here.';

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_type_created_at_idx on public.leads (type, created_at desc);

-- RLS on with no policies: the anon and authenticated roles (browser keys) can do nothing.
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
```

Apply any changes the best-practices skill flags before committing.

- [x] **Step 9: Verify the migration locally (Docker; first start downloads images and takes several minutes)**

```bash
npx supabase start
npx supabase db reset
npx supabase status -o env | grep -E 'API_URL|SECRET_KEY|ANON_KEY'
```

With the printed values:
```bash
curl -s -X POST "$API_URL/rest/v1/leads?select=id" -H "apikey: $SECRET_KEY" -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"type":"contact","name":"Test","email":"t@example.com","payload":{}}'
curl -s "$API_URL/rest/v1/leads" -H "apikey: $ANON_KEY"
```
Expected: first returns `[{"id":"…"}]`; second returns an error or `[]` (anon cannot read). If the CLI prints `SERVICE_ROLE_KEY` instead of `SECRET_KEY`, use that value (the code handles legacy JWT keys). Then `npx supabase stop`.

- [x] **Step 10: Write `.env.example`**

```bash
# Public site URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://fitin.space
# Supabase project (Settings → API). Use the SECRET key (sb_secret_…), never the publishable/anon key.
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SECRET_KEY=
# Resend (domain fitin.space must be verified in Resend first)
RESEND_API_KEY=
LEADS_FROM="Fitin Website <leads@fitin.space>"
LEADS_TO=hello@fitin.space
```

- [x] **Step 11: Run all unit tests and commit**

Run: `npm test` — Expected: PASS.

```bash
git add lib/rate-limit.ts lib/leads.ts app/api tests/rate-limit.test.ts tests/api-leads.test.ts supabase .env.example package.json package-lock.json
git commit -m "feat: lead endpoint saving to Supabase and emailing via Resend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Form building blocks and the Start project flow

**Files:**
- Create: `lib/use-lead-submit.ts`, `lib/whatsapp.ts`, `components/form/field.tsx`, `components/form/chips.tsx`, `components/form/honeypot.tsx`, `components/form/whatsapp-fallback.tsx`, `components/forms/start-form.tsx`, `app/start/page.tsx`, `e2e/start.spec.ts`

**Interfaces:**
- Consumes: `projectStep1–4, fieldErrors, SPACES, CITIES, SERVICE_OPTIONS, STYLE_OPTIONS, BUDGETS` (`lib/rules`); `/api/leads` contract (Task 9); `Logo` (`components/header`); icons; `buttonClass`.
- Produces (reused by Tasks 11–12):
  - `useLeadSubmit(type): { status: 'idle'|'sending'|'sent'|'failed'; submit(data: Record<string, unknown>): Promise<boolean>; reset(): void; serverErrors: Record<string,string>; honeypot: RefObject<HTMLInputElement | null> }`.
  - `whatsappLink(text: string): string`.
  - `TextField`, `TextArea`, `SelectField` (props: native attributes + `label`, `error?`, `hint?`, `optional?`), `ErrorText({ id, children })`.
  - `ChoiceChips({ legend, name, options, value, onChange, error })` (single, radios) and `MultiChips({ legend, name, options, values, onChange, error })` (checkboxes).
  - `Honeypot({ ref })`, `WhatsAppFallback({ summary })`.

- [x] **Step 1: Write the failing e2e test** — `e2e/start.spec.ts`

```ts
import { expect, test, type Page } from '@playwright/test'

async function mockApi(page: Page, status = 200) {
  let calls = 0
  await page.route('**/api/leads', async (route) => {
    calls++
    await new Promise((r) => setTimeout(r, 300))
    await route.fulfill({ status, json: status === 200 ? { ok: true } : { error: 'unavailable' } })
  })
  return () => calls
}

async function fillToStep4(page: Page) {
  await page.getByRole('radio', { name: 'Kitchen' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: 'Lahore' }).check()
  await page.getByRole('radio', { name: 'Renovation' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: 'Contemporary' }).check()
  await page.getByRole('radio', { name: 'Not sure yet' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
}

test('shows errors only after Continue and clears them live', async ({ page }) => {
  await page.goto('/start')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('alert')).toHaveText('Pick the space you want to work on.')
  await page.getByRole('radio', { name: 'Bedroom' }).check()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('prefills from the query string and keeps answers when going Back', async ({ page }) => {
  await page.goto('/start?space=Kitchen&city=Lahore')
  await expect(page.getByRole('radio', { name: 'Kitchen' })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('radio', { name: 'Lahore' })).toBeChecked()
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByRole('radio', { name: 'Kitchen' })).toBeChecked()
})

test('rejects a landline and accepts a mobile', async ({ page }) => {
  await mockApi(page)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('042 35761234')
  await page.getByRole('button', { name: 'Request my free quote' }).click()
  await expect(page.getByRole('alert')).toHaveText('Enter a Pakistani mobile number, e.g. 0300 1234567.')
})

test('submits once on a double click and shows the confirmation', async ({ page }) => {
  const calls = await mockApi(page)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('0300 1234567')
  await page.getByRole('button', { name: 'Request my free quote' }).dblclick()
  await expect(page.getByRole('heading', { name: 'Request received, Ayesha.' })).toBeVisible()
  expect(calls()).toBe(1)
})

test('offers WhatsApp when the server cannot take the lead', async ({ page }) => {
  await mockApi(page, 502)
  await page.goto('/start')
  await fillToStep4(page)
  await page.getByLabel('Full name').fill('Ayesha Khan')
  await page.getByLabel('Phone').fill('0300 1234567')
  await page.getByRole('button', { name: 'Request my free quote' }).click()
  const wa = page.getByRole('link', { name: 'Send it on WhatsApp' })
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/923111555264\?text=/)
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/start.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `lib/whatsapp.ts` and `lib/use-lead-submit.ts`**

```ts
import site from '@/content/site.json'

export const whatsappLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`
```

(Imports the JSON directly, not `lib/content.ts`, so it is safe in client bundles.)

```ts
'use client'
import { useRef, useState } from 'react'

export type SubmitStatus = 'idle' | 'sending' | 'sent' | 'failed'

export function useLeadSubmit(type: 'project' | 'partner' | 'contact') {
  const sending = useRef(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})

  async function submit(data: Record<string, unknown>): Promise<boolean> {
    if (sending.current) return false // a second tap while sending is ignored
    sending.current = true
    setStatus('sending')
    setServerErrors({})
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data, type,
          website: honeypot.current?.value ?? '',
          elapsedMs: Math.round(performance.now()), // measured on this device, so clock skew can't drop real leads
          sourcePath: window.location.pathname,
        }),
      })
      if (res.ok) { setStatus('sent'); return true }
      if (res.status === 400) {
        const j = (await res.json().catch(() => ({}))) as { fieldErrors?: Record<string, string> }
        setServerErrors(j.fieldErrors ?? {})
        setStatus('idle')
        return false
      }
      setStatus('failed')
      return false
    } catch {
      setStatus('failed')
      return false
    } finally {
      sending.current = false
    }
  }

  const reset = () => { setStatus('idle'); setServerErrors({}) }

  return { status, submit, reset, serverErrors, honeypot }
}
```

- [x] **Step 4: Write `components/form/field.tsx`**

```tsx
'use client'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertIcon } from '../icons'

export const ErrorText = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} role="alert" className="flex items-center gap-2 text-sm font-semibold text-error">
    <AlertIcon className="size-4 shrink-0" />{children}
  </p>
)

type Extra = { label: string; error?: string; hint?: string; optional?: boolean }
const control = (error?: string) =>
  `w-full rounded-btn border bg-white px-4 text-ink placeholder:text-muted ${error ? 'border-error' : 'border-line'}`

function Wrap({ id, label, optional, hint, error, children }: Extra & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-bold text-navy">
        {label}{optional && <span className="font-medium text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && <span id={`${id}-hint`} className="text-[13px] text-muted">{hint}</span>}
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  )
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined

export function TextField({ label, error, hint, optional, ...rest }: InputHTMLAttributes<HTMLInputElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} h-14`} {...rest} />
    </Wrap>
  )
}

export function TextArea({ label, error, hint, optional, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <textarea id={id} rows={5} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} resize-y py-3.5`} {...rest} />
    </Wrap>
  )
}

export function SelectField({ label, error, hint, optional, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & Extra) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint} optional={optional}>
      <select id={id} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control(error)} h-14`} {...rest}>{children}</select>
    </Wrap>
  )
}
```

- [x] **Step 5: Write `components/form/chips.tsx`, `honeypot.tsx`, `whatsapp-fallback.tsx`**

```tsx
'use client'
import { useId } from 'react'
import { ErrorText } from './field'

const chip = 'flex min-h-12 cursor-pointer items-center rounded-full border border-line bg-white px-5 text-[15px] font-semibold text-navy peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy'

type Base = { legend: string; name: string; options: readonly string[]; error?: string }

export function ChoiceChips({ legend, name, options, value, onChange, error }: Base & { value?: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-3 text-[15px] font-bold text-navy">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label key={o}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
            <span className={chip}>{o}</span>
          </label>
        ))}
      </div>
      {error && <div className="mt-2.5"><ErrorText id={`${id}-err`}>{error}</ErrorText></div>}
    </fieldset>
  )
}

export function MultiChips({ legend, name, options, values, onChange, error }: Base & { values: string[]; onChange: (v: string[]) => void }) {
  const id = useId()
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o])
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-3 text-sm font-bold text-navy">{legend} <span className="font-medium text-muted">(pick any)</span></legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label key={o}>
            <input type="checkbox" name={name} value={o} checked={values.includes(o)} onChange={() => toggle(o)} className="peer sr-only" />
            <span className={chip}>{o}</span>
          </label>
        ))}
      </div>
      {error && <div className="mt-2.5"><ErrorText id={`${id}-err`}>{error}</ErrorText></div>}
    </fieldset>
  )
}
```

`components/form/honeypot.tsx`:
```tsx
import type { Ref } from 'react'

// Hidden from people and assistive tech; bots fill it. Name avoids browser autofill keys.
export const Honeypot = ({ ref }: { ref: Ref<HTMLInputElement> }) => (
  <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
    <label>Leave this empty<input ref={ref} type="text" name="company_website_hp" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
  </div>
)
```

`components/form/whatsapp-fallback.tsx`:
```tsx
import { whatsappLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '../icons'

export function WhatsAppFallback({ summary }: { summary: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-panel bg-lime-soft p-5">
      <p className="font-bold text-navy">We couldn&apos;t send that just now.</p>
      <p className="text-sm text-[#3B4552]">Your details are below — send them to us on WhatsApp and we&apos;ll reply there.</p>
      <a href={whatsappLink(summary)} className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-navy px-5 font-semibold text-white hover:text-white">
        <WhatsAppIcon className="size-[18px]" />Send it on WhatsApp
      </a>
    </div>
  )
}
```

- [x] **Step 6: Write `components/forms/start-form.tsx`** (visual source `design/pages/Start.dc.html`, `PhoneStart.dc.html`)

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { ChoiceChips } from '@/components/form/chips'
import { ErrorText, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { useLeadSubmit } from '@/lib/use-lead-submit'
import {
  BUDGETS, CITIES, SERVICE_OPTIONS, SPACES, STYLE_OPTIONS,
  fieldErrors, projectStep1, projectStep2, projectStep3, projectStep4,
} from '@/lib/rules'

const SPACE_IMAGES: Record<(typeof SPACES)[number], string> = {
  'Living room': '/images/living-navy-sofa-teal-cushions.jpg', Kitchen: '/images/kitchen-open-white.jpg',
  Bedroom: '/images/bedroom-pendant-light.jpg', Bathroom: '/images/bathroom-double-vanity.jpg',
  Wardrobe: '/images/wardrobe-built-in.jpg', 'Home office': '/images/office-sunlit-desk.jpg',
  'Dining area': '/images/dining-classic.jpg', 'Full home': '/images/bedroom-navy-city-view.jpg',
  Commercial: '/images/hallway-built-in-storage.jpg',
}
const STEP_NAMES = ['Space', 'Location & service', 'Style & budget', 'Contact']
const SEG = ['bg-navy', 'bg-teal', 'bg-lime', 'bg-navy']
const STEP_SCHEMAS = [projectStep1, projectStep2, projectStep3, projectStep4]

type Values = {
  space?: string; city?: string; service?: string; size: string; style?: string; budget?: string
  name: string; phone: string; email: string; whatsappUpdates: boolean; design?: string
}

const pick = <T extends readonly string[]>(list: T, v: string | null) => (v && (list as readonly string[]).includes(v) ? v : undefined)

export function StartForm({ quoteHours }: { quoteHours: number }) {
  const params = useSearchParams()
  const [values, setValues] = useState<Values>(() => ({
    space: pick(SPACES, params.get('space')), city: pick(CITIES, params.get('city')),
    service: pick(SERVICE_OPTIONS, params.get('service')), size: '', name: '', phone: '', email: '',
    whatsappUpdates: true, design: /^[a-z0-9-]{1,100}$/.test(params.get('design') ?? '') ? params.get('design')! : undefined,
  }))
  const [step, setStep] = useState(1)
  const [tried, setTried] = useState(false)
  const { status, submit, serverErrors, honeypot } = useLeadSubmit('project')
  const top = useRef<HTMLHeadingElement>(null)

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((s) => ({ ...s, [k]: v }))
  const errors = { ...(tried ? fieldErrors(STEP_SCHEMAS[step - 1], values) : {}), ...serverErrors }

  const go = (n: number) => { setStep(n); setTried(false); requestAnimationFrame(() => top.current?.focus()) }
  const next = () => (Object.keys(fieldErrors(STEP_SCHEMAS[step - 1], values)).length ? setTried(true) : go(step + 1))
  const send = async () => {
    if (Object.keys(fieldErrors(projectStep4, values)).length) return setTried(true)
    await submit(values)
  }

  const summaryRows: [string, string | undefined][] = [
    ['Space', values.space], ['City', values.city], ['Service', values.service],
    ['Size', values.size ? `${values.size} sq ft` : undefined], ['Style', values.style], ['Budget', values.budget],
  ]
  const summaryText = `Hi Fitin, I'd like a quote. ${summaryRows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}. Name: ${values.name}. Phone: ${values.phone}.`

  if (status === 'sent') {
    const first = values.name.trim().split(/\s+/)[0]
    return (
      <section className="flex flex-col items-start gap-5 rounded-panel border border-hairline bg-white p-7 md:p-10">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-9 text-navy" /></span>
        <h1 className="text-[clamp(32px,4vw,40px)] font-bold leading-tight tracking-[-1.2px] text-navy">Request received{first ? `, ${first}` : ''}.</h1>
        <p className="max-w-[520px] text-lg text-ink-2">A Fitin advisor will call you within {quoteHours} hours to talk through your {values.space?.toLowerCase() ?? 'project'} and book a site visit.</p>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Link href="/designs" className={buttonClass('dark', 'w-full sm:w-auto')}>Browse designs meanwhile</Link>
          <Link href="/" className={buttonClass('outline', 'w-full sm:w-auto')}>Back to home</Link>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-wrap items-start gap-8">
      <section className="relative flex min-w-0 flex-[999_1_560px] flex-col gap-8 rounded-panel border border-hairline bg-white p-5 md:p-10">
        <Honeypot ref={honeypot} />
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm font-semibold text-muted"><span>Step {step} of 4</span><span>{STEP_NAMES[step - 1]}</span></div>
          <div aria-hidden className="grid grid-cols-4 gap-1.5">
            {SEG.map((c, i) => <span key={i} className={`h-1.5 rounded-full ${i < step ? c : 'bg-hairline'}`} />)}
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Which space are we working on?</h1>
              <p className="text-ink-2">Pick the main one. You can add more rooms with your designer later.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Space</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SPACES.map((s) => (
                  <label key={s} className="cursor-pointer">
                    <input type="radio" name="space" value={s} checked={values.space === s} onChange={() => set('space', s)} className="peer sr-only" />
                    <span className="block rounded-[18px] border-2 border-hairline bg-white p-2 peer-checked:border-navy peer-checked:shadow-[0_0_0_4px_#E8ECF2] peer-focus-visible:outline-2 peer-focus-visible:outline-navy">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-navy-soft">
                        <Image src={SPACE_IMAGES[s]} alt="" fill sizes="(min-width: 640px) 200px, 45vw" className="object-cover" />
                      </span>
                      <span className="flex items-center justify-between px-1 pb-0.5 pt-2.5 text-[15px] font-bold text-navy">
                        {s}{values.space === s && <span className="flex size-[22px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-3" /></span>}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.space && <ErrorText id="space-err">{errors.space}</ErrorText>}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-7">
            <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Where is it, and what do you need?</h1>
            <ChoiceChips legend="City" name="city" options={CITIES} value={values.city} onChange={(v) => set('city', v)} error={errors.city} />
            <ChoiceChips legend="Service" name="service" options={SERVICE_OPTIONS} value={values.service} onChange={(v) => set('service', v)} error={errors.service} />
            <div className="max-w-80">
              <TextField label="Approximate size (sq ft)" optional inputMode="numeric" placeholder="e.g. 220" value={values.size}
                onChange={(e) => set('size', e.target.value)} hint="Not sure? Leave it blank and we'll measure on site." error={errors.size} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Your style and budget</h1>
              <p className="text-ink-2">A starting point only. Everything stays 100% customisable.</p>
            </div>
            <ChoiceChips legend="Style" name="style" options={STYLE_OPTIONS} value={values.style} onChange={(v) => set('style', v)} error={errors.style} />
            <ChoiceChips legend="Budget" name="budget" options={BUDGETS} value={values.budget} onChange={(v) => set('budget', v)} error={errors.budget} />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 ref={top} tabIndex={-1} className="text-[clamp(28px,3vw,34px)] font-bold leading-tight tracking-[-1px] text-navy outline-none">Where should we send your quote?</h1>
              <p className="text-ink-2">A Fitin advisor will call you within {quoteHours} hours. No spam, no commitment.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Full name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
              <div className="sm:col-span-2">
                <TextField label="Email" optional type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
              </div>
            </div>
            <label className="flex items-center gap-3 text-[15px]">
              <input type="checkbox" checked={values.whatsappUpdates} onChange={(e) => set('whatsappUpdates', e.target.checked)} className="size-5 accent-navy" />
              Send me project updates on WhatsApp
            </label>
            {status === 'failed' && <WhatsAppFallback summary={summaryText} />}
            <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
          </div>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-between gap-3 border-t border-hairline bg-white px-5 pb-5 pt-4 md:static md:m-0 md:p-0 md:pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => go(step - 1)} className="h-12 px-2 font-semibold text-navy underline underline-offset-4">Back</button>
          ) : <span className="text-sm text-muted md:invisible">Step 1 of 4</span>}
          {step < 4 ? (
            <button type="button" onClick={next} className={buttonClass('dark')}>Continue</button>
          ) : (
            <button type="button" onClick={send} disabled={status === 'sending'} className={buttonClass('primary', 'disabled:opacity-60')}>
              {status === 'sending' ? 'Sending…' : 'Request my free quote'}
            </button>
          )}
        </div>
      </section>

      <aside aria-label="Your project summary" className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-panel bg-white p-7 shadow-float">
          <h2 className="text-xl font-bold text-navy">Your project</h2>
          <dl>
            {summaryRows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-hairline py-2.5 text-[15px]">
                <dt className="text-muted">{k}</dt><dd className={`text-right font-semibold ${v ? 'text-navy' : 'text-muted'}`}>{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4 rounded-panel bg-navy p-7 text-white">
          <h2 className="text-lg font-bold">What happens next</h2>
          <ol className="flex flex-col gap-3.5 text-[15px]">
            {([['#9ED6D6', `We call you within ${quoteHours} hours`], ['#229E9F', "You're matched with a verified designer near you"], ['#B6D22A', 'You get a tailored, itemised quote']] as const).map(([c, t]) => (
              <li key={t} className="flex items-start gap-3">
                <svg aria-hidden viewBox="0 0 64 28" className="mt-1 h-4 w-9 shrink-0"><path d="M0 14L64 0v14L0 28z" fill={c} /></svg>{t}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  )
}
```

- [x] **Step 7: Write `app/start/page.tsx`** (focused layout: no site header/footer)

```tsx
import Link from 'next/link'
import { Suspense } from 'react'
import { StartForm } from '@/components/forms/start-form'
import { Logo } from '@/components/header'
import { WhatsAppIcon } from '@/components/icons'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Start your project — free quote',
  description: `Tell us about your space and get a free, tailored quote from a verified Fitin designer within ${site.claims.quoteHours} hours.`,
  path: '/start',
})

export default function StartPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1160px] items-center justify-between gap-3 px-5 md:min-h-[76px] md:px-10">
          <Logo size={36} />
          <div className="flex items-center gap-2 text-sm">
            <a href={`https://wa.me/${site.whatsapp}`} className="hidden items-center gap-2 rounded-full px-3.5 py-2.5 font-semibold no-underline sm:flex">
              <WhatsAppIcon className="size-[18px] text-teal-dark" />Questions? WhatsApp us
            </a>
            <Link href="/" className="rounded-full border border-line bg-white px-4 py-2.5 font-semibold no-underline">Exit</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-5 pb-20 pt-6 md:px-10 md:pt-12">
        <Suspense fallback={<p className="rounded-panel bg-white p-10 text-2xl font-bold text-navy">Which space are we working on?</p>}>
          <StartForm quoteHours={site.claims.quoteHours} />
        </Suspense>
      </main>
    </div>
  )
}
```

- [x] **Step 8: Run tests** — `npx playwright test e2e/start.spec.ts` — Expected: PASS on desktop and phone.

- [x] **Step 9: Commit**

```bash
git add lib/use-lead-submit.ts lib/whatsapp.ts components/form components/forms/start-form.tsx app/start e2e/start.spec.ts
git commit -m "feat: four-step Start project form with inline errors and WhatsApp fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: For designers page and partner application

**Files:**
- Create: `components/forms/partner-form.tsx`, `components/faq.tsx`, `app/(site)/for-designers/page.tsx`, `e2e/for-designers.spec.ts`

**Interfaces:**
- Consumes: `useLeadSubmit`, `TextField, SelectField, ChoiceChips, MultiChips, Honeypot, WhatsAppFallback`, `partnerSchema, fieldErrors, ROLES, CITIES, SPECIALTIES` (`lib/rules`), `site`, UI.
- Produces: `PartnerForm()`; `Faq({ items: { q: string; a: string }[] })` built on native `<details>` (no client JS).
- Visual source: `design/pages/Designers.dc.html`, `PhoneDesigners.dc.html`.
- Copy rule: the FAQ "Is there a fee to join?" is **omitted** until Fitin supplies the answer (no placeholder ships).

- [x] **Step 1: Write the failing test** — `e2e/for-designers.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('partner application validates and submits', async ({ page }) => {
  let body: Record<string, unknown> = {}
  await page.route('**/api/leads', async (route) => { body = route.request().postDataJSON(); await route.fulfill({ json: { ok: true } }) })
  await page.goto('/for-designers')
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByText('Pick at least one specialty.')).toBeVisible()
  await expect(page.getByText('Add a link to your work so we can review it.')).toBeVisible()

  await page.getByRole('radio', { name: 'Vendor' }).check()
  await expect(page.getByLabel('Business name')).toBeVisible()
  await page.getByLabel('Full name').fill('Sara Khan')
  await page.getByLabel('City').selectOption('Lahore')
  await page.getByLabel('Phone').fill('0321 1234567')
  await page.getByLabel('Portfolio or Instagram link').fill('@sara.designs')
  await page.getByRole('checkbox', { name: 'Kitchens' }).check()
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByRole('heading', { name: 'Application received.' })).toBeVisible()
  expect(body).toMatchObject({ type: 'partner', role: 'Vendor', specialties: ['Kitchens'] })
})

test('FAQ answers expand natively', async ({ page }) => {
  await page.goto('/for-designers')
  await page.getByText('How do referral payouts work?').click()
  await expect(page.getByText(/5% commission/)).toBeVisible()
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/for-designers.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `components/faq.tsx`**

```tsx
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="flex flex-col">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-b border-hairline">
          <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-bold text-navy [&::-webkit-details-marker]:hidden">
            {q}
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-xl transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="pb-4.5 text-[15px] text-ink-2">{a}</p>
        </details>
      ))}
    </div>
  )
}
```

- [x] **Step 4: Write `components/forms/partner-form.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChoiceChips, MultiChips } from '@/components/form/chips'
import { SelectField, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { CITIES, ROLES, SPECIALTIES, fieldErrors, partnerSchema } from '@/lib/rules'
import { useLeadSubmit } from '@/lib/use-lead-submit'

export function PartnerForm() {
  const [v, setV] = useState({ role: 'Designer', name: '', business: '', city: '', phone: '', portfolio: '', specialties: [] as string[] })
  const [tried, setTried] = useState(false)
  const { status, submit, serverErrors, honeypot } = useLeadSubmit('partner')
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const errors = { ...(tried ? fieldErrors(partnerSchema, v) : {}), ...serverErrors }

  const onSubmit = async () => {
    if (Object.keys(fieldErrors(partnerSchema, v)).length) return setTried(true)
    await submit(v)
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-lime"><CheckIcon className="size-9 text-navy" /></span>
        <h2 className="text-[34px] font-bold tracking-[-1px] text-navy">Application received.</h2>
        <p className="max-w-md text-[17px] text-ink-2">Our partnerships team will review your work and contact you on WhatsApp or by phone.</p>
        <Link href="/" className={buttonClass('dark')}>Back to home</Link>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="relative flex flex-col gap-6">
      <Honeypot ref={honeypot} />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[32px] font-bold tracking-[-0.8px] text-navy">Apply to join Fitin</h2>
        <p className="text-ink-2">Takes about three minutes.</p>
      </div>
      <ChoiceChips legend="I am a" name="role" options={ROLES} value={v.role} onChange={(x) => set('role', x)} error={errors.role} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <TextField label={v.role === 'Vendor' ? 'Business name' : 'Studio name'} optional autoComplete="organization" value={v.business} onChange={(e) => set('business', e.target.value)} />
        <SelectField label="City" value={v.city} onChange={(e) => set('city', e.target.value)} error={errors.city}>
          <option value="" disabled>Choose a city</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </SelectField>
        <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" value={v.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
        <div className="sm:col-span-2">
          <TextField label="Portfolio or Instagram link" inputMode="url" placeholder="instagram.com/yourstudio" value={v.portfolio} onChange={(e) => set('portfolio', e.target.value)} error={errors.portfolio} />
        </div>
      </div>
      <MultiChips legend="Specialties" name="specialties" options={SPECIALTIES} values={v.specialties} onChange={(x) => set('specialties', x)} error={errors.specialties} />
      {status === 'failed' && <WhatsAppFallback summary={`Hi Fitin, I'd like to join as a ${v.role.toLowerCase()}. Name: ${v.name}. City: ${v.city}. Phone: ${v.phone}. Work: ${v.portfolio}.`} />}
      <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
      <button type="submit" disabled={status === 'sending'} className={buttonClass('primary', 'self-start disabled:opacity-60')}>
        {status === 'sending' ? 'Sending…' : 'Submit application'}
      </button>
    </form>
  )
}
```

`fieldErrors(partnerSchema, v)` reports `city` with `MSG.city` because `''` is not in the enum — matches the design copy.

- [x] **Step 5: Write `app/(site)/for-designers/page.tsx`**

```tsx
import Image from 'next/image'
import { Faq } from '@/components/faq'
import { PartnerForm } from '@/components/forms/partner-form'
import { WhatsAppIcon } from '@/components/icons'
import { Bar, Eyebrow, SectionHead, buttonClass } from '@/components/ui'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'For interior designers & furniture vendors',
  description: `Join Fitin's network of verified designers and vendors. Get matched with homeowners across ${site.cities.length} cities in Pakistan.`,
  path: '/for-designers',
})

const BENEFITS = [
  ['bg-navy-soft', 'Get matched with clients', 'Homeowners are matched to you by city, project type and style, so the requests you get fit the work you do.'],
  ['bg-teal-soft', 'Run projects in one place', 'Mood boards, quotes, vendors and delivery tracking, all shared with your client on one platform.'],
  ['bg-lime-soft', 'Earn on referrals', 'Refer a client and earn a 5% commission, paid out within 7 days.'],
] as const

const STEPS = [
  ['navy', 'Apply', 'Share your details, specialties and portfolio.'],
  ['teal', 'Get verified', 'Our team reviews your work and confirms your details.'],
  ['lime', 'Get matched', 'Receive project requests that fit your city and style.'],
  ['navy', 'Deliver & get paid', 'Run the project on Fitin and get paid as milestones complete.'],
] as const

const FAQ = [
  { q: 'Who can apply?', a: `Interior designers, furniture makers and material vendors working in ${site.cities.join(', ')}.` },
  { q: 'How are projects matched?', a: "By the homeowner's city, project type, style and budget, compared against your specialties and portfolio." },
  { q: 'How do referral payouts work?', a: 'When a client you refer starts a project, you earn a 5% commission, paid out within 7 days.' },
]

export default function ForDesignersPage() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="wrap flex flex-wrap items-center gap-14 py-14 md:py-[72px]">
          <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-6">
            <Eyebrow onNavy>For designers &amp; vendors</Eyebrow>
            <h1 className="text-[clamp(42px,5.6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px]">You design it.<br />We bring the <span className="text-lime">clients</span>.</h1>
            <p className="max-w-[520px] text-[19px] leading-[1.55] text-on-navy">Join Fitin&apos;s network of verified designers and vendors. Get matched with homeowners across {site.cities.length} cities, and run every project from one platform.</p>
            <div className="flex flex-wrap gap-3">
              <a href="#apply" className={buttonClass('primary')}>Apply to join</a>
              <a href="#steps" className="inline-flex min-h-14 items-center rounded-full border border-white/50 px-6 font-semibold text-white hover:text-white">How it works</a>
            </div>
            <dl className="mt-4 flex flex-wrap gap-7">
              {([[site.stats.designers, 'Designers already on Fitin', 'border-lime'], [site.stats.vendors, 'Trusted vendors', 'border-teal'], [String(site.cities.length), 'Cities', 'border-white']] as const).map(([n, l, b]) => (
                <div key={l} className={`flex flex-col-reverse border-t-2 pt-2.5 ${b}`}><dt className="text-sm text-on-navy">{l}</dt><dd className="text-[32px] font-bold tracking-[-1px]">{n}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/4.4] min-w-0 flex-[1_1_420px] overflow-hidden rounded-feature bg-navy-2">
            <Image src="/images/kitchen-green-glasshouse.jpg" alt="A green kitchen in a glass house filled with plants" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="wrap flex flex-col gap-10 py-20">
        <SectionHead title="Spend your time designing, not chasing leads." />
        <div className="grid gap-5 md:grid-cols-3">
          {BENEFITS.map(([bg, t, d]) => (
            <div key={t} className="flex flex-col gap-3.5 rounded-panel border border-hairline p-8">
              <span aria-hidden className={`size-[52px] rounded-2xl ${bg}`} />
              <h3 className="text-[21px] font-bold text-navy">{t}</h3><p className="text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="steps" className="scroll-mt-24 bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead eyebrow="How joining works" title="Four steps to your first project." />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([c, t, d], i) => (
              <li key={t} className="flex flex-col gap-2.5 rounded-panel bg-white p-7">
                <Bar color={c} /><span className="text-sm font-bold text-muted">Step {i + 1}</span>
                <h3 className="text-xl font-bold text-navy">{t}</h3><p className="text-[15px] text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" className="wrap flex scroll-mt-24 flex-wrap items-start gap-14 py-20">
        <div className="min-w-0 flex-[999_1_560px] rounded-feature border border-hairline bg-white p-6 shadow-float md:p-10"><PartnerForm /></div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <h2 className="mb-2 text-[26px] font-bold tracking-[-0.5px] text-navy">Questions</h2>
          <Faq items={FAQ} />
          <a href={`https://wa.me/${site.whatsapp}`} className="mt-2 flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4">
            <WhatsAppIcon className="size-[18px] text-teal-dark" />Ask our partnerships team on WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
```

- [x] **Step 6: Run tests** — `npx playwright test e2e/for-designers.spec.ts` — Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add components/faq.tsx components/forms/partner-form.tsx app/\(site\)/for-designers e2e/for-designers.spec.ts
git commit -m "feat: for-designers page with partner application

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: About, Contact, Privacy, Terms and 404

**Files:**
- Create: `components/forms/contact-form.tsx`, `components/legal-tabs.tsx`, `components/legal-doc.tsx`, `components/not-found-bars.tsx`, `app/(site)/about/page.tsx`, `app/(site)/contact/page.tsx`, `app/(site)/privacy/page.tsx`, `app/(site)/terms/page.tsx`, `app/not-found.tsx`, `e2e/pages.spec.ts`
- Modify: `content/site.json` (add `"legalReviewed": false`, `"legalUpdated": "2026-10-17"`), `lib/content.ts` (`siteSchema` gains `legalReviewed: z.boolean()`, `legalUpdated: z.iso.date()`)

**Interfaces:**
- Consumes: form blocks from Task 10, `contactSchema, TOPICS, fieldErrors`, `site`, UI, `Logo`.
- Produces: `ContactForm()`, `LegalTabs({ active: 'privacy' | 'terms' })`, `LegalDoc({ title, active, sections: LegalSection[] })`, `NotFoundBars()`.
- Visual source: `design/pages/About.dc.html`, `Legal.dc.html`, `NotFound.dc.html` and phone versions.
- **Legal text rule:** the privacy policy and terms below are complete drafts with the disclosures AdSense requires; `site.legalReviewed` stays `false` until Fitin's counsel approves them, and the launch check (Task 17) blocks deploy while it is `false`.

- [x] **Step 1: Write the failing test** — `e2e/pages.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('contact form validates phone-or-email and sends', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ json: { ok: true } }))
  await page.goto('/contact')
  await page.getByLabel('Name').fill('Ali')
  await page.getByLabel('Phone or email').fill('ali at home')
  await page.getByLabel('Message').fill('Hi')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Enter a valid email, or a mobile number like 0300 1234567.')).toBeVisible()
  await expect(page.getByText('Tell us a little more (at least 10 characters).')).toBeVisible()
  await page.getByLabel('Phone or email').fill('ali@example.com')
  await page.getByLabel('Message').fill('Do you work in Multan?')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
})

test('privacy policy carries the AdSense disclosures', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy policy')
  await expect(page.getByText(/third-party vendors, including Google, use cookies/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Google Ads Settings' })).toHaveAttribute('href', 'https://adssettings.google.com')
  await page.getByRole('link', { name: 'Terms of service' }).click()
  await expect(page).toHaveURL('/terms')
})

test('about page and 404 page', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Connecting')
  const res = await page.goto('/this-does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page doesn't fit.")
  await page.getByRole('button', { name: 'Put it back together' }).click()
  await expect(page.getByRole('button', { name: 'Knock it over again' })).toBeVisible()
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/pages.spec.ts` — Expected: FAIL.

- [x] **Step 3: Update site data** — add to `content/site.json`: `"legalReviewed": false, "legalUpdated": "2026-10-17"`; add to `siteSchema` in `lib/content.ts`: `legalReviewed: z.boolean(), legalUpdated: z.iso.date(),`. Run `npx vitest run tests/content.test.ts` — Expected: PASS.

- [x] **Step 4: Write `components/forms/contact-form.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SelectField, TextArea, TextField } from '@/components/form/field'
import { Honeypot } from '@/components/form/honeypot'
import { WhatsAppFallback } from '@/components/form/whatsapp-fallback'
import { CheckIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui'
import { TOPICS, contactSchema, fieldErrors } from '@/lib/rules'
import { useLeadSubmit } from '@/lib/use-lead-submit'

const EMPTY = { name: '', contact: '', topic: TOPICS[0] as string, message: '' }

export function ContactForm() {
  const [v, setV] = useState(EMPTY)
  const [tried, setTried] = useState(false)
  const { status, submit, reset, serverErrors, honeypot } = useLeadSubmit('contact')
  const set = (k: keyof typeof EMPTY, val: string) => setV((s) => ({ ...s, [k]: val }))
  const errors = { ...(tried ? fieldErrors(contactSchema, v) : {}), ...serverErrors }
  const onSubmit = async () => {
    if (Object.keys(fieldErrors(contactSchema, v)).length) return setTried(true)
    await submit(v)
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-4 py-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-lime"><CheckIcon className="size-8 text-navy" /></span>
        <h2 className="text-[30px] font-bold tracking-[-0.8px] text-navy">Message sent.</h2>
        <p className="text-ink-2">We&apos;ll get back to you soon. For anything urgent, WhatsApp is fastest.</p>
        <button type="button" onClick={() => { setV(EMPTY); setTried(false); reset() }} className="font-semibold text-navy underline underline-offset-4">Send another message</button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="relative flex flex-col gap-4.5">
      <Honeypot ref={honeypot} />
      <h2 className="text-2xl font-bold text-navy">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <TextField label="Phone or email" autoComplete="email" value={v.contact} onChange={(e) => set('contact', e.target.value)} error={errors.contact} />
      </div>
      <SelectField label="What's it about?" value={v.topic} onChange={(e) => set('topic', e.target.value)} error={errors.topic}>
        {TOPICS.map((t) => <option key={t}>{t}</option>)}
      </SelectField>
      <TextArea label="Message" value={v.message} onChange={(e) => set('message', e.target.value)} error={errors.message} />
      {status === 'failed' && <WhatsAppFallback summary={`Hi Fitin, ${v.message} — ${v.name} (${v.contact})`} />}
      <p className="text-[13px] text-muted">By sending, you agree to our <Link href="/privacy">Privacy policy</Link>.</p>
      <button type="submit" disabled={status === 'sending'} className={buttonClass('primary', 'self-start disabled:opacity-60')}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
```

- [x] **Step 5: Write `app/(site)/about/page.tsx` and `app/(site)/contact/page.tsx`**

```tsx
// app/(site)/about/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Highlight, SectionHead, buttonClass } from '@/components/ui'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About Fitin',
  description: 'Fitin is a Pakistani platform that brings homeowners, interior designers and furniture vendors together to design, build and fit homes.',
  path: '/about',
})

const PILLARS = [
  ['bg-navy text-white', 'text-sky', '01 · Design', 'The right designer, quickly', 'Every designer on Fitin is verified, and matched to you by city, style and budget.', 'text-on-navy'],
  ['bg-teal-dark text-white', 'text-lime-pale', '02 · Build', 'Vendors you can trust', 'Custom furniture and fit-out from vetted vendors, with quotes and timelines in one place.', 'text-[#E2F2F2]'],
  ['bg-lime text-navy', 'text-navy', '03 · Fit', 'A finished room', 'Delivered, installed and styled, so you walk into a home rather than a pile of boxes.', 'text-[#22300A]'],
] as const

export default function AboutPage() {
  return (
    <>
      <section className="wrap flex flex-wrap items-center gap-16 pb-20 pt-10 md:pt-[72px]">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">About Fitin</span>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">
            Connecting <Highlight tone="teal">spaces</Highlight>.<br />Building <Highlight tone="lime">possibilities</Highlight>.
          </h1>
          <p className="max-w-[540px] text-[19px] leading-[1.6] text-ink-2">
            Fitin is a Pakistani platform that brings homeowners, interior designers and furniture vendors together. One place to find the right people, shape the design, and see it built and fitted.
          </p>
        </div>
        <div className="grid min-w-0 flex-[1_1_460px] grid-cols-2 items-start gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-navy-soft"><Image src="/images/bedroom-warm-timber.jpg" alt="Warm timber bedroom" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
          <div className="mt-14 flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-navy-soft"><Image src="/images/kitchen-open-white.jpg" alt="Open white kitchen" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
            <div className="flex flex-col gap-2.5 rounded-[28px] bg-navy p-6 text-white">
              <svg aria-hidden viewBox="0 0 48 58" className="h-[58px] w-12"><path d="M0 14L48 0v12L0 26z" fill="#fff" /><path d="M0 30L40 18v12L0 42z" fill="#229E9F" /><path d="M0 46L32 36v12L0 58z" fill="#B6D22A" /></svg>
              <span className="text-[15px] font-semibold">Design · Build · Fit</span>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="wrap flex flex-col gap-10 py-20">
          <SectionHead title="Doing up a home shouldn't mean managing ten strangers." />
          <div className="grid gap-5 md:grid-cols-3">
            {PILLARS.map(([box, kick, k, t, d, sub]) => (
              <div key={k} className={`flex flex-col gap-3 rounded-panel p-8 ${box}`}>
                <span className={`text-[13px] font-bold uppercase tracking-[1px] ${kick}`}>{k}</span>
                <h2 className="text-[22px] font-bold">{t}</h2><p className={sub}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap flex flex-wrap items-center justify-between gap-6 py-20">
        <p className="text-2xl font-bold text-navy">Serving {site.cities.join(', ')}.</p>
        <Link href="/contact" className={buttonClass('dark')}>Contact us</Link>
      </section>
    </>
  )
}
```

```tsx
// app/(site)/contact/page.tsx
import { ContactForm } from '@/components/forms/contact-form'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Contact Fitin',
  description: `WhatsApp, call or email Fitin. We serve ${site.cities.join(', ')}.`,
  path: '/contact',
})

const card = 'flex items-center gap-4 rounded-card px-5 py-4.5 no-underline'

export default function ContactPage() {
  return (
    <section className="wrap flex flex-wrap items-start gap-14 py-14 md:py-20">
      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Contact</span>
          <h1 className="text-[clamp(36px,4.4vw,52px)] font-bold leading-[1.08] tracking-[-1.4px] text-navy">Talk to a real person.</h1>
          <p className="text-[17px] text-ink-2">WhatsApp is the quickest way to reach us.</p>
        </div>
        <div className="flex flex-col gap-3">
          <a href={`https://wa.me/${site.whatsapp}`} className={`${card} bg-lime-soft`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-lime"><WhatsAppIcon className="size-[22px] text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">WhatsApp</b><span className="text-sm text-ink-2">{site.phoneDisplay}</span></span>
          </a>
          <a href={`tel:${site.phone}`} className={`${card} border border-hairline`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-soft"><PhoneIcon className="size-5 text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">Call us</b><span className="text-sm text-ink-2">{site.phoneDisplay}</span></span>
          </a>
          <a href={`mailto:${site.email}`} className={`${card} border border-hairline`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-soft"><MailIcon className="size-5 text-navy" /></span>
            <span className="flex flex-col"><b className="text-navy">Email</b><span className="text-sm text-ink-2">{site.email}</span></span>
          </a>
        </div>
        <div className="flex flex-col gap-2.5 pt-2">
          <span className="text-[15px] font-bold text-navy">Cities we serve</span>
          <ul className="flex flex-wrap gap-2">{site.cities.map((c) => <li key={c} className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold">{c}</li>)}</ul>
          {site.address && <p className="text-sm text-muted">Office: {site.address}</p>}
        </div>
      </div>
      <div className="min-w-0 flex-[1_1_520px] rounded-feature border border-hairline bg-white p-6 shadow-float md:p-10"><ContactForm /></div>
    </section>
  )
}
```

- [x] **Step 6: Write the legal pages**

`components/legal-tabs.tsx`:
```tsx
import Link from 'next/link'

export function LegalTabs({ active }: { active: 'privacy' | 'terms' }) {
  const tab = (key: 'privacy' | 'terms', label: string) => (
    <Link href={`/${key}`} aria-current={active === key ? 'page' : undefined}
      className={`flex min-h-11 items-center rounded-full px-5 text-[15px] font-semibold no-underline ${active === key ? 'bg-navy text-white hover:text-white' : 'text-navy'}`}>
      {label}
    </Link>
  )
  return <nav aria-label="Legal documents" className="inline-flex self-start rounded-full bg-surface p-1">{tab('privacy', 'Privacy policy')}{tab('terms', 'Terms of service')}</nav>
}
```

`app/(site)/privacy/page.tsx` (each `<section>` gets an `id`; the table of contents is generated from `SECTIONS`):
```tsx
import Link from 'next/link'
import { LegalDoc, type LegalSection } from '@/components/legal-doc'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Privacy policy', description: 'How Fitin collects, uses and protects your information, including cookies and advertising.', path: '/privacy' })

const SECTIONS: LegalSection[] = [
  { id: 'collect', title: 'What we collect', body: <p>When you use our forms we collect the details you choose to give us: your name, phone number, email address, city and information about your project or business. When you browse the site, we and our service providers collect basic technical information such as pages visited, device and browser type, and approximate location derived from your IP address.</p> },
  { id: 'use', title: 'How we use it', body: <p>We use your details to respond to your request, match you with designers and vendors, prepare quotes, keep you updated about your project (including by WhatsApp if you agree), and improve our website. We do not sell your personal information.</p> },
  { id: 'share', title: 'Who we share it with', body: <p>We share project details only with the designers and vendors working on your project, and with service providers who help us run Fitin, such as our database host (Supabase), email delivery (Resend), analytics (Google Analytics) and website hosting. They may only use your information to provide their service to us.</p> },
  { id: 'cookies', title: 'Cookies and advertising', body: (
    <>
      <p>We use cookies to understand how the site is used and to show advertising on our Journal articles. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</p>
      <p>You can opt out of personalised advertising by visiting <a href="https://adssettings.google.com">Google Ads Settings</a>, or opt out of some third-party vendors&apos; use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>. Visitors in the European Economic Area, the UK and Switzerland are asked for consent through Google&apos;s consent message before advertising or analytics cookies are used.</p>
    </>
  ) },
  { id: 'retention', title: 'How long we keep it', body: <p>We keep enquiry and project records for as long as needed to provide our service and meet legal and accounting obligations, and then delete or anonymise them.</p> },
  { id: 'choices', title: 'Your choices', body: <p>You can ask us to show, correct or delete the personal information we hold about you, or to stop WhatsApp updates, at any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.</p> },
  { id: 'contact', title: 'Contact', body: <p>Questions about this policy? Email <a href={`mailto:${site.email}`}>{site.email}</a> or <Link href="/contact">contact us</Link>.</p> },
]

export default function PrivacyPage() {
  return <LegalDoc title="Privacy policy" active="privacy" sections={SECTIONS} />
}
```

`components/legal-doc.tsx` (shared layout for both legal pages):
```tsx
import type { ReactNode } from 'react'
import { site } from '@/lib/content'
import { LegalTabs } from './legal-tabs'

export type LegalSection = { id: string; title: string; body: ReactNode }

export function LegalDoc({ title, active, sections }: { title: string; active: 'privacy' | 'terms'; sections: LegalSection[] }) {
  return (
    <div className="wrap flex max-w-[1160px] flex-col gap-8 pb-24 pt-14">
      <div className="flex flex-col gap-4">
        <h1 className="text-[clamp(36px,4.4vw,52px)] font-bold leading-[1.08] tracking-[-1.6px] text-navy">{title}</h1>
        <p className="text-[15px] text-muted">Last updated: {new Date(site.legalUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <LegalTabs active={active} />
      </div>
      <div className="flex flex-wrap items-start gap-14">
        <nav aria-label="On this page" className="sticky top-6 flex min-w-0 flex-[1_1_220px] flex-col gap-1">
          <span className="mb-2 text-[13px] font-bold uppercase tracking-[1px] text-muted">On this page</span>
          {sections.map((s, i) => <a key={s.id} href={`#${s.id}`} className="border-l-2 border-hairline px-3 py-2 text-[15px] text-ink no-underline">{i + 1}. {s.title}</a>)}
        </nav>
        <article className="flex min-w-0 max-w-[720px] flex-[999_1_560px] flex-col gap-10 leading-[1.7] text-[#3B4552] [&_a]:underline [&_p+p]:mt-3">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 text-2xl font-bold tracking-[-0.4px] text-navy">{i + 1}. {s.title}</h2>{s.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
```

`app/(site)/terms/page.tsx`:
```tsx
import { LegalDoc, type LegalSection } from '@/components/legal-doc'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Terms of service', description: 'The terms for using the Fitin website and platform.', path: '/terms' })

const SECTIONS: LegalSection[] = [
  { id: 'about', title: 'About Fitin', body: <p>Fitin is a platform that connects homeowners with independent interior designers, furniture makers and material vendors in Pakistan. Designers and vendors are independent businesses; Fitin verifies them and coordinates projects but does not employ them.</p> },
  { id: 'use', title: 'Using the platform', body: <p>You agree to give accurate information, use the site lawfully, and not misuse our forms or try to disrupt the service.</p> },
  { id: 'quotes', title: 'Quotes and estimates', body: <p>Prices shown on the site, including the kitchen cost calculator, are estimates for guidance only. Your final price is set in a written quote after a site visit and depends on your space, materials and choices.</p> },
  { id: 'payments', title: 'Payments', body: <p>Payment amounts, schedules and refund terms are agreed in writing for each project before work begins.</p> },
  { id: 'partners', title: 'Designers and vendors', body: <p>Designers and vendors are responsible for the quality and timing of their own work as agreed in each project. Fitin will help resolve issues between you and a partner.</p> },
  { id: 'liability', title: 'Liability', body: <p>To the extent permitted by law, Fitin is not liable for indirect or consequential losses arising from use of the website. Nothing in these terms limits rights you have under applicable consumer law.</p> },
  { id: 'changes', title: 'Changes and contact', body: <p>We may update these terms; the date above shows the latest version. Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p> },
]

export default function TermsPage() {
  return <LegalDoc title="Terms of service" active="terms" sections={SECTIONS} />
}
```

- [x] **Step 7: Write the 404**

`components/not-found-bars.tsx`:
```tsx
'use client'
import { useState } from 'react'

const BARS = [
  { d: 'M0 50L240 0v60L0 110z', fill: '#0E2340', w: 240, h: 110, top: 40, off: 'translate(-30px,150px) rotate(-28deg)' },
  { d: 'M0 46L210 0v54L0 100z', fill: '#229E9F', w: 210, h: 100, top: 150, off: 'translate(60px,120px) rotate(18deg)' },
  { d: 'M0 42L180 0v50L0 92z', fill: '#B6D22A', w: 180, h: 92, top: 255, off: 'translate(-10px,-210px) rotate(-62deg)' },
]

export function NotFoundBars() {
  const [fixed, setFixed] = useState(false)
  return (
    <div className="flex flex-col items-center gap-6">
      <div aria-hidden className="relative h-[360px] w-[340px] max-w-full origin-top scale-75 md:scale-100">
        {BARS.map((b) => (
          <svg key={b.fill} viewBox={`0 0 ${b.w} ${b.h}`} width={b.w} height={b.h}
            className="absolute left-[50px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ top: b.top, transform: fixed ? 'none' : b.off }}>
            <path d={b.d} fill={b.fill} />
          </svg>
        ))}
      </div>
      <button type="button" onClick={() => setFixed(!fixed)} className="h-12 rounded-full border border-navy bg-white px-5.5 text-[15px] font-semibold text-navy">
        {fixed ? 'Knock it over again' : 'Put it back together'}
      </button>
    </div>
  )
}
```

`app/not-found.tsx`:
```tsx
import Link from 'next/link'
import { Logo } from '@/components/header'
import { NotFoundBars } from '@/components/not-found-bars'
import { Highlight } from '@/components/ui'

const LINKS = [
  ['/designs', 'Explore designs', 'Ideas for every room', ''],
  ['/services', 'Services', 'and the cost calculator', ''],
  ['/start', 'Start a project', 'Free quote', 'bg-lime-soft border-transparent'],
  ['/contact', 'Contact us', 'WhatsApp, phone or email', ''],
] as const

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-hairline"><div className="wrap flex min-h-[76px] items-center"><Logo size={36} /></div></header>
      <main className="wrap flex flex-1 flex-wrap-reverse items-center gap-14 py-16">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-5.5">
          <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-teal-dark">Error 404</span>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.04] tracking-[-2.2px] text-navy">This page doesn&apos;t <Highlight tone="lime">fit</Highlight>.</h1>
          <p className="max-w-[480px] text-[19px] text-ink-2">It may have moved, or the link was mistyped. Here are some good places to start.</p>
          <div className="grid max-w-[520px] grid-cols-2 gap-3">
            {LINKS.map(([href, t, d, extra]) => (
              <Link key={href} href={href} className={`flex flex-col gap-0.5 rounded-[18px] border border-hairline px-5 py-4.5 no-underline ${extra}`}>
                <b className="text-navy">{t}</b><span className="text-sm text-ink-2">{d}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_420px]"><NotFoundBars /></div>
      </main>
    </div>
  )
}
```

The `h1` text is `This page doesn't fit.` — the `Highlight` span does not change the accessible name.

- [x] **Step 8: Run tests** — `npx playwright test e2e/pages.spec.ts && npm test` — Expected: PASS.

- [x] **Step 9: Commit**

```bash
git add components app content/site.json lib e2e/pages.spec.ts
git commit -m "feat: about, contact, privacy, terms and 404 pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Journal — MDX, index, article page, ad slots

**Files:**
- Create: `mdx-components.tsx`, `lib/journal.ts`, `components/ad-slot.tsx`, `components/article-card.tsx`, `app/(site)/journal/page.tsx`, `app/(site)/journal/[article]/page.tsx`, `content/journal/modular-kitchen-cost-pakistan.mdx`, `tests/ads-scope.test.ts`, `e2e/journal.spec.ts`
- Modify: `next.config.ts` (wrap with MDX), `lib/seo.ts` (article Open Graph fields)

**Interfaces:**
- Consumes: `showDrafts, site, getService, getDesigns, designHref` (`lib/content`), `pageMetadata`, UI.
- Produces:
  - `CATEGORIES`, `type ArticleMeta = { slug, title, description, date, updated?, category, status, cover, coverAlt, relatedServices: string[], relatedDesigns: string[] }`.
  - `articleSlugs(): string[]`, `getArticles(): Promise<ArticleMeta[]>` (newest first, drafts per `showDrafts()`), `getArticle(slug): Promise<{ meta: ArticleMeta; Content: ComponentType } | undefined>`.
  - MDX component `<AdBreak />` (renders `AdSlot`), `AdSlot()` (renders nothing unless `site.adsenseId` and `site.adSlot` are set; reserves 280 px when it renders).
  - `pageMetadata({ ..., article?: { published: string; modified?: string } })`.

- [x] **Step 1: Install MDX and wrap the config**

```bash
npm i @next/mdx @mdx-js/loader @mdx-js/react
npm i -D @types/mdx
```

`next.config.ts`:
```ts
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
}

export default createMDX({})(nextConfig)
```

Update `tests/smoke.test.ts` to `expect((await import('@/next.config')).default).toBeTruthy()` — the wrapped export may be a function in some versions. Run `npm test` — Expected: PASS.

- [x] **Step 2: Write the failing tests**

`tests/ads-scope.test.ts` (ads may only be wired on the article page):
```ts
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

function* files(dir: string): Generator<string> {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) yield* files(p)
    else if (/\.(tsx?|mdx)$/.test(e)) yield p
  }
}

test('the AdSense script is referenced only by the article page', () => {
  const hits = [...files('app'), ...files('components')].filter((f) => readFileSync(f, 'utf8').includes('pagead2.googlesyndication.com'))
  expect(hits).toEqual([path.join('app', '(site)', 'journal', '[article]', 'page.tsx')])
})
```

`e2e/journal.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

test('journal index links to articles', async ({ page }) => {
  await page.goto('/journal')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Fitin Journal')
  await page.getByRole('link', { name: /Modular kitchen cost in Pakistan/ }).first().click()
  await expect(page).toHaveURL('/journal/modular-kitchen-cost-pakistan')
})

test('article renders content, related links and no ads without an AdSense id', async ({ page }) => {
  await page.goto('/journal/modular-kitchen-cost-pakistan')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Modular kitchen cost in Pakistan')
  await expect(page.getByRole('link', { name: 'kitchen cost calculator' }).first()).toHaveAttribute('href', '/kitchen-cost-calculator')
  await expect(page.locator('script[src*="googlesyndication"]')).toHaveCount(0)
  await expect(page.getByRole('complementary', { name: 'Advertisement' })).toHaveCount(0)
})

test('unknown article is a 404', async ({ page }) => {
  expect((await page.goto('/journal/nope'))?.status()).toBe(404)
})
```

- [x] **Step 3: Run to verify failure** — `npx vitest run tests/ads-scope.test.ts && npx playwright test e2e/journal.spec.ts` — Expected: FAIL.

- [x] **Step 4: Write `components/ad-slot.tsx` and `mdx-components.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import site from '@/content/site.json'

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdSlot() {
  const pushed = useRef(false)
  const enabled = Boolean(site.adsenseId && site.adSlot)
  useEffect(() => {
    if (!enabled || pushed.current) return
    pushed.current = true
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch { /* ad blocked: slot stays empty */ }
  }, [enabled])
  if (!enabled) return null
  return (
    <aside aria-label="Advertisement" className="my-10 flex min-h-[280px] flex-col items-center gap-2">
      <span className="text-[11px] uppercase tracking-[1px] text-muted">Advertisement</span>
      <ins className="adsbygoogle block w-full" style={{ display: 'block' }} data-ad-client={site.adsenseId}
        data-ad-slot={site.adSlot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  )
}
```

```tsx
// mdx-components.tsx (repo root)
import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { AdSlot } from '@/components/ad-slot'

const components: MDXComponents = {
  h2: (p) => <h2 className="mb-3 mt-10 text-[26px] font-bold leading-tight tracking-[-0.5px] text-navy" {...p} />,
  h3: (p) => <h3 className="mb-2 mt-7 text-xl font-bold text-navy" {...p} />,
  p: (p) => <p className="mb-4 text-[17px] leading-[1.75] text-[#3B4552]" {...p} />,
  ul: (p) => <ul className="mb-5 list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-[#3B4552]" {...p} />,
  ol: (p) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-[17px] leading-[1.7] text-[#3B4552]" {...p} />,
  strong: (p) => <strong className="font-bold text-ink" {...p} />,
  blockquote: (p) => <blockquote className="my-6 rounded-r-card border-l-4 border-teal bg-teal-soft px-5 py-4 text-ink" {...p} />,
  table: (p) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left text-[15px]" {...p} /></div>,
  th: (p) => <th className="border-b-2 border-navy px-3 py-2 font-bold text-navy" {...p} />,
  td: (p) => <td className="border-b border-hairline px-3 py-2" {...p} />,
  a: ({ href = '', ...p }) => (href.startsWith('/') ? <Link href={href} className="underline underline-offset-4" {...p} /> : <a href={href} rel="noopener" className="underline underline-offset-4" {...p} />),
  AdBreak: () => <AdSlot />,
}

export function useMDXComponents(): MDXComponents {
  return components
}
```

- [x] **Step 5: Write `lib/journal.ts`**

```ts
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
```

- [x] **Step 6: Extend `lib/seo.ts`** — replace `pageMetadata` with:

```ts
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
```

- [x] **Step 7: Write the first article** — `content/journal/modular-kitchen-cost-pakistan.mdx`

```mdx
export const meta = {
  title: 'Modular kitchen cost in Pakistan (2026): what drives the price',
  description: 'What a modular kitchen costs in Pakistan, how running feet, materials and hardware change the price, and how to get an accurate quote.',
  date: '2026-10-17',
  category: 'Costs & budgets',
  status: 'draft',
  cover: '/images/kitchen-modular-cream.jpg',
  coverAlt: 'Modular kitchen with cream cabinets and timber accents',
  relatedServices: ['modular-kitchens-wardrobes'],
  relatedDesigns: ['cream-modular-kitchen', 'open-white-kitchen'],
}

A modular kitchen is one of the most popular upgrades in Pakistani homes, and the first question is always the same: how much will it cost? The honest answer is that it depends on a few specific things — and once you understand them, you can plan a budget that won't surprise you later.

This guide explains how kitchen pricing works, which choices move the number most, and how to get a quote you can rely on.

<AdBreak />

## How kitchens are priced: running feet

Most kitchen makers price cabinets by the **running foot (rft)** — the length of wall the cabinets run along. An L-shaped kitchen with an 8-foot wall and a 6-foot wall is roughly 14 rft. Base cabinets, wall cabinets and tall units are usually counted together in that figure.

As a reference point, Fitin's Comfort tier puts a **12 rft kitchen at about PKR 7.55–9.19 Lakh**. You can move the slider on our [kitchen cost calculator](/kitchen-cost-calculator) to see the same rate applied to your length. Treat it as a planning range, not a quote.

## What changes the price most

### 1. Cabinet board and finish
The board inside the cabinets and the finish on the doors make the biggest difference. Moisture-resistant board costs more than standard board but holds up far better near the sink and hob. Door finishes range from laminates to lacquers and veneers; high-gloss and solid-wood looks sit at the upper end.

### 2. Hardware
Hinges, drawer runners and lift-up mechanisms are small items with a big effect on how the kitchen feels after five years. Soft-close hardware costs more, but it is the part you touch every day.

### 3. Counter tops
Counters are often priced separately from cabinets. Stone, quartz and solid-surface tops vary widely in price and in how they handle heat and stains.

### 4. Appliances and fittings
Built-in ovens, hobs, hoods and sinks are usually extra. Decide early whether you are reusing appliances, because built-in units change cabinet sizes.

### 5. Site work
Moving plumbing or gas lines, levelling walls or adding electrical points adds cost before any cabinet goes in. A site visit is the only way to know.

<AdBreak />

## How to keep the budget under control

- **Fix the layout first.** Changing the layout after production starts is the most expensive mistake.
- **Spend on what you touch.** Prioritise hardware and the counter; keep decorative extras simple.
- **Use standard sizes where you can.** Custom widths are possible but add cost.
- **Ask for an itemised quote.** You should see cabinets, counters, hardware, appliances and installation as separate lines.

## Getting an accurate quote

A real quote needs measurements, your material choices and a look at the site. With Fitin, a verified designer visits, measures and prepares an itemised quote for your kitchen. [Start a project](/start) to book a free consultation, or see our [modular kitchens and wardrobes](/services/modular-kitchens-wardrobes) service for what is included.
```

- [x] **Step 8: Write `components/article-card.tsx` and `app/(site)/journal/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/journal'

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function ArticleCard({ a }: { a: ArticleMeta }) {
  return (
    <article>
      <Link href={`/journal/${a.slug}`} className="flex flex-col gap-3 text-navy no-underline">
        <span className="relative block aspect-[16/10] overflow-hidden rounded-card bg-navy-soft">
          <Image src={a.cover} alt={a.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[1px] text-teal-dark">{a.category}</span>
        <span className="text-xl font-bold leading-snug">{a.title}</span>
        <span className="text-[15px] text-ink-2">{a.description}</span>
        <time dateTime={a.date} className="text-sm text-muted">{formatDate(a.date)}</time>
      </Link>
    </article>
  )
}
```

```tsx
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
```

- [x] **Step 9: Write `app/(site)/journal/[article]/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { AdSlot } from '@/components/ad-slot'
import { formatDate } from '@/components/article-card'
import { DesignGrid, toCard } from '@/components/design-card'
import { buttonClass } from '@/components/ui'
import { getDesigns, getService, site } from '@/lib/content'
import { getArticle, getArticles } from '@/lib/journal'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false
export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ article: a.slug }))
}

type Props = { params: Promise<{ article: string }> }

export async function generateMetadata({ params }: Props) {
  const a = await getArticle((await params).article)
  if (!a) return {}
  return pageMetadata({ title: a.meta.title, description: a.meta.description, path: `/journal/${a.meta.slug}`, article: { published: a.meta.date, modified: a.meta.updated } })
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).article)
  if (!a) notFound()
  const { meta, Content } = a
  const services = meta.relatedServices.map(getService).filter((s) => s !== undefined)
  const designs = getDesigns().filter((d) => meta.relatedDesigns.includes(d.slug)).map(toCard)

  return (
    <article className="wrap flex max-w-[760px] flex-col gap-6 pb-20 pt-8 md:pt-12">
      {site.adsenseId && (
        <Script async strategy="afterInteractive" crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseId}`} />
      )}
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
        <Link href="/journal" className="text-muted">Journal</Link><span aria-hidden>/</span><span>{meta.category}</span>
      </nav>
      <h1 className="text-[clamp(32px,4.4vw,48px)] font-bold leading-[1.1] tracking-[-1.4px] text-navy">{meta.title}</h1>
      <p className="text-[15px] text-muted">
        By Fitin Editorial · <time dateTime={meta.date}>{formatDate(meta.date)}</time>
        {meta.updated && <> · Updated <time dateTime={meta.updated}>{formatDate(meta.updated)}</time></>}
      </p>
      <div className="relative aspect-[16/9] overflow-hidden rounded-panel bg-navy-soft">
        <Image src={meta.cover} alt={meta.coverAlt} fill preload sizes="(min-width: 800px) 760px, 100vw" className="object-cover" />
      </div>
      <div className="pt-2"><Content /></div>
      <AdSlot />
      {services.length > 0 && (
        <aside aria-label="Related services" className="flex flex-col gap-3 rounded-panel bg-surface p-6">
          <h2 className="text-lg font-bold text-navy">Related services</h2>
          <ul className="flex flex-col gap-2">{services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.name}</Link></li>)}</ul>
        </aside>
      )}
      {designs.length > 0 && (
        <section className="flex flex-col gap-5 pt-6">
          <h2 className="text-2xl font-bold text-navy">Designs to start from</h2>
          <DesignGrid cards={designs} />
        </section>
      )}
      <div className="mt-6 flex flex-col items-start gap-3 rounded-feature bg-lime-soft p-7">
        <h2 className="text-2xl font-bold text-navy">Planning something similar?</h2>
        <p className="text-[#3B4552]">Get a tailored quote from a verified designer in under {site.claims.quoteHours} hours.</p>
        <Link href="/start" className={buttonClass('dark')}>Start your project</Link>
      </div>
    </article>
  )
}
```

`DesignGrid` uses a 4-column grid; on this 760 px column it shows 2 columns from `sm` — acceptable. Draft designs referenced by `relatedDesigns` are hidden automatically in production.

- [x] **Step 10: Run tests** — `npx vitest run && npx playwright test e2e/journal.spec.ts` — Expected: PASS.

- [x] **Step 11: Commit**

```bash
git add mdx-components.tsx next.config.ts lib components app/\(site\)/journal content/journal tests e2e/journal.spec.ts package.json package-lock.json
git commit -m "feat: journal with MDX articles and article-only ad slots

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Draft the remaining 11 starter articles

**Files:**
- Create: 11 files in `content/journal/` (slugs below)

**Interfaces:**
- Consumes: the `meta` schema and MDX components from Task 13. Every file exports `meta` exactly like `modular-kitchen-cost-pakistan.mdx`.

**Writing rules (apply to every article):**
- 900–1,400 words, original, practical, written for homeowners in Pakistan; plain English; short paragraphs; at least three `##` sections.
- `status: 'draft'`, `date: '2026-10-17'`. The user reviews and flips to `published`.
- **No invented facts.** No statistics, prices, durations or product claims except Fitin's own figures from `content/site.json` / the calculator rate, each labelled as an estimate. General guidance only ("costs vary with…"), never "X costs PKR Y".
- Exactly two `<AdBreak />`: one after the introduction, one roughly mid-article.
- At least two internal links (a service page, `/designs/<room>`, `/kitchen-cost-calculator` or `/start`) and a closing paragraph pointing to `/start`.
- `title` ≤ 70 characters, `description` 50–160 characters, `cover` from `/images/`, `coverAlt` describing the photo.

| slug | title | category | cover | must cover (H2s) | related |
|---|---|---|---|---|---|
| modular-kitchen-layouts | Modular kitchen layouts that work in Pakistani homes | Planning | kitchen-open-white.jpg | Work triangle; L-shape, U-shape, galley, island — when each fits; storage for daily cooking; ventilation and the hood; measuring your wall | services: modular-kitchens-wardrobes; designs: open-white-kitchen, patterned-tile-galley |
| full-home-interior-checklist | Full-home interior design: a step-by-step checklist | Planning | dining-classic.jpg | Before you start; brief and budget; design phase; build phase; furniture and fit; handover | services: full-home-interiors |
| renovation-budget-guide | How to budget a home renovation without surprises | Costs & budgets | hallway-built-in-storage.jpg | What a renovation budget includes; contingency; order of works; getting comparable quotes; red flags in a quote | services: renovation |
| japandi-vs-warm-modern | Japandi vs Warm Modern: which style suits your home? | Style guides | bedroom-warm-timber.jpg | What each style is; colours and materials; furniture shapes; how each works with Pakistani homes and family life; mixing the two | designs: warm-timber-bedroom, teal-accent-lounge |
| small-bedroom-ideas | Small bedroom ideas that make the room feel bigger | Style guides | bedroom-navy-city-view.jpg | Light and colour; bed placement; storage under and above; mirrors and curtains; built-ins | designs: navy-white-suite, pendant-lit-bedroom; services: modular-kitchens-wardrobes |
| built-in-wardrobe-guide | Built-in wardrobes: sizes, layouts and materials | Planning | wardrobe-built-in.jpg | Hinged vs sliding doors; standard depths and why they matter; hanging vs drawers; materials and humidity; lighting inside | services: modular-kitchens-wardrobes; designs: built-in-wardrobe-wall |
| working-with-an-interior-designer | How to work with an interior designer and get what you want | Planning | living-navy-sofa-teal-cushions.jpg | What a designer does; preparing your brief; reviewing concepts; giving feedback; changes and approvals | services: full-home-interiors, signature |
| home-office-design | Designing a home office you'll actually use | Style guides | office-sunlit-desk.jpg | Choosing the spot; desk and chair basics; light and screens; storage; video-call background | designs: sunlit-study-nook |
| kitchen-cabinet-materials | Kitchen cabinet materials compared: boards, finishes, hardware | Planning | kitchen-modular-cream.jpg | Cabinet boards; door finishes; counter tops; hardware; matching materials to budget | services: modular-kitchens-wardrobes; link /kitchen-cost-calculator |
| living-room-layouts | Living room layouts built around how you live | Style guides | living-navy-sofa-teal-cushions.jpg | Start from use, not furniture; conversation zones; TV and media walls; walkways; lighting layers | designs: teal-accent-lounge |
| bathroom-upgrade-ideas | Bathroom upgrade ideas, from a quick refresh to a full redo | Planning | bathroom-double-vanity.jpg | Refresh vs renovation; vanity and storage; tiles and waterproofing; lighting and mirrors; ventilation | services: renovation; designs: marble-double-vanity, spa-bath-with-a-view |

`related` maps to `relatedServices` / `relatedDesigns` in `meta`.

- [x] **Step 1: Write the 11 MDX files** following the rules and table above.
- [x] **Step 2: Validate** — `INCLUDE_DRAFTS=1 npm run build` — Expected: build succeeds (an invalid `meta` throws with the file name). Then `npx playwright test e2e/journal.spec.ts` — Expected: PASS.
- [x] **Step 3: Self-check each article** against the writing rules: word count (`wc -w content/journal/*.mdx`), two `<AdBreak />` each (`grep -c '<AdBreak />' content/journal/*.mdx` → 2 per file), no numbers presented as market facts. Fix any that fail.
- [x] **Step 4: Commit**

```bash
git add content/journal
git commit -m "content: draft 11 starter journal articles for review

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: SEO — structured data, sitemap, robots, ads.txt, OG images, icons

**Files:**
- Create: `lib/jsonld.ts`, `components/json-ld.tsx`, `lib/og.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/ads.txt/route.ts`, `app/opengraph-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/(site)/journal/[article]/opengraph-image.tsx`, `app/(site)/designs/[room]/[design]/opengraph-image.tsx`, `tests/jsonld.test.ts`, `e2e/seo.spec.ts`
- Modify: `app/(site)/layout.tsx`, `app/(site)/designs/[room]/page.tsx`, `app/(site)/designs/[room]/[design]/page.tsx`, `app/(site)/services/[service]/page.tsx`, `app/(site)/journal/[article]/page.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: `site, getDesigns, designsInRoom, ROOMS, getServices, type Service` (`lib/content`), `getArticles, type ArticleMeta` (`lib/journal`), `SITE_URL`.
- Produces: `organizationLd()`, `breadcrumbLd(items: [name: string, path: string][])`, `articleLd(m: ArticleMeta)`, `serviceLd(s: Service)`, `jsonLdString(data: object): string`, `<JsonLd data={...} />`, `ogImage({ title, kicker?, image }): Promise<ImageResponse>`, `OG_SIZE`.

- [x] **Step 1: Write the failing tests**

`tests/jsonld.test.ts`:
```ts
import { expect, test } from 'vitest'
import { jsonLdString } from '@/components/json-ld'
import { breadcrumbLd, organizationLd } from '@/lib/jsonld'

test('organization lists all six cities and contact details', () => {
  const org = organizationLd()
  expect(org['@type']).toBe('HomeAndConstructionBusiness')
  expect(org.areaServed).toHaveLength(6)
  expect(org.telephone).toBe('+923111555264')
})

test('breadcrumb positions and absolute URLs', () => {
  const b = breadcrumbLd([['Explore', '/designs'], ['Kitchens', '/designs/kitchens']])
  expect(b.itemListElement[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Kitchens', item: 'https://fitin.space/designs/kitchens' })
})

test('JSON-LD cannot break out of its script tag', () => {
  expect(jsonLdString({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>')
})
```

`e2e/seo.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

test('sitemap lists key routes and skips the API', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const p of ['/designs/kitchens', '/services/renovation', '/journal/modular-kitchen-cost-pakistan', '/kitchen-cost-calculator', '/privacy']) {
    expect(xml).toContain(`https://fitin.space${p}</loc>`)
  }
  expect(xml).not.toContain('/api/')
})

test('robots blocks /api/ and points to the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text()
  expect(txt).toContain('Disallow: /api/')
  expect(txt).toContain('Sitemap: https://fitin.space/sitemap.xml')
})

test('ads.txt is 404 until a publisher id is configured', async ({ request }) => {
  expect((await request.get('/ads.txt')).status()).toBe(404)
})

test('OG image and icons are served', async ({ request }) => {
  const og = await request.get('/opengraph-image')
  expect(og.headers()['content-type']).toContain('image/png')
  expect((await request.get('/icon.svg')).status()).toBe(200)
})

test('pages carry canonical, JSON-LD and OG tags', async ({ page }) => {
  await page.goto('/designs')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://fitin.space/designs')
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.join()).toContain('HomeAndConstructionBusiness')
  await page.goto('/journal/modular-kitchen-cost-pakistan')
  expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join()).toContain('"@type":"Article"')
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /opengraph-image/)
})
```

- [x] **Step 2: Run to verify failure** — `npx vitest run tests/jsonld.test.ts && npx playwright test e2e/seo.spec.ts` — Expected: FAIL.

- [x] **Step 3: Write `lib/jsonld.ts` and `components/json-ld.tsx`**

```ts
import { type Service, site } from './content'
import type { ArticleMeta } from './journal'
import { SITE_URL } from './seo'

const ORG_ID = `${SITE_URL}/#org`

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': ORG_ID,
  name: site.name,
  legalName: site.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/images/fitin-logo.png`,
  image: `${SITE_URL}/opengraph-image`,
  description: site.description,
  email: site.email,
  telephone: site.phone,
  areaServed: site.cities.map((name) => ({ '@type': 'City', name })),
  address: { '@type': 'PostalAddress', addressCountry: 'PK', ...(site.address && { streetAddress: site.address }) },
})

export const breadcrumbLd = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
})

export const articleLd = (m: ArticleMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: m.title,
  description: m.description,
  datePublished: m.date,
  dateModified: m.updated ?? m.date,
  image: [`${SITE_URL}${m.cover}`],
  author: { '@type': 'Organization', name: 'Fitin Editorial', url: SITE_URL },
  publisher: { '@id': ORG_ID },
  mainEntityOfPage: `${SITE_URL}/journal/${m.slug}`,
})

export const serviceLd = (s: Service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.name,
  serviceType: s.name,
  description: s.summary,
  provider: { '@id': ORG_ID },
  areaServed: site.cities.map((name) => ({ '@type': 'City', name })),
  url: `${SITE_URL}/services/${s.slug}`,
})
```

```tsx
export const jsonLdString = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')

export const JsonLd = ({ data }: { data: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
)
```

- [x] **Step 4: Add JSON-LD to pages**
- `app/(site)/layout.tsx`: render `<JsonLd data={organizationLd()} />` before `<Header />`.
- Room page: `<JsonLd data={breadcrumbLd([['Explore', '/designs'], [room.label, `/designs/${room.slug}`]])} />`.
- Design page: `<JsonLd data={breadcrumbLd([['Explore', '/designs'], [room.label, `/designs/${room.slug}`], [d.title, `/designs/${room.slug}/${d.slug}`]])} />`.
- Service page: `<JsonLd data={serviceLd(s)} />` and `<JsonLd data={breadcrumbLd([['Services', '/services'], [s.name, `/services/${s.slug}`]])} />`.
- Article page: `<JsonLd data={articleLd(meta)} />` and `<JsonLd data={breadcrumbLd([['Journal', '/journal'], [meta.title, `/journal/${meta.slug}`]])} />`.

- [x] **Step 5: Write `app/sitemap.ts`, `app/robots.ts`, `app/ads.txt/route.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { ROOMS, designHref, designsInRoom, getDesigns, getServices } from '@/lib/content'
import { getArticles } from '@/lib/journal'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = (path: string, lastModified: Date | string = now) => ({ url: `${SITE_URL}${path}`, lastModified })
  const fixed = ['', '/designs', '/services', '/kitchen-cost-calculator', '/journal', '/start', '/for-designers', '/about', '/contact', '/privacy', '/terms']
  return [
    ...fixed.map((p) => url(p)),
    ...ROOMS.filter((r) => designsInRoom(r.slug).length > 0).map((r) => url(`/designs/${r.slug}`)),
    ...getDesigns().map((d) => url(designHref(d))),
    ...getServices().map((s) => url(`/services/${s.slug}`)),
    ...(await getArticles()).map((a) => url(`/journal/${a.slug}`, a.updated ?? a.date)),
  ]
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${SITE_URL}/sitemap.xml` }
}
```

```ts
// app/ads.txt/route.ts
import { site } from '@/lib/content'

export const dynamic = 'force-static'

export function GET() {
  if (!site.adsenseId) return new Response('Not found', { status: 404 })
  const pub = site.adsenseId.replace(/^ca-/, '')
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```

- [x] **Step 6: OG images and icons**

Check the font file name first: `ls node_modules/@fontsource/figtree/files | grep 'latin-700-normal.woff$'` — use the printed name below.

`lib/og.tsx`:
```tsx
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

export async function ogImage({ title, kicker, image }: { title: string; kicker?: string; image: string }) {
  const [font, photo] = await Promise.all([
    readFile(path.join(process.cwd(), 'node_modules/@fontsource/figtree/files/figtree-latin-700-normal.woff')),
    readFile(path.join(process.cwd(), 'public', image)),
  ])
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0E2340', color: '#fff', fontFamily: 'Figtree' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, padding: '56px 56px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="46" height="58" viewBox="0 0 48 58"><path d="M0 14L48 0v12L0 26z" fill="#fff" /><path d="M0 30L40 18v12L0 42z" fill="#229E9F" /><path d="M0 46L32 36v12L0 58z" fill="#B6D22A" /></svg>
            <span style={{ fontSize: 44, letterSpacing: -1.4 }}>fitin</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {kicker && <span style={{ fontSize: 22, color: '#9ED6D6', textTransform: 'uppercase', letterSpacing: 1.5 }}>{kicker}</span>}
            <span style={{ fontSize: title.length > 48 ? 52 : 62, lineHeight: 1.05, letterSpacing: -2 }}>{title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22 }}>
            <span style={{ padding: '10px 20px', borderRadius: 999, background: '#B6D22A', color: '#0E2340' }}>fitin.space</span>
            <span style={{ color: '#C9D2DE' }}>Karachi · Lahore · Islamabad +3</span>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, padding: '24px 24px 24px 0' }}>
          <img src={src} alt="" width={536} height={582} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 32 }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Figtree', data: font, weight: 700, style: 'normal' }] },
  )
}
```

`app/opengraph-image.tsx`:
```tsx
import { OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Fitin — Design, build and fit, all in one place'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogImage({ title: 'Design, build and fit — all in one place.', image: '/images/bedroom-navy-city-view.jpg' })
}
```

`app/(site)/journal/[article]/opengraph-image.tsx`:
```tsx
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
```

`app/(site)/designs/[room]/[design]/opengraph-image.tsx`:
```tsx
import { getDesign, getDesigns } from '@/lib/content'
import { OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Fitin design'

export const generateStaticParams = () => getDesigns().map((d) => ({ room: d.room, design: d.slug }))

export default async function Image({ params }: { params: Promise<{ room: string; design: string }> }) {
  const { room, design } = await params
  const d = getDesign(room, design)
  return ogImage({ title: d?.title ?? 'Fitin design', kicker: d ? `${d.style} · ${d.city}` : undefined, image: d?.image ?? '/images/living-navy-sofa-teal-cushions.jpg' })
}
```

`app/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0E2340"/><g transform="translate(106 76) scale(2)"><path d="M10 46L140 10v44L10 90z" fill="#fff"/><path d="M10 104L118 76v40L10 144z" fill="#229E9F"/><path d="M10 156L96 134v28L10 176z" fill="#B6D22A"/></g></svg>
```

`app/apple-icon.tsx`:
```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0E2340', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="104" height="125" viewBox="0 0 150 180"><path d="M10 46L140 10v44L10 90z" fill="#fff" /><path d="M10 104L118 76v40L10 144z" fill="#229E9F" /><path d="M10 156L96 134v28L10 176z" fill="#B6D22A" /></svg>
      </div>
    ),
    size,
  )
}
```

Remove any scaffolded `app/favicon.ico` so the SVG icon is used.

- [x] **Step 7: Run tests** — `npx vitest run && npx playwright test e2e/seo.spec.ts` — Expected: PASS. Open `/opengraph-image` and one article OG image in the browser and compare with the canvas "Link preview image" artboard.

- [x] **Step 8: Commit**

```bash
git add lib/jsonld.ts lib/og.tsx components/json-ld.tsx app tests/jsonld.test.ts e2e/seo.spec.ts
git commit -m "feat: structured data, sitemap, robots, ads.txt, OG images and icons

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Analytics with consent defaults, and security headers

**Files:**
- Modify: `app/layout.tsx`, `next.config.ts`
- Create: `e2e/headers.spec.ts`

**Interfaces:**
- Consumes: `site.gaId`.
- Produces: response headers on every route; GA4 only when `site.gaId` is set, with Consent Mode v2 defaults (denied in EEA/UK/CH, granted elsewhere) set before GA loads.

- [x] **Step 1: Write the failing test** — `e2e/headers.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('security headers are set', async ({ request }) => {
  const h = (await request.get('/')).headers()
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(h['content-security-policy']).toContain("object-src 'none'")
  expect(h['strict-transport-security']).toContain('max-age=63072000')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['permissions-policy']).toContain('camera=()')
  expect(h['x-powered-by']).toBeUndefined()
})

test('no CSP violations while using the site', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()) })
  for (const p of ['/', '/designs/living-rooms/teal-accent-lounge', '/start', '/journal/modular-kitchen-cost-pakistan', '/kitchen-cost-calculator']) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
  }
  expect(violations).toEqual([])
})
```

- [x] **Step 2: Run to verify failure** — `npx playwright test e2e/headers.spec.ts` — Expected: FAIL (headers missing).

- [x] **Step 3: Add headers to `next.config.ts`**

```ts
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
```

`'unsafe-eval'` is added only in `next dev` (React Refresh needs it). Do not add `upgrade-insecure-requests` — it breaks `next start` over `http://localhost` and HSTS already covers production.

- [x] **Step 4: Add analytics with consent defaults to `app/layout.tsx`**

```bash
npm i @next/third-parties
```

```tsx
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
```

- [x] **Step 5: Run tests** — `npx playwright test e2e/headers.spec.ts && npm run e2e` — Expected: PASS (full suite, to catch any CSP-blocked asset).

- [x] **Step 6: Commit**

```bash
git add next.config.ts app/layout.tsx e2e/headers.spec.ts package.json package-lock.json
git commit -m "feat: security headers, CSP and consent-aware analytics

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Launch guard

**Files:**
- Create: `scripts/launch-check.mjs`, `tests/launch-check.test.ts`
- Modify: `package.json` (script `build:launch`)

**Interfaces:**
- Produces: `PLACEHOLDER` regex, `findPlaceholders(dirs: string[]): string[]`, `checkSite(site): string[]`, CLI `node scripts/launch-check.mjs` (exit 1 on errors; prints warnings for publish counts). npm script `build:launch` = guard then `next build` — the deploy build command.

- [x] **Step 1: Write the failing test** — `tests/launch-check.test.ts`

```ts
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { checkSite, findPlaceholders } from '../scripts/launch-check.mjs'

test('finds bracketed placeholders but not markdown links, arrays or Tailwind', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lc-'))
  writeFileSync(path.join(dir, 'a.tsx'), "const x = ['Living rooms']\n<p>Designed by [Designer name]</p>\nclass='[&_a]:underline max-w-[1360px]'\n")
  writeFileSync(path.join(dir, 'b.mdx'), 'See the [Kitchen cost calculator](/kitchen-cost-calculator).\nOffice: [Office address]\n')
  const hits = findPlaceholders([dir])
  expect(hits).toHaveLength(2)
  expect(hits[0]).toMatch(/a\.tsx:2 \[Designer name\]$/)
  expect(hits[1]).toMatch(/b\.mdx:2 \[Office address\]$/)
})

test('site must be verified and legally reviewed', () => {
  expect(checkSite({ statsVerified: false, legalReviewed: false })).toHaveLength(2)
  expect(checkSite({ statsVerified: true, legalReviewed: true })).toEqual([])
})

test('the real project has no placeholders in shipped code', () => {
  expect(findPlaceholders(['app', 'components', 'content'])).toEqual([])
})
```

- [x] **Step 2: Run to verify failure** — `npx vitest run tests/launch-check.test.ts` — Expected: FAIL.

- [x] **Step 3: Implement `scripts/launch-check.mjs`**

```js
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// "[Designer name]", "[Office address]" — capitalised words in brackets, not followed by "(" (markdown links).
export const PLACEHOLDER = /\[[A-Z][a-z]+(?: [A-Za-z]+)*\](?!\()/g

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (/\.(tsx?|mdx?|json)$/.test(e)) yield p
  }
}

export function findPlaceholders(dirs) {
  const hits = []
  for (const d of dirs) {
    for (const f of walk(d)) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(PLACEHOLDER)) hits.push(`${f}:${i + 1} ${m[0]}`)
      })
    }
  }
  return hits
}

export function checkSite(site) {
  const errors = []
  if (site.statsVerified !== true) errors.push('content/site.json: set "statsVerified": true once Fitin confirms the stats, install days and quote hours.')
  if (site.legalReviewed !== true) errors.push('content/site.json: set "legalReviewed": true once counsel approves the privacy policy and terms.')
  return errors
}

function publishedCount(dir, pattern) {
  return readdirSync(dir).filter((f) => pattern.test(readFileSync(path.join(dir, f), 'utf8'))).length
}

function main() {
  const site = JSON.parse(readFileSync('content/site.json', 'utf8'))
  const errors = [...findPlaceholders(['app', 'components', 'content']).map((h) => `placeholder: ${h}`), ...checkSite(site)]
  const designs = publishedCount('content/designs', /"status":\s*"published"/)
  const articles = publishedCount('content/journal', /status:\s*'published'/)
  if (designs === 0) console.warn('warning: no published designs — /designs will show an empty state.')
  if (articles < 20) console.warn(`warning: ${articles} published articles; apply to AdSense at ~20.`)
  if (errors.length) {
    console.error(`Launch check failed:\n- ${errors.join('\n- ')}`)
    process.exit(1)
  }
  console.log('Launch check passed.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
```

Add to `package.json` scripts: `"build:launch": "node scripts/launch-check.mjs && next build"`.

- [x] **Step 4: Run tests** — `npx vitest run tests/launch-check.test.ts` — Expected: PASS. Then `npm run build:launch` — Expected: exits 1 listing `statsVerified` and `legalReviewed` (correct until Fitin signs off).

- [x] **Step 5: Commit**

```bash
git add scripts/launch-check.mjs tests/launch-check.test.ts package.json
git commit -m "feat: launch guard blocks placeholders and unverified content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Quality sweep — every page, accessibility, links, Lighthouse

**Files:**
- Create: `e2e/quality.spec.ts`, `scripts/lighthouse.mjs`
- Modify: `package.json` (devDeps `lighthouse`, `chrome-launcher`; script `lighthouse`)

**Interfaces:**
- Produces: `npm run lighthouse` (expects a server on `LH_BASE`, default `http://localhost:3100`; exits 1 if any score < 95).

- [x] **Step 1: Write `e2e/quality.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.setTimeout(600_000)

async function sitemapPaths(request: import('@playwright/test').APIRequestContext) {
  const xml = await (await request.get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
}

test('every sitemap page loads, has one h1 and no serious accessibility issues', async ({ page, request }) => {
  const paths = await sitemapPaths(request)
  expect(paths.length).toBeGreaterThan(30)
  for (const p of paths) {
    const res = await page.goto(p)
    expect(res?.status(), p).toBe(200)
    await expect(page.locator('h1'), p).toHaveCount(1)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)
    expect(serious, p).toEqual([])
  }
})

test('no broken internal links', async ({ page, request }) => {
  const links = new Set<string>()
  for (const p of await sitemapPaths(request)) {
    await page.goto(p)
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      links.add(href.split('#')[0].split('?')[0] || '/')
    }
  }
  for (const href of links) {
    const res = await request.get(href)
    expect(res.status(), href).toBeLessThan(400)
  }
})
```

- [x] **Step 2: Write `scripts/lighthouse.mjs`**

```bash
npm i -D lighthouse chrome-launcher
```

```js
import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

const BASE = process.env.LH_BASE ?? 'http://localhost:3100'
const PAGES = ['/', '/designs/kitchens', '/designs/living-rooms/teal-accent-lounge', '/journal/modular-kitchen-cost-pakistan', '/start']
const MIN = 95

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] })
let failed = false
for (const p of PAGES) {
  const result = await lighthouse(`${BASE}${p}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] })
  const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([k, c]) => [k, Math.round((c.score ?? 0) * 100)]))
  const low = Object.entries(scores).filter(([, s]) => s < MIN)
  console.log(`${low.length ? 'FAIL' : 'ok  '} ${p}`, scores)
  if (low.length) failed = true
}
await chrome.kill()
process.exit(failed ? 1 : 0)
```

Add script: `"lighthouse": "node scripts/lighthouse.mjs"`. (Lighthouse's default config is mobile emulation with throttling.)

- [x] **Step 3: Run the sweep**

```bash
npx playwright test e2e/quality.spec.ts --project=desktop
npx playwright test e2e/quality.spec.ts --project=phone
INCLUDE_DRAFTS=1 npm run build && (npx next start -p 3100 &) && sleep 5 && npm run lighthouse; kill %1 2>/dev/null || pkill -f "next start -p 3100"
```

Expected: both Playwright runs PASS; Lighthouse prints `ok` for all 5 pages. For each failure: read the audit, fix the cause (contrast, image `sizes`, missing labels, LCP image priority, heading order), add or adjust a test if logic changed, and re-run until clean. Do not lower thresholds.

- [x] **Step 4: Run every check together** — `npm run check && npm run e2e` — Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add e2e/quality.spec.ts scripts/lighthouse.mjs package.json package-lock.json
git add -u
git commit -m "test: sitemap-wide accessibility, link and Lighthouse checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Design review checkpoint (user approval required)

**Files:**
- Create: `e2e/screenshots.spec.ts`
- Modify: `.gitignore` (add `review/`)

- [x] **Step 1: Write the screenshot capture** — `e2e/screenshots.spec.ts`

```ts
import { test } from '@playwright/test'

const PAGES = ['/', '/designs', '/designs/living-rooms/teal-accent-lounge', '/services', '/services/modular-kitchens-wardrobes',
  '/kitchen-cost-calculator', '/start', '/journal', '/journal/modular-kitchen-cost-pakistan', '/for-designers', '/about', '/contact', '/privacy', '/nope']

test('capture review screenshots', async ({ page }, info) => {
  test.skip(!process.env.REVIEW, 'set REVIEW=1 to capture')
  for (const p of PAGES) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `review/${info.project.name}${p.replace(/\//g, '_') || '_home'}.png`, fullPage: true })
  }
})
```

Run: `REVIEW=1 npx playwright test e2e/screenshots.spec.ts` — Expected: 28 PNGs in `review/`.

- [x] **Step 2: Audit** — invoke `taste-skill:redesign-skill` (audit mode) and `ui-ux-pro-max:ui-ux-pro-max` on the screenshots and the component code. Also compare each screenshot against its canvas artboard (https://claude.ai/artifact/XW6cjh4viAsRZL1dwUcFLP) for drift.

- [x] **Step 3: Present findings to the user and STOP.** Format: a table of `#, page, severity (high/med/low), finding, proposed change`. Mark which findings are deviations from the approved design. Wait for the user to pick which to apply. Do not change code before that answer.

- [x] **Step 4: Apply approved changes only**, each with a re-run of the affected e2e spec; then `npm run e2e` and `npm run lighthouse` (server running) — Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add -A
git commit -m "style: apply approved design review improvements

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 20: Deploy preparation — redirects, canonical host, runbook

**Files:**
- Create: `DEPLOY.md`, `tests/redirects.test.ts`
- Modify: `next.config.ts` (`redirects()`)

**Interfaces:**
- Produces: permanent redirects for old fitin.space URLs and `www` → apex; the deploy runbook. Actual deployment happens later with the `hostinger:deploy-to-hosting` skill when the user says go.

- [x] **Step 1: Write the failing test** — `tests/redirects.test.ts`

```ts
import { expect, test } from 'vitest'
import config from '@/next.config'

test('old URLs and www redirect permanently', async () => {
  const resolved = typeof config === 'function' ? await (config as () => Promise<any>)() : config
  const rules = await resolved.redirects!()
  const find = (source: string) => rules.find((r: { source: string }) => r.source === source)
  expect(find('/services/modular')).toMatchObject({ destination: '/services/modular-kitchens-wardrobes', permanent: true })
  expect(find('/services/full-home')).toMatchObject({ destination: '/services/full-home-interiors', permanent: true })
  expect(find('/consultation')).toMatchObject({ destination: '/start', permanent: true })
  expect(find('/calculator')).toMatchObject({ destination: '/kitchen-cost-calculator', permanent: true })
  expect(find('/explore')).toMatchObject({ destination: '/designs', permanent: true })
  expect(find('/packages')).toMatchObject({ destination: '/services', permanent: true })
  expect(rules.find((r: { has?: { value: string }[] }) => r.has?.[0]?.value === 'www.fitin.space')).toMatchObject({ destination: 'https://fitin.space/:path*', permanent: true })
})
```

- [x] **Step 2: Run to verify failure** — `npx vitest run tests/redirects.test.ts` — Expected: FAIL.

- [x] **Step 3: Add redirects to `nextConfig` in `next.config.ts`**

```ts
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.fitin.space' }], destination: 'https://fitin.space/:path*', permanent: true },
      { source: '/services/modular', destination: '/services/modular-kitchens-wardrobes', permanent: true },
      { source: '/services/full-home', destination: '/services/full-home-interiors', permanent: true },
      { source: '/consultation', destination: '/start', permanent: true },
      { source: '/calculator', destination: '/kitchen-cost-calculator', permanent: true },
      { source: '/explore', destination: '/designs', permanent: true },
      { source: '/packages', destination: '/services', permanent: true },
    ]
  },
```

Run: `npx vitest run tests/redirects.test.ts` — Expected: PASS. Before deploy, crawl the live old site's sitemap (if any) and add redirects for every other indexed URL.

- [x] **Step 4: Write `DEPLOY.md`** with these sections, each as numbered steps:
  1. **Accounts Fitin creates:** Supabase project (region closest to Pakistan, e.g. Mumbai `ap-south-1`), Resend, Google Analytics 4 property (copy `G-…` to `site.json.gaId`), Google Search Console, AdSense (later).
  2. **Supabase:** `npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase db push` → copy Project URL and the **secret** key to Hostinger env.
  3. **Resend:** add domain `fitin.space`; add the DNS records Resend shows (SPF, DKIM, return-path) in **Namecheap → Advanced DNS**; wait for "Verified"; set `LEADS_FROM="Fitin Website <leads@fitin.space>"`.
  4. **Hostinger managed Node.js:** Node 22; connect the Git repo; build command `npm ci && npm run build:launch`; start command `npm start`; env vars from `.env.example`; then use the `hostinger:deploy-to-hosting` skill to run and verify.
  5. **Domain:** in Namecheap point `fitin.space` and `www` to Hostinger (records from the Hostinger panel); keep existing MX/TXT records; enable SSL in Hostinger; confirm `www` → apex redirect.
  6. **Smoke test live:** submit each form once (check the Supabase row and the email), check `/sitemap.xml`, `/robots.txt`, OG preview via a WhatsApp message to yourself.
  7. **Search Console:** verify the domain (DNS TXT in Namecheap), submit `https://fitin.space/sitemap.xml`.
  8. **AdSense (after ~20 published articles):** add site, put the publisher id in `site.json.adsenseId`, create one display ad unit and put its id in `site.json.adSlot`, enable **Privacy & messaging → European regulations message**, redeploy, confirm `/ads.txt`.
  9. **Launch checklist:** `statsVerified` and `legalReviewed` true; real designs set to `published`; drafts reviewed; `npm run check && npm run e2e` green.

- [x] **Step 5: Commit**

```bash
git add next.config.ts tests/redirects.test.ts DEPLOY.md
git commit -m "chore: redirects for old URLs and the deploy runbook

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
