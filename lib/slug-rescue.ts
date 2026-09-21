import { PRODUCTS } from "./products";
import { FAMILIES, isProductInHiddenFamily } from "./showcase-data";

// Self-healing URLs.
//
// WHY: a GSC audit on 2026-09-21 found 27 URLs Google still knew about, carrying
// 3,859 impressions over 180 days, every one of them returning 404 — the old Wix
// and Shopify structures. Those were mapped explicitly in next.config.ts, but the
// list only covers URLs we happened to find. Raheel: "ideally we should handle
// redirects etc. Since domain is the same, we can always reroute them so none of
// our URLs are dead."
//
// This is the general case: when a /products, /showcase or /blog slug does not
// exist, try to recognise what it was asking for and 308 to the real page.
//
// ⚠️ It deliberately does NOT rescue everything. Redirecting an unrelated URL to a
// plausible-looking page is a "soft 404" — Google discards the equity and can
// distrust the site. So a rescue only fires on a CONFIDENT match; anything else
// still 404s, and the custom not-found page carries the reader onward instead.

const NOISE = new Set([
  "voltec", "the", "a", "an", "and", "or", "for", "with", "in", "of", "to", "by",
  "pakistan", "pk", "lahore", "price", "buy", "online", "best", "new", "sale",
  "product", "products", "category", "collections", "shop", "store", "item",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && t.length > 1 && !NOISE.has(t));
}

/** Overlap score in [0,1], weighted toward covering the QUERY's tokens. */
function score(query: string[], candidate: string[]): number {
  if (!query.length || !candidate.length) return 0;
  const cand = new Set(candidate);
  const hits = query.filter((t) => cand.has(t)).length;
  // Also credit numeric/spec tokens matching (10k, 100ah, 30kva) — they are the
  // most identifying part of a stabilizer or cell slug.
  return hits / query.length;
}

type Candidate = { path: string; tokens: string[] };

function best(slug: string, candidates: Candidate[]): string | null {
  const q = tokens(slug);
  if (q.length < 2) return null; // too little to be confident about
  let top: { path: string; s: number } | null = null;
  for (const c of candidates) {
    const s = score(q, c.tokens);
    if (!top || s > top.s) top = { path: c.path, s };
  }
  // Require most of the query to be accounted for. Two-token queries must match
  // fully; longer ones may miss one token.
  return top && top.s >= (q.length <= 2 ? 1 : 0.6) ? top.path : null;
}

function visibleProducts() {
  return PRODUCTS.filter((p) => !p.hidden && !isProductInHiddenFamily(p));
}

/** A real /products/<id> for an unknown product slug, or null. */
export function rescueProduct(slug: string): string | null {
  const cands: Candidate[] = visibleProducts().map((p) => ({
    path: `/products/${p.id}`,
    tokens: [...tokens(p.id), ...tokens(p.name)],
  }));
  return best(slug, cands);
}

/** A real /showcase/<slug> — or the range collection — for an unknown family. */
export function rescueFamily(slug: string): string | null {
  const cands: Candidate[] = FAMILIES.filter((f) => !f.hidden).map((f) => ({
    path: `/showcase/${f.slug}`,
    tokens: [...tokens(f.slug), ...tokens(f.name), ...tokens(f.category)],
  }));
  return best(slug, cands);
}

/** A real /blog/<slug> for an unknown post slug, given the live post list. */
export function rescuePost(
  slug: string,
  posts: { slug: string; title: string }[],
): string | null {
  const cands: Candidate[] = posts.map((p) => ({
    path: `/blog/${p.slug}`,
    tokens: [...tokens(p.slug), ...tokens(p.title)],
  }));
  return best(slug, cands);
}
