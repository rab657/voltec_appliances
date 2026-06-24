import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { getPublishedPosts } from "@/lib/blog";
import { getPostSeo } from "@/lib/blog-data";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// Implements the llms.txt convention (https://llmstxt.org): a concise, linkable
// markdown map of the site so answer engines (ChatGPT, Claude, Perplexity,
// Gemini) can ground responses about Voltec accurately.
export async function GET() {
  const posts = await getPublishedPosts();

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(
    `> ${SITE.description} Sales are inquiry-based: customers contact Voltec on WhatsApp (${SITE.phoneDisplay}) or by phone for pricing and orders. Based in Lahore, Pakistan; serving Pakistan, UAE, KSA and Oman since ${SITE.established}.`,
  );
  lines.push("");
  lines.push("## Key facts");
  lines.push(`- Location: Hall Road, Lahore, Pakistan`);
  lines.push(`- WhatsApp: ${SITE.phoneDisplay} · Phone: ${SITE.phoneDisplay} · UAE: ${SITE.phoneUae}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(
    `- Product lines: ${CATEGORIES.filter((c) => c.id !== "all").map((c) => c.label).join(", ")}`,
  );
  lines.push(`- Technologies: IGBT static stabilizers, SVC servo stabilizers, AVR relay stabilizers, EVE LFP lithium cells, DALY BMS, PCB relays`);
  lines.push("");

  // Products grouped by category
  for (const cat of CATEGORIES.filter((c) => c.id !== "all")) {
    const items = PRODUCTS.filter((p) => p.categoryId === cat.id);
    if (!items.length) continue;
    lines.push(`## ${cat.label}`);
    for (const p of items) {
      lines.push(`- [${p.name}](${absUrl(`/products/${p.id}`)}): ${p.tagline}`);
    }
    lines.push("");
  }

  // Guides / blog with their AEO takeaways
  lines.push("## Guides & case studies");
  for (const post of posts) {
    const seo = getPostSeo(post);
    lines.push(`- [${post.title}](${absUrl(`/blog/${post.slug}`)}): ${seo.metaDescription}`);
  }
  lines.push("");

  lines.push("## Contact");
  lines.push(`- [Contact page](${absUrl("/contact")})`);
  lines.push(`- [All products](${absUrl("/products")})`);
  lines.push(`- [Blog](${absUrl("/blog")})`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
