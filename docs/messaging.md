# Voltec — canonical messaging (single source of truth)

Every public surface — website, Facebook Page, Google Business Profile, ad copy,
cover art, directory listings — must trace back to this file. **If the messaging
changes, change it HERE first, then propagate to every surface in the table below.**
Created 2026-08-02 after the FB bio, GBP description, cover photo and website were
each found saying different things (and two of them carrying an unknown phone number).

---

## 1. One-liner (≤120 chars — search snippets, social bios)

> Importers of servo (SVC) & IGBT voltage stabilizers and genuine EVE/Cornex lithium cells. Since 1995.

## 2. Short bio (~160–255 chars — FB `about`, IG bio, GBP headline)

> Importers of Servo (SVC), IGBT stabilizers, genuine EVE/Cornex lithium cells.

## 3. Long description (FB `description`, GBP "from the business" ≤750 chars)

> Voltec Appliances has supplied power-protection equipment since 1995. We import servo
> (SVC), inverter (IGBT) and SCR voltage stabilizers, and supply genuine Grade-A EVE and
> Cornex LiFePO4 cells — QR-traceable, with a test report on every batch — plus battery
> packs and BMS for solar and UPS storage. We are an authorised EVE distributor. The range
> covers every need: relay (AVR) for a fridge or AC, servo (SVC) for the whole home,
> inverter (IGBT) for sensitive equipment, and three-phase industrial systems from 100 to
> 500 kVA and beyond. Plus PCB power relays. Every product is quality-checked by Voltec
> and backed by our own service network. Trusted by industry leaders including K&N's.
> WhatsApp us your load and we'll size the right solution.

## 4. Product roster (canonical order — use everywhere, including cover art)

1. **EVE & Cornex LiFePO4 cells** — Grade A, QR-traceable, test report per batch, carton of 8
2. **Lithium battery packs & BMS** — solar and UPS storage
3. **Voltage stabilizers** — servo (SVC) · inverter (IGBT) · SCR · relay (AVR) — lead with **imported**; do not label the AVR line's origin in outward-facing copy
4. **Three-phase industrial systems** — 100–500 kVA+, built to order, tender documentation
5. **PCB power relays & electronic components**

Compact form for art/footers: `Cells & packs · BMS · Servo / AVR / IGBT · 3-phase industrial`

## 5. Claims — where each may appear

| claim | allowed | not allowed |
|---|---|---|
| "Authorised EVE distributor" | homepage partner row, blog, llms.txt, GBP/FB long description, Google ad copy | the top utility strip (user: too loud, 2026-07-31) |
| Prices | website stays **Rs 9,800/cell** — the public list price never moves with the deal rate | **any Meta ad creative** (standing rule 2026-07-27). ⚠️ **NEVER sweep the WhatsApp rate onto the site** (user, 2026-08-11: "don't sweep the rate anywhere. Keep Rs.9800 online — this is when they reach out to me and I'll give that on whatsapp"). The private negotiating ladder is not recorded in this repo (see gitignored memory.md). |
| "Trusted by K&N's" etc. | everywhere (real clients) | — |
| Superlatives ("best", "No.1") | — | everywhere (CLAUDE.md: no false superlatives) |
| **Origin — "imported"** | servo (SVC), inverter (IGBT), SCR, 3-phase SJW industrial, EVE cells — say **imported** wherever the line is named (site banner, ads, bios) | never call these "made in Lahore/Pakistan", "Voltec-made", "we build/make/manufacture", "stabilizer maker" (user, 2026-09-18: "play the IMPORTED card") |
| **Origin — "made in Pakistan" / "made in Lahore"** | — | **anywhere in an outward-facing bio, description or ad** (user, 2026-09-19: "Made in lahore and shit - let's not use it"). Heritage is carried by **"Since 1995"** alone. The AVR `cfg.madepk` chip on the website is the one surviving exception and is under review — see the note below this table. |
| Audience naming in CELLS ad copy | **"Battery pack assemblers"** only (user, 2026-08-10) | ❌ "solar installers", ❌ "dealers/distributors/resellers" — cells ads target pack assemblers & factories exclusively; MOQ 1 carton (8 cells) must be stated |
| Clever hooks / dramatic openers in ad copy | — | **anywhere** (user, 2026-08-05: "keep messaging simple — no such stupid titles… yeh extra fazool cheezain nahi likhin"). Ad copy = product name first, specs, carton rule, WhatsApp CTA. Nothing else. |

> **Note on the AVR line (2026-09-19).** Voltec really does make the AVR relay A-series in Pakistan,
> and on 2026-09-18 the user asked for a "Made in Pakistan" chip on that range plus a second banner
> clause naming it. On 2026-09-19 the user then cut all made-in wording from the Facebook bio and the
> long description ("Made in lahore and shit - let's not use it"). Bios, descriptions and ad copy now
> carry **no** made-in claim. The website still shows the `cfg.madepk` chip on the AVR family and the
> banner's "AVR relay stabilizers: made in Pakistan." second clause — **left in place pending the
> user's call**, because removing it reverses an explicit instruction from the day before. Ask before
> sweeping it.

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
| Google Business Profile | description, categories, hours | manual — google.com/business (no API access). ⚠️ As of 2026-09-18 the live GBP still says "Made in Lahore since 1995" — paste §2/§3 above |
| Meta ad copy | live creatives | `scripts/` tooling; NO prices |
| Cell brands | **EVE and Cornex** (user, 2026-09-19 — Cornex is new; the website, product data and cell ads still say EVE only and need a sweep) | — |
| Google ad copy | RSAs | `scripts/google-rsa-imported.py` (imported-positioning sweep, 2026-09-18; `google-rsa-improve.py` is superseded — do not re-run its `apply`) |
| Directory listings | NAP + short bio | `docs/google-business-profile.md` §5 |
