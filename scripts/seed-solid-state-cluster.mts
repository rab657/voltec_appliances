// Seeds the SOLID-STATE STABILIZER cluster: 9 posts that make the case for
// static (SCR + IGBT) stabilizers over servo and relay, and position the Voltec
// SCR and IGBT ranges as the answer.
//
// WHY (Raheel, 2026-10-09): "the future will be owned by static solid state
// stabilizers… relay based and servo motor have movements. SCR + IGBT = solid
// state much better. Servo vs SCR is the category we want to own. IGBT is also
// a category we want to own." The cluster is decision content: it helps a buyer
// choose, and every page ends in a WhatsApp quote.
//
// Usage:
//   npx tsx scripts/seed-solid-state-cluster.mts --dry      # print stats, write nothing
//   npx tsx scripts/seed-solid-state-cluster.mts            # upsert the posts as DRAFTS
//   npx tsx scripts/seed-solid-state-cluster.mts --publish  # publish them + refresh p-007
//
// Drafts are not listed, not in the sitemap and not in llms.txt, but
// /blog/<slug> still renders them by direct URL (getPostBySlug does not filter
// on `published`) — that is how they get reviewed before going live.
//
// ⚠️ RULES THIS CONTENT FOLLOWS — keep them if you edit it:
//  - NO PRICES in stabilizer content (standing rule, 2026-08-06). Inquiry-first.
//  - SVC, SCR and IGBT are IMPORTED. Never "we build/make/manufacture" them.
//  - SCR is stepped ±5%. NEVER call it stepless, pure sine, ±1% or "precision" —
//    those belong to the IGBT range only (see the note in lib/products.ts).
//  - Specs are the data-sheet numbers in lib/products.ts: IGBT ±2%, 0 ms,
//    90–310V, THD <3%, ≥96%; SCR ±5%, ~20 ms, 95–250V (works 85–268V), ≥95%;
//    SVC ±1%, 25–30 V/s, >96%. Do not round them up.
//  - "No moving parts" means nothing moves to CORRECT the voltage. Both solid-
//    state ranges still have temperature-controlled cooling fans — say so where
//    maintenance comes up.
//  - Honest about servo: Voltec sells servo too, and it still wins on very large
//    and three-phase loads. That honesty is what makes the solid-state case
//    credible, and it keeps the live SVC funnel intact.
//  - The SCR and IGBT showcases (/showcase/scr, /showcase/smart-inverter-voltage-
//    stabilizer) are HIDDEN pre-launch and 404. Link only to live pages. When
//    those lines launch, add product links here and re-run.
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

// Canonical PK sales line (SITE.whatsapp). Each link pre-fills a message that
// names the topic, so the lead identifies itself in the inbox.
const wa = (text: string) => `https://wa.me/923211644447?text=${encodeURIComponent(text)}`;
const WA_SCR = wa("Hi Voltec! I want to ask about SCR stabilizers. My load is: ");
const WA_IGBT = wa("Hi Voltec! I want to ask about IGBT inverter stabilizers. My load is: ");
const WA_COMPARE = wa("Hi Voltec! Please quote servo, SCR and IGBT side by side. My load is: ");
const WA_MACHINE = wa("Hi Voltec! I need a stabilizer for my machine. Nameplate photo attached: ");
const WA_SERVO_FIX = wa("Hi Voltec! My servo stabilizer has a problem. Photo attached: ");

const DATE = "October 16, 2026";
const AUTHOR = { author: "Voltec Team", authorRole: "Lahore Office" };

// The two Voltec solid-state ranges, as a reusable closing block.
const RANGE_CALLOUT = `
<div class="callout"><div class="c-label">The Voltec solid-state range</div><div><strong>SCR (thyristor):</strong> 1, 2, 3, 5 and 10 kVA — 220V ±5% from a 95–250V input, about 20 ms response. <strong>IGBT (inverter):</strong> 550VA, 2, 5, 10, 15 and 20 kVA — 220V ±2% from a 90–310V input, 0 ms rated response, pure sine. Both imported, checked and stocked by Voltec in Lahore. <a href="${WA_COMPARE}">WhatsApp your appliance list</a> and we will quote the right one in writing.</div></div>`;

const posts = [
  // ───────────────────────────────────────────────────────────── 1. PILLAR
  {
    id: "p-ss-001",
    slug: "solid-state-voltage-stabilizer",
    title: "Solid-State Voltage Stabilizers: Why SCR and IGBT Are the Future",
    category: "Buyer Guide",
    cover: "assets/blog/solid-state-voltage-stabilizer.jpg",
    readTime: 8,
    excerpt:
      "Every stabilizer with a moving part — a relay that clicks or a servo motor that turns — wears out. Solid-state stabilizers fix voltage with silicon instead. Here is how SCR and IGBT work, and why we think they are the future.",
    metaTitle: "Solid-State Voltage Stabilizer Guide: SCR & IGBT (2026)",
    metaDescription:
      "Static stabilizers fix voltage with silicon, not a motor or relay. How SCR and IGBT work, where they beat servo, and which one fits your home or clinic.",
    keywords: [
      "solid state voltage stabilizer",
      "static voltage stabilizer",
      "static stabilizer pakistan",
      "scr stabilizer",
      "igbt stabilizer",
      "best voltage stabilizer technology",
      "stabilizer without servo motor",
      "thyristor stabilizer",
    ],
    takeaways: [
      "There are four stabilizer types. Relay (AVR) and servo (SVC) correct voltage by moving something. SCR and IGBT are solid-state: nothing moves to correct the voltage.",
      "Moving parts are the weak point: relay contacts burn, carbon brushes wear, and dust and heat speed both up.",
      "A servo corrects at about 25–30 volts per second, so a sudden 60V drop takes about two seconds to fix. SCR reacts in about 20 ms; IGBT is rated 0 ms.",
      "SCR is solid-state at a sensible price (220V ±5%). IGBT is the top of the range (220V ±2%, pure sine, works from 90V).",
      "Servo still makes sense for very large and three-phase loads. For homes, shops, clinics and workshops up to 20 kVA, solid-state is where the market is going.",
    ],
    body: `
<p>For forty years, Pakistani homes have protected their appliances with two kinds of stabilizer. The relay type, which clicks. And the servo type, which hums. Both work. But both fix your voltage by moving something — and anything that moves, wears out.</p>

<p>A newer kind of stabilizer does the same job with no moving parts in the correction at all. It is called <strong>solid-state</strong>, or <strong>static</strong>. It comes in two types: <strong>SCR</strong> (thyristor) and <strong>IGBT</strong> (inverter). This guide explains both in plain words, where they win, where they do not, and how to choose.</p>

<h2>Four types of stabilizer, two families</h2>

<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>How it fixes voltage</th><th>Moving parts</th><th>Speed</th><th>Output</th></tr></thead>
<tbody>
<tr><td>Relay (AVR)</td><td>Relays click between transformer taps</td><td>Relay contacts</td><td>Stepped, under a second</td><td>Steps of ±5–10%</td></tr>
<tr><td>Servo (SVC)</td><td>A motor drags a carbon brush along a copper winding</td><td>Motor, gears, carbon brush</td><td>About 25–30 volts per second</td><td>220V ±1%, smooth</td></tr>
<tr><td>SCR (thyristor)</td><td>Silicon switches pick the right transformer tap</td><td>None in the correction</td><td>About 20 ms</td><td>220V ±5%, stepped</td></tr>
<tr><td>IGBT (inverter)</td><td>Fast silicon switches build the correct wave</td><td>None in the correction</td><td>0 ms rated</td><td>220V ±2%, pure sine</td></tr>
</tbody></table></div>

<p>The servo, SCR and IGBT figures are from the data sheets of the ranges Voltec sells. The first two types are electro-mechanical. The last two are solid-state.</p>

<h2>Why moving parts are the problem</h2>

<p><strong>They wear.</strong> Every time a relay clicks, a small spark eats into its contacts. Every time a servo corrects, its carbon brush rubs along the winding. In Pakistan the voltage moves all day, so a stabilizer corrects thousands of times a month. Contacts pit. Brushes wear down to the spring.</p>

<p><strong>Dust and heat make it worse.</strong> Summers above 45°C dry out motor grease. Dust settles on the brush track and in the gears. A servo even makes its own dust: its brush sheds carbon as it wears. A sealed silicon switch does not care about any of it. More in <a href="/blog/servo-stabilizer-maintenance">why dust is a servo's enemy</a>.</p>

<p><strong>A motor is slow.</strong> This is the one most people miss. A servo motor can only turn so fast. Our own servo units correct at about 25–30 volts per second. So when the voltage suddenly falls from 220V to 160V, a servo needs about <strong>two seconds</strong> to catch up. For those two seconds, your appliance sees low voltage. A solid-state stabilizer reacts within one cycle of the mains — 20 milliseconds — or faster.</p>

<p><strong>They make noise.</strong> Relays click. Servo motors hum. Solid-state units are silent apart from a cooling fan that runs when they get warm.</p>

<h2>We have seen this change before</h2>

<p>Think about what happened to air-conditioners. Ten years ago, most ACs in Pakistan were fixed-speed. Today, most new ACs sold are inverter ACs. The old type was cheaper at first. The new type won because it does the job better and wastes less.</p>

<p>The same thing happened to TVs (tube to LED), to computer storage (spinning disk to SSD) and to electricity meters (spinning disc to digital). Each time, the mechanical version was replaced by a solid-state one. Silicon power switches are now cheap and reliable enough to do the same to stabilizers. In fact, an IGBT stabilizer uses the same family of power chip that runs your inverter AC and your solar inverter.</p>

<h2>SCR: solid-state at a sensible price</h2>

<p>An SCR stabilizer has a transformer with several taps, like a relay stabilizer. The difference is the switch. Instead of a metal relay that snaps open and shut, it uses <strong>thyristors</strong> — silicon switches with no contacts. They switch at the moment the AC wave crosses zero, so there is no spark, no click and nothing to burn.</p>

<p>The Voltec SCR range holds <strong>220V ±5%</strong> across a <strong>95–250V</strong> input (it keeps working from 85V to 268V), corrects in <strong>about 20 ms</strong>, is <strong>≥95% efficient</strong>, and has six layers of protection. It suits laser machines, clinic devices, ultrasound, electronics, and homes and shops where speed and long life matter and ±5% is enough. More: <a href="/blog/what-is-scr-thyristor-stabilizer">what an SCR stabilizer is</a> and <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo, side by side</a>.</p>

<h2>IGBT: the top of the range</h2>

<p>An IGBT stabilizer does not pick a tap. It measures the incoming wave and switches IGBT chips tens of thousands of times a second to build exactly the voltage you need. Filters smooth that into a clean sine wave.</p>

<p>The Voltec IGBT range holds <strong>220V ±2%</strong> across a <strong>90–310V</strong> input, has a <strong>0 ms</strong> rated response, gives a <strong>pure sine</strong> output (distortion under 3%) and is <strong>≥96% efficient</strong>. Because it switches at high frequency, it needs much less iron: the 10 kVA model weighs 12.7 kg and hangs on a wall. It suits the most sensitive machines, inverter ACs, whole homes in very-low-voltage areas, and anyone who wants the cleanest power. More: <a href="/blog/what-is-igbt-inverter-stabilizer">what an IGBT stabilizer is</a> and <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo, side by side</a>.</p>

<h2>Where servo and relay still make sense</h2>

<p>We sell servo and relay stabilizers too, so here is the honest picture. They are not going away tomorrow.</p>

<ul>
<li><strong>Very large and three-phase loads.</strong> At 100 kVA and above, a servo still gives the most kVA for the money and takes heavy motor starts well. Our <a href="/industrial">three-phase industrial systems</a> come in servo or static IGBT, made to your load.</li>
<li><strong>One appliance on a tight budget.</strong> A relay AVR is the cheapest honest protection for a single fridge or AC.</li>
<li><strong>A servo that is working well.</strong> If yours is healthy and your load is ordinary home appliances, keep it. Replace it when it starts to cost you service visits.</li>
</ul>

<p>So our rule is simple. For homes, shops, clinics and workshops up to 20 kVA, solid-state is where we would put our own money. Above that, or on three-phase, talk to us and we will size both options.</p>

<h2>How to choose in 30 seconds</h2>

<ol>
<li><strong>Running something sensitive</strong> — a laser, CNC, lab analyser, imaging or server? Choose <strong>IGBT</strong>. Choose <strong>SCR</strong> if the machine's manual accepts ±10% and your voltage stays above 95V.</li>
<li><strong>Whole home with inverter ACs, and evening voltage below 95V?</strong> Choose <strong>IGBT</strong> — it holds 220V from 90V.</li>
<li><strong>Home or shop, voltage stays between 95V and 250V, and you want nothing to service?</strong> Choose <strong>SCR</strong>.</li>
<li><strong>Above 20 kVA, or three-phase?</strong> Send us your load. Servo or static IGBT, sized to it.</li>
<li><strong>One fridge on a budget?</strong> A relay AVR is enough.</li>
</ol>

<p>Still unsure between the two solid-state types? Read <a href="/blog/scr-vs-igbt-stabilizer">SCR vs IGBT: which one do you need</a>.</p>

<h2>What to ask any seller of a "static" stabilizer</h2>

<ul>
<li><strong>Is it SCR or IGBT?</strong> A digital display does not make a stabilizer solid-state. Many relay and servo units have an LCD too. Ask what does the switching.</li>
<li><strong>Output accuracy and response time — in writing.</strong> "Fast" is not a number. ±5% and 20 ms is.</li>
<li><strong>Which input range holds 220V?</strong> Many sheets show the range where the unit stays on, not the range where it actually holds 220V. Ask for both.</li>
<li><strong>What size for my AC or motor?</strong> Motors pull extra current when they start. A good seller sizes for that.</li>
<li><strong>Who services it in Pakistan, and what is the warranty?</strong></li>
</ul>

<h2>Voltec's solid-state range</h2>

<p>Voltec has been in the stabilizer trade since 1995 and sells all four types — relay, servo, SCR and IGBT. That means we have no reason to push one. Our SCR and IGBT ranges are imported, checked and stocked in Lahore, and backed by our own service team.</p>
${RANGE_CALLOUT}
`,
    faqs: [
      {
        q: "What is a solid-state (static) voltage stabilizer?",
        a: "It is a stabilizer that corrects voltage with silicon switches instead of a relay or a servo motor, so nothing moves to correct the voltage. There are two types: SCR (thyristor), which switches transformer taps electronically, and IGBT (inverter), which builds the correct voltage with fast switching. Both are silent, fast and have no contacts or brushes to wear out.",
      },
      {
        q: "Is a solid-state stabilizer better than a servo stabilizer?",
        a: "For homes, shops, clinics and workshops up to about 20 kVA, yes in most cases. It reacts in milliseconds instead of seconds, has no motor or carbon brush to wear, and is silent. A servo still makes sense for very large and three-phase loads, where it gives the most kVA for the money and handles heavy motor starts well.",
      },
      {
        q: "What is the difference between SCR and IGBT stabilizers?",
        a: "Both are solid-state. An SCR stabilizer picks the nearest transformer tap, so it corrects in steps and holds 220V within ±5%, in about 20 ms. An IGBT stabilizer builds exactly the voltage needed, holds 220V within ±2%, gives a pure sine output and works from 90V. SCR costs less; IGBT is the top of the range.",
      },
      {
        q: "Do solid-state stabilizers need maintenance?",
        a: "Very little. There is no carbon brush, no servo motor and no relay contact to replace. The only moving parts are small cooling fans that switch on with temperature, so keep the vents clear of dust and leave space around the unit.",
      },
      {
        q: "Are solid-state stabilizers more expensive?",
        a: "An IGBT stabilizer costs more up front than a servo of the same size. An SCR stabilizer costs less than an IGBT. Over the years, a solid-state unit saves on brush changes, motor repairs and downtime. Send us your load on WhatsApp and we will quote servo, SCR and IGBT side by side in writing.",
      },
      {
        q: "Can a solid-state stabilizer run an AC or a motor?",
        a: "Yes, if it is sized for the starting current. Inverter ACs start gently and need little extra margin. Fixed-speed ACs, fridges and water pumps pull a surge when they start, so leave more headroom. Send us the nameplate of your AC or motor and we will size it.",
      },
    ],
  },

  // ───────────────────────────────────────────────────── 2. SCR vs SERVO
  {
    id: "p-ss-002",
    slug: "scr-vs-servo-stabilizer",
    title: "SCR vs Servo Stabilizer: Which One Should You Buy?",
    category: "Buyer Guide",
    cover: "assets/blog/scr-vs-servo-stabilizer.jpg",
    readTime: 7,
    excerpt:
      "A servo stabilizer turns a motor to fix your voltage. An SCR stabilizer flips silicon switches. Here is what that difference means for your machines, your maintenance and your money.",
    metaTitle: "SCR vs Servo Stabilizer: Speed, Life & Upkeep (2026)",
    metaDescription:
      "Thyristor (SCR) vs servo (SVC) stabilizer, side by side: correction speed, moving parts, accuracy, noise and upkeep — and the cases where each one wins.",
    keywords: [
      "scr vs servo stabilizer",
      "thyristor vs servo stabilizer",
      "static vs servo stabilizer",
      "scr stabilizer vs svc",
      "which stabilizer is best scr or servo",
      "servo stabilizer alternative",
      "scr stabilizer pakistan",
    ],
    takeaways: [
      "A servo corrects voltage with a motor and carbon brush. An SCR corrects it with thyristors — silicon switches with no contacts.",
      "Speed is the big difference: a servo needs about two seconds to fix a sudden 60V drop. An SCR fixes it in about 20 ms.",
      "A servo holds a tighter ±1% once it catches up. An SCR holds ±5% in steps, which is inside what most equipment accepts.",
      "SCR has nothing that wears with each correction, runs silent, and does not mind dust on a brush track because there is none.",
      "Choose SCR for sensitive electronics, lasers and clinic devices up to 10 kVA. Servo still fits large single-phase and three-phase loads.",
    ],
    body: `
<p>Both types protect your appliances. They just do it in very different ways. A servo stabilizer turns a small motor. An SCR stabilizer flips silicon switches. That one difference decides how fast it reacts, how long it lasts and what it is good for.</p>

<div class="callout"><div class="c-label">The short answer</div><div>For sensitive electronics, a laser or a clinic device — or if you are tired of brush changes — choose <strong>SCR</strong>. If you need the tightest ±1% on a heavy motor load, or more than 10 kVA on one phase, a <strong>servo</strong> still makes sense.</div></div>

<h2>How a servo stabilizer works</h2>

<p>Inside a servo stabilizer is a round copper winding with a bare track on top. A carbon brush sits on that track. A small motor moves the brush along it. Move one way, the voltage goes up. Move the other way, it comes down. A control card watches the output and tells the motor where to go.</p>

<p>It is a good design. The correction is smooth, with no steps, and the output is tight — our servo units hold <strong>220V ±1%</strong>. But it has two built-in limits. The brush and motor wear. And the motor can only turn so fast: our units correct at <strong>about 25–30 volts per second</strong>.</p>

<h2>How an SCR stabilizer works</h2>

<p>An SCR stabilizer has a transformer with several taps — fixed points that give a little more or a little less voltage. A control board reads your incoming voltage every cycle and decides which tap brings the output closest to 220V. Then it switches to that tap with a pair of <strong>thyristors</strong> (SCRs).</p>

<p>A thyristor is a silicon switch. It has no metal contact, so nothing sparks and nothing burns. It switches at the moment the AC wave crosses zero, so the change is clean. The whole job takes <strong>about 20 ms</strong> — one cycle of the mains. The Voltec SCR range holds <strong>220V ±5%</strong> from a <strong>95–250V</strong> input.</p>

<h2>Side by side</h2>

<div class="table-scroll"><table>
<thead><tr><th></th><th>Servo (SVC)</th><th>SCR (thyristor)</th></tr></thead>
<tbody>
<tr><td>What does the correcting</td><td>Motor and carbon brush</td><td>Thyristors (silicon switches)</td></tr>
<tr><td>Parts that wear with each correction</td><td>Brush, motor, gears</td><td>None</td></tr>
<tr><td>Speed</td><td>About 25–30 V per second — about 2 seconds for a 60V drop</td><td>About 20 ms</td></tr>
<tr><td>Output</td><td>220V ±1%, smooth</td><td>220V ±5%, in steps</td></tr>
<tr><td>Input range (Voltec)</td><td>100–280V on the 10 kVA, choose your range</td><td>95–250V (keeps working 85–268V)</td></tr>
<tr><td>Noise</td><td>Motor hum</td><td>Silent</td></tr>
<tr><td>Dust and heat</td><td>Dust settles on the brush track and gears</td><td>Sealed switches on a heatsink, fan-cooled</td></tr>
<tr><td>Efficiency</td><td>&gt;96%</td><td>≥95%</td></tr>
<tr><td>Sizes (Voltec)</td><td>1–30 kVA single-phase, up to 500 kVA three-phase</td><td>1–10 kVA single-phase</td></tr>
</tbody></table></div>

<p>Notice what is <em>not</em> on the list of differences: efficiency. Both waste only a few percent. Anyone who tells you one will halve your bill is not being honest.</p>

<h2>The speed problem, in numbers</h2>

<p>It is a summer evening. Neighbours switch on their ACs and the voltage at your meter drops from 220V to 160V in a moment.</p>

<ul>
<li><strong>With a servo:</strong> the motor starts turning at about 28 volts per second. It needs a little over two seconds to bring the output back to 220V. For those two seconds, your equipment sees something closer to 160V than 220V.</li>
<li><strong>With an SCR:</strong> the board sees the drop on the next cycle and jumps to a higher tap. About 20 ms later, the output is back inside 220V ±5%.</li>
</ul>

<p>A fridge does not care about two seconds. A laser power supply, an ultrasound machine or a computer often does — it can reset, throw an error or abort the job. That is why solid-state is the right tool for sensitive equipment.</p>

<p>Good servo units also have a fast cut-off relay for dangerous voltage. But a cut-off switches your equipment off. It does not correct the voltage.</p>

<h2>Where SCR wins</h2>

<ul>
<li><strong>Speed.</strong> About 20 ms instead of seconds.</li>
<li><strong>Long life.</strong> No brush to wear down, no motor to burn out, no gears to strip.</li>
<li><strong>Silent.</strong> No hum and no click. Right for a clinic room, a bedroom or an office.</li>
<li><strong>Dust.</strong> There is no open brush track for dust to settle on, and no brush shedding carbon inside. See <a href="/blog/servo-stabilizer-maintenance">what dust does to a servo</a>.</li>
<li><strong>Size.</strong> It hangs on a wall like a small cabinet.</li>
</ul>

<h2>Where servo still wins</h2>

<ul>
<li><strong>Tighter steady output.</strong> Once it catches up, a servo holds ±1% with no steps. If your equipment manual asks for better than ±5%, choose a servo — or better, an <a href="/blog/igbt-vs-servo-stabilizer">IGBT</a>, which holds ±2% with no delay.</li>
<li><strong>Bigger sizes.</strong> Our SCR range stops at 10 kVA. For 15–30 kVA on one phase, or three-phase industrial loads, servo is the proven option.</li>
<li><strong>Very low voltage on a big load.</strong> Servo units can be built for unusual input ranges — our 30 kVA servo works from 60V.</li>
</ul>

<h2>What does ±5% actually mean?</h2>

<p>It means the output stays between about <strong>209V and 231V</strong>. Most equipment sold in Pakistan is designed for 220–240V with at least ±10% tolerance. Check the label or the manual of your machine. If it says ±10% or wider, an SCR keeps it well inside its limits. If it says ±5% or tighter, choose IGBT.</p>

<h2>Which one should you buy?</h2>

<ol>
<li><strong>Laser, ultrasound, clinic device, computers or AV?</strong> SCR.</li>
<li><strong>Home or shop up to 10 kVA, and you want nothing to service?</strong> SCR.</li>
<li><strong>Equipment that needs tighter than ±5%, or voltage below 95V?</strong> IGBT.</li>
<li><strong>15 kVA or more on one phase, or three-phase?</strong> Servo, or a three-phase static system.</li>
<li><strong>Your servo works fine and runs ordinary appliances?</strong> Keep it. See <a href="/blog/servo-stabilizer-problems">the signs it is time to replace it</a>.</li>
</ol>

<h2>We sell both</h2>

<p>Voltec imports servo stabilizers from 1 to 30 kVA and SCR stabilizers from 1 to 10 kVA. We have no reason to push one over the other — we would rather you buy the right one once. Send us your load and we will quote both side by side. Read the full background in our <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>.</p>

<div class="callout"><div class="c-label">Get both quotes</div><div>WhatsApp <a href="${WA_COMPARE}">+92 321 1644447</a> with your appliance list or machine nameplate. We reply with servo and SCR options, side by side, in writing. Or see them at our Abid Market showroom in Lahore, Mon–Sat 10am–8pm.</div></div>
`,
    faqs: [
      {
        q: "Is an SCR stabilizer better than a servo stabilizer?",
        a: "For sensitive electronics, lasers, clinic devices and homes up to 10 kVA, usually yes. An SCR stabilizer corrects voltage in about 20 ms instead of seconds, has no motor or carbon brush to wear out, and is silent. A servo still wins where you need ±1% output, more than 10 kVA on one phase, or a three-phase industrial system.",
      },
      {
        q: "Is an SCR stabilizer faster than a servo?",
        a: "Yes, much faster. A servo motor corrects at about 25–30 volts per second, so a sudden 60V drop takes about two seconds to fix. An SCR stabilizer switches taps electronically and is back within 220V ±5% in about 20 ms — one cycle of the mains.",
      },
      {
        q: "Is ±5% accurate enough?",
        a: "For most equipment, yes. ±5% means the output stays between about 209V and 231V. Most equipment sold in Pakistan is designed for 220–240V with at least ±10% tolerance. Check your machine's label or manual: if it asks for ±5% or tighter, choose an IGBT stabilizer instead.",
      },
      {
        q: "Which lasts longer, SCR or servo?",
        a: "An SCR stabilizer has nothing that wears with each correction — no brush, no motor and no gears. A servo's carbon brush rubs on the winding every time it corrects, so it wears and needs replacing, sooner where voltage swings all day or the room is dusty.",
      },
      {
        q: "Does an SCR stabilizer save more electricity than a servo?",
        a: "Not meaningfully. Both waste only a few percent: our SCR range is at least 95% efficient and our servo range is over 96%. Choose between them on speed, upkeep and what your equipment needs, not on the bill.",
      },
      {
        q: "Can an SCR stabilizer run an AC?",
        a: "Yes. Size it for the AC's starting current: an inverter AC starts gently, a fixed-speed AC pulls a surge. As a guide, 1–3 kVA covers a single appliance or AC, and 5–10 kVA covers a home or shop. Send us your appliance list on WhatsApp and we will size it.",
      },
    ],
  },

  // ──────────────────────────────────────────────────── 3. IGBT vs SERVO
  {
    id: "p-ss-003",
    slug: "igbt-vs-servo-stabilizer",
    title: "IGBT vs Servo Stabilizer: Instant Correction vs a Turning Motor",
    category: "Buyer Guide",
    cover: "assets/blog/igbt-vs-servo-stabilizer.jpg",
    readTime: 7,
    excerpt:
      "An IGBT stabilizer fixes voltage instantly with nothing moving inside, and works down to 90V. A servo is proven, smooth and good value at large sizes. Here is when each one makes sense.",
    metaTitle: "IGBT vs Servo Voltage Stabilizer: Which Is Better? (2026)",
    metaDescription:
      "Inverter (IGBT) vs servo (SVC) stabilizer compared on speed, input range, output quality, weight and upkeep — with honest advice on when servo still fits.",
    keywords: [
      "igbt vs servo stabilizer",
      "inverter stabilizer vs servo stabilizer",
      "igbt stabilizer pakistan",
      "inverter voltage stabilizer",
      "servo stabilizer vs static stabilizer",
      "best stabilizer for inverter ac",
      "igbt stabilizer price pakistan",
    ],
    takeaways: [
      "An IGBT stabilizer uses the same family of power chip as your inverter AC and solar inverter. It builds the correct voltage electronically — no motor, no brush, no taps.",
      "It is rated 0 ms; a servo corrects at about 25–30 volts per second. A servo holds ±1% once it catches up; an IGBT holds ±2% and never falls behind.",
      "IGBT works from 90V to 310V and gives a pure sine output (distortion under 3%). A servo passes along whatever distortion is already on the mains.",
      "Efficiency is about the same (both around 96%). The IGBT's real wins are speed, wave quality, wider input, silence, weight and no brush to service.",
      "Servo still makes sense on a tight budget, at large sizes and on three-phase. Size an IGBT with headroom for motor starts.",
    ],
    body: `
<p>Pakistan already made this switch once. Ten years ago most ACs were fixed-speed. Now most new ones are inverter ACs. The chip that made that possible is called an <strong>IGBT</strong>. It also runs your solar inverter. And it is now doing the same thing to voltage stabilizers.</p>

<p>Here is how an IGBT (inverter) stabilizer compares with the servo (SVC) stabilizer most homes and shops use today — honestly, including where the servo still wins.</p>

<div class="callout"><div class="c-label">The short answer</div><div>For a modern home with inverter ACs, a clinic, a workshop with sensitive machines, or an area where voltage falls below 100V — <strong>IGBT</strong>. For a tight budget, very large loads, or three-phase industry — <strong>servo</strong> is still a good, proven choice.</div></div>

<h2>How each one fixes voltage</h2>

<p><strong>Servo:</strong> a small motor drags a carbon brush along a copper winding. The further it moves, the more the voltage changes. Smooth, accurate — and limited by how fast the motor can turn.</p>

<p><strong>IGBT:</strong> a control chip measures the incoming wave all the time. IGBT switches turn on and off tens of thousands of times a second to add or remove exactly the voltage needed. Filters smooth that into a clean 220V sine wave. Nothing moves to do the correcting.</p>

<h2>Side by side</h2>

<div class="table-scroll"><table>
<thead><tr><th></th><th>Servo (SVC)</th><th>IGBT (inverter)</th></tr></thead>
<tbody>
<tr><td>What does the correcting</td><td>Motor and carbon brush</td><td>IGBT switches and a control chip</td></tr>
<tr><td>Response</td><td>About 25–30 V per second</td><td>0 ms rated</td></tr>
<tr><td>Holds 220V from (Voltec)</td><td>100–280V on the 10 kVA, choose your range</td><td>90–310V on every model</td></tr>
<tr><td>Output accuracy</td><td>±1%, once it catches up</td><td>±2%, all the time</td></tr>
<tr><td>Wave shape</td><td>Passes the mains wave through, distortion included</td><td>Pure sine, distortion under 3%</td></tr>
<tr><td>Efficiency</td><td>&gt;96%</td><td>≥96%</td></tr>
<tr><td>Weight (10 kVA)</td><td>Heavy transformer cabinet</td><td>12.7 kg, wall-mounted</td></tr>
<tr><td>Noise</td><td>Motor hum</td><td>Silent; fan runs when warm</td></tr>
<tr><td>Upkeep</td><td>Brush and motor checks</td><td>Keep the vents clear</td></tr>
<tr><td>Price</td><td>Lower up front</td><td>Higher up front</td></tr>
<tr><td>Sizes (Voltec)</td><td>1–30 kVA single-phase, up to 500 kVA three-phase</td><td>550VA–20 kVA single-phase</td></tr>
</tbody></table></div>

<h2>Why speed matters more than the last 1%</h2>

<p>On paper, a servo's ±1% looks better than an IGBT's ±2%. But that ±1% only applies <em>after</em> the motor has caught up. When the voltage drops suddenly from 220V to 160V, a servo turning at about 28 volts per second needs around two seconds to get back. During those two seconds, your equipment gets far worse than ±1%.</p>

<p>An IGBT never falls behind. It corrects within the wave, so the output stays inside ±2% the whole time. For an inverter AC's control board, a laser, a computer or a lab analyser, those two seconds are what cause a reset, an error or damage. That is the real difference.</p>

<h2>Wave quality: the part nobody talks about</h2>

<p>A servo is a transformer. It changes the size of the voltage, but it passes along the shape of the wave exactly as it arrives — including the distortion from UPS chargers, inverters and motors on your street.</p>

<p>An IGBT stabilizer builds a fresh wave. The Voltec range gives a pure sine with distortion under 3%. Inverter AC compressors, LED drivers, medical devices and audio equipment all run cooler and cleaner on a clean wave.</p>

<h2>The 90V question</h2>

<p>In many parts of Pakistan — the end of long feeders in South Punjab, interior Sindh and the villages of KP — evening voltage falls to 100–150V, and sometimes lower. Late at night, when the load drops, it can jump above 260V.</p>

<p>The Voltec IGBT range holds 220V from <strong>90V up to 310V</strong> on every model, with no special order. A servo can be built for low voltage too, but you have to choose that range when you order. If you are not sure how low your voltage goes, the IGBT is the safer pick.</p>

<h2>Is the bill lower?</h2>

<p>A little, but do not buy it for that. Both types are around 96% efficient. The IGBT has no motor to run, and holding a steady 220V keeps your AC and fridge working at their rated efficiency. That saving is real but small. Buy an IGBT for protection and no upkeep — the bill is a bonus. More on this in <a href="/blog/inverter-stabilizer-electricity-bill">will an inverter stabilizer lower your bill</a>.</p>

<h2>Where servo still makes sense</h2>

<ul>
<li><strong>Tight budget.</strong> A servo costs less up front for the same kVA.</li>
<li><strong>Above 20 kVA, or three-phase.</strong> Servo gives the most kVA for the money at large sizes. Our <a href="/industrial">three-phase systems</a> come in servo or static IGBT.</li>
<li><strong>Heavy motor starts.</strong> A big transformer shrugs off a large starting surge. An IGBT can handle motors too, but must be sized with more headroom.</li>
<li><strong>A healthy servo you already own.</strong> Keep it until it starts costing you service visits.</li>
</ul>

<h2>Sizing an IGBT stabilizer</h2>

<p>Electronics have less overload margin than a big lump of copper and iron, so size with care. Inverter ACs start gently. Fixed-speed ACs, fridges and water pumps pull a surge at start-up, so leave more room.</p>

<div class="table-scroll"><table>
<thead><tr><th>Voltec IGBT model</th><th>Rated current</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td>550VA</td><td>2.5A</td><td>TV, router and a few lights</td></tr>
<tr><td>2 kVA</td><td>10A</td><td>One AC, or a room of electronics</td></tr>
<tr><td>5 kVA</td><td>25A</td><td>One or two ACs plus fridge, fans and lights</td></tr>
<tr><td>10 kVA</td><td>50A</td><td>A full home with several ACs</td></tr>
<tr><td>15 kVA</td><td>75A</td><td>Whole home or small shop, geyser and motors included</td></tr>
<tr><td>20 kVA</td><td>100A</td><td>A large home or shop load</td></tr>
</tbody></table></div>

<p>Send us your appliance list or a photo of your AC and pump nameplates, and we will size it for you. See also <a href="/blog/what-size-stabilizer-pakistan-home">what size stabilizer your home needs</a>.</p>

<h2>Our honest view</h2>

<p>We sell both. For a home with inverter ACs, a clinic, or a workshop with sensitive machines, the IGBT is where the market is going — the same way the inverter AC took over from the fixed-speed one. For large and three-phase loads, servo still earns its place. Read the full picture in our <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>.</p>

<div class="callout"><div class="c-label">IGBT or servo — get both quotes</div><div>WhatsApp <a href="${WA_COMPARE}">+92 321 1644447</a> with your appliance list and your lowest evening voltage. We reply with IGBT and servo options, side by side, in writing.</div></div>
`,
    faqs: [
      {
        q: "Is an IGBT stabilizer better than a servo stabilizer?",
        a: "For homes with inverter ACs, clinics and sensitive machines, yes. An IGBT stabilizer is rated 0 ms instead of correcting at 25–30 volts per second, holds 220V from 90V to 310V, gives a pure sine output and has no motor or brush to wear. A servo still makes sense on a tight budget, above 20 kVA, or on three-phase industrial loads.",
      },
      {
        q: "Why does a servo show ±1% but an IGBT shows ±2%?",
        a: "A servo holds ±1% once its motor has caught up, but a sudden drop takes it about two seconds to fix, and during that time the output is far outside ±1%. An IGBT holds ±2% all the time because it corrects within the wave. For sensitive equipment, never falling behind matters more than the last 1%.",
      },
      {
        q: "Does an IGBT stabilizer save electricity compared with a servo?",
        a: "Only a little. Both are around 96% efficient. The IGBT has no motor to run and keeps your AC and fridge at their rated voltage, so there is a small saving. Buy it for protection, speed and no upkeep, not for the bill.",
      },
      {
        q: "Can an IGBT stabilizer work at 90V?",
        a: "Yes. Every model in the Voltec IGBT range holds 220V output from a 90V to 310V input, so it keeps working in end-of-feeder areas where evening voltage falls very low.",
      },
      {
        q: "What size IGBT stabilizer do I need for one inverter AC?",
        a: "A 2 kVA IGBT stabilizer covers one AC on its own. If the same stabilizer also feeds the fridge, fans and lights, choose 5 kVA. Fixed-speed ACs and pumps need more headroom for their starting surge. Send us the nameplate and we will size it.",
      },
      {
        q: "Does an IGBT stabilizer need maintenance?",
        a: "Very little. There is no carbon brush or servo motor. The only moving parts are cooling fans that switch on with temperature, so keep the vents free of dust and leave space around the unit.",
      },
    ],
  },

  // ───────────────────────────────────────────────────── 4. SCR vs IGBT
  {
    id: "p-ss-004",
    slug: "scr-vs-igbt-stabilizer",
    title: "SCR vs IGBT Stabilizer: Which Solid-State Type Do You Need?",
    category: "Buyer Guide",
    cover: "assets/blog/scr-vs-igbt-stabilizer.jpg",
    readTime: 6,
    excerpt:
      "You have decided to skip the motor. Good. Now the real choice: SCR or IGBT. Both are solid-state, but they work differently, cost differently and suit different machines.",
    metaTitle: "SCR vs IGBT Stabilizer: Which Solid-State Type? (2026)",
    metaDescription:
      "Both have no moving parts. SCR switches taps in about 20 ms and holds ±5%; IGBT builds a pure sine at ±2% from 90V. How to pick between them.",
    keywords: [
      "scr vs igbt stabilizer",
      "thyristor vs igbt stabilizer",
      "igbt or scr stabilizer",
      "static stabilizer types",
      "best solid state stabilizer",
      "scr stabilizer vs inverter stabilizer",
    ],
    takeaways: [
      "SCR and IGBT are both solid-state: silent, fast, with no brush or relay contact to wear out.",
      "SCR is a staircase: it jumps to the nearest step and holds 220V within ±5%, in about 20 ms. IGBT is a ramp: it lands exactly where it needs to, within ±2%, and cleans the wave.",
      "SCR holds 220V from 95V to 250V. IGBT holds it from 90V to 310V.",
      "Choose SCR when your equipment accepts ±10% and your voltage stays above 95V. Choose IGBT for tighter tolerances, very low voltage, or the cleanest wave.",
      "SCR costs less. IGBT is the top of the range.",
    ],
    body: `
<p>If you have read our <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a> or <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</a> guides, you already know why we prefer solid-state. This page answers the next question: which of the two?</p>

<h2>What they share</h2>

<ul>
<li>Nothing moves to correct the voltage — no motor, no carbon brush, no relay contact.</li>
<li>Silent. Only a small cooling fan runs when the unit gets warm.</li>
<li>Fast: milliseconds, not seconds.</li>
<li>Nothing wears out each time they correct.</li>
</ul>

<h2>The one real difference: a staircase or a ramp</h2>

<p><strong>An SCR stabilizer is a staircase.</strong> Its transformer has fixed steps. When the voltage moves, it jumps to the step that lands closest to 220V. It always lands within ±5% — between about 209V and 231V — but not always on 220V exactly.</p>

<p><strong>An IGBT stabilizer is a ramp.</strong> It has no steps. It builds exactly the voltage needed, all the time, and lands within ±2%. Because it builds the wave itself, it also cleans it: the output is a pure sine with distortion under 3%.</p>

<h2>Side by side</h2>

<div class="table-scroll"><table>
<thead><tr><th></th><th>SCR (thyristor)</th><th>IGBT (inverter)</th></tr></thead>
<tbody>
<tr><td>How it corrects</td><td>Jumps between transformer taps</td><td>Builds the voltage continuously</td></tr>
<tr><td>Output accuracy</td><td>220V ±5%</td><td>220V ±2%</td></tr>
<tr><td>Response</td><td>About 20 ms</td><td>0 ms rated</td></tr>
<tr><td>Holds 220V from</td><td>95–250V (keeps working 85–268V)</td><td>90–310V</td></tr>
<tr><td>Wave shape</td><td>Follows the mains</td><td>Pure sine, distortion under 3%</td></tr>
<tr><td>Efficiency</td><td>≥95%</td><td>≥96%</td></tr>
<tr><td>Sizes (Voltec)</td><td>1, 2, 3, 5, 10 kVA</td><td>550VA, 2, 5, 10, 15, 20 kVA</td></tr>
<tr><td>Price</td><td>Lower</td><td>Higher</td></tr>
</tbody></table></div>

<h2>Choose SCR when…</h2>

<ul>
<li>Your machine's manual accepts <strong>±10% or wider</strong> on its input. Most equipment does.</li>
<li>Your voltage stays <strong>between 95V and 250V</strong>, even on the worst evening.</li>
<li>You want solid-state speed and long life <strong>at a lower price</strong>.</li>
<li>Typical loads: aesthetic and dental lasers, RF devices, ultrasound, computers, AV, and home or shop loads up to 10 kVA.</li>
</ul>

<h2>Choose IGBT when…</h2>

<ul>
<li>Your machine's manual asks for <strong>±5% or tighter</strong>, or a clean or "regulated" supply.</li>
<li>Your voltage falls <strong>below 95V</strong> or jumps <strong>above 250V</strong>.</li>
<li>You run <strong>inverter ACs</strong> in a weak-voltage area and want one unit for the whole home.</li>
<li>Typical loads: lab analysers, imaging, CNC and laser cutters, servers and broadcast, high-end audio, and whole homes up to 20 kVA.</li>
</ul>

<h2>A simple test: find your worst evening</h2>

<p>The best way to choose is to know your real voltage. Use a plug-in voltmeter, or read the display of your current stabilizer, for one week. Note the lowest reading (usually 7–11pm in summer) and the highest (usually late at night).</p>

<ul>
<li>Lowest above 95V and highest below 250V → <strong>SCR</strong> covers you.</li>
<li>Lowest below 95V, or highest above 250V → <strong>IGBT</strong>.</li>
</ul>

<h2>Typical cases</h2>

<p>These are the kinds of requests we get every week, and what we would usually suggest:</p>

<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Suggestion</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Skin clinic with a hair-removal laser; evening voltage 170–240V; manual says ±10%</td><td>SCR</td><td>Fast, silent, inside the machine's tolerance, lower cost</td></tr>
<tr><td>Home with two inverter ACs; evening voltage drops to 90–100V</td><td>IGBT</td><td>Holds 220V from 90V; SCR only from 95V</td></tr>
<tr><td>Sign shop with a CO2 laser cutter and a small CNC router</td><td>IGBT</td><td>Motion drives and laser supplies like a clean, tight supply</td></tr>
<tr><td>Small diagnostic lab with analysers and a PC</td><td>IGBT</td><td>Clean pure sine and ±2% for lab instruments</td></tr>
<tr><td>Office with computers, printers and a server rack, voltage 180–240V</td><td>SCR</td><td>Fast and silent; ±5% is well inside what computers accept</td></tr>
</tbody></table></div>

<p>Whichever you choose, a stabilizer fixes voltage, not outages. For machines that must not lose power mid-job, add a UPS after the stabilizer. More on that in <a href="/blog/stabilizer-for-laser-cnc-medical-equipment">stabilizers for laser, CNC and medical machines</a>.</p>

<h2>Still unsure?</h2>

<p>Send us two things on WhatsApp: a photo of your machine's nameplate (or your appliance list), and your lowest evening voltage. We will tell you which one you need — and if the SCR is enough, we will say so.</p>
${RANGE_CALLOUT}
`,
    faqs: [
      {
        q: "Is IGBT better than SCR?",
        a: "IGBT is the higher-end type: it holds 220V within ±2% instead of ±5%, gives a pure sine output, has a 0 ms rated response and works from 90V instead of 95V. But SCR is enough for most equipment, which accepts ±10%, and it costs less. Choose by your equipment's tolerance and your lowest voltage.",
      },
      {
        q: "Is an SCR stabilizer good enough for a laser machine?",
        a: "For most aesthetic and dental lasers, yes — if the manual accepts ±10% input and your voltage stays above 95V. An SCR reacts in about 20 ms with no motor lag. For laser cutters, or any machine whose manual asks for ±5% or a clean supply, choose IGBT.",
      },
      {
        q: "Which is cheaper, SCR or IGBT?",
        a: "SCR costs less than IGBT for the same kVA. It gives you solid-state speed and long life at a lower price, with stepped ±5% output instead of the IGBT's ±2% pure sine. Send us your load and we will quote both.",
      },
      {
        q: "What does pure sine mean, and do I need it?",
        a: "Mains power should be a smooth wave, but motors, chargers and inverters on your street add distortion. A pure sine output means the stabilizer delivers a clean wave — the Voltec IGBT range keeps distortion under 3%. Lab instruments, imaging, motion drives and some audio and medical equipment benefit most. Most home appliances work fine without it.",
      },
      {
        q: "Do SCR and IGBT stabilizers have any moving parts?",
        a: "Nothing moves to correct the voltage in either type. Both use temperature-controlled cooling fans, which are the only moving parts. Keep the vents clear of dust and leave space around the unit.",
      },
    ],
  },

  // ───────────────────────────────────────────────── 5. WHAT IS SCR
  {
    id: "p-ss-005",
    slug: "what-is-scr-thyristor-stabilizer",
    title: "What Is an SCR (Thyristor) Voltage Stabilizer?",
    category: "Technical",
    cover: "assets/blog/what-is-scr-thyristor-stabilizer.jpg",
    readTime: 6,
    excerpt:
      "SCR stands for silicon-controlled rectifier, also called a thyristor. In a stabilizer, it does the job a relay or a servo motor used to do — with nothing moving. Here is how it works, in plain words.",
    metaTitle: "What Is an SCR (Thyristor) Stabilizer? How It Works",
    metaDescription:
      "An SCR stabilizer fixes voltage with thyristors instead of a relay or motor. How it works, what the specs mean and what it suits — in plain words.",
    keywords: [
      "what is scr stabilizer",
      "scr voltage stabilizer",
      "thyristor voltage stabilizer",
      "thyristor stabilizer working",
      "scr stabilizer meaning",
      "static voltage stabilizer working",
      "scr stabilizer pakistan",
    ],
    takeaways: [
      "An SCR stabilizer is a tapped transformer where silicon switches (thyristors) — not relays and not a motor — choose which tap feeds your appliance.",
      "Thyristors switch when the AC wave crosses zero, so there is no spark, no click and nothing to burn.",
      "It corrects in about 20 ms — one cycle of the mains — and holds 220V within ±5%.",
      "Think of it as a relay stabilizer that grew up: same idea, but a silicon switch instead of a metal contact.",
      "It is not stepless and does not build a pure sine. For that, choose an IGBT stabilizer.",
    ],
    body: `
<h2>SCR in one sentence</h2>

<p>An SCR stabilizer is a transformer with several taps, where <strong>silicon switches called thyristors</strong> — not relays, and not a motor — choose which tap feeds your appliance.</p>

<h2>What is a thyristor?</h2>

<p>SCR stands for <strong>silicon-controlled rectifier</strong>. Most people call it a <strong>thyristor</strong>. It is a switch made of silicon, built for heavy AC power. It has no metal contacts and no moving parts.</p>

<p>A thyristor has one useful habit. Once it is switched on, it stays on until the current falls to zero. On 50 Hz mains, the current crosses zero 100 times a second. So a thyristor naturally switches at the zero point — the quietest moment of the wave. That is why it does not spark.</p>

<p>Thyristors are not new. Industry has used them for decades in motor soft-starters, welding machines, heaters and power transmission. What is new is that they are now cheap and reliable enough to put in a stabilizer for your home or clinic.</p>

<h2>How the stabilizer uses it</h2>

<ol>
<li>A control board measures your incoming voltage, every cycle.</li>
<li>It works out which transformer tap will bring the output closest to 220V.</li>
<li>It switches on the thyristor pair for that tap, at the zero point of the wave.</li>
<li>If the voltage moves again, it repeats. The whole job takes about 20 ms.</li>
</ol>

<h2>SCR vs relay: same idea, different switch</h2>

<p>A relay stabilizer (AVR) also picks between transformer taps. The difference is the switch. A relay is a metal contact that physically snaps shut. Each snap makes a small spark, a click, and a little wear. Over time the contacts pit and burn.</p>

<p>A thyristor has no contact to snap. It switches with silicon, silently, with no spark and no wear. You can think of an SCR stabilizer as <strong>a relay stabilizer that grew up</strong>.</p>

<p>And compared with a servo? A servo moves a carbon brush with a motor, which is smooth but slow — about 25–30 volts per second. An SCR is far faster and has no brush to wear. See <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo, side by side</a>.</p>

<h2>Reading an SCR spec sheet</h2>

<p>Here is what each line on the Voltec SCR data sheet means:</p>

<div class="table-scroll"><table>
<thead><tr><th>Spec</th><th>Voltec SCR range</th><th>What it means for you</th></tr></thead>
<tbody>
<tr><td>Input range</td><td>95–250V</td><td>Across this range, output is held at 220V ±5%</td></tr>
<tr><td>Works from</td><td>85–268V</td><td>The unit stays on here, but output may be outside ±5%</td></tr>
<tr><td>Output</td><td>220V ±5%, 50/60 Hz</td><td>Output stays between about 209V and 231V</td></tr>
<tr><td>Correction</td><td>Stepped, about 20 ms</td><td>Jumps to the nearest tap within one mains cycle</td></tr>
<tr><td>Efficiency</td><td>≥95%</td><td>Wastes only a few percent as heat</td></tr>
<tr><td>Protection</td><td>Over/under-voltage, overload, over-temperature, short circuit</td><td>Cuts off before bad power reaches your equipment</td></tr>
<tr><td>Restart delay</td><td>Short 5 s / Long 200 s</td><td>After a cut-off, waits before restoring power: 5 seconds for electronics, about 3 minutes for fridges and ACs so the compressor can settle</td></tr>
</tbody></table></div>

<h2>What an SCR stabilizer is good for</h2>

<ul>
<li><strong>Laser machines</strong> — aesthetic, dental and hair-removal lasers, where a motor's delay is too slow.</li>
<li><strong>Clinic devices</strong> — ultrasound, RF and body-contouring platforms that want steady, spark-free power.</li>
<li><strong>Electronics</strong> — computers, AV, networking and small servers.</li>
<li><strong>Homes and shops</strong> where you want nothing to service and your voltage stays between 95V and 250V.</li>
<li><strong>Quiet rooms</strong> — clinics, bedrooms and offices. No click, no hum.</li>
</ul>

<h2>What it is not</h2>

<p>An SCR stabilizer corrects in steps. It does not build a new wave, so it does not clean up distortion on the mains, and it holds ±5% rather than ±1–2%. If your equipment asks for a tighter tolerance or a clean sine wave, or your voltage falls below 95V, choose an <a href="/blog/what-is-igbt-inverter-stabilizer">IGBT stabilizer</a> instead. Not sure? Read <a href="/blog/scr-vs-igbt-stabilizer">SCR vs IGBT</a>.</p>

<h2>Sizes in the Voltec SCR range</h2>

<div class="table-scroll"><table>
<thead><tr><th>Model</th><th>Typical use</th><th>Net weight</th></tr></thead>
<tbody>
<tr><td>1 kVA</td><td>Sensitive electronics and instruments</td><td>6.4 kg</td></tr>
<tr><td>2 kVA</td><td>Electronics and small clinic devices</td><td>7.5 kg</td></tr>
<tr><td>3 kVA</td><td>A laser, ultrasound or clinic machine</td><td>12 kg</td></tr>
<tr><td>5 kVA</td><td>Laser machines; a home or shop</td><td>18.4 kg</td></tr>
<tr><td>10 kVA</td><td>Larger lasers and clinic equipment; a bigger home or shop</td><td>25.3 kg</td></tr>
</tbody></table></div>

<p>The Voltec SCR range is imported, checked and stocked in Lahore, and backed by our own service team. For the bigger picture, read our <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>.</p>

<div class="callout"><div class="c-label">Ask about SCR</div><div>WhatsApp <a href="${WA_SCR}">+92 321 1644447</a> with your machine nameplate or appliance list. We will size it and quote in writing. Or come and see one at our Abid Market showroom in Lahore, Mon–Sat 10am–8pm.</div></div>
`,
    faqs: [
      {
        q: "What does SCR stand for in a stabilizer?",
        a: "SCR stands for silicon-controlled rectifier, also called a thyristor. It is a silicon switch for heavy AC power with no metal contacts. In an SCR stabilizer, thyristors choose which transformer tap feeds your appliance, instead of a relay or a servo motor.",
      },
      {
        q: "Is a thyristor stabilizer the same as a static stabilizer?",
        a: "Yes. A static (solid-state) stabilizer is any stabilizer where nothing moves to correct the voltage. SCR (thyristor) stabilizers are one type of static stabilizer. IGBT (inverter) stabilizers are the other.",
      },
      {
        q: "Does an SCR stabilizer make noise?",
        a: "No. Thyristors switch silently with no spark and no click, and there is no motor to hum. The only sound is a small cooling fan that runs when the unit gets warm.",
      },
      {
        q: "Why does the stabilizer wait before turning back on?",
        a: "After it cuts off for very high or low voltage, it waits before restoring power. A short delay of about 5 seconds suits electronics. A long delay of about 200 seconds protects fridges and ACs, because a compressor that restarts too soon can stall and overheat.",
      },
      {
        q: "Is an SCR stabilizer better than a relay stabilizer?",
        a: "It works on the same idea — choosing between transformer taps — but uses silicon switches instead of metal relay contacts. That means no spark, no click and nothing that wears each time it switches. A relay stabilizer is cheaper and fine for one budget appliance.",
      },
      {
        q: "Can I use an SCR stabilizer for my AC?",
        a: "Yes. Set it to the long restart delay and size it for the AC's starting current. As a guide, 1–3 kVA covers a single appliance or AC, and 5–10 kVA covers a home or shop. Send us your appliance list and we will size it.",
      },
    ],
  },

  // ───────────────────────────────────────────────── 6. WHAT IS IGBT
  {
    id: "p-ss-006",
    slug: "what-is-igbt-inverter-stabilizer",
    title: "What Is an IGBT (Inverter) Voltage Stabilizer?",
    category: "Technical",
    cover: "assets/blog/what-is-igbt-inverter-stabilizer.jpg",
    readTime: 6,
    excerpt:
      "An IGBT stabilizer does not pick a tap or turn a motor. It builds the voltage you need, electronically, tens of thousands of times a second. Here is what that means in plain words.",
    metaTitle: "What Is an IGBT Inverter Stabilizer? How It Works",
    metaDescription:
      "An IGBT stabilizer rebuilds a clean 220V wave with fast silicon switches — no motor, no taps. How it works, what 0 ms and pure sine mean, and who needs one.",
    keywords: [
      "what is igbt stabilizer",
      "igbt voltage stabilizer",
      "inverter voltage stabilizer",
      "inverter stabilizer meaning",
      "igbt stabilizer working",
      "is inverter stabilizer a ups",
      "igbt stabilizer pakistan",
    ],
    takeaways: [
      "IGBT stands for insulated-gate bipolar transistor — the same kind of power switch that runs inverter ACs and solar inverters.",
      "An IGBT stabilizer measures the incoming wave and switches tens of thousands of times a second to build exactly 220V. Nothing moves to correct the voltage.",
      "The Voltec range: 220V ±2% from a 90–310V input, 0 ms rated response, pure sine (distortion under 3%), ≥96% efficient.",
      "It is called 'inverter' because of the switching technology. It is not a UPS and has no battery — when the power goes, it goes too.",
      "Size it with headroom for motor starts, keep the vents clear, and add a UPS after it if a machine must not lose power mid-job.",
    ],
    body: `
<h2>IGBT in one sentence</h2>

<p>An IGBT stabilizer uses fast silicon switches to <strong>build exactly the voltage you need</strong>, all the time — no motor, no brush and no transformer taps.</p>

<h2>What is an IGBT?</h2>

<p>IGBT stands for <strong>insulated-gate bipolar transistor</strong>. It is a power switch made of silicon that can turn on and off tens of thousands of times a second, while carrying heavy current.</p>

<p>You already own some. IGBTs run the compressor in an inverter AC. They are the heart of most solar inverters. They drive electric trains, electric cars and modern welding machines. They became cheap and reliable because all of those industries use them.</p>

<h2>How the stabilizer uses it</h2>

<ol>
<li>A control chip (a DSP) measures the incoming wave continuously.</li>
<li>It works out exactly how much voltage to add or take away to make 220V.</li>
<li>The IGBTs switch at high speed to make that correction.</li>
<li>Filters and coils smooth the fast switching into a clean sine wave.</li>
</ol>

<p>There are no steps. The output does not jump from tap to tap. It is built continuously, so it stays within ±2% of 220V the whole time.</p>

<h2>Why is it called an "inverter" stabilizer?</h2>

<p>Because it uses the same switching technology as an inverter AC. It is <strong>not</strong> a UPS, and it is <strong>not</strong> a solar inverter. It has no battery. When the grid power goes during load-shedding, the stabilizer goes off too. Its job is to fix bad voltage, not to replace missing voltage.</p>

<h2>What the specs mean</h2>

<div class="table-scroll"><table>
<thead><tr><th>Spec</th><th>Voltec IGBT range</th><th>What it means for you</th></tr></thead>
<tbody>
<tr><td>Input range</td><td>90–310V</td><td>Holds 220V even when your voltage falls to 90V or jumps to 310V</td></tr>
<tr><td>Output</td><td>220V / 230V, ±2%</td><td>Output stays between about 216V and 224V on the 220V setting</td></tr>
<tr><td>Response</td><td>0 ms rated</td><td>Corrects within the wave — no catching up</td></tr>
<tr><td>Wave shape</td><td>Pure sine, THD under 3%</td><td>THD is how far the wave is from a perfect curve. Under 3% is clean.</td></tr>
<tr><td>Efficiency</td><td>≥96%</td><td>Wastes only a few percent as heat</td></tr>
<tr><td>No-load loss</td><td>10W (550VA) to 85W (20 kVA)</td><td>What it uses just by being switched on — about one or two light bulbs</td></tr>
<tr><td>Protection</td><td>Over/under-voltage, over-current, over-temperature, short circuit</td><td>Cuts off before bad power reaches your equipment</td></tr>
</tbody></table></div>

<h2>Why it is so much lighter</h2>

<p>A servo or relay stabilizer works at mains frequency, 50 Hz, so it needs a big, heavy transformer. An IGBT stabilizer switches at a much higher frequency, which lets it use far smaller magnetic parts. The Voltec 10 kVA IGBT weighs <strong>12.7 kg</strong> and hangs on a wall.</p>

<h2>Who needs one</h2>

<ul>
<li><strong>Precision and sensitive machines:</strong> laser and CNC cutters, lab analysers, imaging, servers and broadcast.</li>
<li><strong>Homes with inverter ACs</strong> in areas where voltage falls below 100V in the evening.</li>
<li><strong>Anyone who wants the cleanest power</strong> — pure sine, silent, with nothing to service.</li>
</ul>

<p>If your equipment accepts ±10% and your voltage stays above 95V, an <a href="/blog/what-is-scr-thyristor-stabilizer">SCR stabilizer</a> may be enough and costs less. See <a href="/blog/scr-vs-igbt-stabilizer">SCR vs IGBT</a>.</p>

<h2>What to watch for</h2>

<ul>
<li><strong>Size for starting current.</strong> Electronics have less overload margin than a big transformer. Fixed-speed ACs, fridges and pumps pull a surge at start-up — leave headroom.</li>
<li><strong>Keep it cool.</strong> The cooling fans are its only moving parts. Leave space around the unit and keep the vents clear of dust.</li>
<li><strong>Wire it properly.</strong> Use the right cable size and a good earth. Do not run it through an extension board.</li>
<li><strong>Add a UPS if needed.</strong> For a machine that must not lose power mid-job, put a UPS after the stabilizer.</li>
</ul>

<h2>The Voltec IGBT range</h2>

<div class="table-scroll"><table>
<thead><tr><th>Model</th><th>Rated current</th><th>Typical use</th><th>Net weight</th></tr></thead>
<tbody>
<tr><td>550VA</td><td>2.5A</td><td>TV, router and a few lights</td><td>2.1 kg</td></tr>
<tr><td>2 kVA</td><td>10A</td><td>One AC, or a room of electronics</td><td>3.3 kg</td></tr>
<tr><td>5 kVA</td><td>25A</td><td>One or two ACs plus the basics; clinics</td><td>7.3 kg</td></tr>
<tr><td>10 kVA</td><td>50A</td><td>A full home; laser and CNC machines</td><td>12.7 kg</td></tr>
<tr><td>15 kVA</td><td>75A</td><td>Whole home or small shop</td><td>19.5 kg</td></tr>
<tr><td>20 kVA</td><td>100A</td><td>Large home or shop; heavier machinery</td><td>22 kg</td></tr>
</tbody></table></div>

<p>The Voltec IGBT range is imported, checked and stocked in Lahore, and backed by our own service team. For the bigger picture, read our <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>, or see how it compares with a servo in <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</a>.</p>

<div class="callout"><div class="c-label">Ask about IGBT</div><div>WhatsApp <a href="${WA_IGBT}">+92 321 1644447</a> with your appliance list or machine nameplate, and your lowest evening voltage. We will size it and quote in writing.</div></div>
`,
    faqs: [
      {
        q: "What does IGBT stand for?",
        a: "IGBT stands for insulated-gate bipolar transistor. It is a silicon power switch that can turn on and off tens of thousands of times a second while carrying heavy current. The same kind of chip runs inverter ACs, solar inverters and electric cars.",
      },
      {
        q: "Is an inverter stabilizer the same as a UPS or a solar inverter?",
        a: "No. An inverter stabilizer has no battery. It fixes bad voltage from the grid, but when the power goes during load-shedding, it goes off too. It is called 'inverter' because it uses the same IGBT switching technology as an inverter AC.",
      },
      {
        q: "What does 0 ms response time mean?",
        a: "It means the stabilizer corrects the voltage within the wave itself, instead of reacting after the fact. There is no motor to move and no tap to switch, so the output stays within ±2% of 220V even when the input changes suddenly.",
      },
      {
        q: "What does pure sine output mean?",
        a: "Mains power should be a smooth wave, but motors, chargers and inverters nearby add distortion. An IGBT stabilizer builds a fresh, clean wave. The Voltec range keeps total harmonic distortion (THD) under 3%, which is what pure sine means in practice.",
      },
      {
        q: "Is an IGBT stabilizer worth the higher price?",
        a: "If you run sensitive or expensive equipment, have inverter ACs in a very-low-voltage area, or want nothing to service, yes. It reacts instantly, works from 90V, gives a clean wave and has no brush or motor to wear. For ordinary appliances where voltage stays above 95V, an SCR stabilizer costs less and may be enough.",
      },
      {
        q: "How long does an IGBT stabilizer last?",
        a: "Nothing inside wears each time it corrects, unlike a servo's carbon brush or a relay's contacts. What shortens the life of any electronics is heat and dust, so keep the vents clear, leave space around the unit, and do not overload it.",
      },
    ],
  },

  // ──────────────────────────────────────────── 7. SERVO PROBLEMS (pain)
  {
    id: "p-ss-007",
    slug: "servo-stabilizer-problems",
    title: "Servo Stabilizer Problems: Carbon Brush, Noise and Slow Correction",
    category: "Technical",
    cover: "assets/blog/servo-stabilizer-problems.jpg",
    readTime: 7,
    excerpt:
      "A servo stabilizer is a good machine with one weak point: it moves. Here are the faults we see most, what causes each one, what a fix involves — and when it makes more sense to go solid-state.",
    metaTitle: "Servo Stabilizer Problems: Carbon Brush, Noise & Fixes",
    metaDescription:
      "Worn carbon brush, motor noise, hunting output, slow response: the common servo stabilizer faults, their causes and fixes, and when to go solid-state.",
    keywords: [
      "servo stabilizer problems",
      "servo stabilizer carbon brush",
      "servo stabilizer carbon brush replacement",
      "servo stabilizer noise",
      "servo stabilizer not working",
      "servo stabilizer output fluctuating",
      "servo stabilizer repair",
      "servo stabilizer repair lahore",
    ],
    takeaways: [
      "A servo stabilizer wears because it moves: a motor drags a carbon brush along the winding every time the voltage changes.",
      "The most common faults are a worn brush, a noisy or stuck motor, output that swings up and down, and overheating.",
      "Slow response to a sudden drop is not a fault — a servo corrects at about 25–30 volts per second by design.",
      "A six-monthly clean and brush check prevents most failures. Always switch off and isolate first, or call a technician.",
      "Repair a healthy servo. Replace it when the winding track is damaged, brushes need changing every season, or sensitive equipment keeps resetting.",
    ],
    body: `
<p>We sell and service servo stabilizers, so we see the same faults on our bench again and again. A servo is a good machine. It has one weak point: it moves. Here is what goes wrong, why, what a fix involves — and when it is time to stop fixing.</p>

<h2>Why a servo stabilizer wears</h2>

<p>Inside the cabinet is a round copper winding with a bare track on top. A <strong>carbon brush</strong> presses on that track. A small <strong>motor and gearbox</strong> move the brush to raise or lower the voltage.</p>

<p>In Pakistan, the voltage moves all day — up at night, down in the evening, swinging every time a big load starts nearby. Each swing means the brush slides along the track. That is thousands of movements a month. Add 45°C summers and dust, and the moving parts wear faster than they would in a clean, cool room.</p>

<h2>Problem 1: Worn carbon brush</h2>

<p><strong>Signs:</strong> output flickers or jumps, a burning smell, black carbon dust inside the cabinet, lights that flicker even though the input reading looks steady.</p>

<p><strong>Cause:</strong> the brush has worn down until the spring can no longer press it firmly onto the track. It starts to arc.</p>

<p><strong>Fix:</strong> replace the brush and clean the track. If the track has burn marks or grooves, the winding may need resurfacing or replacement — a bigger job.</p>

<h2>Problem 2: Motor noise, grinding, or no movement</h2>

<p><strong>Signs:</strong> a grinding or whining sound, or the output stays stuck at one value while the input changes.</p>

<p><strong>Cause:</strong> worn gears, a dry bearing, a failed motor, or a stuck limit switch at the end of the track.</p>

<p><strong>Fix:</strong> replace the motor or gearbox. Check the limit switches while the cabinet is open.</p>

<h2>Problem 3: The output swings up and down ("hunting")</h2>

<p><strong>Signs:</strong> the output reading moves up and down by itself, and you hear the motor going back and forth.</p>

<p><strong>Cause:</strong> the control card is set too sensitive, the brush is worn, or a feedback wire is loose.</p>

<p><strong>Fix:</strong> recalibrate the control card, tighten connections, and check the brush.</p>

<h2>Problem 4: Slow to catch a sudden drop</h2>

<p><strong>Signs:</strong> lights dim for a moment, or a computer, laser or medical machine resets, when the voltage drops suddenly — even though the stabilizer is working.</p>

<p><strong>Cause:</strong> this is not a fault. It is how a servo works. A motor can only turn so fast — our servo units correct at about <strong>25–30 volts per second</strong>. A sudden 60V drop takes about two seconds to fix.</p>

<p><strong>Fix:</strong> there is no repair for physics. If your equipment is sensitive to those two seconds, it needs a solid-state stabilizer, which reacts in milliseconds. See <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a>.</p>

<h2>Problem 5: It keeps cutting off</h2>

<p><strong>Signs:</strong> the stabilizer switches off and shows high or low voltage, then comes back after a delay.</p>

<p><strong>Cause:</strong> usually the protection doing its job — your mains has gone outside the range the unit can correct. Sometimes the cut-off is set too tight.</p>

<p><strong>Fix:</strong> check the cut-off settings and compare your lowest and highest voltage with the unit's input range. If your area regularly goes outside it, you need a wider-range model.</p>

<h2>Problem 6: Overheating</h2>

<p><strong>Signs:</strong> the cabinet is hot to touch, a thermal trip, or a burnt smell.</p>

<p><strong>Cause:</strong> too much load for the kVA, blocked vents, dust, or a unit squeezed into a cupboard.</p>

<p><strong>Fix:</strong> add up your load and compare it with the rating. Clean the vents. Give it space. If you have added ACs since you bought it, it may simply be too small. See <a href="/blog/what-size-stabilizer-pakistan-home">what size stabilizer you need</a>.</p>

<h2>Prevent most of these with simple care</h2>

<p>Most of these faults start with dust — from the air, and from the carbon the brush sheds as it wears. A monthly look-and-listen, a clean and brush check every 3–6 months, and a yearly service prevent most of them. Our <a href="/blog/servo-stabilizer-maintenance">servo maintenance checklist</a> has the full routine.</p>

<p><strong>Safety first:</strong> a stabilizer carries mains voltage inside, and its winding can still be live when the display is off. Switch off at the breaker and isolate it before opening the cabinet. If you are not trained, have a technician do this.</p>

<h2>Repair, or move to solid-state?</h2>

<p><strong>Repair when:</strong> the unit is only a few years old, the problem is the brush or a loose connection, and it runs ordinary home appliances.</p>

<p><strong>Move to solid-state when:</strong></p>
<ul>
<li>the winding track is burnt or grooved;</li>
<li>you are changing brushes every season;</li>
<li>sensitive equipment keeps resetting on voltage dips;</li>
<li>the hum is a problem in a clinic, office or bedroom;</li>
<li>you want something you never have to open.</li>
</ul>

<p>A solid-state stabilizer has no brush, no motor and no gears — nothing that wears each time it corrects. An <a href="/blog/what-is-scr-thyristor-stabilizer">SCR stabilizer</a> is the cost-effective step up; an <a href="/blog/what-is-igbt-inverter-stabilizer">IGBT stabilizer</a> is the top of the range. Our <a href="/blog/solid-state-voltage-stabilizer">solid-state guide</a> explains both.</p>

<div class="callout"><div class="c-label">Repair or replace?</div><div>WhatsApp <a href="${WA_SERVO_FIX}">+92 321 1644447</a> a photo of your servo stabilizer, its nameplate and the problem. We will tell you honestly if it is worth fixing — and if not, quote a solid-state replacement in writing.</div></div>
`,
    faqs: [
      {
        q: "How long does a servo stabilizer carbon brush last?",
        a: "It depends on how much your voltage moves and how dusty the room is. In a normal home it can last years. Where the voltage swings all day, or in a dusty workshop, it wears much faster. Check the brush every six months so you can replace it before it starts to arc.",
      },
      {
        q: "Why is my servo stabilizer making noise?",
        a: "A soft hum while it corrects is normal — that is the motor moving. Grinding, whining or clicking usually means worn gears, a dry bearing or a failing motor. If it hums back and forth constantly, the control card may be set too sensitive and need recalibrating.",
      },
      {
        q: "Why does my servo stabilizer output keep going up and down?",
        a: "This is called hunting. It usually means the control card is set too sensitive, the carbon brush is worn, or a feedback wire is loose. Recalibrating the card and checking the brush and connections normally fixes it.",
      },
      {
        q: "Can I replace the carbon brush myself?",
        a: "Only if you are trained to work on mains equipment. The winding can still be live even when the display is off, so switch off at the breaker and isolate the unit first. If in doubt, have a technician do it.",
      },
      {
        q: "Why does my computer or laser reset even though I have a servo stabilizer?",
        a: "A servo corrects at about 25–30 volts per second, so a sudden 60V drop takes about two seconds to fix. Sensitive equipment can reset in that time. It is not a fault in the stabilizer; it is how a servo works. A solid-state SCR or IGBT stabilizer reacts in milliseconds.",
      },
      {
        q: "Does a solid-state stabilizer have a carbon brush?",
        a: "No. SCR and IGBT stabilizers correct voltage with silicon switches, so there is no brush, no servo motor and no gears to wear out. The only moving parts are small cooling fans.",
      },
    ],
  },

  // ─────────────────────────────────── 8. LASER / CNC / MEDICAL (use case)
  {
    id: "p-ss-008",
    slug: "stabilizer-for-laser-cnc-medical-equipment",
    title: "Which Stabilizer for a Laser, CNC or Medical Machine?",
    category: "Buyer Guide",
    cover: "assets/blog/stabilizer-for-laser-cnc-medical-equipment.jpg",
    readTime: 7,
    excerpt:
      "A laser or an ultrasound machine costs lakhs. Protecting it with the wrong type of stabilizer is the most common mistake we see. Here is how to choose — by machine, by voltage and by size.",
    metaTitle: "Best Stabilizer Type for Laser, CNC & Medical Machines",
    metaDescription:
      "Lasers, CNC drives and medical devices hate slow correction. Why servo falls short, when SCR is enough, when you need IGBT, and how to size it right.",
    keywords: [
      "stabilizer for laser machine",
      "stabilizer for laser hair removal machine",
      "stabilizer for cnc machine",
      "stabilizer for medical equipment",
      "stabilizer for ultrasound machine",
      "stabilizer for co2 laser cutter",
      "voltage stabilizer for clinic pakistan",
      "best stabilizer for sensitive equipment",
    ],
    takeaways: [
      "Lasers, CNC drives and medical devices care about the first few milliseconds of a voltage drop, not the average. A servo takes about two seconds to fix a sudden 60V drop.",
      "Choose SCR for most clinic lasers, ultrasound and electronics when the manual accepts ±10% and your voltage stays above 95V.",
      "Choose IGBT for laser cutters, CNC, lab analysers, imaging and anything whose manual asks for ±5% or a clean supply.",
      "Size from the machine's maximum input, add 25–50% headroom, and include the chiller, vacuum pump or extractor that runs with it.",
      "A stabilizer is not a UPS. For machines that must not stop mid-job, put a UPS after the stabilizer. Earth everything properly.",
    ],
    body: `
<p>A diode laser, a CO2 cutter or an ultrasound machine can cost more than a car. Yet we often see one plugged into a cheap relay stabilizer, or an old servo that takes two seconds to react. When something fails, the stabilizer gets blamed — but the real mistake was the type.</p>

<h2>Why these machines are different</h2>

<p>A fridge or a fan does not mind a dip of a second or two. A laser, a CNC or a medical device does. Inside are switch-mode power supplies, control boards, motion drives and laser sources. A sudden dip can make them reset in the middle of a job, abort a treatment shot, spoil a cut or throw an error. A surge can damage the power supply.</p>

<p>These machines do not care that your average voltage is 220V. They care what happens in the first few milliseconds of a change.</p>

<h2>Why a servo is the wrong tool here</h2>

<ul>
<li><strong>Too slow.</strong> A servo corrects at about 25–30 volts per second. A sudden 60V drop takes about two seconds to fix. The machine sees the dip.</li>
<li><strong>It wears.</strong> The carbon brush and motor need service — and service means downtime for the machine.</li>
<li><strong>It hums.</strong> Not what you want in a treatment room.</li>
</ul>

<p>A relay stabilizer is faster but corrects in coarse steps and clicks every time. For a valuable machine, both are false savings. Solid-state is the right tool.</p>

<h2>SCR or IGBT? A guide by machine</h2>

<div class="table-scroll"><table>
<thead><tr><th>Machine</th><th>Our usual suggestion</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Aesthetic and hair-removal lasers, dental lasers</td><td>SCR (IGBT if voltage falls below 95V)</td><td>Fast and silent; most accept ±10%</td></tr>
<tr><td>RF, HIFU and body-contouring devices</td><td>SCR</td><td>Steady, spark-free, quiet</td></tr>
<tr><td>Ultrasound, ECG, patient monitors</td><td>SCR, or IGBT for the cleanest wave</td><td>Fast correction; check the manual's tolerance</td></tr>
<tr><td>Lab analysers, PCR, centrifuges</td><td>IGBT</td><td>±2% and a pure sine for instruments</td></tr>
<tr><td>CO2 laser cutters and engravers</td><td>IGBT</td><td>Laser supply and motion drives like a clean, tight supply</td></tr>
<tr><td>Single-phase CNC routers</td><td>IGBT</td><td>Stepper and servo drives, spindle electronics</td></tr>
<tr><td>Servers, network racks, broadcast</td><td>IGBT, with a UPS</td><td>Clean wave, no dips</td></tr>
<tr><td>Fibre laser cutters, large CNC, X-ray, CT, MRI</td><td>Talk to us</td><td>Often three-phase with high start-up current; sized to the maker's power spec</td></tr>
</tbody></table></div>

<p>For three-phase machines, see our <a href="/industrial">industrial systems</a> — available in static IGBT or servo, made to your load.</p>

<h2>Read your machine's manual first</h2>

<p>Find the page called "power requirements" or "electrical specifications". Look for four things:</p>

<ul>
<li><strong>Input voltage</strong> — for example 220–240V.</li>
<li><strong>Tolerance</strong> — for example ±10%. If it says ±10% or wider, an SCR (±5%) keeps it well inside. If it says ±5% or tighter, choose IGBT (±2%).</li>
<li><strong>Power</strong> — the maximum input in VA, kVA or W. This is what you size from.</li>
<li><strong>Any note about a "regulated", "stable" or "clean" supply</strong> — choose IGBT.</li>
</ul>

<h2>How to size it</h2>

<ol>
<li>Take the machine's <strong>maximum</strong> input power, not its average.</li>
<li>Add everything that runs with it. A laser often has a <strong>water chiller</strong>. A CNC router has a <strong>vacuum pump</strong> and a <strong>dust extractor</strong>. A clinic room has an AC. These motors pull a surge when they start.</li>
<li>Add <strong>25–50% headroom</strong> on top. More if there are motors.</li>
<li>Pick the next size up.</li>
</ol>

<p>Not sure? Send us a photo of every nameplate and we will do the sum for you.</p>

<h2>A stabilizer is not a UPS</h2>

<p>A stabilizer fixes bad voltage. It does nothing when the power goes off. If a machine must not stop mid-job — a treatment shot, an analyser run, a server — put a <strong>UPS after the stabilizer</strong>: mains, then stabilizer, then UPS, then machine. The stabilizer protects the UPS; the UPS covers the outage.</p>

<h2>Install it right</h2>

<ul>
<li><strong>A dedicated circuit</strong> from the board, with the right cable size.</li>
<li><strong>A proper earth.</strong> This matters most for medical and laser equipment. A stabilizer cannot fix a missing earth.</li>
<li><strong>No extension boards</strong> between the stabilizer and the machine.</li>
<li><strong>Space and air</strong> around the unit, away from the machine's own heat outlet.</li>
</ul>

<h2>What Voltec offers clinics and workshops</h2>

<p>Voltec imports both solid-state types: the <strong>SCR range</strong> from 1 to 10 kVA and the <strong>IGBT range</strong> from 550VA to 20 kVA, plus three-phase systems for larger machines. We size from your nameplates, quote in writing, and back what we sell with our own service team. Clinic owners can also see our <a href="/medical">medical power protection page</a>. For background, read <a href="/blog/scr-vs-igbt-stabilizer">SCR vs IGBT</a> and our <a href="/blog/solid-state-voltage-stabilizer">solid-state guide</a>.</p>

<div class="callout"><div class="c-label">Send your nameplate</div><div>WhatsApp <a href="${WA_MACHINE}">+92 321 1644447</a> a photo of your machine's nameplate (and the chiller or pump that runs with it), plus your lowest evening voltage. We reply with the right type and size, quoted in writing.</div></div>
`,
    faqs: [
      {
        q: "What is the best stabilizer for a laser machine?",
        a: "A solid-state one. For most aesthetic, hair-removal and dental lasers, an SCR stabilizer is enough if the manual accepts ±10% input and your voltage stays above 95V. For CO2 laser cutters, or any laser whose manual asks for ±5% or a clean supply, choose an IGBT stabilizer. Avoid servo types: they take about two seconds to fix a sudden drop.",
      },
      {
        q: "Can I use a servo stabilizer for a laser hair removal machine?",
        a: "It will work, but it is not the best fit. A servo corrects at about 25–30 volts per second, so the laser sees a sudden dip for up to two seconds, which can cause errors or resets. The motor also hums and needs brush service. A solid-state SCR or IGBT stabilizer reacts in milliseconds and is silent.",
      },
      {
        q: "What size stabilizer do I need for a CO2 laser cutter?",
        a: "Add the laser's maximum input power to everything that runs with it — water chiller, exhaust fan and air pump — then add 25–50% headroom for motor start-up and pick the next size up. Send us photos of the nameplates and we will do the sum for you.",
      },
      {
        q: "Do medical machines need a stabilizer and a UPS?",
        a: "Often both. A stabilizer fixes bad voltage; a UPS covers a power cut. If the machine must not stop mid-use, connect mains to the stabilizer, the stabilizer to the UPS, and the UPS to the machine. Always follow the equipment maker's power requirements.",
      },
      {
        q: "Which stabilizer is best for a CNC machine?",
        a: "For a single-phase CNC router, an IGBT stabilizer — its ±2% pure sine output suits stepper and servo drives and spindle electronics. Size it to include the vacuum pump and dust extractor. Large three-phase CNC machines need a three-phase system sized to the load.",
      },
      {
        q: "Does a stabilizer need earthing?",
        a: "Yes. Connect the stabilizer and the machine to a proper earth, on a dedicated circuit with the right cable size. A stabilizer cannot fix a missing earth, and medical and laser equipment depend on it for safety.",
      },
    ],
  },
  // ───────────────────────────── 9. SERVO MAINTENANCE + DUST (Raheel, 2026-10-16)
  // "publish a story around servo motor maintenance… SCR & IGBT are dust-free."
  // ⚠️ "Dust-free" is worded as dust-free SWITCHING (it happens inside sealed
  // silicon) and "nothing for dust to wear" — NOT dust-proof. Both solid-state
  // ranges have fans and vents that still need a wipe; the post says so.
  // Owns "servo stabilizer maintenance"; the problems post (p-ss-007) owns
  // faults/repair and links here for the routine.
  {
    id: "p-ss-009",
    slug: "servo-stabilizer-maintenance",
    title: "Servo Stabilizer Maintenance: Why Dust Is the Enemy, and a Simple Checklist",
    category: "Technical",
    cover: "assets/blog/servo-stabilizer-maintenance.jpg",
    readTime: 7,
    excerpt:
      "A servo stabilizer fights dust every day — the dust in the air, and the carbon dust its own brush makes. Here is a simple checklist that keeps one alive, and why SCR and IGBT stabilizers have nothing for dust to wear down.",
    metaTitle: "Servo Stabilizer Maintenance Checklist: Dust & Carbon Brush",
    metaDescription:
      "Dust and carbon brush wear kill servo stabilizers. A simple monthly, 3–6 monthly and yearly checklist — and why SCR and IGBT have nothing for dust to wear.",
    keywords: [
      "servo stabilizer maintenance",
      "servo stabilizer service",
      "servo stabilizer cleaning",
      "servo stabilizer dust",
      "stabilizer carbon brush cleaning",
      "voltage stabilizer maintenance checklist",
      "maintenance free voltage stabilizer",
      "dust free stabilizer",
    ],
    takeaways: [
      "A servo stabilizer has two dust problems: dust from the air, and carbon dust shed by its own brush.",
      "Dust, carbon and damp air make a paste on the winding track. The brush sparks on it, burns the track, and the output starts to flicker.",
      "A simple routine prevents most failures: a monthly look-and-listen, a clean and brush check every 3–6 months, and a full service once a year.",
      "SCR and IGBT stabilizers switch inside sealed silicon. There is no brush to shed dust and no track, motor or gears for dust to wear.",
      "Their list is short: keep the vents clear and wipe the fan grille once or twice a year — more often in a dusty workshop.",
    ],
    body: `
<p>On our service bench, one cause of servo stabilizer failure comes up more than any other: <strong>dust</strong>. Not age. Not load. Dust.</p>

<p>Here is why dust matters so much to a servo, a simple checklist that keeps one running for years — and why solid-state SCR and IGBT stabilizers have nothing for dust to wear down.</p>

<h2>A servo stabilizer has two dust problems</h2>

<p><strong>Dust from outside.</strong> A servo cabinet has vents, because it needs air to stay cool. Air in Pakistan carries a lot with it: summer dust storms, road and construction dust, smog season in Punjab. In a workshop add wood dust, textile lint or flour. All of it gets pulled inside.</p>

<p><strong>Dust it makes itself.</strong> This is the one most people never hear about. Every time the carbon brush moves, a tiny amount of it wears away. That worn carbon becomes a fine black powder inside the cabinet. And carbon conducts electricity.</p>

<h2>What dust does inside a servo</h2>

<ol>
<li>Outside dust and carbon powder settle on the bare winding track where the brush runs.</li>
<li>In damp weather — the monsoon, or Karachi's humid air — it turns into a thin paste.</li>
<li>The brush slides on that paste instead of clean copper, and it starts to spark.</li>
<li>Each spark leaves a small burn mark. Burnt spots make the output flicker and jump.</li>
<li>Dust in the gears makes the motor work harder. It slows down, grinds and runs hot.</li>
<li>Dust on the control card, plus damp air, causes wrong readings and random faults.</li>
</ol>

<p>None of this happens in a day. It builds up slowly — which is exactly why a simple routine works.</p>

<h2>The servo maintenance checklist</h2>

<div class="callout"><div class="c-label">Safety first</div><div>A stabilizer carries mains voltage inside, and parts can stay live even when the display is off. Switch off at the breaker and isolate it before opening the cabinet. If you are not trained to work on mains equipment, have a technician do it.</div></div>

<p><strong>Every month — no tools, no opening. Anyone can do this.</strong></p>
<ul>
<li><strong>Look</strong> at the display. Does the output stay close to 220V while the input moves?</li>
<li><strong>Listen.</strong> A soft hum while it corrects is normal. Grinding, whining or constant back-and-forth is not.</li>
<li><strong>Smell.</strong> Any burning smell: switch off and call a technician.</li>
<li><strong>Feel</strong> the cabinet. Warm is fine. Too hot to keep your hand on is not.</li>
<li><strong>Check the vents</strong> are not blocked by boxes, curtains or a layer of dust.</li>
</ul>

<p><strong>Every 3–6 months — a technician, with the power off.</strong> Every 3 months in a workshop or dusty area; every 6 months in a clean home.</p>
<ul>
<li>Blow the dust out with <strong>dry</strong> compressed air. Never water, never a wet cloth.</li>
<li>Wipe the carbon dust off the winding track with a dry, lint-free cloth.</li>
<li>Check the carbon brush: its length, its spring pressure and whether it wears evenly. Replace it before it wears down to the mark.</li>
<li>Look along the track for burn marks or grooves.</li>
<li>Run the motor from end to end. It should move smoothly, with no grinding. Check the limit switches at each end.</li>
<li>Tighten the input and output terminals. Loose terminals heat up.</li>
<li>Check the cables for brown or melted insulation.</li>
<li>Compare the output with a multimeter. If it is off by more than a few volts, recalibrate.</li>
</ul>

<p><strong>Once a year — full service.</strong> Everything above, plus: check the motor and gears closely, test the cut-off relay, clean the control card with dry air, check the earth connection, and test that the high- and low-voltage cut-offs trip where they should.</p>

<p><strong>After a dust storm, nearby construction, or the monsoon:</strong> do the 3–6 month clean early.</p>

<h2>Where you put it matters</h2>

<ul>
<li><strong>Off the floor</strong> — away from mopping water and floor dust.</li>
<li><strong>Away from the kitchen</strong> — grease and dust make a sticky paste.</li>
<li><strong>Not in a closed cupboard</strong> — leave at least a hand's width of space on every side.</li>
<li><strong>Out of direct sun and rain.</strong></li>
<li><strong>Never cover it</strong> while it is running.</li>
</ul>

<h2>Why SCR and IGBT stabilizers don't have this problem</h2>

<p>A solid-state stabilizer corrects voltage with silicon switches — thyristors in an SCR unit, IGBT modules in an inverter unit. The switching happens <strong>inside sealed components</strong>, so it is dust-free by design.</p>

<ul>
<li><strong>No brush</strong> — so nothing inside makes its own carbon dust.</li>
<li><strong>No open track</strong> — so there is nowhere for paste to form.</li>
<li><strong>No motor and no gears</strong> — so there is nothing for dust to grind.</li>
<li><strong>No contact to spark</strong> — so no burn marks, ever.</li>
</ul>

<p>To be fair, they still breathe. Both have temperature-controlled cooling fans that pull air across a heatsink, and dust can settle on the fan and the fins. Heavy dust makes them run warmer. So they need a little care too — just far less of it.</p>

<div class="table-scroll"><table>
<thead><tr><th>Task</th><th>Servo (SVC)</th><th>SCR / IGBT</th></tr></thead>
<tbody>
<tr><td>Clear dust</td><td>Blow out the inside every 3–6 months</td><td>Wipe the vents and fan grille once or twice a year</td></tr>
<tr><td>Clean carbon off the winding track</td><td>Every service</td><td>Not needed — no brush, no track</td></tr>
<tr><td>Replace the carbon brush</td><td>When it wears down</td><td>Never — there is no brush</td></tr>
<tr><td>Check motor and gears</td><td>Every service</td><td>Not needed — no motor, no gears</td></tr>
<tr><td>Look for burn marks and sparking</td><td>Every service</td><td>Not needed — no contacts to spark</td></tr>
<tr><td>Tighten terminals, check the earth</td><td>Yearly</td><td>Yearly</td></tr>
<tr><td>Check output against a meter</td><td>Every service</td><td>Yearly</td></tr>
</tbody></table></div>

<h2>When maintenance stops making sense</h2>

<p>A healthy servo in a clean home, serviced on time, is a good machine. Keep it. But think about moving to solid-state when:</p>

<ul>
<li>you clean it on schedule and the output still flickers;</li>
<li>the winding track is burnt and needs resurfacing;</li>
<li>it sits in a workshop full of wood, textile or CNC dust — a servo in that air is a losing fight;</li>
<li>it protects a clinic machine, lab or production line where a service day costs more than the stabilizer.</li>
</ul>

<p>An <a href="/blog/what-is-scr-thyristor-stabilizer">SCR stabilizer</a> is the cost-effective step up. An <a href="/blog/what-is-igbt-inverter-stabilizer">IGBT stabilizer</a> is the top of the range. If your servo is already showing faults, see <a href="/blog/servo-stabilizer-problems">common servo problems and fixes</a>, and for the full comparison read <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a> and our <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>.</p>

<div class="callout"><div class="c-label">Service or switch?</div><div>We service the servo stabilizers we sell. Thinking of moving to solid-state? WhatsApp <a href="${WA_SERVO_FIX}">+92 321 1644447</a> a photo of your servo's nameplate, your load, and where it sits — home, shop or workshop. We will quote an SCR or IGBT replacement side by side, in writing.</div></div>
`,
    faqs: [
      {
        q: "How often should a servo stabilizer be serviced?",
        a: "Clean it and check the carbon brush every 6 months in a clean home, or every 3 months in a workshop or dusty area. Give it a full service once a year. Do an extra clean after a dust storm, nearby construction or the monsoon.",
      },
      {
        q: "Why is there black dust inside my servo stabilizer?",
        a: "It is carbon dust from the brush. The brush wears a little every time it moves, and the worn carbon collects inside the cabinet. A small amount is normal. A lot of it, or a sticky black layer on the winding track, means the brush is worn or sparking — have it cleaned and checked.",
      },
      {
        q: "Can I clean a stabilizer with water or a wet cloth?",
        a: "No. Use dry compressed air and a dry, lint-free cloth only, with the power switched off at the breaker and the unit isolated. Water and damp cloths mix with dust and carbon into a conductive paste — the very thing that causes sparking.",
      },
      {
        q: "Does dust damage voltage stabilizers?",
        a: "It damages servo stabilizers most: dust and the brush's own carbon form a paste on the winding track, causing sparks, burn marks and flickering output, and dust in the gears wears the motor. SCR and IGBT stabilizers switch inside sealed silicon, so dust only affects their vents and cooling fan.",
      },
      {
        q: "Do SCR and IGBT stabilizers need maintenance?",
        a: "Very little. There is no carbon brush, servo motor or gearbox to service. Keep the vents clear, wipe the fan grille once or twice a year — more often in a dusty workshop — and check the terminals and earth when you service your wiring.",
      },
      {
        q: "Is a solid-state stabilizer better for a dusty workshop?",
        a: "Yes. Wood, textile and CNC dust are hard on a servo's brush, track and gears. An SCR or IGBT stabilizer has none of those parts. Give it space and clean air around the vents, and check the fan grille more often than you would at home.",
      },
    ],
  },
];

// ── p-007 refresh: the June comparison post predates SCR. On --publish it gains
// an SCR section, a solid-state frame and links into this cluster. Same URL,
// same title — it already has whatever ranking it has earned.
const P007_UPDATE = {
  readTime: 6,
  excerpt:
    "There are four kinds of voltage stabilizer in Pakistan — relay (AVR), servo (SVC), SCR (thyristor) and inverter (IGBT). Here is the plain difference, and which one to buy.",
  metaDescription:
    "Relay (AVR), servo (SVC), SCR (thyristor) and inverter (IGBT) stabilizers in plain words: how each works, what wears out, and which one to buy for your home.",
  keywords: [
    "inverter vs servo stabilizer",
    "IGBT vs servo vs relay stabilizer",
    "best voltage stabilizer for home Pakistan",
    "inverter stabilizer",
    "AVR vs servo",
    "scr vs servo stabilizer",
    "types of voltage stabilizer",
  ],
  takeaways: [
    "There are four stabilizer types: relay (AVR), servo (SVC), SCR (thyristor) and inverter (IGBT).",
    "Relay and servo correct voltage by moving something — a relay contact or a motor and brush — and those parts wear.",
    "SCR and IGBT are solid-state: nothing moves to correct the voltage, so they are faster, silent and need almost no upkeep.",
    "Inverter (IGBT) is the top of the range: 0 ms rated, ±2%, pure sine, works from 90V. SCR is solid-state at a lower price: about 20 ms, ±5%.",
    "Relay (AVR) is the cheapest, for one appliance on a budget. Servo still suits large and three-phase loads.",
  ],
  body: `
<p>Most stabilizers in Pakistani homes are the relay type or the servo type. But there are four kinds, and the difference matters for your appliances. Here it is in plain words.</p>

<h2>Relay (AVR) — the budget stabilizer</h2>
<p>This is what most shops sell by default. It switches between transformer taps with relays, so the output jumps in steps (±5–10%). You hear a click every time it corrects. It is the cheapest to buy, and the relay contacts wear a little with every click. Fine for one appliance on a budget.</p>

<h2>Servo (SVC) — the motor type</h2>
<p>A small motor drags a carbon brush along a winding to correct voltage smoothly (±1%). It is proven and good value, especially for large and motor loads. But it is slow — about 25–30 volts per second — and the motor and brush wear out over time and need service. It makes a faint hum.</p>

<h2>SCR (thyristor) — solid-state at a sensible price</h2>
<p>Like a relay stabilizer, it picks between transformer taps — but with silicon switches (thyristors) instead of metal contacts. No spark, no click, nothing to wear. It corrects in about 20 ms and holds 220V ±5%. Good for laser machines, clinic devices, electronics and homes where you want nothing to service. <a href="/blog/what-is-scr-thyristor-stabilizer">How an SCR stabilizer works</a>.</p>

<h2>Inverter (IGBT) — the top of the range</h2>
<p>This works like an inverter AC. It builds the correct voltage electronically with no moving parts, rated 0 ms. It holds 220V ±2% from a 90–310V input, gives a clean pure sine output and runs silent. It costs more up front, and it is the best fit for inverter ACs, sensitive machines and very-low-voltage areas. <a href="/blog/what-is-igbt-inverter-stabilizer">How an IGBT stabilizer works</a>.</p>

<blockquote>Relay and servo fix voltage by moving something. SCR and IGBT do it with silicon. That is why we think solid-state is the future.</blockquote>

<p>Compare them head to head: <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a> · <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</a> · <a href="/blog/scr-vs-igbt-stabilizer">SCR vs IGBT</a>. Or read the full <a href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</a>.</p>

<div class="callout"><div class="c-label">Quick answer</div><div>Inverter (IGBT) = top of the range, for sensitive equipment and inverter ACs. SCR = solid-state at a lower price. Servo (SVC) = proven, for large and motor loads. Relay (AVR) = cheapest, for a single appliance.</div></div>
`,
  faqs: [
    {
      q: "What is the difference between inverter, SCR, servo and relay stabilizers?",
      a: "Relay (AVR) switches transformer taps with metal relays and is the cheapest. Servo (SVC) moves a carbon brush with a motor for smooth ±1% output but is slow and wears. SCR switches taps with silicon thyristors — no spark, about 20 ms, ±5%. Inverter (IGBT) builds the voltage electronically — 0 ms rated, ±2%, pure sine, from 90V.",
    },
    {
      q: "Which type of voltage stabilizer is best for a home?",
      a: "For a modern home with inverter ACs and electronics, a solid-state stabilizer: IGBT for the cleanest power and very low voltage, or SCR for solid-state speed at a lower price. A servo is still a proven choice for large loads. A relay AVR is only worth it for a single budget appliance.",
    },
    {
      q: "Is an inverter stabilizer worth the higher price?",
      a: "For most modern homes and any sensitive equipment, yes. It reacts instantly, works from 90V, runs silently and has no brush or motor to wear out. If your voltage stays above 95V and your equipment accepts ±10%, an SCR stabilizer gives you solid-state speed for less.",
    },
  ],
};

const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

if (process.argv.includes("--dry")) {
  for (const p of posts) {
    console.log(`\n── /blog/${p.slug}`);
    console.log(`   ${p.title}`);
    console.log(
      `   ${p.readTime} min · ${p.keywords.length} kw · ${p.takeaways.length} takeaways · ` +
        `${p.faqs.length} FAQs · ${words(p.body)} words`,
    );
    console.log(`   metaTitle [${p.metaTitle.length}] ${p.metaTitle}`);
    console.log(`   metaDesc  [${p.metaDescription.length}]`);
  }
  console.log(`\n── p-007 refresh: ${words(P007_UPDATE.body)} words, ${P007_UPDATE.faqs.length} FAQs`);
  console.log("\nDRY RUN — nothing written.");
  process.exit(0);
}

const publish = process.argv.includes("--publish");
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rows = posts.map((p) => ({ ...p, ...AUTHOR, date: DATE, published: publish }));
const { error } = await sb.from("posts").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("UPSERT ERROR:", error);
  process.exit(1);
}

if (publish) {
  const { error: e2 } = await sb.from("posts").update(P007_UPDATE).eq("id", "p-007");
  if (e2) {
    console.error("p-007 UPDATE ERROR:", e2);
    process.exit(1);
  }
}

const { data } = await sb.from("posts").select("slug").eq("published", true);
console.log(
  `${publish ? "Published" : "Saved as drafts"}: ${rows.map((r) => "/blog/" + r.slug).join(", ")}` +
    `${publish ? " · p-007 refreshed" : ""}. Published posts now live: ${data?.length}`,
);
