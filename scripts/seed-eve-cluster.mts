// EVE cells SEO/AEO content cluster (2026-07-31).
//
// GOAL (user): rank #1 on Google and in AI answer engines for
//   "eve cells in pakistan" · "genuine eve cells in pakistan"
//   "authorized distributor of eve cells in pakistan"
//
// ⚠️ WHY THIS IS A SCRIPT AND NOT lib/blog-data.ts: the Supabase `posts` table
// has rows, and lib/blog.ts returns Supabase and IGNORES DEFAULT_POSTS whenever
// it is non-empty. Anything added to blog-data.ts would never appear live.
// Content therefore lives here (version-controlled, reviewable) and is upserted
// into Supabase, which is what the site actually reads.
//
// Run:  node scripts/seed-eve-cluster.mts          (upsert, safe to re-run)
//       node scripts/seed-eve-cluster.mts --dry    (print, change nothing)
//
// RESEARCH THIS IS BUILT ON (2026-07-31):
//  - The PK field is fragmented small shops (alladin.pk, evolta.pk,
//    neexgentsolar.pk, burncart.pk, hakadibattery.com, daroghawala.org). None
//    dominant. Evolta lists 100Ah around Rs 12,000 — Voltec is Rs 10,500.
//  - The top-ranking PK lithium buying guide (badarenergy) is ~2.5-3k words with
//    NO FAQ schema, NO product schema, NO author, NO date, and never mentions EVE
//    cells. This blog already emits Article + FAQPage + BreadcrumbList, so the
//    structural bar is already cleared — content depth is what's missing.
//  - The verification detail below (B-stamp, 24-char QR, date in chars 15-17,
//    missing safety valve on fakes) is documented on DIY Solar Power Forum,
//    Energie Panda and Gobel Power's QR decoder — and has NEVER been published
//    for a Pakistani audience. That is the moat.
//
// AUTHOR NOTE: everything is attributed to "Voltec Team" on purpose. For E-E-A-T
// the two technical posts would be stronger under a named engineer with a real
// bio — reassign in the admin once someone agrees to own them.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
) as Record<string, string>;

const DATE = "July 31, 2026";
const A = { author: "Voltec Team", authorRole: "Lahore Office" };

// ---------------------------------------------------------------------------
// 1. PILLAR — head term "eve cells in pakistan"
// ---------------------------------------------------------------------------
const pillar = {
  id: "p-eve-001",
  slug: "eve-lithium-cells-pakistan",
  title: "EVE Lithium Cells in Pakistan: The Complete Buyer's Guide",
  category: "Buyer Guide",
  cover: "assets/cells/cell-hero.webp",
  readTime: 9,
  excerpt:
    "Which EVE cells actually reach Pakistan, what they cost, how to tell Grade A from Grade B, and how many cells you need for a 24V or 48V pack. Written for assemblers and dealers.",
  metaTitle: "EVE Lithium Cells in Pakistan — Prices, Grades & Buyer's Guide (2026)",
  metaDescription:
    "Genuine EVE LiFePO4 cells in Pakistan: LF100LA at Rs 10,500 per cell, sold by the carton of 8. Grades explained, QR verification, and 24V/48V pack sizing.",
  keywords: [
    "eve cells in pakistan", "eve lithium cells pakistan", "eve lifepo4 pakistan",
    "eve cells price in pakistan", "lifepo4 cells pakistan", "eve lf100la pakistan",
    "lithium cells for solar pakistan", "prismatic lifepo4 cells lahore",
  ],
  takeaways: [
    "EVE is one of the world's largest LiFePO4 cell makers — the cells are genuine, but Pakistan's supply chain is where the risk sits.",
    "Voltec stocks EVE LF100LA (3.2V 100Ah) at Rs 10,500 per cell, sold by the carton of 8. One carton = a 24V bank; two = 48V.",
    "Grade A and Grade B look almost identical. The QR code is what separates them, and EVE stamps rejected cells with a B.",
    "Always ask for the per-cell test report before you pay. A seller who cannot produce one is selling you someone else's rejects.",
  ],
  body: `<p>If you assemble battery packs in Pakistan, EVE cells are probably already on your bench or on your shortlist. EVE Energy is one of the largest lithium iron phosphate manufacturers in the world, and their prismatic LFP cells have become the default for solar and UPS storage here.</p>

<p>The cells themselves are not the problem. <strong>The supply chain is.</strong> Pakistan's market is a patchwork of small importers, and the same model number can arrive as a factory-fresh Grade A cell or as a rejected cell with a reprinted label. This guide covers what actually reaches Pakistan, what it should cost, and how to avoid paying Grade A money for Grade B stock.</p>

<h2>Which EVE cells reach Pakistan</h2>
<p>EVE makes a wide range, but only a handful arrive here in real volume:</p>
<ul>
<li><strong>LF100LA — 3.2V 100Ah.</strong> The workhorse for home solar and UPS banks. Compact, easy to handle, and the sweet spot for a first build. This is what Voltec stocks.</li>
<li><strong>LF105 — 3.2V 105Ah.</strong> Very common in the local market. Practically interchangeable with the LF100LA in most builds.</li>
<li><strong>LF230 / LF280K / LF304 — 230Ah to 304Ah.</strong> Large-format cells for bigger banks. Fewer cells per kWh, but heavy, and a single bad cell costs you much more.</li>
</ul>

<div class="table-scroll"><table>
<thead><tr><th>Model</th><th>Nominal</th><th>Capacity</th><th>16S pack (48V)</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td>LF100LA</td><td>3.2V</td><td>100Ah</td><td>5.12 kWh</td><td>Home solar and UPS. Easiest first build — light enough to handle alone. Voltec stock.</td></tr>
<tr><td>LF105</td><td>3.2V</td><td>105Ah</td><td>5.38 kWh</td><td>Very common locally; near-identical in use to the LF100LA.</td></tr>
<tr><td>LF230</td><td>3.2V</td><td>230Ah</td><td>11.8 kWh</td><td>Larger home banks, with fewer cells and busbars to wire.</td></tr>
<tr><td>LF280K</td><td>3.2V</td><td>280Ah</td><td>14.3 kWh</td><td>Big residential and light commercial storage.</td></tr>
<tr><td>LF304</td><td>3.2V</td><td>304Ah</td><td>15.6 kWh</td><td>Maximum capacity per cell; heavy, and one bad cell costs the most.</td></tr>
</tbody></table></div>

<div class="callout"><div class="c-label">Never mix</div><div>Do not mix capacities, batches or ages in one pack. The weakest cell sets the ceiling for the whole bank — a 100Ah cell in a 105Ah string turns the entire pack into a 100Ah pack, and the mismatch accelerates ageing.</div></div>

<h2>What EVE cells cost in Pakistan</h2>
<p>Voltec sells the <strong>EVE LF100LA at Rs 10,500 per cell</strong>, by the carton of 8. We do not break cartons. Local listings for comparable 100–105Ah cells sit around Rs 11,000–12,000, so the carton price is competitive — but price alone is a bad way to choose.</p>

<p><strong>Be suspicious of anything much cheaper.</strong> A genuine Grade A cell has a floor cost set by the factory. When a price looks impossible, you are usually being offered one of three things: a Grade B cell, a recycled cell pulled from an old pack, or a counterfeit with a printed QR code. The third kind is the dangerous one.</p>

<h2>How many cells do you need?</h2>
<p>LFP cells sit at a 3.2V nominal, so pack voltage is simply the number of cells in series:</p>
<ul>
<li><strong>8 cells (8S) = 25.6V nominal</strong> — the "24V" bank. 2.56 kWh with 100Ah cells. One carton.</li>
<li><strong>16 cells (16S) = 51.2V nominal</strong> — the "48V" bank, and what most modern hybrid inverters expect. 5.12 kWh. Two cartons.</li>
<li><strong>Want more capacity, not more voltage?</strong> Add a second string in parallel — 16S2P gives you 51.2V and 10.24 kWh.</li>
</ul>
<p>Full sizing tables, the cost of a complete 48V build, and what else you need to buy are in our <a href="/blog/eve-lf100la-price-pakistan-pack-sizing">LF100LA price and pack sizing guide</a>.</p>

<h2>Grade A, Grade B, and why it matters</h2>
<p>EVE grades cells at the factory. Grade A cells meet the full capacity and internal-resistance spec. Cells that miss are marked as B grade — they still work, but capacity is lower, matching across a batch is worse, and cycle life is shorter. Sold honestly and cheaply, B grade has legitimate uses. Sold as A grade at A grade prices, it is fraud, and it is common here.</p>
<p>The two look nearly identical on the bench. <strong>The QR code is the tell</strong> — EVE stamps rejected cells with a B and the code itself is physically smaller. We wrote the full verification method, including how to decode the manufacturing date, in <a href="/blog/genuine-eve-cells-check-pakistan">how to check if your EVE cells are genuine</a>.</p>

<h2>What actually kills LFP packs in Pakistan</h2>
<p>Cells rated for 5,000+ cycles routinely die here in a fraction of that, and it is almost never the cell's fault. Five local causes, in the order we see them:</p>
<ul>
<li><strong>A cheap BMS.</strong> The most common cause by a wide margin. Without a working battery management system one cell drifts, gets over-charged or over-discharged, and takes the pack with it. This is not the component to save Rs 5,000 on.</li>
<li><strong>No compression.</strong> Prismatic LFP cells swell slightly in normal use. Without end plates and banding holding even pressure across the stack, you will not see anything close to rated cycle life. Loose cells in a box is not a pack.</li>
<li><strong>Heat.</strong> LFP handles our summers far better than lead-acid, but sustained high temperature still shortens life. A pack boxed into an unventilated cupboard against a west-facing wall in June is being cooked. Give it air.</li>
<li><strong>Daily deep cycling.</strong> With 4 to 10 hours of load-shedding, many packs do a full cycle every single day. At one cycle a day, 5,000 cycles is around thirteen years — but only if you are not running to empty daily. Size the bank so a normal day uses 70–80%, not 100%.</li>
<li><strong>Mixed batches.</strong> Cells bought at different times, or a carton split across two builds. The weakest cell rules, always.</li>
</ul>

<h2>What to demand from any seller</h2>
<ul>
<li><strong>A photo of the actual QR code</strong> on the cells you will receive — not a stock photo of a carton.</li>
<li><strong>The per-cell test report</strong> showing capacity and internal resistance for your batch.</li>
<li><strong>The grade in writing on the invoice.</strong> A seller who will say "Grade A" on WhatsApp but not on paper is telling you something.</li>
<li><strong>A straight answer on where the cells came from.</strong> Direct import, an authorised distributor, or a middleman — all are fine, but evasiveness is not. See <a href="/blog/authorized-eve-distributor-pakistan">how to verify a distributor claim</a>.</li>
</ul>

<h2>Buying from Voltec</h2>
<p>We have been building voltage stabilizers in Pakistan since 1995 and import EVE cells directly. Every carton ships with its test report, the QR codes are yours to verify before you pay, and we publish teardown and load-test videos of the stock we actually sell rather than stock photos.</p>
<p>Cells are Rs 10,500 each, carton of 8, delivered across Punjab, KPK and Gilgit-Baltistan, or collected from our Abid Market showroom in Lahore. See the <a href="/products/vt-eve-lf100">LF100LA product page</a> or message us on WhatsApp for dealer rates on multiple cartons.</p>`,
  faqs: [
    { q: "What is the price of EVE cells in Pakistan?",
      a: "Voltec sells the EVE LF100LA 3.2V 100Ah cell at Rs 10,500 per cell, sold by the carton of 8 (Rs 84,000 per carton). Dealer rates are available on multiple cartons — ask on WhatsApp. Comparable 100–105Ah cells are commonly listed locally at Rs 11,000–12,000." },
    { q: "Can I buy a single EVE cell?",
      a: "No. Cells are sold by the carton of 8, because a pack must be built from cells of the same batch and capacity. Mixing batches means the weakest cell limits the entire bank. One carton gives you a 24V bank; two cartons give you 48V." },
    { q: "How many EVE cells do I need for a 48V battery?",
      a: "Sixteen cells in series (16S) gives 51.2V nominal, which is what hybrid inverters call 48V. With 100Ah cells that is 5.12 kWh of storage. That is two cartons of 8." },
    { q: "Are Voltec's EVE cells Grade A?",
      a: "Yes. Every carton ships with its per-cell test report showing capacity and internal resistance, and you are welcome to verify the QR codes on the cells before paying. We put the grade in writing on the invoice." },
    { q: "Which EVE cell is best for home solar in Pakistan?",
      a: "For a first home build the LF100LA (3.2V 100Ah) is the easiest to work with — light enough to handle alone, and 16 cells give a standard 5.12 kWh 48V bank. Large-format cells like the LF280K store more per cell but are heavy and a single failure costs more." },
    { q: "Do you deliver EVE cells outside Lahore?",
      a: "Yes — across Punjab, Khyber Pakhtunkhwa and Gilgit-Baltistan. You can also collect from the Abid Market showroom in Lahore." },
  ],
};

// ---------------------------------------------------------------------------
// 2. SPOKE — "genuine eve cells in pakistan". The flagship / moat piece.
// ---------------------------------------------------------------------------
const genuine = {
  id: "p-eve-002",
  slug: "genuine-eve-cells-check-pakistan",
  title: "How to Check If Your EVE Cells Are Genuine (QR Code, B-Mark, Safety Valve)",
  category: "Technical",
  cover: "assets/cells/vp-traceable.jpg",
  readTime: 8,
  excerpt:
    "Grade A and Grade B EVE cells look identical on the bench. The QR code, the safety valve and a multimeter will tell you the truth in ten minutes — before you pay.",
  metaTitle: "How to Check Genuine EVE Cells in Pakistan — QR Code & B-Mark Guide",
  metaDescription:
    "Verify genuine EVE LiFePO4 cells before you pay: the 24-character QR rule, EVE's B-stamp on rejected cells, the missing safety valve on fakes, and a bench test.",
  keywords: [
    "genuine eve cells in pakistan", "fake eve cells", "eve grade b cells",
    "how to check eve cells genuine", "eve cell qr code check", "eve b mark",
    "original eve lf100la", "counterfeit lifepo4 cells pakistan",
  ],
  takeaways: [
    "A genuine EVE QR code is 24 characters (19 on an officially recycled cell). Anything else is a red flag.",
    "EVE stamps rejected cells with a B, and the QR code on a B-grade cell is physically smaller than on Grade A.",
    "Characters 15, 16 and 17 of the QR code encode the manufacturing date — so you can catch old stock sold as fresh.",
    "Counterfeit cells frequently have no safety valve. That is not a quality issue, it is a fire risk.",
    "Ten minutes with a multimeter before you pay is cheaper than replacing a pack in eighteen months.",
  ],
  body: `<p>The uncomfortable truth about buying EVE cells in Pakistan is that a Grade A cell and a factory-rejected Grade B cell look nearly the same sitting on a table. Same blue case, same terminals, same model number silkscreened on the side. The difference shows up eighteen months later when one cell in your pack drops and takes the whole bank's usable capacity with it.</p>

<p>You do not have to trust anyone's word. Here is how to check, in the order you should check.</p>

<h2>1. Count the characters in the QR code</h2>
<p>Every genuine EVE cell carries a QR code laser-marked on the top face. Scan it with any phone QR reader and count what comes out:</p>
<ul>
<li><strong>24 characters</strong> — a normal genuine cell.</li>
<li><strong>19 characters</strong> — an officially recycled or reclaimed cell. Legitimate, but it is not new, and it should not be priced as new.</li>
<li><strong>Anything else, or a code that will not scan at all</strong> — walk away.</li>
</ul>
<p>This single check catches most counterfeits, because printed fake labels are generated without knowing the format.</p>

<div class="callout"><div class="c-label">Roman Urdu</div><div>QR code scan karein aur characters ginein. 24 characters = normal cell. 19 = recycled cell (naya nahi hai — naye ka rate mat dein). Scan hi nahi hota? Cell na khareedein.</div></div>

<h2>2. Look for the B</h2>
<p>EVE marks cells that fail its Grade A spec with a <strong>B</strong> at the QR code. Two things give it away:</p>
<ul>
<li>The letter B stamped as part of the code area.</li>
<li><strong>The QR code itself is visibly smaller</strong> than on a Grade A cell. Put two cells side by side and it is obvious.</li>
</ul>
<p>B-grade cells are not fake and not useless — lower capacity, wider spread across a batch, shorter life. Sold cheaply and honestly they have real uses. The problem is B-grade sold at A-grade prices, which is the single most common way buyers get cheated here.</p>

<h2>3. Decode the manufacturing date</h2>
<p>The date is encoded in <strong>characters 15, 16 and 17</strong> of the QR string:</p>
<ul>
<li><strong>Character 15 — year.</strong> A = 2020, B = 2021, C = 2022, and so on through the alphabet.</li>
<li><strong>Character 16 — month.</strong> 1 to 9 for January to September, then A, B, C for October, November and December.</li>
<li><strong>Character 17 — day.</strong> 1 to 9 for the 1st to 9th, then A to V for the 10th to 31st.</li>
</ul>
<p>This matters because LFP cells age on the shelf as well as in use. A cell manufactured three years ago is not fresh stock, however new the carton looks. If every cell in a "new" batch decodes to an old date, you are buying someone's dead inventory.</p>

<h2>4. Check the safety valve</h2>
<p>Every genuine prismatic LFP cell has a pressure relief vent on the top face — a deliberately weak point that lets gas escape safely if the cell is abused. <strong>Counterfeit cells frequently do not have one.</strong></p>
<p>This is the part of the article to take most seriously. A cell with no vent does not fail gracefully; it fails as a rupture. This is not about getting your money's worth, it is about not putting a fire hazard inside someone's house.</p>

<h2>5. Put a multimeter on it</h2>
<p>Before you accept a carton:</p>
<ul>
<li><strong>Measure open-circuit voltage on every cell.</strong> Cells from one genuine batch should sit within a few millivolts of each other, typically around 3.2–3.3V at storage charge. A spread of 100mV or more across a "matched" batch means they were never matched.</li>
<li><strong>Check the terminals.</strong> Genuine terminals are cleanly machined with crisp threads. Rough, burred or re-welded terminals suggest a cell pulled from a previous pack.</li>
<li><strong>Look at the case.</strong> Dents, scuff marks around the terminals, or residue where old busbars were bolted on all point to a reclaimed cell.</li>
</ul>

<h2>6. Ask for the test report — and ask before you pay</h2>
<p>A real supplier can produce a per-cell test report for your batch showing capacity and internal resistance. This is normal paperwork in this trade, not a special favour. A seller who cannot or will not produce one either does not know what they bought, or does and would rather you did not.</p>

<div class="callout"><div class="c-label">The one-line test</div><div>Ask for a photo of the QR code on the specific cells you will receive, and the test report for that batch, before paying. An honest seller sends both within minutes. Everyone else changes the subject.</div></div>

<h2>How Voltec handles this</h2>
<p>We import EVE cells directly and we publish what we actually have in stock — teardown footage, load tests, and the QR codes on the real cartons rather than stock photography. Every carton ships with its test report. You are welcome to scan the codes and run a multimeter over the cells before you hand over money; if a cell fails any check above, it is not your problem to absorb.</p>
<p>See the <a href="/products/vt-eve-lf100">LF100LA product page</a> for current stock, or read the <a href="/blog/eve-lithium-cells-pakistan">complete EVE cells buyer's guide</a> for prices and pack sizing. If you want to check a seller's authorisation claim, we wrote that up <a href="/blog/authorized-eve-distributor-pakistan">here</a>.</p>`,
  faqs: [
    { q: "How can I tell if EVE cells are genuine?",
      a: "Scan the QR code and count the characters: a genuine EVE cell returns 24 characters, or 19 for an officially recycled cell. Then check for a B stamp and a smaller-than-normal QR code (both indicate a factory-rejected Grade B cell), confirm the pressure relief valve is present on the top face, and measure open-circuit voltage across every cell — a genuine matched batch sits within a few millivolts." },
    { q: "What does the B mark on an EVE cell mean?",
      a: "EVE stamps cells that fail its Grade A specification with a B, and prints a physically smaller QR code on them. B-grade cells have lower capacity, wider variation across a batch and shorter cycle life. They are not counterfeit and can be used legitimately if priced accordingly — the fraud is selling them at Grade A prices." },
    { q: "Are Grade B EVE cells safe to use?",
      a: "Genuine Grade B cells from EVE are safe in the sense that they are real cells with a real safety valve, but they will not hold rated capacity and will not stay matched over time. They are unsuitable for a pack you expect to last ten years. Counterfeit cells with no safety valve are a different matter entirely and should never be used." },
    { q: "How do I read the manufacturing date on an EVE cell?",
      a: "Characters 15, 16 and 17 of the QR code hold the date. Character 15 is the year, where A is 2020, B is 2021 and so on. Character 16 is the month: 1 to 9 for January to September, then A, B and C for October to December. Character 17 is the day: 1 to 9 for the 1st to 9th, then A to V for the 10th to 31st." },
    { q: "What if the seller will not show me the QR code?",
      a: "Treat that as an answer. Asking for a photo of the QR code on the cells you will actually receive, plus the batch test report, is a routine request in this trade. A supplier who deflects either does not know what they imported or does not want you to check." },
    { q: "Can I test lithium cells at home before buying?",
      a: "Yes, and you should. A basic multimeter is enough to measure open-circuit voltage on each cell and spot a batch that was never matched. You can also inspect terminals for re-welding and the case for marks left by previous busbars, both of which indicate reclaimed cells." },
  ],
};

// ---------------------------------------------------------------------------
// 3. SPOKE — "authorized distributor of eve cells in pakistan"
// ⚠️ The authorisation claim below is stated because the user confirmed on
// 2026-07-31 that Voltec is appointed and holds documentation. If that ever
// changes, EDIT THIS POST FIRST — a false distributor claim is a trademark
// exposure with EVE and the first thing a competitor screenshots.
// TODO(voltec): add the appointing entity, document reference and territory to
// the proof callout, and upload a scan. A specific claim outranks a vague one.
// ---------------------------------------------------------------------------
const distributor = {
  id: "p-eve-003",
  slug: "authorized-eve-distributor-pakistan",
  title: "Authorised EVE Cell Distributor in Pakistan — and How to Verify Any Seller",
  category: "Company",
  cover: "assets/cells/cell-2.webp",
  readTime: 6,
  excerpt:
    "Plenty of sellers in Pakistan call themselves authorised. Very few can show you anything. Here is what real authorisation means, and the four documents to ask for.",
  metaTitle: "Authorised EVE Cell Distributor in Pakistan | Voltec Appliances",
  metaDescription:
    "Voltec is an authorised EVE cell distributor in Pakistan, with documentation available on request. Learn the four checks that separate a real distributor from a reseller.",
  keywords: [
    "authorized distributor of eve cells in pakistan", "eve authorised distributor pakistan",
    "eve energy dealer pakistan", "eve cells official distributor", "eve distributor lahore",
    "genuine eve supplier pakistan",
  ],
  takeaways: [
    "Voltec is an authorised EVE cell distributor in Pakistan. Our appointment documentation is available to customers on request.",
    "\"Authorised\" is a specific commercial status, not a marketing adjective — most Pakistani sellers using the word are resellers or importers.",
    "Ask for four things: the appointment document, the upstream supplier's name, the batch test report, and the grade written on your invoice.",
    "Authorisation is a supply-chain guarantee. It does not replace checking the QR codes on the cells you are handed.",
  ],
  body: `<p>Search for EVE cells in Pakistan and you will find a dozen sellers describing themselves as authorised, official, or a direct dealer. The words are used loosely. Almost none of these sellers will show you a document if you ask, because in most cases there is nothing to show.</p>

<p>This page explains what authorisation actually means, states our own position plainly, and gives you the four checks that separate a real distributor from a reseller with good branding.</p>

<h2>Voltec's position</h2>
<p><strong>Voltec Appliances is an authorised EVE cell distributor in Pakistan.</strong> We have been manufacturing voltage stabilizers here since 1995, and we supply genuine EVE LiFePO4 cells to battery pack assemblers and dealers across Punjab, Khyber Pakhtunkhwa and Gilgit-Baltistan.</p>

<div class="callout"><div class="c-label">Ask us for the paperwork</div><div>Our appointment documentation is available to customers on request — message us on WhatsApp and we will send it before you place an order. We would rather you verified us than took our word for it, and we would encourage you to ask every other seller for the same thing.</div></div>

<h2>What "authorised" actually means</h2>
<p>There are three genuinely different positions in this market, and it is worth knowing which one you are dealing with:</p>
<ul>
<li><strong>Authorised distributor.</strong> Formally appointed, in writing, by the manufacturer or by an authorised upstream distributor, usually for a defined territory. Supply is traceable to the factory.</li>
<li><strong>Direct importer.</strong> Buys genuine cells and imports them itself, without a formal appointment. This can be perfectly legitimate and the cells can be perfectly genuine — it is simply a different relationship.</li>
<li><strong>Reseller.</strong> Buys from whoever has stock locally. Often has no reliable idea of the cells' origin, which is where Grade B stock sold as Grade A enters the market.</li>
</ul>
<p>None of these is automatically dishonest. What matters is that the seller tells you which one they are, and can prove it.</p>

<h2>The four things to ask for</h2>
<p>Send these four requests to any seller before you pay. It takes two minutes and it will thin the field fast.</p>
<ul>
<li><strong>1. The appointment document.</strong> An authorisation letter or certificate naming the seller, and naming who appointed them. "We are authorised" in a WhatsApp message is not a document.</li>
<li><strong>2. The upstream supplier.</strong> Who did this stock come from — EVE directly, or a named authorised distributor? A seller who cannot name their own supply chain does not control it.</li>
<li><strong>3. The batch test report.</strong> Per-cell capacity and internal resistance for the specific cartons you are buying. Routine paperwork, not a favour.</li>
<li><strong>4. The grade, written on the invoice.</strong> If a seller will say Grade A on the phone but will not put it on paper, you have learned what you needed to know.</li>
</ul>

<h2>Authorisation is not a substitute for checking</h2>
<p>This is the part most distributor pages leave out. Authorisation tells you about the supply chain. It does not tell you what is inside the specific carton in front of you — cartons get swapped, stock gets mixed, and paperwork gets reused.</p>
<p><strong>Verify the cells as well as the seller.</strong> Scan the QR codes, count the characters, check for the B mark and confirm the safety valve is present. It takes ten minutes and it is the only check that examines the actual cells you will be putting in someone's home. Our full method is in <a href="/blog/genuine-eve-cells-check-pakistan">how to check if your EVE cells are genuine</a>.</p>

<h2>Buying from us</h2>
<p>EVE LF100LA cells are Rs 10,500 each, sold by the carton of 8, with the batch test report included and the QR codes available for you to check before payment. Delivery across Punjab, KPK and Gilgit-Baltistan, or collection from our Abid Market showroom in Lahore.</p>
<p>See the <a href="/products/vt-eve-lf100">LF100LA product page</a>, the <a href="/blog/eve-lithium-cells-pakistan">complete buyer's guide</a>, or message us on WhatsApp for dealer rates.</p>`,
  faqs: [
    { q: "Is Voltec an authorised EVE distributor in Pakistan?",
      a: "Yes. Voltec Appliances is an authorised EVE cell distributor in Pakistan, and our appointment documentation is available to customers on request — ask on WhatsApp before placing an order. We have manufactured voltage stabilizers in Pakistan since 1995." },
    { q: "How do I verify that a seller is really an authorised EVE distributor?",
      a: "Ask for four things: the written appointment letter or certificate naming them and naming who appointed them; the name of their upstream supplier; the per-cell test report for the batch you are buying; and the cell grade written on your invoice. A genuine distributor can produce all four. A claim in a WhatsApp message is not a document." },
    { q: "What is the difference between an authorised distributor and a direct importer?",
      a: "An authorised distributor has been formally appointed in writing by the manufacturer or an authorised upstream distributor, usually for a defined territory, so supply is traceable to the factory. A direct importer buys and imports genuine cells without that formal appointment. Both can supply genuine cells — the difference is the relationship and the traceability, not automatically the quality." },
    { q: "Does buying from an authorised distributor mean the cells are cheaper?",
      a: "Not necessarily. Authorisation is about traceable supply, not price. What it should mean is that the origin of the stock is known and the grade is guaranteed in writing, which is what protects you from paying Grade A prices for factory rejects." },
    { q: "If a seller is authorised, do I still need to check the cells?",
      a: "Yes. Authorisation describes the supply chain, not the specific carton in front of you. Always scan the QR codes, count the characters, look for the B mark and confirm the safety valve is present before you pay." },
  ],
};

// ---------------------------------------------------------------------------
// 4. SPOKE — commercial intent: price + pack sizing
// ---------------------------------------------------------------------------
const pricing = {
  id: "p-eve-004",
  slug: "eve-lf100la-price-pakistan-pack-sizing",
  title: "EVE LF100LA Price in Pakistan + How Many Cells for a 24V or 48V Pack",
  category: "Buyer Guide",
  cover: "assets/cells/vp-matched.jpg",
  readTime: 7,
  excerpt:
    "Rs 10,500 per cell, carton of 8. Here is what a complete 24V and 48V build actually costs once you add the BMS and busbars — and when buying a finished pack makes more sense.",
  metaTitle: "EVE LF100LA Price in Pakistan (2026) — 24V & 48V Pack Cost Breakdown",
  metaDescription:
    "EVE LF100LA 3.2V 100Ah at Rs 10,500 per cell, carton of 8. Full 24V (2.56 kWh) and 48V (5.12 kWh) pack sizing, what else you need, and total build cost.",
  keywords: [
    "eve lf100la price in pakistan", "eve cell price pakistan", "lifepo4 cell price in pakistan",
    "48v lifepo4 battery pack pakistan", "24v lithium battery pack cells",
    "5kwh lithium battery cost pakistan", "diy lifepo4 pack pakistan",
  ],
  takeaways: [
    "EVE LF100LA is Rs 10,500 per cell, sold by the carton of 8 — Rs 84,000 per carton.",
    "8 cells in series gives a 24V bank at 2.56 kWh. 16 cells gives a 48V bank at 5.12 kWh.",
    "Cells are roughly 80–85% of a build. Budget for a BMS, busbars, nuts and compression as well.",
    "Building your own makes sense above roughly one 48V pack — below that, a finished pack is usually better value once you count your time.",
  ],
  body: `<p>The most common question we get from assemblers is simply: what does a pack cost? Here is the arithmetic, with nothing hidden.</p>

<h2>Cell price</h2>
<p><strong>EVE LF100LA, 3.2V 100Ah: Rs 10,500 per cell.</strong> Sold by the carton of 8, so Rs 84,000 per carton. We do not break cartons — a pack has to be built from cells of the same batch, and splitting cartons is how mismatched banks get made. Dealer rates apply on multiple cartons; ask on WhatsApp.</p>

<h2>Pack sizing</h2>
<p>LFP is 3.2V nominal per cell, so series count sets voltage and the cell capacity sets the amp-hours:</p>
<ul>
<li><strong>8S — 25.6V nominal ("24V"), 100Ah, 2.56 kWh.</strong> One carton. Suits a small backup, a shop, or an older 24V inverter.</li>
<li><strong>16S — 51.2V nominal ("48V"), 100Ah, 5.12 kWh.</strong> Two cartons. What almost every modern hybrid inverter expects, and the most common home build.</li>
<li><strong>16S2P — 51.2V, 200Ah, 10.24 kWh.</strong> Four cartons. Two parallel strings for a bigger home or light commercial load.</li>
</ul>

<div class="table-scroll"><table>
<thead><tr><th>Config</th><th>Cells</th><th>Cartons</th><th>Nominal</th><th>Capacity</th><th>Cell cost</th></tr></thead>
<tbody>
<tr><td>8S</td><td>8</td><td>1</td><td>25.6V ("24V")</td><td>2.56 kWh</td><td>Rs 84,000</td></tr>
<tr><td>16S</td><td>16</td><td>2</td><td>51.2V ("48V")</td><td>5.12 kWh</td><td>Rs 168,000</td></tr>
<tr><td>16S2P</td><td>32</td><td>4</td><td>51.2V ("48V")</td><td>10.24 kWh</td><td>Rs 336,000</td></tr>
<tr><td>16S3P</td><td>48</td><td>6</td><td>51.2V ("48V")</td><td>15.36 kWh</td><td>Rs 504,000</td></tr>
</tbody></table></div>
<p>Cell cost only — see below for what else a finished pack needs.</p>

<div class="callout"><div class="c-label">Voltage names are nominal</div><div>A "48V" LFP pack actually runs from about 40V empty to 58.4V fully charged. Check your inverter's real battery voltage window before you commit to a series count — some older units cannot handle the top of that range.</div></div>

<h2>Sizing the BMS to your inverter</h2>
<p>The BMS has to carry your inverter's full current, not the battery's rated current. Work it out from inverter power and pack voltage, then add headroom:</p>
<div class="table-scroll"><table>
<thead><tr><th>Inverter</th><th>Current at 48V</th><th>BMS to fit</th></tr></thead>
<tbody>
<tr><td>3 kW</td><td>~63A</td><td>100A</td></tr>
<tr><td>5 kW</td><td>~104A</td><td>150A</td></tr>
<tr><td>8 kW</td><td>~167A</td><td>200A</td></tr>
<tr><td>10 kW</td><td>~208A</td><td>250A</td></tr>
</tbody></table></div>
<p>The rule is inverter watts divided by roughly 48, then add about 25% headroom and round up to the next standard size. Undersizing the BMS is the most common way a good set of cells gets ruined.</p>

<h2>What a complete build costs</h2>
<p>Cells are the bulk of it, but they are not all of it. For a 16S 48V 5.12 kWh pack you also need:</p>
<ul>
<li><strong>A BMS</strong> sized for your charge and discharge current — this is not optional and not the place to save money. An LFP pack without a working BMS will eventually be destroyed by a single cell drifting.</li>
<li><strong>Busbars and nuts</strong> to link the cells. Voltec supplies nuts and copper busbars with the cells.</li>
<li><strong>Compression</strong> — end plates and banding. Prismatic LFP cells swell slightly in normal use and need to be held under even pressure to reach rated cycle life.</li>
<li><strong>An enclosure, wiring and a main fuse or breaker.</strong></li>
</ul>
<p>In practice the cells come to roughly 80–85% of a self-built pack. So a 48V 5.12 kWh build starts around Rs 168,000 in cells, with the balance of materials on top of that depending on the BMS you choose.</p>

<h2>Build or buy?</h2>
<p>Honest answer: <strong>below about one 48V pack, buying a finished battery is usually better value</strong> once you count your own time, the tools, and the risk of getting compression or the BMS wrong. Self-building pays off when you are making several packs, when you want to choose your own BMS, or when you are assembling for customers — which is exactly who most of our cell buyers are.</p>
<p>If you would rather not build at all, we also stock finished lithium packs — ask on WhatsApp what is in stock this week.</p>

<h2>Before you pay</h2>
<p>Whatever you buy and whoever you buy from, verify the cells. Scan the QR codes, count the characters, check for the B mark, and confirm the safety valve is present on every cell. The full ten-minute method is in <a href="/blog/genuine-eve-cells-check-pakistan">how to check if your EVE cells are genuine</a>, and background on grades and models is in the <a href="/blog/eve-lithium-cells-pakistan">complete EVE cells buyer's guide</a>.</p>
<p>Current stock and specifications are on the <a href="/products/vt-eve-lf100">LF100LA product page</a>. Delivery across Punjab, KPK and Gilgit-Baltistan, or collect in Lahore.</p>`,
  faqs: [
    { q: "What is the price of an EVE LF100LA cell in Pakistan?",
      a: "Rs 10,500 per cell, sold by the carton of 8, which is Rs 84,000 per carton. Dealer rates are available on multiple cartons. Nuts and copper busbars are supplied with the cells." },
    { q: "How much does a 48V 5kWh lithium battery cost to build?",
      a: "A 16S 48V pack at 5.12 kWh needs 16 EVE LF100LA cells — two cartons, so about Rs 168,000 in cells. Cells are roughly 80–85% of a build, so add a suitably sized BMS, compression end plates and banding, an enclosure, wiring and a main fuse on top." },
    { q: "How many EVE cells make a 24V battery?",
      a: "Eight cells in series (8S) gives 25.6V nominal, which inverters call 24V. With 100Ah cells that is 2.56 kWh — exactly one carton." },
    { q: "Do I need a BMS with EVE LFP cells?",
      a: "Yes, always. Without a battery management system a single cell drifting out of balance will eventually be over-charged or over-discharged and the pack will be damaged. Size the BMS to your actual charge and discharge current; it is not the component to economise on." },
    { q: "Is it cheaper to build my own lithium pack or buy a finished one?",
      a: "Below roughly one 48V pack, a finished battery is usually better value once you account for your time, tools and the risk of getting compression or the BMS wrong. Self-building pays off across several packs, or when you need to choose a specific BMS — which is why most of our cell customers are assemblers building for their own clients." },
    { q: "Can I mix new EVE cells with cells I already have?",
      a: "No. Mixing batches, ages or capacities means the weakest cell limits the entire pack, and the mismatch accelerates ageing across every cell. Build each pack from a single matched batch." },
  ],
};

// ---------------------------------------------------------------------------
const POSTS = [pillar, genuine, distributor, pricing].map((p) => ({
  ...p, ...A, date: DATE, published: true,
}));

if (process.argv.includes("--dry")) {
  for (const p of POSTS) {
    console.log(`\n── ${p.slug}`);
    console.log(`   ${p.title}`);
    console.log(`   ${p.readTime} min · ${p.keywords.length} keywords · ` +
      `${p.takeaways.length} takeaways · ${p.faqs.length} FAQs · ` +
      `${p.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length} words`);
  }
  console.log("\nDRY RUN — nothing written.");
  process.exit(0);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await sb.from("posts").upsert(POSTS, { onConflict: "id" });
if (error) {
  console.error("UPSERT ERROR:", error);
  process.exit(1);
}

const { data } = await sb.from("posts").select("slug,published").eq("published", true);
console.log(`Upserted ${POSTS.length} EVE cluster posts.`);
console.log(`Published posts now live: ${data?.length}`);
for (const p of POSTS) console.log(`  /blog/${p.slug}`);
