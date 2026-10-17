# Fitin website

Marketing site for Fitin (fitin.space) — a Pakistani platform connecting homeowners with verified interior designers and custom-furniture vendors ("Design · Build · Fit"). Next.js 16 App Router, statically generated, deployed to Hostinger managed Node.js. The CRM is a **separate project** at crm.fitin.space — never build dashboards, logins or project tracking here; this site only links to it and sends it leads.

## Read before working
- Spec: `docs/superpowers/specs/2026-10-17-fitin-website-design.md`
- Plan (21 tasks, being executed natively in order): `docs/superpowers/plans/2026-10-17-fitin-website.md`
- Design system: `design/FITIN-DESIGN.md` · page sources: `design/pages/*.dc.html` (canvas format, reference only — not runnable) · canvas: https://claude.ai/artifact/XW6cjh4viAsRZL1dwUcFLP
- Check off plan steps (`- [x]`) as they complete so progress survives between sessions.

## Rules
- **Dependencies:** runtime deps are limited to next, react, react-dom, zod, @next/mdx, @mdx-js/loader, @mdx-js/react, @next/third-parties. Supabase and Resend are called with `fetch`, no SDKs. Ask before adding any other runtime dependency.
- **Styling:** only the `@theme` tokens in `app/globals.css`. Lime `#B6D22A` and logo teal `#229E9F` are never text on white — use `teal-dark #167A7C`. One lime (primary) action per view. No emoji, no gradients, one shadow (`shadow-float`).
- **Content:** lives in `content/` (JSON + MDX), validated by Zod at build. Designs and articles have `status: draft | published`; drafts render only in dev or with `INCLUDE_DRAFTS=1`. The 14 seeded designs are stock photos — never present them as Fitin work.
- **No invented facts:** no made-up stats, prices, names or addresses. Fitin figures live only in `content/site.json`. Unknowns stay out of the page (no `[Placeholders]` in `app/`, `components/`, `content/`).
- **Forms:** browser and server share `lib/rules.ts`; error copy is verbatim from there. `/api/leads` saves to Supabase first, then emails via Resend; WhatsApp fallback if both fail.
- **Ads:** AdSense script and slots only on `/journal/[article]` (a test enforces this).
- **Next.js 16:** route `params` are Promises (`await params`); use `preload`, not `priority`, on `next/image`.
- **Security:** secrets only in server env (`.env*` is git-ignored); headers/CSP live in `next.config.ts`.
- **Strix** security scan is the last task — official CLI only (`uv tool install --python 3.12 strix-agent`), never third-party "strix" skills.

## Commands
- `npm run dev` · `npm run build` · `npm start`
- `npm test` (Vitest, `tests/`) · `npm run e2e` (Playwright, `e2e/`, desktop + phone, builds with drafts) · `npm run check` (lint + test + audit)
- `npm run build:launch` — deploy build; fails on placeholders or until `site.json` has `statsVerified` and `legalReviewed` set to true
- `npm run lighthouse` — needs a server on :3100; fails below 95
- `npx supabase start | db reset | db push` — migrations in `supabase/migrations/`

## Tooling
- Use graphify (`graphify-out/`) for codebase questions once code exists; ponytail stays on (minimal code).
- Design review (plan Task 19) uses taste-skill + ui-ux-pro-max and **stops for user approval** before changing approved designs.
- Commits end with the `Co-Authored-By` line given in the session's attribution reminder (it names whichever model is running).
