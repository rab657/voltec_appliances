# Voltec — canonical messaging (single source of truth)

Every public surface — website, Facebook Page, Google Business Profile, ad copy,
cover art, directory listings — must trace back to this file. **If the messaging
changes, change it HERE first, then propagate to every surface in the table below.**
Created 2026-08-02 after the FB bio, GBP description, cover photo and website were
each found saying different things (and two of them carrying an unknown phone number).

---

## 1. One-liner (≤120 chars — search snippets, social bios)

> Voltage stabilizers & genuine EVE lithium cells — made and supplied in Lahore since 1995.

## 2. Short bio (~160–255 chars — FB `about`, IG bio, GBP headline)

> Servo (SVC), relay (AVR) & inverter (IGBT) stabilizers — single unit to 3-phase
> industrial — genuine EVE lithium cells, BMS & battery packs. Made in Lahore since 1995.
> Homes, industry & battery pack assemblers.

## 3. Long description (FB `description`, GBP "from the business" ≤750 chars)

> Voltec Appliances has built power-protection equipment in Lahore since 1995. We are
> an authorised EVE distributor supplying genuine Grade-A EVE LF100LA LiFePO4 cells —
> QR-traceable, with a test report on every batch — plus lithium battery packs and BMS
> for solar and UPS storage. We make voltage stabilizers for every need: relay (AVR)
> for a fridge or AC, servo (SVC) for the whole home, inverter (IGBT) for sensitive
> equipment, and three-phase industrial systems built to order from 100 to 500 kVA and
> beyond, plus PCB power relays. Every product is backed by our own service network.
> Trusted by industry leaders including K&N's. WhatsApp us your load and we'll size
> the right solution.

## 4. Product roster (canonical order — use everywhere, including cover art)

1. **EVE LF100LA LiFePO4 cells** — Grade A, QR-traceable, test report per batch, carton of 8
2. **Lithium battery packs & BMS** — solar and UPS storage
3. **Voltage stabilizers** — servo (SVC) · relay (AVR) · inverter (IGBT)
4. **Three-phase industrial systems** — 100–500 kVA+, built to order, tender documentation
5. **PCB power relays & electronic components**

Compact form for art/footers: `Cells & packs · BMS · Servo / AVR / IGBT · 3-phase industrial`

## 5. Claims — where each may appear

| claim | allowed | not allowed |
|---|---|---|
| "Authorised EVE distributor" | homepage partner row, blog, llms.txt, GBP/FB long description, Google ad copy | the top utility strip (user: too loud, 2026-07-31) |
| Prices | website (Rs 9,800/cell — firesale window from 2026-08-06) | **any Meta ad creative** (standing rule 2026-07-27); WhatsApp quote is Rs 9,700 (9,600 bulk) — deliberate discount-on-contact |
| "Trusted by K&N's" etc. | everywhere (real clients) | — |
| Superlatives ("best", "No.1") | — | everywhere (CLAUDE.md: no false superlatives) |
| Audience naming in CELLS ad copy | **"Battery pack assemblers"** only (user, 2026-08-10) | ❌ "solar installers", ❌ "dealers/distributors/resellers" — cells ads target pack assemblers & factories exclusively; MOQ 1 carton (8 cells) must be stated |
| Clever hooks / dramatic openers in ad copy | — | **anywhere** (user, 2026-08-05: "keep messaging simple — no such stupid titles… yeh extra fazool cheezain nahi likhin"). Ad copy = product name first, specs, carton rule, WhatsApp CTA. Nothing else. |

## 6. Contact & facts (must be byte-identical everywhere)

- **WhatsApp / sales CTA:** +92 321 1644447 (`wa.me/923211644447`)
- **Showroom landline (location surfaces + GBP/FB phone field ONLY):** +92 42 3636 8601
- **UAE (export only):** +971 52 541 4894
- **0324-4004778 = Raheel Ahmad's own line** (RESOLVED 2026-08-06 — it appears on every
  invoice as his contact, alongside Riaz Ahmed +92-321-4855800). It is legitimate, but the
  **sales CTA everywhere stays +92 321 1644447** — that's the line wired to lead capture.
  Artwork carrying 0324 is not wrong, just not the tracked funnel.
- **Address:** 8/26 Shadab Colony, Abid Market, Temple Road, Lahore 54000
- **Hours:** Mon–Sat 10:00–20:00, Sunday closed (confirmed 2026-07-31)
- **Founded:** 1995 · geo 31.550733, 74.316244

## 7. Surface map — where the text lives and how to update it

| surface | field | how to update |
|---|---|---|
| Website org description | `lib/site.ts` `SITE.description` | edit + deploy |
| Website hero / i18n | `lib/i18n.ts` `home.feat.*` | edit all exposed locales + deploy |
| llms.txt | `app/llms.txt/route.ts` | edit + deploy |
| Facebook `about` + `description` | Page 1879349048754625 | Graph API: page token from `/me/accounts`, `POST /{page}` |
| Facebook cover | `creatives/posts/fb-cover.html` → `creatives/out/fb-cover.png` | render, then manual upload (token lacks `pages_manage_posts`) |
| Google Business Profile | description, categories, hours | manual — google.com/business (no API access) |
| Meta ad copy | live creatives | `scripts/` tooling; NO prices |
| Google ad copy | RSAs | `scripts/google-rsa-improve.py` (campaigns currently paused) |
| Directory listings | NAP + short bio | `docs/google-business-profile.md` §5 |
