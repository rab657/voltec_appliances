import type { Product } from "./types";
import { acModel } from "./ac-products";
import { VOLTEC_ORG, absUrl } from "./site";

// Selling price for schema.org markup: the AC line's checkout price (by R-code),
// else any price carried on the product itself. Undefined = inquiry-only.
export function productPrice(p: Product): number | undefined {
  const r = p.name.match(/\bR[2-9]\b/);
  if (r) {
    const m = acModel(r[0]);
    if (m) return m.price;
  }
  return p.price || undefined;
}

// schema.org Offer for a product — or undefined when we have no public price.
// An Offer WITHOUT a price is a structured-data ERROR in Search Console
// (Merchant listings + Product snippets reports), so inquiry-only products
// must omit `offers` entirely rather than emit a price-less one.
export function productOffer(p: Product): Record<string, unknown> | undefined {
  const price = productPrice(p);
  if (!price) return undefined;
  return {
    "@type": "Offer",
    price,
    priceCurrency: "PKR",
    availability:
      p.status === "upcoming" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    url: absUrl(`/products/${p.id}`),
    seller: VOLTEC_ORG,
  };
}
