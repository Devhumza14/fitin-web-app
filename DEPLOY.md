# Deploying fitin.space

The site is a statically generated Next.js 16 app. The only server code is `POST /api/leads`. It runs on Hostinger managed Node.js. The CRM at `crm.fitin.space` is a separate project and is not deployed from here.

Nothing below has been run yet. Do the steps in order.

## 1. Accounts Fitin creates

1. **Supabase** project. Pick the region closest to Pakistan (for example Mumbai, `ap-south-1`).
2. **Resend** account.
3. **Google Analytics 4** property. Copy the `G-…` measurement id into `content/site.json` → `gaId`.
4. **Google Search Console** property for `fitin.space`.
5. **Google AdSense**, later (see step 8).

## 2. Supabase

1. `npx supabase login`
2. `npx supabase link --project-ref <ref>`
3. `npx supabase db push` (applies `supabase/migrations/20261017000000_create_leads.sql`)
4. In the Supabase dashboard, open Settings → API. Copy the **Project URL** and the **secret** key (`sb_secret_…`, never the publishable or anon key). They become `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the Hostinger environment.

## 3. Resend

1. Add the domain `fitin.space` in Resend.
2. Add the DNS records Resend shows (SPF, DKIM, return-path) in **Namecheap → Advanced DNS**.
3. Wait until Resend shows **Verified**.
4. Set `LEADS_FROM="Fitin Website <leads@fitin.space>"`, `LEADS_TO=hello@fitin.space` and `RESEND_API_KEY`.

## 4. Hostinger managed Node.js

1. Create a Node.js website with **Node 22**.
2. Connect the Git repository.
3. Build command: `npm ci && npm run build:launch`
4. Start command: `npm start`
5. Environment variables: everything in `.env.example` (`ALLOW_INDEXING=1` (the site is hidden from search engines without it, and `build:launch` fails), `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `LEADS_FROM`, `LEADS_TO`). `NEXT_PUBLIC_` values are read at build time, so rebuild after changing them.
6. Use the `hostinger:deploy-to-hosting` skill to run the deploy and verify the live site.

`build:launch` fails on purpose until `content/site.json` has `statsVerified: true` and `legalReviewed: true`, and while any `[Bracketed Placeholder]` is left in `app/`, `components/` or `content/`.

## 5. Domain

1. In Namecheap, point `fitin.space` and `www` to Hostinger using the records shown in the Hostinger panel.
2. Keep any existing MX and TXT records.
3. Turn on SSL in Hostinger.
4. Confirm `https://www.fitin.space` redirects to `https://fitin.space` (the redirect lives in `next.config.ts`).
5. Before switching DNS, crawl the old site's sitemap, if there is one, and add a redirect in `next.config.ts` for every indexed URL that no longer exists.

## 6. Smoke test the live site

1. Submit each form once (Start project, partner application, Contact). Check the new row in Supabase and the email in the `LEADS_TO` inbox.
2. Open `/sitemap.xml` and `/robots.txt`.
3. Send the home page link to yourself on WhatsApp and check the preview image.

## 7. Search Console

1. Verify the domain with a DNS TXT record in Namecheap.
2. Submit `https://fitin.space/sitemap.xml`.

## 8. AdSense (after about 20 published articles)

1. Add the site in AdSense.
2. Put the publisher id (`ca-pub-…`) in `content/site.json` → `adsenseId`.
3. Create one display ad unit and put its id in `adSlot`.
4. Turn on **Privacy & messaging → European regulations message**.
5. Redeploy and confirm `https://fitin.space/ads.txt` returns the publisher line.

Ads only ever appear on `/journal/[article]` (a test enforces this).

## 9. Launch checklist

- [ ] `content/site.json`: `statsVerified` and `legalReviewed` set to `true` (Fitin confirms the stats, install days and quote hours; counsel approves the privacy policy and terms).
- [ ] The 14 designs are stock photos. Replace them with real work or approve them, then set their `status` to `published`.
- [ ] Review the draft journal articles and set `status` to `published` on the ones to launch.
- [ ] `npm run check && npm run e2e` pass.
- [ ] `npm run lighthouse` passes against a production build (needs a server on port 3100).
