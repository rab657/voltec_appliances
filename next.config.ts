import type { NextConfig } from "next";

// Canonical origin. Legacy redirects target it absolutely so a request arriving on
// www. or shop. lands on the apex instead of cloning the site onto a second host.
const APEX = "https://voltecappliances.com";

// Redirects are evaluated IN ORDER — specific rules must come before the catch-alls.
const nextConfig: NextConfig = {
  async redirects() {
    // ── shop.voltecappliances.com (Shopify store, disconnected 2026-08-10) ──────
    // Its DNS still points at Shopify (23.227.38.74) which answers 409, so stale
    // Google results land users on an error page and the duplicate URLs keep
    // splitting search authority. These take over once the subdomain is pointed at
    // Vercel and added as a domain there (user action — see docs/shop-redirect.md).
    const host = [{ type: "host" as const, value: "shop.voltecappliances.com" }];
    const shop = [
      { source: "/products/voltec-a-25", destination: `${APEX}/products/vt-avr-a25`, permanent: true, has: host },
      { source: "/products/voltec-a-50", destination: `${APEX}/products/vt-avr-a50`, permanent: true, has: host },
      { source: "/products/voltec-a-70", destination: `${APEX}/showcase/avr`, permanent: true, has: host },
      { source: "/products/voltec-a-100-r2", destination: `${APEX}/products/vt-avr-a100-r2`, permanent: true, has: host },
      { source: "/products/voltec-a-100-r3", destination: `${APEX}/products/vt-avr-a100-r3`, permanent: true, has: host },
      { source: "/products/voltec-a-100-r4", destination: `${APEX}/products/vt-avr-a100-r4`, permanent: true, has: host },
      { source: "/collections/avr", destination: `${APEX}/showcase/avr`, permanent: true, has: host },
      // NOTE: a repeating param must follow a "/" — `/products/voltec-svc:rest*` fails the
      // build with «Can not repeat "rest" without a prefix and suffix». Use a single
      // segment param and let the regex do the prefix matching instead.
      { source: "/collections/:slug(servo.*)", destination: `${APEX}/showcase/svc`, permanent: true, has: host },
      { source: "/products/:slug(voltec-svc.*)", destination: `${APEX}/showcase/svc`, permanent: true, has: host },
      { source: "/collections/:slug*", destination: `${APEX}/products`, permanent: true, has: host },
      { source: "/products/:slug*", destination: `${APEX}/products`, permanent: true, has: host },
    ];

    // ── Legacy Wix-era site on www.voltecappliances.com (pre-2026) ──────────────
    // AUDIT 2026-09-21: 27 URLs Google still knows carried 3,859 impressions over
    // 180 days and EVERY ONE returned 404, because the old catch-all preserved the
    // path onto a domain where that path does not exist. Google keeps the dead page
    // in its index, the equity never reaches the new site, and answer engines go on
    // quoting the old copy ("manufactured in Pakistan", "25+ years", old prices).
    //
    // A 301 to an IRRELEVANT page is treated as a soft 404 and discarded, so each
    // rule points at the closest live equivalent rather than a tidy catch-all.
    // Impression counts below are the 180-day figures that justify each mapping.
    const legacy = [
      // products — the old structure was singular /product/<slug>
      { source: "/product/lithium-cell-100a-eve-catl-solar-battery", destination: `${APEX}/products/vt-eve-lf100` }, // 1798
      { source: "/product/voltec-3-phase-stabilizer-for-elevators-sensitive-equipment-mains-line", destination: `${APEX}/industrial` }, // 340
      { source: "/product/wirell-relay-jqc-3f-t73-12vdc-5a-7a-10a", destination: `${APEX}/products/vt-relay-t73` }, // 106
      { source: "/product/voltec-3-phase-servo-motor-stabilizer---10kva---high-low-voltage-protection", destination: `${APEX}/industrial` }, // 104
      { source: "/product/voltec-servo-motor-stabilizer-1-kva-for-lcd-led-home-theatre", destination: `${APEX}/products/vt-svc-1k` }, // 71
      { source: "/product/daly-standard-bms-4s-60a-with-1a-active-balancer", destination: `${APEX}/products/vt-bms-16s` }, // 20
      { source: "/product/voltec-3-phase-servo-motor-stabilizer---30kva---buck-boost-type", destination: `${APEX}/industrial` }, // 18
      { source: "/product/voltec-a-100-r3-for-air-conditioner", destination: `${APEX}/products/vt-avr-a100-r3` }, // 10
      { source: "/product/voltec-a-120sp-works-from-75v-low-voltage", destination: `${APEX}/showcase/avr` }, // 9
      { source: "/product/wirell-relay-t90-jqx-15f-12vdc-20a-30a-40a", destination: `${APEX}/products/vt-relay-t90` }, // 8
      // …and anything else under /product/ routed by what the slug is about
      { source: "/product/:slug(.*3-phase.*)", destination: `${APEX}/industrial` },
      { source: "/product/:slug(.*servo.*)", destination: `${APEX}/showcase/svc` },
      { source: "/product/:slug(.*relay.*)", destination: `${APEX}/showcase/relay` },
      { source: "/product/:slug(.*(?:cell|lithium|lifepo4|bms).*)", destination: `${APEX}/showcase/cells` },
      { source: "/product/:slug(.*(?:a-25|a-50|a-100|a-120|avr).*)", destination: `${APEX}/showcase/avr` },
      { source: "/product/:slug*", destination: `${APEX}/products` },

      // category listings
      { source: "/category/lithium-batteries-solar", destination: `${APEX}/showcase/cells` }, // 334
      { source: "/category/residential-voltage-stabilizers", destination: `${APEX}/showcase/svc` }, // 277
      { source: "/category/three-phase-voltage-stabilizers", destination: `${APEX}/industrial` }, // 41
      { source: "/category/battery-management-systems-bms", destination: `${APEX}/products/vt-bms-16s` }, // 28
      { source: "/category/wirell-relay-by-voltec", destination: `${APEX}/showcase/relay` }, // 9
      { source: "/category/:slug*", destination: `${APEX}/products` },

      // static pages
      { source: "/contact-us", destination: `${APEX}/contact` }, // 172
      { source: "/all-products", destination: `${APEX}/products` }, // 160
      { source: "/about-us", destination: `${APEX}/about` }, // 106
      { source: "/order-confirmation", destination: `${APEX}/` }, // 6
      { source: "/help/:path*", destination: `${APEX}/` }, // 4

      // old Wix blog (/post/<slug>) — the content was generic lighting filler, so the
      // blog index is the closest honest match rather than any one article.
      { source: "/post/:slug*", destination: `${APEX}/blog` }, // 46 across 4 URLs

      // Shopify page/blog/policy namespaces (also reached on the shop host)
      { source: "/pages/about-us", destination: `${APEX}/about` }, // 191
      { source: "/pages/:slug(contact.*)", destination: `${APEX}/contact` },
      { source: "/pages/:slug*", destination: `${APEX}/about` },
      { source: "/blogs/:path*", destination: `${APEX}/blog` },
      { source: "/policies/:path*", destination: `${APEX}/privacy` },
      { source: "/cart", destination: `${APEX}/products` },
    ].map((r) => ({ ...r, permanent: true }));

    return [
      ...shop,
      ...legacy,
      // Anything still left on the old store goes to the homepage. It deliberately
      // does NOT preserve the path any more: doing so is what produced the 404s.
      { source: "/:path*", destination: APEX, permanent: true, has: host },
    ];
  },
};

export default nextConfig;
