---
name: Fitin design system
description: Warm, photo-led interior platform. White canvas, navy ink, one lime voltage for the primary action, teal as the supporting brand color. Soft, rounded, generous — inspired by Airbnb's marketplace patterns, carried in Fitin's own logo colors.

colors:
  navy: "#0E2340"          # ink for headlines, primary dark buttons, dark bands
  teal: "#229E9F"          # brand teal — fills, icons, decorative only (fails as small text)
  teal-dark: "#167A7C"     # teal that passes contrast — eyebrows, checks, Build fills
  lime: "#B6D22A"          # the single voltage: primary CTA fill (always navy text on it)
  text: "#1F2733"          # body text
  text-2: "#4A5462"        # secondary text
  muted: "#5B6573"         # labels, inactive tabs, meta
  hairline: "#E4E7EB"      # dividers, card borders
  border: "#D5DAE0"        # input / pill outlines
  canvas: "#FFFFFF"
  surface: "#F6F7F8"       # alternate section band, footer
  navy-soft: "#E8ECF2"     # image placeholder, Design chip
  teal-soft: "#DDF0F0"     # Build chip
  lime-soft: "#F2F7E3"     # CTA panel, badges
  on-navy-2: "#C9D2DE"     # secondary text on navy
  error: "#B42318"         # form errors only — border + message (6.6:1 on white)

typography:
  family: "'Figtree', -apple-system, system-ui, sans-serif"   # weights 400–800
  display: clamp(44px, 6vw, 76px) / 1.02 / 700 / -2.4px       # one per page, the hero h1
  h2-section: clamp(32px, 4vw, 48px) / 1.08 / 700 / -1.4px
  h2-compact: 32px / 700 / -0.8px                             # grid section heads
  h3: 21–22px / 700 / -0.3px
  eyebrow: 13px / 700 / +1.2px / uppercase / teal-dark
  body-lg: 17–19px / 1.55
  body: 16px / 1.5
  small: 14px
  micro: 12px / 700                                           # field labels, badges

rounded:
  button: 12px
  input: 12px
  card: 20px          # photo cards
  panel: 24px         # content cards
  feature: 32px       # hero photo, CTA panel
  pill: 9999px        # search bar, chips, badges, icon buttons

shadow:
  float: "rgba(14,35,64,0.04) 0 0 0 1px, rgba(14,35,64,0.08) 0 4px 10px, rgba(14,35,64,0.14) 0 10px 24px"
  # the only shadow — floating chips, the start pill, sticky quote card. Everything else is flat.

layout:
  container: 1360px max, 40px side padding (16px on phones)
  section: 80px vertical
  grid-gap: 20px columns, 28px rows on photo grids
---

## Signature elements
- **The three bars.** The logo's three parallelograms = Design (navy) → Build (teal) → Fit (lime). Use them for any 3-stage or step sequence: stacked cards rotated -3deg, or a 64×28 parallelogram marker above step titles.
- **Highlight underline.** Key words in a display headline get an inset underline in navy-soft / teal-soft / lime.
- **Start pill.** Fully rounded white bar, hairline segments, lime "Start project" button on the right.

## Buttons
- Primary: lime fill, navy text, pill or 12px radius, 52–56px tall. One per view.
- Dark: navy fill, white text, 12px radius.
- Secondary: white fill, 1px navy border, navy text.
- Text link: navy, underline offset 4px.

## Forms & errors
- Validate on Continue / Submit, not while typing; once shown, errors clear live as the user fixes them.
- Error = 1px error border on the field + a 14px/600 error message with a circle-! icon below it, `role="alert"`, `aria-invalid="true"`.
- Messages say how to fix: "Enter a Pakistani mobile number, e.g. 0300 1234567." — never just "Invalid".
- Phone: accept 03XXXXXXXXX, +92 / 0092 prefixes, spaces and dashes.

## Photography
Bright, daylight interiors; whites, warm wood, navy and teal accents. No dark or moody shots, no people-centred stock. CC0 sources only.

## Contrast (measured, WCAG)
- navy on white 15.8:1 · text 15.0 · text-2 7.7 · muted 5.9 (5.5 on surface)
- teal-dark on white 5.1:1 (white on teal-dark 5.1) — passes AA for body text
- navy on lime 9.2:1 — the CTA pairing
- teal on white 3.3:1 and lime on white 1.7:1 — fills/decoration only

## Don'ts
- Lime or brand teal as text on white (contrast fails) — use teal-dark.
- More than one shadow tier, gradients, emoji.
- More than one lime action per view.
