import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // shop.voltecappliances.com was a Shopify store, disconnected 2026-08-10. Its DNS
    // still points at Shopify (23.227.38.74) which now answers 409, so stale Google
    // results land users on an error page and the duplicate URLs keep splitting our
    // search authority. These rules take over once the subdomain is pointed at Vercel
    // and added as a domain there (user action — see docs/shop-redirect.md).
    //
    // Product/collection paths map to the closest live equivalent so the redirect is a
    // 301 to a RELEVANT page — Google treats a 301 to an irrelevant page as a soft 404
    // and discards the equity we are trying to keep.
    const host = [{ type: "host" as const, value: "shop.voltecappliances.com" }];
    return [
      { source: "/products/voltec-a-25", destination: "https://voltecappliances.com/products/vt-avr-a25", permanent: true, has: host },
      { source: "/products/voltec-a-50", destination: "https://voltecappliances.com/products/vt-avr-a50", permanent: true, has: host },
      { source: "/products/voltec-a-70", destination: "https://voltecappliances.com/showcase/avr", permanent: true, has: host },
      { source: "/products/voltec-a-100-r2", destination: "https://voltecappliances.com/products/vt-avr-a100-r2", permanent: true, has: host },
      { source: "/products/voltec-a-100-r3", destination: "https://voltecappliances.com/products/vt-avr-a100-r3", permanent: true, has: host },
      { source: "/products/voltec-a-100-r4", destination: "https://voltecappliances.com/products/vt-avr-a100-r4", permanent: true, has: host },
      { source: "/collections/avr", destination: "https://voltecappliances.com/showcase/avr", permanent: true, has: host },
      // NOTE: a repeating param must follow a "/" — `/products/voltec-svc:rest*` fails the
      // build with «Can not repeat "rest" without a prefix and suffix». Use a single
      // segment param and let the regex do the prefix matching instead.
      { source: "/collections/:slug(servo.*)", destination: "https://voltecappliances.com/showcase/svc", permanent: true, has: host },
      { source: "/products/:slug(voltec-svc.*)", destination: "https://voltecappliances.com/showcase/svc", permanent: true, has: host },
      { source: "/collections/:slug*", destination: "https://voltecappliances.com/products", permanent: true, has: host },
      { source: "/products/:slug*", destination: "https://voltecappliances.com/products", permanent: true, has: host },
      // everything else on the old store
      { source: "/:path*", destination: "https://voltecappliances.com/:path*", permanent: true, has: host },
    ];
  },
};

export default nextConfig;
