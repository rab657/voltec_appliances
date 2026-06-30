@AGENTS.md

# Voltec Appliances — project guide

Marketing + e-commerce-style site for **Voltec Appliances** (Pakistani voltage-stabilizer
maker, est. 1995). Lead-gen, **inquiry-based** (no checkout): every product routes to a
pre-filled **WhatsApp** message. Audience is ESL / non-technical Pakistani buyers + MENAP.

> **Live operational state** — current ad campaigns, budgets, goals, blockers, and decisions —
> lives in `memory.md` (gitignored, private; this repo is **public**). Read it at the start of a
> session. Keep it updated as work lands.

@memory.md

## Commands
- `npm run dev` — Turbopack dev server (port 3000). Prefer the **preview tools** to verify UI.
- `npm run build` / `npx tsc --noEmit` — production build / typecheck before shipping.
- **Deploy = push to `main`** → Vercel auto-builds & deploys `voltecappliances.com`. There is no
  local Vercel link; just `git push origin main` and poll the live URL.

## Architecture
- **Routes:** `app/(site)/*` (App Router). Solutions verticals: `/solar`, `/medical`, `/ac`.
  Product showcases: `/showcase/[slug]`. `app/api/track/route.ts` = first-party analytics beacon.
- **Product data:** `lib/products.ts` (`PRODUCTS`, `VOLTEC_WHATSAPP`, `whatsappLink()`).
- **Showcase engine:** `lib/showcase-data.ts` — `FAMILIES` + `familyOf()` auto-collect SKUs by
  `categoryId` + `tech` (e.g. every `tech:"SVC"` product joins the `stab-svc` family). Members
  render in **array order**, so order products in `products.ts` the way the chips should appear.
- **Admin overrides:** `lib/product-media.ts` — Supabase `product_overrides` (prod) / `.data/`
  (local) can override images/price/name/hidden and add **variants**.
  ⚠️ **Variants clone the base product's specs** (only name/images/price differ). Do **not** use
  variants for SKUs that need distinct specs — that silently mislabels them. For real spec
  differences, add a proper product in `products.ts`. (This bit us on the SVC lineup.)
- **i18n:** `lib/i18n.ts` — `DICT` of 6 locales (en/ur/de/ar/ru/id; en/ur/ar exposed),
  `getT()` / `useI18n()`. Add a new `nav.*` key across **all** locales. RTL for ar/ur.
- **Site config:** `lib/site.ts` — `SITE.whatsapp`, `SITE.phone`, org structured data.
- **Variant label:** `lib/variant-label.ts` — derives chip text (e.g. "10kVA") from the product
  **name**, so model names must carry the spec they advertise.

## Tracking (this is treated as critical)
- `lib/analytics.ts` — `track()` / `pageview()` fan every event to **GA4 (gtag)**, **Meta Pixel
  (fbq)**, and the first-party `/api/track` beacon. Public IDs are baked as code defaults.
  Event→Pixel map: `lead→Lead`, `whatsapp_click`/`phone_click→Contact`, `view_item→ViewContent`.
- `lib/meta-capi.ts` — server-side **Conversions API**, deduped with the browser Pixel via a
  shared `event_id`. Token is env-only (`META_CAPI_TOKEN`), never in code.
- Every WhatsApp CTA should fire `whatsapp_click` (or `lead`) with useful params so spend ties to
  the funnel. `scripts/ads-report.py` reads per-creative spend / CTR / CPC / cost-per-lead.

## Conventions
- **Voice:** simple, short, problem-first. English-led with Roman-Urdu support; ad copy may be
  fuller Roman-Urdu (the proven local voice). Position Voltec strongly ("trusted since 1995") —
  **no false superlatives**. Keep it readable for a non-technical reader.
- **Secrets:** `.env.local` only (gitignored). **Never** commit tokens/keys or paste them in chat;
  this repo is **public**. Public IDs (GA, Pixel) are fine. Account/campaign IDs → `memory.md`.
- **Account actions I can't do:** setting Vercel env, GA4/Meta dashboard config, flipping the Meta
  app Live, topping up ad balance — surface these to the user.
- Next.js here is **modified** — read `node_modules/next/dist/docs/` before writing Next code
  (see AGENTS.md).
