# Fitin website — build spec

**Date:** 2026-10-17 · **Status:** approved in brainstorming, awaiting written-spec review
**Design source:** `design/` (canvas export) · design system `design/FITIN-DESIGN.md` · live canvas https://claude.ai/artifact/XW6cjh4viAsRZL1dwUcFLP

## 1. Goal and success criteria

Replace the current fitin.space (vibe-coded, bloated) with a lean Next.js marketing site built from the approved designs.

Fitin is a Pakistani platform connecting homeowners with verified interior designers and custom-furniture vendors ("Design · Build · Fit"), serving Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad and Multan.

Success means:
- Every page indexable and fast: Lighthouse ≥ 95 on mobile for Performance, Accessibility, Best Practices and SEO on key pages; LCP < 2.5 s on 4G.
- Approved by Google AdSense on first application (ads on Journal articles only).
- Every form submission becomes a stored lead plus an email; no lead is lost.
- No placeholder or unverified content can reach production.

**Assumptions:** mostly phone visitors in Pakistan; WhatsApp is the primary contact channel; English only at launch.

## 2. Decisions

| Area | Decision |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript, all pages statically generated |
| Styling | Tailwind CSS v4; tokens from `FITIN-DESIGN.md` defined in `@theme` |
| Font | Figtree via `next/font` (self-hosted) |
| Content | Files in repo: designs/services/site as JSON, articles as MDX; validated with Zod at build |
| Forms | `POST /api/leads` → save to Supabase `leads` → email via Resend; WhatsApp fallback |
| Database | Supabase, **leads only**; migrations in `supabase/migrations/`, applied at deploy (`supabase db push`) |
| Journal | ~12 starter articles drafted by Claude, reviewed by Fitin before publishing; apply to AdSense at ~20 |
| Ads | AdSense on `/journal/[article]` only; Google's own certified consent message (Privacy & messaging) |
| Analytics | Google Analytics 4 via `@next/third-parties`, under the same consent message |
| Language | English; structure allows adding Urdu later |
| Hosting | Hostinger managed Node.js (`next build` + `next start`); domain at Namecheap — both at deploy |
| CRM | Out of scope; separate future project at crm.fitin.space (nav "Sign in" links there) |

## 3. Routes

| URL | Page | Source design |
|---|---|---|
| `/` | Home | Main / PhoneHome |
| `/start` | 4-step project request; thank-you state in place (no URL) | Start / PhoneStart |
| `/designs` | Explore all designs; style/city/budget as `?query` (canonical → no params) | Explore / PhoneExplore |
| `/designs/[room]` | Room landing page (e.g. `/designs/kitchens`) | Explore, filtered |
| `/designs/[room]/[design]` | Design detail | Detail / PhoneDetail |
| `/services` | Services overview | Services / PhoneServices |
| `/services/[service]` | One page per service (4) | Services rows |
| `/kitchen-cost-calculator` | Standalone calculator (also embedded on modular service page) | Services calculator |
| `/journal` | Article index | new — built from design system |
| `/journal/[article]` | Article with ad slots | new — built from design system |
| `/for-designers` | Partner page + application form | Designers / PhoneDesigners |
| `/about` | About | About / PhoneAbout |
| `/contact` | Contact cards + form | About contact section |
| `/privacy`, `/terms` | Legal, styled as tabs, separate URLs | Legal / PhoneLegal |
| not-found | 404 with logo-bars interaction | NotFound / PhoneNotFound |
| `/sitemap.xml`, `/robots.txt`, `/ads.txt` | Generated | — |
| `opengraph-image` | Per-route OG images via `next/og`, brand template | ShareImage |
| `icon`, `apple-icon` | From Favicon design | Favicon |

Phone artboards are the small-screen layout of the same routes (one responsive codebase).
Room slugs: `living-rooms, bedrooms, kitchens, wardrobes, bathrooms, home-offices, dining-areas, commercial`.
Service slugs: `modular-kitchens-wardrobes, full-home-interiors, signature, renovation`.

**Not built:** city landing pages (doorway-page risk until each city has unique content), user accounts, dashboards, search, shop.

## 4. Code structure

```
app/                     routes above; app/api/leads/route.ts
components/              Header, MobileMenu, Footer, Button, Chip, Field, PhotoCard,
                         StageBars, SectionHeader, AdSlot, JsonLd …
content/designs/*.json   one file per design
content/services.json
content/site.json        name, tagline, contacts, cities, stats, adsenseId, gaId
content/journal/*.mdx    articles; metadata exported as `export const meta`
lib/content.ts           load + Zod-validate content (build fails on invalid content)
lib/rules.ts             shared validation: PK mobile, email, portfolio link, lengths
lib/leads.ts             saveLead (Supabase REST) + sendLeadEmail (Resend REST)
lib/seo.ts               metadata + JSON-LD builders
supabase/migrations/     SQL migrations
tests/                   Vitest unit tests; Playwright e2e
```

Supabase and Resend are called with `fetch` against their REST APIs — no SDK dependencies.
Expected runtime dependencies: `next`, `react`, `react-dom`, `zod`, `@next/mdx` (+ MDX loader), `@next/third-parties`.

## 5. Content model

**Design** (`content/designs/<slug>.json`): `slug, title, room, style, city, image, imageAlt, badge?, summary, about, included[], finishes { upholstery[{name, hex}], wood[{name, hex}] }, featured`.
`room`, `style` (Warm Modern, Japandi Minimal, Contemporary, Classic) and `city` are enums.

**Service** (`content/services.json`): `slug, name, summary, intro, includes[], image, imageAlt`.

**Article** (`content/journal/<slug>.mdx`, `export const meta`): `title, description, date, updated?, category` (Costs & budgets · Style guides · Planning), `cover, coverAlt, relatedServices[], relatedDesigns[]`. Author shown as "Fitin Editorial".

**Site** (`content/site.json`): contacts (hello@fitin.space, +92 311 1555264, wa.me/923111555264), cities, stats, `adsenseId`, `gaId`.

**Calculator:** Comfort tier, 12 rft = PKR 7.55–9.19 Lakh (fitin.space); range = rft × 7.55/12 … rft × 9.19/12 Lakh, rft 6–30.

## 6. SEO

- Static generation for every route; `generateStaticParams` from content.
- Per-page `metadata`: title template `%s | Fitin`, description, canonical, Open Graph, Twitter card. Keyword-led titles on room, service and article pages.
- JSON-LD: `Organization` + `HomeAndConstructionBusiness` (areaServed = 6 cities, telephone, email) site-wide; `Article` on articles; `BreadcrumbList` on designs and articles; `Service` on service pages. No FAQ schema.
- Performance: `next/image` (AVIF/WebP, responsive `sizes`, `priority` on LCP image only); self-hosted font; Server Components by default — client components only for forms, calculator, Explore filters, mobile menu, save hearts, 404 bars.
- `sitemap.xml` from content with `lastModified`; `robots.txt` disallows `/api/`.
- One H1 per page, logical headings, descriptive alt text, internal links (article → services/designs; design → similar designs).
- Canonical host (`fitin.space` vs `www`) decided and redirected at deploy.
- Launch: Google Search Console verification + sitemap submission (owner: Fitin).

## 7. AdSense compliance

- Footer on every page links About, Contact, Privacy, Terms.
- Privacy policy includes: third-party vendors incl. Google use cookies to serve ads based on prior visits; link to Google Ads Settings for opting out; form data collected and purpose; EEA/UK consent. Drafted in standard form; final wording reviewed by Fitin's counsel.
- `ads.txt` generated from `site.json.adsenseId` (`google.com, pub-…, DIRECT, f08c47fec0942fa0`).
- Consent: Google "Privacy & messaging" CMP (certified, Consent Mode v2). No custom banner.
- AdSense script loads only on `/journal/[article]` (`next/script`, `afterInteractive`); manual units after intro, mid-article, end; each slot reserves height (no CLS); never adjacent to buttons/forms; Auto ads off.
- **Placeholder guard:** production build fails if any `[Bracketed Placeholder]` remains in `content/`, `app/` or `components/` (the `design/` export is excluded; it keeps its placeholders as reference).
- Apply when: ~20 reviewed articles live, no placeholders, site live on fitin.space.

## 8. Forms and leads

Forms: `project` (Start), `partner` (For designers), `contact` (Contact). Client and server use the same rules from `lib/rules.ts`; error messages match the designs (e.g. "Enter a Pakistani mobile number, e.g. 0300 1234567.").

`POST /api/leads` (Node runtime):
1. Accept JSON only, ≤ 10 KB; Zod schema per `type`, unknown keys stripped.
2. Spam: honeypot field must be empty; form open ≥ 3 s; ≤ 5 submissions / 10 min per IP (in-memory).
   `ponytail:` in-memory limiter is per-process and resets on restart — fine for one Hostinger instance; move to Supabase or Redis if scaled out.
3. **Save first:** insert into `leads` via Supabase REST with the secret (service-role) key.
4. **Then email:** Resend to `LEADS_TO`, subject e.g. "New project lead: Kitchen · Lahore", `reply_to` = visitor email if given; all user values HTML-escaped.
5. Responses: saved or emailed → `200`; validation failure → `400` with field errors (shown inline); both save and email failed → `502`, UI shows "We couldn't send that — message us on WhatsApp" with a prefilled `wa.me` link.

Success state keeps the designed confirmation screen plus a "Chat on WhatsApp" button.

**Table `leads`:** `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `type text check (type in ('project','partner','contact'))`, `name text not null`, `phone text`, `email text`, `city text`, `payload jsonb not null default '{}'`, `email_sent boolean not null default false`, `source_path text`. RLS enabled, **no policies** (anon/authenticated have no access); index on `created_at`. IPs are never stored.

**Environment:** `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `LEADS_FROM`, `LEADS_TO`; public IDs live in `site.json`.
**Deploy prerequisite:** verify fitin.space in Resend (DNS records at Namecheap).

## 9. Security

- Headers on all routes: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation off), `poweredByHeader: false`.
- CSP: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` + Google ads/analytics domains; `img-src`/`frame-src`/`connect-src` limited to self + Google ad/analytics domains; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`. (`'unsafe-inline'` is required by static generation; nonce CSP would force dynamic rendering.)
- API: POST only, content-type and size checks, strict schemas, escaped email output, no user input in paths or queries beyond parameterised REST insert.
- Secrets only in server env; `.env*` git-ignored; lockfile committed; `npm audit` in checks.

## 10. Testing and verification

- **Vitest:** `lib/rules.ts` (PK phone and portfolio cases already proven in design phase), calculator maths, `/api/leads` handler with Supabase/Resend stubbed (save-then-email order, failure branches, spam rules).
- **Playwright** (desktop 1440 + phone 390): each form happy path and error messages; crawl every sitemap URL for 200 and broken links; 404; mobile menu; `@axe-core/playwright` on every page.
- **Lighthouse** on Home, a room page, a design, an article, Start: fail below 95.
- **Build gates:** content schema, placeholder guard, `npm audit`.
- **Design review:** Playwright screenshots audited with taste-skill and ui-ux-pro-max; findings presented to the user; only approved changes applied.
- **Tooling:** graphify after scaffold; claude-code-setup recommender on the real project.

## 11. Build order

1. Scaffold: Next.js, Tailwind tokens, font, layout, Header/MobileMenu/Footer, base components.
2. Content system + schemas; port 14 designs, 4 services, site data; draft 12 articles for review.
3. Pages (desktop + phone) in route order of §3.
4. Forms, `lib/rules.ts`, `/api/leads`, Supabase migration (local via Docker), Resend.
5. SEO metadata, JSON-LD, sitemap/robots/ads.txt, OG images and icons, AdSense + GA + consent.
6. Tests, Lighthouse, accessibility, design review (user approves changes).
7. Deploy prep: Hostinger notes, env vars, canonical host, Namecheap DNS (site + Resend), Search Console steps.

## 12. Owned by Fitin (blocking launch or AdSense)

- Confirm or correct: 500+ designs, 50+ designers, 25+ vendors, "installed in 14 days", "quote in under 24 hours".
- Replace sample content: the example designs' details, Signature description, budget ranges, designer names, office address, joining-fee FAQ answer.
- Review every Journal article before publishing.
- Legal wording for Privacy and Terms (counsel).
- Accounts: Supabase project, Resend, AdSense, Google Analytics, Search Console, Hostinger.
