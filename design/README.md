# Fitin website — design source

Live canvas (private, owner only): https://claude.ai/artifact/XW6cjh4viAsRZL1dwUcFLP

## Folder
- `FITIN-DESIGN.md` — the design system (colours, type, shape, components, form-error rules, contrast). Source of truth.
- `airbnb-reference-DESIGN.md` — the Airbnb reference it was inspired by.
- `assets/` — logo + 14 CC0 stock photos, named by subject. Sources: rawpixel / StockSnap / pd.w.org via Openverse (CC0, no credit needed).
- `pages/` — one file per canvas page + `canvas.json` (layout of the canvas).

## Pages
Desktop: Main (home), Start (4-step quote form), Explore, Detail, Services (+ kitchen calculator), Designers, About (+ contact), Legal (privacy/terms), NotFound (404), DesignSystem.
Phone (390px): PhoneHome, PhoneMenu, PhoneStart, PhoneExplore, PhoneDetail, PhoneServices, PhoneDesigners, PhoneAbout, PhoneLegal, PhoneNotFound.
Brand assets: ShareImage (1200x630 link preview), Favicon (512x512 icon).

## Important
The `.dc.html` files are the canvas' "Design Component" format, not plain web pages:
they load `./support.js` (the canvas runtime, not included here) and use `{{holes}}`, `<sc-if>`, `<sc-for>`.
Opening them in a browser will NOT render them. Use them as the reference for the real build
(layout, copy, styles are all inline and readable). View the designs on the canvas link above.

## Placeholders to resolve before launch
- Unverified claims copied from fitin.space: 500+ designs, 50+ designers, 25+ vendors, "installed in 14 days", "quote in under 24 hours".
- Invented sample content: "Teal accent lounge" design + items/finishes, Signature description, budget ranges, [Designer name], [Office address], joining-fee FAQ answer, legal wording.
- Calculator rate: 12 rft Comfort kitchen = PKR 7.55-9.19 Lakh (from fitin.space), scaled linearly.
- Forms are front-end only; they must POST to crm.fitin.space.
