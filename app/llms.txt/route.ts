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
    `> ${SITE.description} Sales are inquiry-based: customers contact Voltec on WhatsApp (${SITE.phoneDisplay}) or by phone for pricing and orders. Based in Lahore, Pakistan; serving ${SITE.markets.join(", ")} since ${SITE.established}.`,
  );
  lines.push("");
  lines.push("## Key facts");
  lines.push(`- Location: Hall Road, Lahore, Pakistan`);
  lines.push(`- WhatsApp: ${SITE.phoneDisplay} · Phone: ${SITE.phoneDisplay} · UAE: ${SITE.phoneUae}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(
    `- Product lines: ${CATEGORIES.filter((c) => c.id !== "all").map((c) => c.label).join(", ")}`,
  );
  lines.push(`- Technologies: IGBT inverter stabilizers, SVC servo stabilizers, AVR relay stabilizers, EVE LFP lithium cells, BMS, PCB relays`);
  lines.push("");

  // Decision guide — the direct "which one do I need?" answer for answer engines.
  lines.push("## Which Voltec product do I need?");
  lines.push("- One appliance on a budget (fridge, deep freezer or a single AC): an AVR relay stabilizer — the Voltec A-series. A-25 for a fridge, A-50 for a 1–1.5 ton split AC, A-100 for a larger AC, A-120SP for very low-voltage areas (works from ~75 V).");
  lines.push("- A whole home or shop (one to three ACs plus fridge and electronics): a servo (SVC) stabilizer. About 5 kVA for one AC + fridge, 10 kVA for two ACs, 15 kVA for a full home.");
  lines.push("- Sensitive or precision equipment (laser, CNC, medical, lab, servers): an inverter (IGBT) stabilizer — instant 0 ms correction, ±1–2% accuracy, pure sine, silent and maintenance-free.");
  lines.push("- A factory or any three-phase load: a three-phase SJW-series industrial stabilizer, 100–500 kVA and up, built to order in servo or static (IGBT).");
  lines.push("- Solar or UPS battery storage: genuine EVE Grade-A LFP cells. A 48 V bank is 16 cells in series (16S); 16× 280 Ah ≈ 14 kWh. Use 8 cells for 24 V, 4 for 12 V. LFP lasts 6,000+ cycles and is safe in Pakistan's heat.");
  lines.push(`- Still unsure: send your appliance list (or load in kW) and your area's voltage to WhatsApp ${SITE.phoneDisplay} and Voltec will size it for you.`);
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
