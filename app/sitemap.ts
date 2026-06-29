import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { FAMILIES } from "@/lib/showcase-data";
import { getPublishedPosts } from "@/lib/blog";
import { absUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/products"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absUrl("/solar"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/medical"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Only cells & electric parts have their own page. Stabilizers/industrial
  // live on their family showcase (model picker) — covered by showcasePages.
  const productPages: MetadataRoute.Sitemap = PRODUCTS.filter(
    (p) => p.categoryId === "cells" || p.categoryId === "parts",
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
