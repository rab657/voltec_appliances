import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { isProductInHiddenFamily } from "@/lib/showcase-data";
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
  lines.push(`- Location: Abid Market, Lahore, Pakistan`);
  lines.push(`- WhatsApp: ${SITE.phoneDisplay} · Phone: ${SITE.phoneDisplay} · UAE: ${SITE.phoneUae}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(
    `- Product lines: ${CATEGORIES.filter((c) => c.id !== "all").map((c) => c.label).join(", ")}`,
  );
  lines.push(`- Technologies: IGBT inverter stabilizers, SVC servo stabilizers, AVR relay stabilizers, EVE LFP lithium cells, BMS, PCB relays`);
  lines.push("");

  // Decision guide — the direct "which one do I need?" answer for answer engines.
  // Keep these facts CURRENT: answer engines quote them verbatim.
  lines.push("## Which Voltec product do I need?");
  lines.push("- An air conditioner (1 or 1.5 ton, inverter or normal): the Voltec A-100 AC stabilizer, 10,000 W, 100% copper, 1-year warranty. Pick by how low your voltage drops: A-100 R2 works from 150 V (Rs 24,000), A-100 R3 from 120 V (Rs 29,000, most popular), A-100 R4 from 100 V (Rs 32,000, severe low-voltage areas). Buy online for Lahore delivery or at the Abid Market showroom.");
  lines.push("- A fridge or single small appliance: the Voltec A-25 (2,500 W) or A-50 (5,000 W) AVR relay stabilizer.");
  lines.push("- A whole home, shop or solar inverter: a servo (SVC) stabilizer, built to order 10–500 kVA. SVC 1 kVA Rs 17,000 (TV/electronics), 10 kVA Rs 110,000 (whole home / 6–8 kVA solar inverter), 15 kVA Rs 175,000 (large home / 10 kVA inverter). Input 150–270 V, lower on request.");
  lines.push("- Sensitive or precision equipment (laser, CNC, medical, lab, servers): an inverter (IGBT) stabilizer — instant 0 ms correction, pure sine, silent and maintenance-free.");
  lines.push("- A factory or any three-phase load: a three-phase SJW-series industrial stabilizer, 100–500 kVA and up, built to order — with complete tender documentation for government and corporate procurement.");
  lines.push("- Solar or UPS battery storage: genuine EVE LF100LA Grade-A lithium iron phosphate (LiFePO4) cells, 3.2 V 100 Ah, 5,000+ cycles, QR-traceable, direct from EVE Energy — Rs 10,500 per cell, sold by the carton of 8 (one carton = a 24 V set; two cartons = 48 V). Voltec is a direct importer.");
  lines.push(`- Still unsure: send your appliance list (or load in kW) and your area's voltage to WhatsApp ${SITE.phoneDisplay} and Voltec will size it for you.`);
  lines.push("");
  lines.push("## Visit the showroom (Lahore)");
  lines.push("- Address: Abid Market, 26/8 Temple Rd, Mozang Chungi, Lahore 54000 — live low-voltage demo: watch an AC run at 100 V before you buy.");
  lines.push("- Hours: Mon–Sat, 10am–8pm. Phone: (042) 36368601.");
  lines.push(`- Business & tenders (nationwide supply): ${absUrl("/industrial")}`);
  lines.push("");

  // Products grouped by category
  for (const cat of CATEGORIES.filter((c) => c.id !== "all")) {
    const items = PRODUCTS.filter((p) => p.categoryId === cat.id && !isProductInHiddenFamily(p));
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
