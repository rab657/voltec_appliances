// Stabilizer/SVC SEO cluster (2026-08-06) — the cells playbook aimed at
// "voltage stabilizer pakistan" / "servo stabilizer" / price queries.
//
// WHY: user — "Delux, stabilizer.pk, Super World hit top of search… I need to be
// on top for all voltage stabilizer SVC in Pakistan." Recon (WebFetch, 08-06):
// stabilizer.pk = storefront with 85 products, most priced "₨ 0", NO guides, NO
// schema. Super World/Stabimatic sell Rs 10-14k consumer servos through it.
// They rank on the exact-match domain, not on content. Voltec's edge = real
// content + REAL PUBLISHED PRICES (they hide theirs) + Article/FAQ/Product/Store
// schema already emitted by this blog.
//
// Prices below are the ALREADY-PUBLIC ones (llms.txt + Merchant Center). Items
// without a public number stay "on quote" — never invent a price.
// Run: node scripts/seed-stabilizer-cluster.mts [--dry]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
) as Record<string, string>;

const DATE = "August 6, 2026";
const A = { author: "Voltec Team", authorRole: "Lahore Office" };

const price = {
  id: "p-stab-001",
  slug: "voltage-stabilizer-price-in-pakistan",
  title: "Voltage Stabilizer Price in Pakistan (2026): Real Prices, Every Type",
  category: "Buyer Guide",
  cover: "stripes-home",
  readTime: 8,
  excerpt:
    "Most stabilizer sellers in Pakistan won't print a price. Here is our full price list — relay (AVR), servo (SVC), inverter (IGBT) and three-phase industrial — and how to pick the right type.",
  metaTitle: "Voltage Stabilizer Price in Pakistan (2026) — AVR, Servo & 3-Phase",
  metaDescription:
    "Real voltage stabilizer prices in Pakistan: AVR from Rs 24,000, servo (SVC) from Rs 17,000 to Rs 175,000, IGBT and 3-phase industrial built to order. Full list with sizing.",
  keywords: [
    "voltage stabilizer price in pakistan", "stabilizer price in pakistan",
    "servo stabilizer price in pakistan", "svc stabilizer price", "stabilizer price lahore",
    "ac stabilizer price in pakistan", "3 phase stabilizer price in pakistan",
  ],
  takeaways: [
    "Relay (AVR) stabilizers for a fridge or AC: Rs 24,000–32,000 depending on how low your voltage drops.",
    "Servo (SVC) stabilizers: Rs 17,000 (1 kVA) to Rs 175,000 (15 kVA); larger sizes built to order.",
    "Three-phase industrial (30–500 kVA) is always built to order — get a written quote, not a listing price.",
    "A seller who won't print any price usually has one that changes with your face. Ours are public.",
  ],
  body: `<p>Search for a stabilizer price in Pakistan and you will mostly find listings that say "call for price" — or worse, ₨ 0. We publish ours. Voltec has manufactured stabilizers in Lahore since 1995, and these are the same numbers you would get on WhatsApp.</p>

<h2>Relay (AVR) stabilizers — single appliance</h2>
<p>For one fridge, one AC, one TV. The A-100 series is our AC line — pick by how low your area's voltage actually sags:</p>
<div class="table-scroll"><table>
<thead><tr><th>Model</th><th>For</th><th>Works from</th><th>Price</th></tr></thead>
<tbody>
<tr><td>A-25 (2,500W)</td><td>Refrigerator</td><td>—</td><td>on quote</td></tr>
<tr><td>A-50 (5,000W)</td><td>Split AC (1 ton)</td><td>—</td><td>on quote</td></tr>
<tr><td>A-100 R2 (10,000W)</td><td>1–1.5 ton AC</td><td>150 V</td><td>Rs 24,000</td></tr>
<tr><td>A-100 R3 (10,000W)</td><td>1–1.5 ton AC</td><td>120 V</td><td>Rs 29,000</td></tr>
<tr><td>A-100 R4 (10,000W)</td><td>1–1.5 ton AC, severe sag areas</td><td>100 V</td><td>Rs 32,000</td></tr>
</tbody></table></div>
<p>Full AC guidance is in our <a href="/blog/what-size-stabilizer-pakistan-home">home sizing guide</a> and <a href="/blog/ac-stabilizer-price-in-lahore">AC stabilizer price guide</a>.</p>

<h2>Servo (SVC) stabilizers — whole home, shop, solar inverter</h2>
<p>A servo motor drives a variac for smooth, accurate correction — the right choice above a single appliance. All 100% copper winding:</p>
<div class="table-scroll"><table>
<thead><tr><th>Size</th><th>Typical use</th><th>Price</th></tr></thead>
<tbody>
<tr><td>SVC 1 kVA</td><td>TV / electronics / one LCD</td><td>Rs 17,000</td></tr>
<tr><td>SVC 3 kVA</td><td>Photocopier, small shop</td><td>Rs 30,000</td></tr>
<tr><td>SVC 5–7 kVA</td><td>Small home</td><td>on quote</td></tr>
<tr><td>SVC 10 kVA</td><td>Whole home / 6–8 kVA solar inverter</td><td>Rs 110,000</td></tr>
<tr><td>SVC 15 kVA</td><td>Large home / 10 kVA inverter</td><td>Rs 175,000</td></tr>
<tr><td>SVC 20–30 kVA</td><td>Commercial</td><td>on quote</td></tr>
</tbody></table></div>
<p>Protecting a solar inverter? Read <a href="/blog/stabilizer-for-solar-inverter-livoltek-growatt-solis">the solar inverter stabilizer guide</a>. For the full servo picture — including three-phase — see the <a href="/blog/servo-voltage-stabilizer-pakistan">SVC guide</a>.</p>

<h2>Inverter (IGBT) stabilizers — sensitive equipment</h2>
<p>No moving parts, 0 ms correction, pure sine output — for labs, medical imaging, CNC and servers. Sized 550VA to 20 kVA, priced on quote because configuration matters. <a href="/showcase/svc">Compare the technologies here</a>.</p>

<h2>Three-phase industrial — 30 to 500 kVA</h2>
<p>Factories, elevators, hospitals and government sites. Every unit is <strong>built to order</strong> in Lahore against your load sheet, with complete tender documentation when you need it. Nobody can give you an honest flat listing price for a 100 kVA unit without knowing your load — anyone who does is guessing. WhatsApp us the load and we quote in writing.</p>

<h2>Why prices vary so much between sellers</h2>
<ul>
<li><strong>Copper vs aluminium winding.</strong> The single biggest hidden difference. Aluminium is cheaper and runs hotter with a shorter life. Ours are 100% copper.</li>
<li><strong>Real vs printed kVA.</strong> A "10 kVA" unit that sags at 7 kVA load is a 7 kVA unit with a sticker.</li>
<li><strong>Input range.</strong> Working "from 150 V" is normal; working from 100 V costs more — that is what you pay for in the R4.</li>
<li><strong>Service.</strong> A stabilizer is a 10-year purchase. We service our own units — since 1995.</li>
</ul>
<p>All prices above are showroom prices — 8/26 Shadab Colony, Abid Market, Lahore, Mon–Sat 10am–8pm — or WhatsApp <a href="https://wa.me/923211644447">+92 321 1644447</a>.</p>`,
  faqs: [
    { q: "What is the price of a voltage stabilizer in Pakistan?",
      a: "It depends on the type. Relay (AVR) stabilizers for a single AC run Rs 24,000–32,000 at Voltec. Servo (SVC) stabilizers run Rs 17,000 for 1 kVA up to Rs 175,000 for 15 kVA. Inverter (IGBT) and three-phase industrial units are configured and quoted to your load." },
    { q: "How much does a 10 kVA servo stabilizer cost in Pakistan?",
      a: "Voltec's SVC 10 kVA — enough for a whole home or a 6–8 kVA solar inverter — is Rs 110,000, with 100% copper winding. Cheaper 10 kVA units usually mean aluminium winding or an optimistic kVA rating." },
    { q: "What is the price of a 3-phase industrial stabilizer?",
      a: "Three-phase units from 30 to 500 kVA are built to order against your measured load, so honest sellers quote rather than list a price. Send Voltec your load details on WhatsApp and you get a written quote, with tender documentation if required." },
    { q: "Which stabilizer do I need for a 1.5 ton AC?",
      a: "A 10,000W AVR from the A-100 series. Choose by your area's lowest voltage: R2 works from 150 V (Rs 24,000), R3 from 120 V (Rs 29,000 — the most common choice), R4 from 100 V (Rs 32,000) for severe low-voltage areas." },
    { q: "Why do some sellers not show stabilizer prices?",
      a: "Some quote differently per customer; others list placeholder prices like ₨ 0 to get calls. Voltec publishes prices for standard models and gives written quotes for built-to-order units — the WhatsApp price and the listed price are the same." },
  ],
};

const servo = {
  id: "p-stab-002",
  slug: "servo-voltage-stabilizer-pakistan",
  title: "Servo Voltage Stabilizer (SVC) in Pakistan: 1 kVA Home to 500 kVA Industrial",
  category: "Technical",
  cover: "stripes-industrial",
  readTime: 9,
  excerpt:
    "How servo stabilizers work, when you need three-phase, and how to size 30/50/100 kVA units for factories in Karachi, Islamabad and beyond — from the people who build them in Lahore.",
  metaTitle: "Servo Voltage Stabilizer Pakistan — SVC 1–500 kVA, 3-Phase & Industrial",
  metaDescription:
    "Servo (SVC) voltage stabilizers in Pakistan: how they work, single vs three-phase, sizing 30/50/100 kVA for industry, tender supply. Built in Lahore since 1995.",
  keywords: [
    "servo voltage stabilizer pakistan", "servo motor stabilizer", "svc stabilizer",
    "3 phase voltage stabilizer pakistan", "100 kva stabilizer", "50 kva servo stabilizer",
    "industrial voltage stabilizer karachi", "servo stabilizer islamabad",
  ],
  takeaways: [
    "A servo stabilizer corrects smoothly and continuously — the right technology from whole-home size up to full factories.",
    "Three-phase units protect motors from the imbalance and sag that burn windings — the 30/50/100 kVA range covers most factories.",
    "Size on measured load plus 25–30% headroom and motor starting surge, not on the sum of nameplates.",
    "Voltec builds SVC units in Lahore since 1995 and supplies Karachi and Islamabad with tender documentation for government buyers.",
  ],
  body: `<p>Servo stabilizers do one job better than any other technology at their price: continuous, smooth correction under real load. A servo motor drives a variable transformer, so output tracks input constantly instead of jumping between relay taps. That is why every serious installation — from a 10-kVA home to a 500-kVA plant — ends up on servo or better.</p>

<h2>Single-phase SVC: home, shop, solar</h2>
<p>From 1 kVA (a TV and router) to 30 kVA (commercial), with the 10 kVA the workhorse for whole homes and 6–8 kVA solar inverters. Full prices are in our <a href="/blog/voltage-stabilizer-price-in-pakistan">price guide</a>; the short version: Rs 17,000 to Rs 175,000 for standard sizes, 100% copper throughout.</p>

<h2>When you need three-phase</h2>
<p>Any site fed by three phases — factories, workshops with machinery, elevators, hospitals, cold storage — needs a three-phase stabilizer, and not three single-phase units strapped together. Real three-phase units handle <strong>per-phase imbalance</strong>, which is what actually kills motors in Pakistani industrial estates: one sagging phase overheats a winding while the nameplate voltage looks fine.</p>

<h2>Sizing 30 / 50 / 100 kVA — the honest method</h2>
<ul>
<li><strong>Measure, don't add nameplates.</strong> Clamp the real running current per phase at peak. Summing every machine's plate oversizes by 2x.</li>
<li><strong>Add motor starting surge.</strong> Direct-on-line motors pull 5–7x rated current for a moment. Soft starters and VFDs change the maths — tell us what drives you run.</li>
<li><strong>Then add 25–30% headroom</strong> for the machines you will add next year.</li>
<li><strong>Check your real input range.</strong> "Stabilizer chahiye" usually means voltage collapses at peak hours. If your estate sees 330 V phase-to-phase at 7pm, say so — the correction range drives the design.</li>
</ul>
<div class="table-scroll"><table>
<thead><tr><th>Unit</th><th>Typical site</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>30 kVA 3-phase</td><td>Workshop, printing press, cold store</td><td>built to order</td></tr>
<tr><td>50 kVA 3-phase</td><td>Small factory floor, packaging line</td><td>built to order</td></tr>
<tr><td>100 kVA 3-phase</td><td>Textile / plastics / pharma unit</td><td>built to order, SJW series</td></tr>
<tr><td>200–500 kVA</td><td>Full plant</td><td>built to order, site survey</td></tr>
</tbody></table></div>

<h2>Karachi and Islamabad supply</h2>
<p>Most of our industrial enquiries come from <strong>Karachi</strong> — SITE, Korangi, Port Qasim, North Karachi — and the <strong>Islamabad–Rawalpindi</strong> belt including Taxila and Wah. Units are built in Lahore and shipped nationwide with installation support. We have supplied industry since 1995; plants like K&N's run our three-phase systems.</p>

<h2>Government and tender buyers</h2>
<p>We prepare <strong>complete tender documentation</strong> — certified specifications, datasheets, test reports and compliance papers — and quote against your BOQ. If you are a procurement officer comparing bids: ask every bidder whether the winding is copper, what the per-phase correction range is, and for a factory test report. Those three questions eliminate most of the field.</p>

<p>Send your load sheet or BOQ on WhatsApp — <a href="https://wa.me/923211644447">+92 321 1644447</a> — and an engineer sizes it the same day.</p>`,
  faqs: [
    { q: "What is a servo voltage stabilizer?",
      a: "A stabilizer in which a servo motor continuously drives a variable transformer, so the output voltage is corrected smoothly and accurately rather than in steps. It is the standard choice from whole-home sizes up to industrial three-phase systems." },
    { q: "What size stabilizer does a factory need — 30, 50 or 100 kVA?",
      a: "Measure the real running current per phase at peak, add motor starting surge (5–7x for direct-on-line motors), then add 25–30% headroom. Summing machine nameplates always oversizes. Voltec engineers size from your load sheet on WhatsApp the same day." },
    { q: "Can I use three single-phase stabilizers instead of one three-phase unit?",
      a: "It is done, but it cannot correct per-phase imbalance the way a true three-phase unit does — and imbalance is what overheats motor windings in Pakistani industrial estates. For motors and elevators, use a real three-phase stabilizer." },
    { q: "Do you supply servo stabilizers in Karachi and Islamabad?",
      a: "Yes — Karachi is our largest industrial market (SITE, Korangi, Port Qasim), along with the Islamabad–Rawalpindi–Taxila–Wah belt. Units are built in Lahore since 1995 and shipped nationwide with installation support." },
    { q: "Do you handle government tenders for stabilizers?",
      a: "Yes. Voltec prepares complete tender documentation — certified specifications, datasheets, test reports and compliance papers — and quotes against your BOQ for units from 30 to 500 kVA and beyond." },
  ],
};

const brands = {
  id: "p-stab-003",
  slug: "compare-stabilizer-brands-pakistan",
  title: "How to Compare Stabilizer Brands in Pakistan (Before You Pay)",
  category: "Buyer Guide",
  cover: "stripes-bench",
  readTime: 6,
  excerpt:
    "Five checks that separate a 10-year stabilizer from a 2-year one: winding metal, honest kVA, input range, service network, and whether the seller will put specs in writing.",
  metaTitle: "Best Voltage Stabilizer in Pakistan? 5 Checks Before You Buy Any Brand",
  metaDescription:
    "Comparing stabilizer brands in Pakistan: copper vs aluminium winding, real vs printed kVA, input voltage range, service network. The 5-question checklist that works on any brand.",
  keywords: [
    "best voltage stabilizer in pakistan", "best stabilizer brand pakistan",
    "stabilizer brands in pakistan", "which stabilizer is best", "copper vs aluminium stabilizer",
  ],
  takeaways: [
    "Winding metal is the biggest hidden difference — copper runs cooler and lasts; aluminium is why some units are cheap.",
    "A printed kVA is a claim, not a measurement. Ask for the full-load test report.",
    "Input range is what you are actually buying: 'works from 100 V' costs more than 'works from 150 V' for a reason.",
    "Judge the service network, not the sticker — a stabilizer is a 10-year machine.",
  ],
  body: `<p>Every brand in Pakistan says "heavy duty" and "guaranteed." Sales talk is free. Here are the five checks that actually separate stabilizers — they work on ours too, which is the point.</p>

<h2>1. Copper or aluminium winding?</h2>
<p>The transformer winding is most of the cost of a real stabilizer. Copper carries more current, runs cooler and lasts decades; aluminium is cheap, runs hot, and is the usual reason one "10 kVA" unit costs half of another. Ask directly, and get it on the invoice. Every Voltec unit is 100% copper — that is not a slogan, it is why our prices are what they are.</p>

<h2>2. Is the kVA real?</h2>
<p>A printed rating costs nothing. Ask for the <strong>full-load test report</strong> — output voltage held at rated load at low input. A unit that "is" 10 kVA but sags at 7 is a 7 kVA unit with a bigger sticker and a smaller price.</p>

<h2>3. What input range, exactly?</h2>
<p>"Works on low voltage" means nothing without a number. From 150 V is standard. From 120 V costs more. From 100 V — what our A-100 R4 does — costs more again, because the transformer must be physically bigger. If a cheap unit claims a huge range, return to check #2.</p>

<h2>4. Who services it in year six?</h2>
<p>A stabilizer is a 10-year purchase. Brands that import containers and disappear cannot service anything. We have built and serviced our own units in Lahore since 1995 — there are Voltec stabilizers from the 2000s still in service, and we still have parts.</p>

<h2>5. Will they put it in writing?</h2>
<p>Winding metal, real kVA, input range, warranty terms — on the invoice. Any brand confident in its unit will do this. Any brand that hesitates has answered your question.</p>

<p>Run these five on us and on anyone else — <a href="/blog/voltage-stabilizer-price-in-pakistan">our prices are public</a>, and the showroom on Abid Market runs live low-voltage demos Mon–Sat. WhatsApp <a href="https://wa.me/923211644447">+92 321 1644447</a>.</p>`,
  faqs: [
    { q: "Which is the best voltage stabilizer brand in Pakistan?",
      a: "Judge any brand — including Voltec — on five verifiable things: copper vs aluminium winding, a full-load test report proving the kVA rating, the exact input voltage range in writing, a real service network, and willingness to put all of it on the invoice. Brands that pass all five are rare." },
    { q: "Why are some stabilizers so much cheaper than others?",
      a: "Usually aluminium winding instead of copper, an optimistic kVA rating, or a narrower real input range than advertised. The transformer is most of the cost of an honest stabilizer, so a very low price is telling you what is inside." },
    { q: "Copper vs aluminium winding — does it really matter?",
      a: "Yes, more than any other spec. Copper carries higher current, runs cooler, and lasts decades. Aluminium heats up, degrades faster, and is the main reason two same-size stabilizers can differ 2x in price." },
    { q: "How do I verify a stabilizer's kVA rating?",
      a: "Ask for a full-load test report: rated load connected, low input voltage applied, output measured. If the seller cannot produce one, assume the printed kVA is optimistic. Voltec runs live low-voltage demos at the Abid Market showroom." },
  ],
};

const POSTS = [price, servo, brands].map((p) => ({ ...p, ...A, date: DATE, published: true }));

if (process.argv.includes("--dry")) {
  for (const p of POSTS) {
    const words = p.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    console.log(`  ${p.slug}: ${words} words · ${p.faqs.length} FAQs · ${p.keywords.length} kw`);
  }
  process.exit(0);
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await sb.from("posts").upsert(POSTS, { onConflict: "id" });
if (error) { console.error("UPSERT ERROR:", error); process.exit(1); }
const { data } = await sb.from("posts").select("slug").eq("published", true);
console.log(`Upserted ${POSTS.length}. Published total: ${data?.length}`);
for (const p of POSTS) console.log(`  /blog/${p.slug}`);
