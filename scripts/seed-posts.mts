// One-off: publish the 10 built-in blog posts (DEFAULT_POSTS) into the Supabase
// `posts` table so they go live on the real site (Supabase wins over code
// fallback once it has rows). Run: node scripts/seed-posts.mts
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_POSTS, getPostSeo } from "../lib/blog-data.ts";
import { coverFor } from "../lib/blog-covers.ts";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
) as Record<string, string>;

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rows = DEFAULT_POSTS.map((p) => {
  const seo = getPostSeo(p);
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    excerpt: p.excerpt,
    cover: coverFor(p.slug) || p.cover,
    author: p.author,
    authorRole: p.authorRole,
    readTime: p.readTime,
    date: p.date,
    published: true,
    body: p.body,
    metaTitle: p.metaTitle ?? null,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords ?? null,
    takeaways: seo.takeaways ?? null,
    faqs: seo.faqs ?? null,
  };
});

const { error } = await sb.from("posts").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("UPSERT ERROR:", error);
  process.exit(1);
}

const { data } = await sb.from("posts").select("slug").eq("published", true);
console.log(`Seeded ${rows.length} posts. Published now: ${data?.length}`);
console.log((data ?? []).map((d) => d.slug).join("\n"));
