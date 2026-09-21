// Seeds ONE post: "How to tell EVE cells are original" — the test-report answer.
//
// WHY THIS POST EXISTS (Raheel, 2026-09-21): "QR code can be refurbished etc +
// agents do it for $1. Best way is to ask for a testing report from the seller."
// That is a genuine market update and it SUPERSEDES the advice everyone else
// (including our own July post) gives. It is also the strongest AEO play open:
// Google's AI Overview for "original eve cells in pakistan" already reproduces
// our QR/B-mark method almost line for line but credits Facebook and Sky Solar.
// A named, specific method with a document behind it is far harder to paraphrase
// without attribution than a list of physical checks.
//
// ⚠️ CANNIBALISATION GUARD: /blog/genuine-eve-cells-check-pakistan already ranks
// (~100 impressions/week, position 4.9) for "how to check genuine EVE cells".
// This post deliberately targets a DIFFERENT intent — "is the QR enough / what
// proof do I ask for" — and links to that post rather than repeating it. The
// July post gets a short update note pointing here (applied separately).
//
// ⚠️ The "$1 re-coding" figure is Raheel's own trade knowledge, not something I
// can source publicly. It is written as market practice, not as a cited fact.
//
// 📷 IMAGE SLOT: Raheel has a screenshot of a real batch test report. When it
// lands, save it as public/assets/cells/test-report.webp and swap the callout
// marked REPORT-IMAGE below for a figure. The post is publishable without it.
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

const post = {
  id: "p-eve-005",
  slug: "eve-cells-original-test-report",
  title: "How to Tell EVE Cells Are Original: Ask for the Test Report",
  category: "Technical",
  cover: "assets/cells/vp-matched.jpg",
  readTime: 6,
  author: "Voltec Team",
  authorRole: "Lahore Office",
  date: "September 21, 2026",
  published: true,
  excerpt:
    "The QR code is no longer proof. Re-coding a cell is a cheap trade service, so a scannable code tells you almost nothing. The batch test report is the document that is actually hard to fake.",
  metaTitle: "How to Tell If EVE Cells Are Original (2026 Guide)",
  metaDescription:
    "A scannable QR code no longer proves an EVE cell is new — re-coding is cheap. Here is the one document to ask every seller for, and how to read it.",
  keywords: [
    "how to tell eve cells are original",
    "eve cell test report",
    "fake eve cells pakistan",
    "eve cell qr code fake",
    "original eve cells in pakistan",
    "refurbished lifepo4 cells",
    "eve cell verification",
    "grade a lifepo4 cells pakistan",
  ],
  takeaways: [
    "A scannable QR code is no longer proof of a new cell — re-lasering a code is a cheap, routine service in the trade.",
    "Ask every seller for the batch test report: capacity and internal resistance, cell by cell, for the batch you are being sold.",
    "A real report has many rows with small, believable variation. Identical numbers down the column mean it was typed, not measured.",
    "Physical checks still filter obvious fakes, but treat them as a first pass, not as proof.",
    "Test the cells yourself on arrival and match the result to the report before you pay.",
  ],
  body: `
<p>Every guide to buying lithium cells in Pakistan tells you the same thing: scan the QR code. We published that advice ourselves. It is no longer enough, and anyone selling cells at volume already knows why.</p>

<h2>Why the QR code stopped being proof</h2>

<p>The code on the side of a prismatic cell is laser-etched. Etching a new one is not difficult and not expensive. In the trade it is a routine service, bought for around a dollar a cell — less in quantity.</p>

<p>That matters because of where used cells come from. A cell pulled out of an electric bus or a retired storage bank is still a physical cell. Clean it, re-wrap it, etch a fresh code, and it scans. The code you check will look correct because it <em>is</em> correct. It simply does not describe the cell you are holding.</p>

<p>The same applies to Grade B stock. EVE marks cells that fail its own checks, and a seller who wants them to look like Grade A has one small mark and one code to deal with.</p>

<div class="callout"><div class="c-label">The short version</div><div>A scannable code proves someone put a valid code on the cell. It does not prove the cell is new, is Grade A, or holds its rated capacity.</div></div>

<h2>What actually holds up: the batch test report</h2>

<p>Ask for the test report for the batch you are buying. Not a sample report, not last year's, not one for a different shipment. The report that belongs to the cells going into your pack.</p>

<p>A real report lists every cell in the batch, individually. For each cell it gives at minimum:</p>

<ul>
<li><strong>Measured capacity</strong> in Ah, from an actual discharge — not the number printed on the label.</li>
<li><strong>Internal resistance</strong> in milliohms, which is what separates a healthy cell from a tired one.</li>
<li><strong>Open-circuit voltage</strong> at the time of testing.</li>
<li><strong>The cell serial</strong>, so each row ties back to a physical cell you can pick up.</li>
</ul>

<p>This is harder to fake than a code for a simple reason: it is long, it is specific, and it has to survive contact with reality. You can check it against the cells in front of you.</p>

<!-- REPORT-IMAGE: swap this callout for a figure once assets/cells/test-report.webp exists -->
<div class="callout"><div class="c-label">Ask us</div><div>We send the batch test report with every carton. If you want to see what one looks like before you order, message us on WhatsApp and we will send a copy of a real one.</div></div>

<h2>How to read a report in two minutes</h2>

<p>You do not need to be an engineer. Three things tell you whether a report was measured or invented.</p>

<ol>
<li><strong>Look at the spread.</strong> Real measurements vary. Capacities that all read exactly 100.0 Ah, or resistances identical to two decimals down the whole column, were typed by a person, not produced by a tester.</li>
<li><strong>Check the count.</strong> The report should have as many rows as there are cells in the batch. A one-page summary for a container is a summary, not a test.</li>
<li><strong>Match a serial.</strong> Pick a cell at random, read its serial, and find that row. If you cannot, the report does not belong to these cells.</li>
</ol>

<h2>Then test them yourself</h2>

<p>The report tells you what the seller measured. Your own bench tells you what arrived. Before you pay, or before you build, check a sample:</p>

<ul>
<li>Resting voltage across every cell. A batch that has been stored properly sits in a tight band.</li>
<li>Internal resistance on a few cells, compared against the report.</li>
<li>One full capacity cycle on at least one cell if the order is large enough to justify it.</li>
</ul>

<p>If your numbers and the report broadly agree, you have a batch you can build with. If they do not, you have found out before the cells are welded into a pack and sold to your own customer.</p>

<h2>The physical checks still have a use</h2>

<p>None of this makes the older checks worthless. A missing safety valve, a ground-off mark, a code of the wrong length, mismatched wrap — these still catch careless fakes quickly and cost you nothing. Use them as a first pass. We wrote them up in detail in <a href="/blog/genuine-eve-cells-check-pakistan">how to check if your EVE cells are genuine</a>.</p>

<p>The change is in what you conclude from them. Passing the physical checks means the cell is not an obvious fake. It does not mean the cell is new.</p>

<h2>Four questions to ask any seller</h2>

<ol>
<li>Can you send the test report for this specific batch?</li>
<li>Does it list every cell, with capacity and internal resistance?</li>
<li>Can I check a serial from the report against a cell before I pay?</li>
<li>If my own test disagrees with your report, what happens?</li>
</ol>

<p>A seller who imports their own stock can answer all four without hesitating. A seller who bought from someone else, who bought from someone else, usually cannot answer the first.</p>

<h2>Where Voltec stands</h2>

<p>We import our cells ourselves and we sell them by the carton of eight. Every carton ships with the test report for its batch, the codes are yours to scan before you pay, and you are welcome to test at our Abid Market showroom in Lahore before the cells leave the counter.</p>

<p>That is the whole claim. Not that our codes are more real than anyone else's, but that there is a document behind them and you are allowed to check it.</p>

<div class="callout"><div class="c-label">Buying cells</div><div>Genuine EVE LF100LA, 3.2V 100Ah, sold by the carton of 8 — one carton makes a 24V set, two make 48V. Nationwide delivery or collection in Lahore. Message us for the current rate and the batch report.</div></div>
`,
  faqs: [
    {
      q: "Can a QR code on a lithium cell be faked?",
      a: "Yes. The code is laser-etched, and re-etching a cell is a cheap, routine service in the trade — roughly a dollar a cell, less in quantity. A used or downgraded cell with a fresh code will scan correctly. That is why a scannable code proves only that someone put a valid code on the cell, not that the cell is new.",
    },
    {
      q: "What is the best way to tell if EVE cells are original?",
      a: "Ask the seller for the batch test report and check it against the cells. A real report lists every cell individually with measured capacity, internal resistance, voltage and serial number. It is far harder to fake than a code because it is long, specific, and you can verify it against the cells in front of you.",
    },
    {
      q: "What should a real EVE cell test report contain?",
      a: "One row per cell, with measured capacity in Ah from an actual discharge, internal resistance in milliohms, open-circuit voltage at test time, and the cell serial. The numbers should vary slightly from cell to cell. Identical values down the whole column mean the report was typed rather than measured.",
    },
    {
      q: "How can I check the test report is genuine?",
      a: "Three checks take two minutes. Look for natural variation in the numbers. Confirm there are as many rows as cells in the batch. Then pick a cell at random, read its serial, and find that exact row in the report. If you cannot match it, the report does not belong to those cells.",
    },
    {
      q: "Are the physical checks like the safety valve and B-mark still worth doing?",
      a: "Yes, as a first pass. A missing safety valve, a ground-off mark or a code of the wrong length will catch a careless fake in seconds and costs nothing. Just do not treat passing them as proof — it means the cell is not an obvious fake, not that it is new.",
    },
    {
      q: "Should I test the cells myself even if I have the report?",
      a: "Yes. The report tells you what the seller measured; your own bench tells you what arrived. Check resting voltage across every cell, internal resistance on a few against the report, and run one full capacity cycle if the order justifies it. Do it before the cells are welded into a pack.",
    },
  ],
};

if (process.argv.includes("--dry")) {
  const words = post.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`\n── ${post.slug}`);
  console.log(`   ${post.title}`);
  console.log(`   ${post.readTime} min · ${post.keywords.length} keywords · ` +
    `${post.takeaways.length} takeaways · ${post.faqs.length} FAQs · ${words} words`);
  console.log(`   metaTitle  [${post.metaTitle.length}] ${post.metaTitle}`);
  console.log(`   metaDesc   [${post.metaDescription.length}]`);
  console.log("\nDRY RUN — nothing written.");
  process.exit(0);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await sb.from("posts").upsert([post], { onConflict: "id" });
if (error) {
  console.error("UPSERT ERROR:", error);
  process.exit(1);
}
const { data } = await sb.from("posts").select("slug").eq("published", true);
console.log(`Upserted /blog/${post.slug}. Published posts now live: ${data?.length}`);
