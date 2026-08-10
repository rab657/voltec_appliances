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

## ⚠️ Expect a transition window of up to ~1 hour — this is NOT a misconfiguration

Right after the switch, `shop.voltecappliances.com` returned **HTTP 409 with
`server: cloudflare`, `error code: 1001`**. That Cloudflare is **Shopify's own CDN**
(`shops.myshopify.com` is served by Cloudflare) answering for requests that still resolved
to the OLD record — the DNS is hosted at **GoDaddy** (`ns35/ns36.domaincontrol.com`), and
there is no Cloudflare account involved. Nothing to toggle.

Proof the config was already correct while the 409s were still appearing — force the
request past every DNS cache straight at a Vercel edge IP:

```bash
curl -sI --resolve shop.voltecappliances.com:443:76.76.21.241 \
  https://shop.voltecappliances.com/collections/avr
# HTTP/2 308 · server: Vercel
# location: https://voltecappliances.com/showcase/avr
```

The CNAME's TTL is **3600s**, so stale answers can persist about an hour. Wait it out and
re-check; do not "fix" anything in the meantime.

**Note on the status code:** Next.js `permanent: true` emits **308**, not 301. Both are
permanent redirects and Google treats them equivalently for consolidation.

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
