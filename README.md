# Voltec Appliances — Website

Production rebuild of the Voltec design bundle in **Next.js 16 (App Router) + TypeScript**.
Voltage stabilizers, lithium cells & power electronics, Lahore. Lead-gen / inquiry model
(WhatsApp + phone), SEO/AEO-optimized, with a Supabase-backed blog CMS and first-party
"living site" analytics.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you need (all optional to run)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

The site runs end-to-end with **zero configuration** — products and blog posts come from
typed seed data, the admin uses localStorage, and analytics show a setup hint. Configure
the env vars below to switch on the production backends.

## What's built

| Area | Where | Notes |
|------|-------|-------|
| Design system | `styles/styles.css`, `styles/stabilizer.css` | Ported verbatim. Fonts via `next/font` (Instrument Serif / Inter Tight / JetBrains Mono). |
| Home / About / Contact | `app/(site)/` | Server-rendered, full metadata + JSON-LD. |
| Products listing + PDP | `app/(site)/products` | Filter/sort, 18 products prerendered, Product + Breadcrumb JSON-LD. |
| **Family showcase engine** | `app/(site)/showcase/[id]`, `components/showcase/` | Per-family landing templates — IGBT renders the AC→DC→AC *flow*, SVC/AVR/cells/bms/relay render *pillars*. Driven by `lib/showcase-data.ts`. |
| Blog + article pages | `app/(site)/blog` | TOC scroll-spy, Key Takeaways, FAQ accordion, Article + FAQPage + Blog JSON-LD. |
| **Admin CMS** | `app/admin`, `app/api/admin/*` | WYSIWYG editor with SEO/AEO fields. Supabase-backed, localStorage fallback. Password-gated. |
| **Analytics** | `components/Analytics.tsx`, `lib/analytics*.ts` | GA4 + Facebook Pixel + first-party collector. |
| **Living-site dashboard** | `app/admin/analytics` | Page views, product interest, reverse-DNS org, referrers. |
| SEO / AEO | `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt` | Sitemap, AI-crawler-friendly robots, llms.txt for answer engines. |

## Environment variables

All optional. See `.env.example`.

- `NEXT_PUBLIC_SITE_URL` — canonical origin (sitemap, JSON-LD, OG).
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 Measurement ID (`G-…`). Loads GA4 when set.
- `NEXT_PUBLIC_FB_PIXEL_ID` — Facebook Pixel ID. Loads the Pixel when set.
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — enable the Supabase-backed blog
  and analytics persistence. Run `supabase-schema.sql` once in your project.
- `ADMIN_PASSWORD` — when set, `/admin` requires this password (login at `/admin/login`).
  When unset, the admin is open (dev convenience).
- `ANALYTICS_DEBUG=1` — log captured events to the server console.

## Enabling the backends

1. **Analytics tags**: set `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_FB_PIXEL_ID`. Page views,
   `view_item`, and `whatsapp_click` events fan out to GA4, the Pixel, and `/api/track`.
2. **Supabase** (blog persistence + living-site analytics):
   - Create a project, run `supabase-schema.sql` in the SQL editor.
   - Set the three Supabase env vars. The blog now reads from the `posts` table and the
     admin writes to it; analytics events persist to `events` (enriched with reverse DNS).
3. **Admin auth**: set `ADMIN_PASSWORD` (and optionally `ADMIN_SESSION_SECRET`).

## Notes

- This repo follows **Next.js 16** conventions: `async` `params`/`searchParams`, the
  `PageProps<>` global helper, and `proxy.ts` (not `middleware.ts`) for route protection.
- The original design prototypes live in `../project/` for reference.
- Product render "slots" on showcase pages are intentional drop-zones (striped placeholders);
  replace `<Slot>` content or add real assets under `public/assets` as photography arrives.
