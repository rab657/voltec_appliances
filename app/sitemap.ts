import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { FAMILIES, isProductInHiddenFamily } from "@/lib/showcase-data";
import { getPublishedPosts } from "@/lib/blog";
import { absUrl } from "@/lib/site";

// A sitemap.ts is a Route Handler and is CACHED AT BUILD TIME by default. Blog
// posts are seeded straight into Supabase (see scripts/seed-*.mts) and go live
// without a deploy, so a build-time sitemap silently omits every post published
// since the last deploy — /blog/eve-cells-original-test-report was live and
// missing from the sitemap on 2026-09-21 for exactly this reason. Revalidating
// hourly keeps the sitemap honest without querying Supabase on every crawl.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/products"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absUrl("/ac"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // ⚠️ /industrial was omitted here until 2026-09-21 and had 0 organic impressions in
    // 28 days as a result — it is the bulk / tender / importer page and the destination
    // of the live Google Search campaign. Never drop a real route from this list.
    { url: absUrl("/industrial"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absUrl("/solar"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/medical"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Every model has its own page (2026-08-19) — stabilizers/industrial too.
  const productPages: MetadataRoute.Sitemap = PRODUCTS.filter(
    (p) => !p.hidden && !isProductInHiddenFamily(p),
  ).map((p) => ({
    url: absUrl(`/products/${p.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const showcasePages: MetadataRoute.Sitemap = FAMILIES.filter((f) => !f.hidden).map((f) => ({
    url: absUrl(`/showcase/${f.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const posts = await getPublishedPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...showcasePages, ...blogPages];
}
