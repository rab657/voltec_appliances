# Retiring shop.voltecappliances.com (the old Shopify store)

**Status 2026-08-10:** the store is disconnected in Shopify, but **DNS still points at
Shopify** — `shop.voltecappliances.com` → `voltecappliances.myshopify.com` →
`shops.myshopify.com` → `23.227.38.74`, which now answers **HTTP 409**.

That is the worst of both worlds: Google still has those URLs indexed (Search Console
shows impressions for `/collections/avr`, `/products/voltec-a-25`, `/products/voltec-svc-…`),
so real searchers click through to a Shopify error page, and the duplicate URLs keep
splitting search authority with the main site.

## Should you redirect? Yes.

Leaving it broken eventually works — Google drops erroring URLs after weeks — but a 301
is better on three counts:

1. **Users who click stale results land on the real product page** instead of an error.
2. **Any accumulated authority transfers** to voltecappliances.com instead of evaporating.
3. **The duplicate leaves the index faster** than it would via ambiguous 409s.

The redirect rules are already written in `next.config.ts` (host-matched on
`shop.voltecappliances.com`, mapping old Shopify paths to the closest live page — a 301
to an irrelevant page is treated as a soft 404 and passes nothing).

## What only you can do (2 steps, ~5 minutes)

**1. Point the subdomain at Vercel.** In the DNS host for voltecappliances.com, replace
the existing `shop` record:

```
DELETE  shop  CNAME  shops.myshopify.com
CREATE  shop  CNAME  cname.vercel-dns.com
```

**2. Add the domain in Vercel.** Project → Settings → Domains → Add
`shop.voltecappliances.com`. Vercel issues the certificate automatically; the
`next.config.ts` rules then answer every request with a 301.

## ⚠️ If it still returns 409 after the DNS change: Cloudflare is proxying it

Observed 2026-08-10 after the Vercel domain was added: `shop.voltecappliances.com` answered
**HTTP 409 with `server: cloudflare` and `error code: 1001`** (Cloudflare cannot resolve the
origin), while `voltecappliances.com` answered `server: Vercel` directly. DNS already
resolved to `cname.vercel-dns.com`, so the record itself was right — the request never
reached Vercel because the `shop` record is still **Proxied** (orange cloud) from the
Shopify era.

**Fix:** Cloudflare dashboard → DNS → the `shop` record → set proxy status to
**DNS only (grey cloud)**. Proxying also blocks Vercel's certificate challenge, which is
why the domain sat on "Generating SSL Certificate".

## Verify afterwards

```bash
curl -sI https://shop.voltecappliances.com/collections/avr | head -3
curl -sI https://shop.voltecappliances.com/products/voltec-a-25 | head -3
```

Expect `301` plus a `location:` pointing at the matching voltecappliances.com page.

Then in Search Console, submit the main sitemap again — the old URLs drop out on their
own once the 301s are seen.

## If you would rather not host the subdomain at all

Second-best option: keep DNS wherever it is but have the registrar/DNS provider do a
**domain-level 301 forward** to `https://voltecappliances.com`. Slightly worse (every
old URL lands on the homepage rather than its matching product), but far better than
409s. Do **not** simply delete the DNS record — that leaves users with a dead link and
throws away the authority instead of moving it.
