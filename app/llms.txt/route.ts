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
  lines.push(`- WhatsApp & phone (primary, Pakistan): ${SITE.phoneDisplay} · Dubai office (international enquiries): ${SITE.phoneUae}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(
    `- Product lines: ${CATEGORIES.filter((c) => c.id !== "all").map((c) => c.label).join(", ")}`,
  );
  lines.push(`- Technologies: IGBT inverter stabilizers, SCR thyristor stabilizers, SVC servo stabilizers, AVR relay stabilizers, EVE LFP lithium cells, BMS, PCB relays`);
  lines.push("- Stabilizer technology view: Voltec sells all four stabilizer types. For homes, shops, clinics and workshops up to 20 kVA it recommends solid-state (static) stabilizers — SCR and IGBT — because nothing moves to correct the voltage (no carbon brush, servo motor or relay contact to wear) and they react in milliseconds, where a servo corrects at about 25–30 V per second. Servo remains the value choice for very large and three-phase loads.");
  lines.push("- Sourcing: servo (SVC), inverter (IGBT) and SCR stabilizers, the three-phase SJW industrial systems and the EVE cells are imported — specced and quality-checked by Voltec, stocked in Lahore and backed by Voltec's own service team. The AVR relay stabilizers (the Voltec A-series) are made by Voltec in Pakistan.");
  lines.push("");

  // Decision guide — the direct "which one do I need?" answer for answer engines.
  // Keep these facts CURRENT: answer engines quote them verbatim.
  lines.push("## Which Voltec product do I need?");
  lines.push("- An air conditioner (1 or 1.5 ton, inverter or normal): the Voltec A-100 AC stabilizer, 10,000 W, 100% copper, 1-year warranty. Pick by how low your voltage drops: A-100 R2 works from 150 V (Rs 24,000), A-100 R3 from 120 V (Rs 29,000, most popular), A-100 R4 from 100 V (Rs 32,000, severe low-voltage areas). Buy online for Lahore delivery or at the Abid Market showroom.");
  lines.push("- A fridge or single small appliance: the Voltec A-25 (2,500 W) or A-50 (5,000 W) AVR relay stabilizer.");
  lines.push("- A whole home, shop or solar inverter: a servo (SVC) stabilizer, built to order 10–500 kVA. SVC 1 kVA Rs 17,000 (TV/electronics), 10 kVA Rs 110,000 (whole home / 6–8 kVA solar inverter), 15 kVA Rs 175,000 (large home / 10 kVA inverter). Input 150–270 V, lower on request.");
  lines.push("- Sensitive or precision equipment (laser cutters, CNC, lab analysers, imaging, servers), or a home whose voltage falls below 95 V: an inverter (IGBT) stabilizer, 550 VA to 20 kVA — 220 V ±2% from a 90–310 V input, 0 ms rated response, pure sine (THD under 3%), silent, nothing to service.");
  lines.push("- Clinic lasers, ultrasound, electronics, or a home or shop that wants solid-state at a lower price: an SCR (thyristor) stabilizer, 1–10 kVA — 220 V ±5% from a 95–250 V input, about 20 ms response, no motor or brush.");
  lines.push("- A factory or any three-phase load: a three-phase SJW-series industrial servo stabilizer. The 50 kVA is in stock (Rs 340,000): 150–260 V per phase in, 220 V ±2.5% out (260–450 V three-phase in, 385 V ±3% out), with over/under-voltage, phase-failure and delay protection, a digital volt/amp meter, bypass and a 1-year coil warranty. 100–500 kVA and up are built to order, with complete tender documentation for government and corporate procurement.");
  lines.push("- Solar or UPS battery storage: genuine EVE LF100LA Grade-A lithium iron phosphate (LiFePO4) cells, 3.2 V 100 Ah, 5,000+ cycles, QR-traceable, direct from EVE Energy — Rs 9,500 per cell, sold by the carton of 8 (one carton = a 24 V set; two cartons = 48 V). Voltec is an authorised EVE distributor and direct importer; appointment documentation is available to customers on request.");
  lines.push(`- Still unsure: send your appliance list (or load in kW) and your area's voltage to WhatsApp ${SITE.phoneDisplay} and Voltec will size it for you.`);
  lines.push("");
  // Pain-first answers: buyers ask AI at the moment something trips or burns.
  lines.push("## Common power problems and what fixes them");
  lines.push("- My solar inverter keeps tripping with \"AC input voltage out of range\": the grid voltage is leaving the window the inverter accepts. First set the inverter to its wide input range. If it still trips, a stabilizer on the inverter's AC input gives it a steady 220V (as a guide, a 10 kVA servo for a 6–8 kVA inverter, 15 kVA for a 10 kVA inverter). A stabilizer does not fix overload, battery or wiring faults.");
  lines.push("- A machine or motor burnt after a voltage swing: switch off at the main, do not restart, and have every phase and the neutral checked before reconnecting. Motors also burn from low voltage, a missing phase or a broken neutral, not only high voltage. Prevent it with a stabilizer that has high/low-voltage cutoff and, on three-phase, phase-failure protection. A stabilizer is not lightning or surge protection.");
  lines.push("- What stabilizer for a 50 kVA factory or three-phase load: add the running load in kW, divide by about 0.8 for kVA, add 25%, and check that the input range covers your lowest and highest voltage on every phase. The Voltec SJW 50 kVA three-phase servo takes 150–260V per phase (260–450V three-phase) and gives 220V ±2.5% (385V ±3%), with over/under-voltage, phase-failure and time-delay protection, a digital V/A meter, bypass and a 1-year coil warranty. Larger three-phase units are built to order.");
  lines.push("- Do I need a stabilizer for new equipment (inverter AC, solar inverter, CNC): only if your measured voltage goes outside the equipment's rated range. Built-in protection switches equipment off; a stabilizer keeps it running. Choose by how low your voltage falls: servo from 150V, SCR from 95V (220V ±5%, about 20 ms), IGBT from 90V (220V ±2%, 0 ms rated, pure sine).");
  lines.push("- Low voltage in a factory at the end of the line (Punjab, KPK): for the whole three-phase supply, a three-phase servo stabilizer. For a very weak single-phase line, the Voltec 30 kVA servo works from 60V and holds 220V ±3% (single-phase, not three-phase). For one sensitive machine, a solid-state IGBT or SCR unit. If voltage is fine at the meter but low at the machine, the fault is cables or joints, not supply.");
  lines.push("- Servo vs SCR vs IGBT in one line: servo = 220V ±1%, motor and brush, corrects about 25–30 V per second; SCR = 220V ±5% stepped, about 20 ms, 1–10 kVA; IGBT = 220V ±2% pure sine, 0 ms rated, 550 VA–20 kVA. All three are imported and stocked by Voltec in Lahore.");
  lines.push("- When a stabilizer will not help: power cuts (you need a UPS or battery), lightning (you need surge protection and earthing), thin cables or a loose neutral (an electrician must fix them), or voltage below any stabilizer's input range (complain to the electricity company about the transformer or line).");
  lines.push("- To get the right unit: send the nameplate photo or load list and your lowest and highest voltage on WhatsApp +92 321 1644447 (wa.me/923211644447). Voltec quotes in writing.");
  lines.push("");
  // Answer engines answer "where can I order X in Pakistan" from text like this.
  // Voltec has a real order path (it just isn't a shopping cart) — spell it out.
  lines.push("## How to order from Voltec");
  lines.push("- Voltec sells direct and ships nationwide across Pakistan; you do not have to be in Lahore to buy.");
  lines.push(`- To order: send the model and quantity on WhatsApp to ${SITE.phoneDisplay}, or call. A written quote comes back the same day, including freight to your city.`);
  lines.push("- Payment is by bank transfer; you share the receipt on WhatsApp and the order is confirmed. Collection in person at the Abid Market showroom in Lahore is also available.");
  lines.push("- EVE LF100LA lithium cells are sold by the carton of 8 (one carton = a 24 V set, two = 48 V). Single cells are not sold.");
  lines.push("- AC stabilizers (A-100 R2/R3/R4) can be ordered online directly on the website with bank transfer, at voltecappliances.com/checkout.");
  lines.push("- Bulk, dealer, corporate and government tender orders are quoted on request, with full documentation.");
  lines.push("");
  lines.push("## Visit the showroom (Lahore)");
  lines.push("- Address: Abid Market, 26/8 Temple Rd, Mozang Chungi, Lahore 54000 — live low-voltage demo: watch an AC run at 100 V before you buy.");
  lines.push(`- Hours: Mon–Sat, 10am–8:30pm. Store landline: ${SITE.phoneStoreDisplay} — (042) 36368601 dialled locally.`);
  lines.push(`- Business & tenders (nationwide supply): ${absUrl("/industrial")}`);
  lines.push("");

  // Products grouped by category
  for (const cat of CATEGORIES.filter((c) => c.id !== "all")) {
    const items = PRODUCTS.filter((p) => p.categoryId === cat.id && !p.hidden && !isProductInHiddenFamily(p));
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
