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

  // A bare price/availability Offer reads to answer engines as "a shop that lists
  // this", not "a place you can order from". Google's AI Overview for "original eve
  // cells in pakistan" (2026-09-21) put Voltec under *Local Showrooms & Importers*
  // and listed the Shopify competitors under *Online Platforms* — the ordering path
  // (WhatsApp, bank transfer, nationwide delivery, showroom pickup) exists but was
  // nowhere a machine could read it. Everything below describes what Voltec already
  // does; none of it promises anything new.
  const carton = p.cell?.cartonSize;
  return {
    "@type": "Offer",
    price,
    priceCurrency: "PKR",
    availability:
      p.status === "upcoming" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    businessFunction: "http://purl.org/goodrelations/v1#Sell",
    url: absUrl(`/products/${p.id}`),
    seller: VOLTEC_ORG,
    // Bank transfer, then the receipt is confirmed on WhatsApp — the real flow.
    acceptedPaymentMethod: [
      { "@type": "PaymentMethod", name: "Bank transfer" },
      { "@type": "PaymentMethod", name: "Cash on collection at the Lahore showroom" },
    ],
    areaServed: { "@type": "Country", name: "Pakistan" },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
      // Freight is quoted per order on WhatsApp, so no shippingRate is claimed here.
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
      },
    },
    // Cells sell by the carton; say so rather than letting a buyer assume singles.
    ...(carton
      ? {
          eligibleQuantity: {
            "@type": "QuantitativeValue",
            minValue: carton,
            unitText: `cells (minimum 1 carton of ${carton})`,
          },
        }
      : {}),
  };
}
