// Seeds the PAIN cluster: 5 posts that answer the questions Pakistani buyers ask
// an AI assistant at the moment something goes wrong (inverter tripping, machine
// burnt, low voltage in the factory) or right after buying new equipment.
//
// WHY (2026-10-22): first-party data shows ChatGPT sends ~8% of site visits and
// converts best (~1 in 7 click WhatsApp), but almost all of that lands on the EVE
// cell pages. Stabilizer pages get almost no AI traffic. Buyers already know what
// a stabilizer is — they ask AI when they are in pain. These pages are written
// for answer engines (ChatGPT / Gemini / Perplexity / Google AI Overview): every
// post opens with a 2–3 sentence direct answer, uses question-form H2s, and
// carries 5–6 FAQs (emitted as FAQPage schema) including Roman-Urdu phrasings.
//
// Usage:
//   node scripts/seed-pain-cluster.mts --dry   # print stats, write nothing
//   node scripts/seed-pain-cluster.mts         # upsert the posts as DRAFTS
//
// There is deliberately NO publish path in this script. Drafts are not listed,
// not in the sitemap and not in llms.txt, but /blog/<slug> still renders them by
// direct URL (getPostBySlug does not filter on `published`) — review them there,
// then flip `published` by hand (or add a reviewed --publish flag) when approved.
//
// ⚠️ RULES THIS CONTENT FOLLOWS — keep them if you edit it:
//  - NO STABILIZER PRICES anywhere. Inquiry-first; quote on WhatsApp.
//  - Servo (SVC), SCR, IGBT and 3-phase SJW are IMPORTED. Never "we build / make /
//    manufacture", never "made in Lahore/Pakistan". "Since 1995" and "Lahore
//    showroom" are fine.
//  - Specs only from lib/products.ts and the solid-state seed: IGBT 220V ±2%,
//    0 ms rated, 90–310V, up to 20 kVA; SCR 220V ±5%, ~20 ms, 95–250V, 1–10 kVA;
//    SVC 220V ±1%, 25–30 V/s, standard input 150–270V; 30 kVA 60V servo is
//    single-phase, 60–250V in, 220V ±3%. SJW 50 kVA 3-phase: per phase 150–260V
//    in → 220V ±2.5%; 3-phase 260–450V in → 385V ±3%; 50–60Hz; over/under
//    voltage, phase failure, time delay, digital V/A meter, bypass; 1-year coil
//    warranty.
//  - SCR is stepped ±5%. Never call it stepless, pure sine or ±1%.
//  - No false superlatives, no competitor stabilizer brands, no invented
//    customers, certifications or statistics.
//  - Honest broker: say plainly when a stabilizer will NOT fix the problem.
//  - Never link /showcase/scr or /showcase/smart-inverter-voltage-stabilizer
//    (hidden pre-launch, they 404).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Canonical PK sales line (SITE.whatsapp). Each link pre-fills the topic so the
// lead identifies itself in the inbox.
const wa = (text: string) => `https://wa.me/923211644447?text=${encodeURIComponent(text)}`;
const WA_INVERTER = wa("Stabilizer quote: my solar inverter keeps tripping. Inverter size: ");
const WA_BURNT = wa("Stabilizer quote: my machine burnt from high voltage. Nameplate photo attached: ");
const WA_FACTORY = wa("Stabilizer quote: 3-phase factory load. Load sheet / kW: ");
const WA_NEW = wa("Stabilizer quote: I bought new equipment. Model / nameplate: ");
const WA_LOWV = wa("Stabilizer quote: low voltage in my factory. Lowest voltage and load: ");

const DATE = "October 22, 2026";
const AUTHOR = { author: "Voltec Team", authorRole: "Lahore Office" };

const CTA = (href: string, line: string) => `
<div class="callout"><div class="c-label">Get the right unit, in writing</div><div>${line} WhatsApp <a href="${href}">+92 321 1644447</a> — send a photo of the nameplate or your load list and your lowest and highest voltage. Voltec has supplied power protection from its Lahore showroom since 1995, and we will tell you honestly if a stabilizer is not the fix.</div></div>`;

const posts = [
  // ───────────────────────────────────────────── 1. INVERTER TRIPPING
  {
    id: "p-pain-001",
    slug: "inverter-tripping-low-high-voltage",
    title: "Why Does My Solar Inverter Trip on Low or High Voltage — and How Do I Fix It?",
    category: "Problem Solver",
    cover: "stripes-home",
    readTime: 6,
    excerpt:
      "\"AC input voltage out of range\" means the grid voltage left the window your hybrid inverter accepts. Here is why it happens, when a stabilizer fixes it, and when it does not.",
    metaTitle: "Inverter Tripping on Low/High Voltage: Causes & Fix",
    metaDescription:
      "Why hybrid solar inverters show \"AC input voltage out of range\" and drop the grid — the settings to check, when a stabilizer fixes it, and when it won't.",
    keywords: [
      "inverter tripping low voltage",
      "ac input voltage out of range",
      "solar inverter tripping high voltage",
      "hybrid inverter grid fault pakistan",
      "inverter baar baar trip",
      "stabilizer for solar inverter",
      "inverter grid voltage fault",
      "growatt inverter low voltage fault",
      "solis inverter grid voltage error",
      "livoltek inverter tripping",
      "huawei inverter grid overvoltage",
    ],
    takeaways: [
      "\"AC input voltage out of range\" means the grid went outside the voltage window your inverter accepts, so it disconnected to protect itself.",
      "First check the inverter's input-range setting: a narrow (UPS-type) range trips far more often than a wide (appliance-type) range.",
      "If the grid really goes below or above that window, a stabilizer on the inverter's AC input holds it steady and the trips stop.",
      "A stabilizer will not fix trips caused by overload, battery faults, frequency problems or a loose connection.",
      "Size the stabilizer above the inverter's AC input load. As a guide, Voltec pairs a 10 kVA servo with a 6–8 kVA inverter and 15 kVA with a 10 kVA inverter.",
    ],
    body: `
<p><strong>Your hybrid solar inverter trips because the grid voltage has gone outside the range it is set to accept, so it disconnects from WAPDA to protect itself and your load.</strong> The fix is to first widen the inverter's input-range setting, and if the grid still goes too low or too high, put a voltage stabilizer on the inverter's AC input so it always sees a steady 220V. A stabilizer will not help if the trip is caused by overload, the battery or a wiring fault.</p>

<h2>What does "AC input voltage out of range" mean?</h2>
<p>Every hybrid inverter — Growatt, Solis, Livoltek, Huawei, GoodWe, Deye, Knox, Inverex, Fronus and similar — watches the grid voltage on its AC input. If the voltage falls below or rises above a set window, it shows a grid fault (often "AC input voltage out of range", "grid voltage low/high" or a fault code), stops charging from the grid and switches to battery. When the voltage comes back, it reconnects. On a weak line this can happen many times an hour. The battery drains, the inverter clicks in and out, and sometimes the load drops for a moment.</p>

<h2>Why does my inverter trip so often in the evening?</h2>
<p>In many areas of Pakistan, voltage is fine in the morning and falls hard in the evening when everyone runs ACs. Homes at the far end of a long line, or on an overloaded transformer, can see well below 180V. Some areas get the opposite: high voltage late at night, or after load-shedding ends. Both push the inverter out of its window.</p>

<h2>What should I check before buying anything?</h2>
<ul>
<li><strong>Input-range setting.</strong> Many inverters have a narrow range (often called UPS mode) and a wide range (often called appliance mode). Narrow trips much sooner. If your load can accept it, switch to the wide range — this is free.</li>
<li><strong>Measure the real voltage.</strong> Use the inverter's own display or a meter, at the worst time of day. Write down the lowest and highest numbers.</li>
<li><strong>Overload.</strong> If the fault says overload, not voltage, a stabilizer will not help. Reduce the load or size up the inverter.</li>
<li><strong>Battery and wiring.</strong> Battery faults, loose AC terminals or a thin supply cable can look like voltage problems. Have your installer check them.</li>
</ul>

<h2>When does a stabilizer fix inverter tripping?</h2>
<p>When the grid voltage itself goes outside the inverter's window and the setting is already as wide as your load allows. The stabilizer sits between the grid and the inverter's AC input. It takes the swinging grid voltage and gives the inverter a steady 220V, so the inverter stays on grid, keeps charging and stops clicking over.</p>

<h2>Which type of stabilizer is right for a solar inverter?</h2>
<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Output</th><th>Speed</th><th>Good for</th></tr></thead>
<tbody>
<tr><td>Servo (SVC)</td><td>220V ±1%</td><td>About 25–30 V per second</td><td>Slow evening sag; larger inverters</td></tr>
<tr><td>SCR (thyristor)</td><td>220V ±5%, stepped</td><td>About 20 ms</td><td>Fast dips; input from 95V</td></tr>
<tr><td>IGBT (inverter)</td><td>220V ±2%, pure sine</td><td>0 ms rated</td><td>Very low voltage (from 90V); sudden dips</td></tr>
</tbody></table></div>
<p>A servo is the common choice for a whole-home inverter. But a servo corrects at about 25–30 volts per second, so a sudden drop from 220V to 160V takes about two seconds to fix — some inverters trip inside that time. If your trips come from sudden dips, a solid-state unit reacts faster. See <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</a> and <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a>.</p>

<h2>What size stabilizer do I need for my inverter?</h2>
<p>Size it above everything the inverter pulls from the grid: the load it passes through plus battery charging. As a guide, Voltec pairs a <strong>10 kVA servo with a 6–8 kVA inverter</strong> and a <strong>15 kVA servo with a 10 kVA inverter</strong>. Check the input range too: a standard servo works from 150V; if your line falls lower, ask for a low-voltage model. See the <a href="/showcase/svc">servo (SVC) range</a> and our guide to <a href="/blog/stabilizer-for-solar-inverter-livoltek-growatt-solis">stabilizers for solar inverters</a>.</p>

<h2>When will a stabilizer NOT help?</h2>
<p>If the trip is from overload, a battery fault, a frequency problem on a generator, or a loose connection, a stabilizer changes nothing. If the grid is completely off, a stabilizer cannot make power. And if your voltage falls below what any stabilizer can work from, the real fix is a complaint to your electricity company about the transformer or the line.</p>
${CTA(WA_INVERTER, "Tell us your inverter model and size, and send a photo of the fault screen.")}
`,
    faqs: [
      {
        q: "Why does my inverter show \"AC input voltage out of range\"?",
        a: "The grid voltage went below or above the window the inverter is set to accept, so it disconnected from the grid to protect itself. It reconnects when the voltage comes back into range.",
      },
      {
        q: "Inverter baar baar trip kyun hota hai?",
        a: "Usually because WAPDA voltage keeps going too low (often in the evening) or too high (often late at night), outside the inverter's input range. First set the inverter to its wide input range. If it still trips, a stabilizer on the inverter's AC input gives it a steady 220V.",
      },
      {
        q: "Will a stabilizer stop my solar inverter from tripping?",
        a: "Yes, if the trips are caused by grid voltage going out of range. No, if they are caused by overload, a battery fault, generator frequency or a loose connection.",
      },
      {
        q: "What size stabilizer do I need for a 6 kVA or 10 kVA inverter?",
        a: "As a guide, Voltec pairs a 10 kVA servo stabilizer with a 6–8 kVA inverter and a 15 kVA servo with a 10 kVA inverter. The exact size depends on your load and battery charging current.",
      },
      {
        q: "Servo or solid-state stabilizer for an inverter?",
        a: "A servo (220V ±1%) suits slow evening sag. It corrects at about 25–30 V per second, so a sudden dip can still trip some inverters. SCR (about 20 ms) and IGBT (0 ms rated, from 90V) react faster to sudden dips.",
      },
      {
        q: "Kya stabilizer lagane se inverter ka low voltage fault khatam ho jaye ga?",
        a: "Agar fault grid voltage ki wajah se hai to haan — stabilizer inverter ko steady 220V deta hai. Agar fault overload, battery ya wiring ka hai to stabilizer se farq nahi parega.",
      },
    ],
  },

  // ───────────────────────────────────────────── 2. MACHINE BURNT
  {
    id: "p-pain-002",
    slug: "machine-burnt-due-to-high-voltage",
    title: "Machine or Motor Burnt Due to High Voltage? What to Do Now — and How to Stop It Happening Again",
    category: "Problem Solver",
    cover: "stripes-industrial",
    readTime: 6,
    excerpt:
      "A burnt motor or control board after a voltage spike is painful. Here is what to do in the first hour, how to find the real cause, and what protection stops it next time.",
    metaTitle: "Machine Burnt Due to High Voltage: What to Do Next",
    metaDescription:
      "Motor or machine burnt from high voltage? Steps to take now, how to find the real cause (high volts, low volts, phase failure, neutral), and how to prevent it.",
    keywords: [
      "machine burnt due to high voltage",
      "motor burnt high voltage",
      "high voltage damage appliance pakistan",
      "motor jal gaya voltage",
      "phase failure motor burnt",
      "stabilizer for motor protection",
      "high voltage cutoff stabilizer",
    ],
    takeaways: [
      "Switch off at the main, do not restart, and photograph the nameplate and the damage before anything is moved.",
      "Find the real cause. High voltage burns electronics and boards; motors also burn from low voltage, a missing phase or a broken neutral.",
      "Check all three phases and the neutral before you restart a repaired machine — or it can burn again.",
      "A stabilizer with high/low cutoff and phase-failure protection keeps voltage steady and disconnects the load when supply goes outside its range.",
      "A stabilizer is not lightning protection and does not fix an overloaded or mechanically jammed motor.",
    ],
    body: `
<p><strong>If a machine or motor burnt because of high voltage, switch it off at the main, do not restart it, and have the voltage on every phase and the neutral checked before anything goes back on.</strong> Then get the motor rewound or the board repaired, and fit a stabilizer with high- and low-voltage cutoff — and phase-failure protection on a three-phase supply — so the next swing is corrected or cut off before it reaches the machine.</p>

<h2>What should I do right now?</h2>
<ol>
<li><strong>Switch off at the main breaker.</strong> Do not keep trying to start the machine — each try can do more damage.</li>
<li><strong>Do not reconnect other equipment</strong> to the same supply until it has been checked. If one machine burnt, the fault may still be there.</li>
<li><strong>Take photos</strong> of the nameplate, the burnt part, the panel and any meter reading. You will need them for repair, warranty and choosing protection.</li>
<li><strong>Call a qualified electrician</strong> to measure voltage on each phase (phase to neutral and phase to phase) and check the neutral and earth.</li>
<li><strong>Write down what happened</strong> — the time, whether lights went very bright or dim, and whether the electricity had just come back after load-shedding.</li>
</ol>

<h2>Was it really high voltage?</h2>
<p>Often, but not always. It matters, because the protection is different.</p>
<ul>
<li><strong>High voltage</strong> mostly burns electronics: control boards, VFDs, chargers, LED drivers. It also overheats motor windings.</li>
<li><strong>Low voltage</strong> burns motors too. When voltage drops, a motor pulls more current to do the same work, and the winding heats up. So a "burnt motor" can be low-voltage damage, not high-voltage.</li>
<li><strong>A missing phase</strong> (single-phasing) on a three-phase motor makes it hum, overheat and burn quickly.</li>
<li><strong>A broken or loose neutral</strong> can push one single-phase line far above 250V while another drops low. This is a common cause of many appliances burning at once.</li>
</ul>

<h2>Machine kyun jal gayi — how do I find the cause?</h2>
<p>Ask the rewinding shop how the winding burnt: one phase burnt usually points to a missing phase; all windings evenly burnt points to overload or long low voltage. Ask your electrician to check the neutral and earthing. If several appliances burnt at the same moment, suspect the neutral or a supply-side fault and report it to your electricity company.</p>

<h2>How do I stop it happening again?</h2>
<p>Fit protection that matches the cause:</p>
<ul>
<li><strong>A stabilizer</strong> holds the voltage steady when supply swings, and cuts the load off if voltage goes beyond what it can correct. Look for high/low-voltage cutoff, a time delay on restart (so motors do not restart the instant power returns), and overload protection.</li>
<li><strong>On three-phase:</strong> a stabilizer with phase-failure protection. The Voltec SJW 3-phase units include over/under-voltage, phase failure, time delay, a digital volt/amp meter and a bypass switch. See <a href="/industrial">three-phase industrial stabilizers</a>.</li>
<li><strong>For sensitive single-phase machines</strong> (CNC controllers, lasers, medical devices), a solid-state stabilizer reacts faster than a servo: SCR in about 20 ms, IGBT 0 ms rated. More: <a href="/blog/stabilizer-for-laser-cnc-medical-equipment">stabilizers for laser, CNC and medical equipment</a>.</li>
</ul>

<h2>What will a stabilizer NOT protect against?</h2>
<p>Be clear on this before you spend money. A stabilizer is not a lightning arrester — a direct strike or large surge needs a surge protection device and good earthing. It does not fix a motor that is overloaded, jammed or has worn bearings. And it does not fix a bad neutral in your building: that must be repaired by an electrician. If your problem is one of these, we will tell you.</p>

<h2>What size stabilizer does the machine need?</h2>
<p>Read the kW or kVA and the voltage on the nameplate, add a 25% margin, and allow for the starting surge of motors. A compressor or motor can pull several times its running load for a few seconds at start. Single-phase or three-phase must match your supply. Step-by-step sizing for larger loads is in <a href="/blog/stabilizer-for-50-kva-factory">which stabilizer for a 50 kVA factory</a>.</p>
${CTA(WA_BURNT, "Send the nameplate photo of the burnt machine and tell us what happened.")}
`,
    faqs: [
      {
        q: "What should I do if my machine burnt due to high voltage?",
        a: "Switch off at the main, do not restart, photograph the nameplate and damage, and have an electrician measure every phase and check the neutral before reconnecting anything. Then repair the machine and fit voltage protection.",
      },
      {
        q: "Motor jal gaya, ab kya karoon?",
        a: "Main breaker band karein, motor dobara start na karein, aur electrician se teeno phase aur neutral check karwayein. Rewinding ke baad stabilizer ya phase-failure protection lagayein taake dobara na jale.",
      },
      {
        q: "Can low voltage burn a motor?",
        a: "Yes. At low voltage a motor pulls more current to do the same work, which overheats the winding. So a burnt motor is not always a high-voltage problem.",
      },
      {
        q: "Does a stabilizer protect against high voltage?",
        a: "Yes. A stabilizer brings high voltage back to 220V within its input range, and a unit with high-voltage cutoff disconnects the load if the voltage goes beyond that range.",
      },
      {
        q: "Will a stabilizer protect my machine from lightning?",
        a: "No. A stabilizer is not lightning or surge protection. For that you need a surge protection device and proper earthing.",
      },
      {
        q: "Why did many appliances burn at the same time?",
        a: "This often points to a broken or loose neutral, which can push one line far above normal voltage. Have an electrician check the neutral and report supply faults to your electricity company.",
      },
    ],
  },

  // ───────────────────────────────────────────── 3. 50 kVA FACTORY SIZING
  {
    id: "p-pain-003",
    slug: "stabilizer-for-50-kva-factory",
    title: "Which Stabilizer Do I Need for a 50 kVA Factory or 3-Phase Load? (30–100 kVA Sizing in Plain Steps)",
    category: "Buyer Guide",
    cover: "stripes-industrial",
    readTime: 7,
    excerpt:
      "Sizing a three-phase stabilizer for a factory is five steps: add up the load, convert to kVA, allow for motor starting, add margin, and check the real voltage range. Worked example inside.",
    metaTitle: "Stabilizer for a 50 kVA Factory: 3-Phase Sizing Steps",
    metaDescription:
      "How to size a three-phase stabilizer for a 30–100 kVA factory load in five plain steps, with a worked example and the specs to check on a 50 kVA unit.",
    keywords: [
      "50 kva stabilizer",
      "3 phase stabilizer for factory",
      "industrial stabilizer pakistan",
      "how to size 3 phase stabilizer",
      "factory voltage stabilizer",
      "kitne kva ka stabilizer chahiye factory",
      "30 kva 100 kva stabilizer",
    ],
    takeaways: [
      "Add up the running load in kW, convert to kVA (divide by about 0.8 for motor loads), and add a 25% margin.",
      "Allow for motor starting: a large motor started direct-on-line pulls several times its running current for a few seconds.",
      "Measure the lowest and highest voltage on each phase at your worst time of day. The stabilizer's input range must cover it.",
      "A 3-phase load needs a 3-phase stabilizer that corrects each phase on its own, with phase-failure protection.",
      "The Voltec SJW 50 kVA: per phase 150–260V in to 220V ±2.5%; 3-phase 260–450V in to 385V ±3%; phase failure, delay, V/A meter and bypass.",
    ],
    body: `
<p><strong>For a 50 kVA factory, choose a three-phase stabilizer rated at least 25% above your real running load in kVA, with an input range that covers the lowest and highest voltage on every phase at your site.</strong> Work it out in five steps: add up the load, convert kW to kVA, allow for motor starting, add margin, and check the voltage. Example: 32 kW of running motors ÷ 0.8 = 40 kVA, plus 25% = 50 kVA.</p>

<h2>Step 1: What is my real load?</h2>
<p>List every machine the stabilizer will feed and read the kW on each nameplate. Then ask: how many run at the same time? A workshop with ten machines rarely runs all ten at full load together. Add up the machines that really run together on a busy day. If you have a load sheet or an electricity bill showing maximum demand, use that.</p>

<h2>Step 2: How do I convert kW to kVA?</h2>
<p>Stabilizers are rated in kVA, machines usually in kW. For a typical factory with motors, divide kW by about 0.8. So 32 kW ÷ 0.8 = 40 kVA. If your nameplates already show kVA or amps, use those directly.</p>

<h2>Step 3: Do I need to allow for motor starting?</h2>
<p>Yes. A motor started direct-on-line can pull several times its running current for a few seconds. Compressors behave the same way. If your largest motor is big compared with the total load, or several motors start together, you need more room. Soft starters, star-delta starters and VFDs reduce this.</p>

<h2>Step 4: How much margin should I add?</h2>
<p>Add 25% to the running load. 40 kVA × 1.25 = 50 kVA. If your answer falls between two sizes, or you plan to add machines soon, go up a size. Do not oversize by a lot — a much bigger stabilizer costs more without helping.</p>

<h2>Step 5: What voltage range do I need?</h2>
<p>This is the step most buyers skip. Measure each phase at your worst time — often the evening peak, or the morning start in industrial areas. Write down the lowest and highest. The stabilizer's input range must cover both, on every phase, because in Pakistan the three phases are often unbalanced.</p>

<h2>What does a 50 kVA three-phase stabilizer look like?</h2>
<p>The <a href="/products/vt-ind-50k">Voltec SJW 50 kVA</a> is an imported three-phase servo stabilizer. Its data:</p>
<div class="table-scroll"><table>
<thead><tr><th>Spec</th><th>SJW 50 kVA</th></tr></thead>
<tbody>
<tr><td>Input, per phase</td><td>150–260V</td></tr>
<tr><td>Output, per phase</td><td>220V ±2.5%</td></tr>
<tr><td>Input, 3-phase</td><td>260–450V</td></tr>
<tr><td>Output, 3-phase</td><td>385V ±3%</td></tr>
<tr><td>Frequency</td><td>50–60 Hz</td></tr>
<tr><td>Protection</td><td>Over/under-voltage, phase failure, time delay</td></tr>
<tr><td>Display and control</td><td>Digital volt/amp meter, bypass switch</td></tr>
<tr><td>Warranty</td><td>1 year on the coil</td></tr>
</tbody></table></div>
<p>Phase-failure protection matters most: if one phase is lost, a three-phase motor can burn in minutes. The bypass switch keeps the factory running while the stabilizer is serviced.</p>

<h2>What about 30 kVA or 100 kVA?</h2>
<p>The same five steps apply. Under about 30 kVA on a single-phase supply, a single-phase servo is often enough — the <a href="/products/vt-svc-30k-60v">30 kVA single-phase servo works from 60V</a> for very weak lines (it is not three-phase). From 100 kVA up, Voltec supplies three-phase industrial units built to order with tender documentation: see <a href="/industrial">industrial stabilizers</a>.</p>

<h2>Servo or solid-state for a factory?</h2>
<p>For a whole three-phase factory feed, servo is still the practical choice. Solid-state SCR (up to 10 kVA) and IGBT (up to 20 kVA) suit single sensitive machines inside the factory, such as a CNC or laser. More in <a href="/blog/low-voltage-factory-servo-scr-igbt">servo vs SCR vs IGBT for factory low voltage</a>.</p>
${CTA(WA_FACTORY, "Send your load sheet or the nameplates of your main machines, plus your per-phase voltage readings.")}
`,
    faqs: [
      {
        q: "What size stabilizer do I need for a 50 kVA load?",
        a: "Take your real running load in kVA and add 25%, then check that the input range covers your site's lowest and highest voltage on every phase. If your 50 kVA figure is already the running load, you need the next size up.",
      },
      {
        q: "Factory ke liye kitne kVA ka stabilizer chahiye?",
        a: "Sab machines ka running load kW mein jama karein, 0.8 se divide karke kVA nikaalein, aur 25% margin add karein. Misal: 32 kW ÷ 0.8 = 40 kVA, +25% = 50 kVA.",
      },
      {
        q: "How do I convert kW to kVA for a stabilizer?",
        a: "For a typical motor load, divide kW by about 0.8. For example, 40 kW ÷ 0.8 = 50 kVA. If the nameplate shows kVA or amps, use that directly.",
      },
      {
        q: "What input range does the Voltec 50 kVA three-phase stabilizer have?",
        a: "The SJW 50 kVA takes 150–260V per phase and gives 220V ±2.5%, or 260–450V three-phase and gives 385V ±3%. It has over/under-voltage, phase-failure and time-delay protection, a digital V/A meter, a bypass switch and a 1-year coil warranty.",
      },
      {
        q: "Do I need phase-failure protection?",
        a: "On any three-phase motor load, yes. If one phase is lost, a three-phase motor overheats and can burn quickly. Phase-failure protection disconnects the load.",
      },
      {
        q: "Can I use a single-phase stabilizer for a three-phase factory?",
        a: "No. A three-phase load needs a three-phase stabilizer that corrects each phase. A single-phase unit, such as the 30 kVA 60V servo, suits single-phase supplies only.",
      },
    ],
  },

  // ───────────────────────────────────────────── 4. NEW EQUIPMENT
  {
    id: "p-pain-004",
    slug: "stabilizer-for-new-inverter-ac-machine",
    title: "Do I Need a Stabilizer for My New Inverter, AC or Machine? Protecting New Equipment From Day One",
    category: "Buyer Guide",
    cover: "stripes-home",
    readTime: 6,
    excerpt:
      "New equipment has built-in protection, but it is designed to switch off, not to keep working on a bad line. Here is how to tell if your new inverter, AC or machine needs a stabilizer, and which type.",
    metaTitle: "Stabilizer for a New Inverter, AC or Machine?",
    metaDescription:
      "Does your new solar inverter, inverter AC or industrial machine need a stabilizer? A simple check, which type fits each, and when you can skip it.",
    keywords: [
      "do i need stabilizer for new ac",
      "stabilizer for new inverter",
      "stabilizer for inverter ac pakistan",
      "new machine voltage protection",
      "naye ac ke liye stabilizer",
      "stabilizer for cnc machine",
      "protect new equipment voltage",
    ],
    takeaways: [
      "Measure your voltage first. If it stays inside the equipment's rated range all day, you may not need a stabilizer.",
      "Built-in protection switches equipment off when voltage goes bad. A stabilizer keeps it running and takes the stress instead.",
      "Inverter ACs and solar inverters: choose by how low your voltage falls. IGBT works from 90V, SCR from 95V, standard servo from 150V.",
      "Industrial machines: match single- or three-phase to your supply and size by the nameplate plus 25%.",
      "Install the stabilizer before the equipment is first switched on, so the warranty period is not spent on a bad line.",
    ],
    body: `
<p><strong>You need a stabilizer for new equipment if your voltage goes outside the range printed on its nameplate or manual at any time of day.</strong> Measure the lowest and highest voltage first; if they stay inside the rated range, you can skip it. If they do not, fit a stabilizer sized to the equipment before you switch it on for the first time, so it never runs on a bad line.</p>

<h2>Doesn't new equipment already have voltage protection?</h2>
<p>Most does. Inverter ACs, solar inverters and modern machines have under- and over-voltage protection. But that protection is designed to <strong>switch the equipment off</strong>, not keep it running. On a weak line that means an AC that stops every evening, an inverter that keeps dropping the grid, or a machine that stops mid-job. The stabilizer's job is different: it corrects the voltage so the equipment keeps working, and its own cutoff acts as a second line of defence.</p>

<h2>How do I check if I need one?</h2>
<ol>
<li><strong>Find the rated voltage range</strong> on the nameplate or in the manual.</li>
<li><strong>Measure your voltage</strong> at the worst times — evening peak and late night — for a few days. A plug-in meter or your solar inverter's display works.</li>
<li><strong>Compare.</strong> If your lowest or highest reading falls outside the rated range, or close to its edge, you need a stabilizer.</li>
</ol>

<h2>Which stabilizer for a new inverter AC?</h2>
<p>An inverter AC accepts a wider range than an old fixed-speed AC, but many areas still fall below it in summer evenings. Choose by how low your voltage goes. If it stays above 150V, a servo works. If it falls lower, solid-state is the better fit: <strong>SCR works from 95V</strong> and holds 220V ±5%; <strong>IGBT works from 90V</strong> and holds 220V ±2% with a pure sine output. Both react in milliseconds. More: <a href="/blog/solid-state-voltage-stabilizer">solid-state stabilizers explained</a>.</p>

<h2>Which stabilizer for a new solar inverter?</h2>
<p>Put the stabilizer on the inverter's AC (grid) input. Size it above the inverter's grid load plus charging — as a guide, a 10 kVA servo for a 6–8 kVA inverter, 15 kVA for a 10 kVA inverter. If your inverter is already tripping, read <a href="/blog/inverter-tripping-low-high-voltage">why inverters trip on low or high voltage</a>.</p>

<h2>Which stabilizer for a new industrial machine?</h2>
<ul>
<li><strong>Single-phase sensitive machines</strong> — CNC controllers, lasers, printing and medical equipment: IGBT (550VA to 20 kVA) or SCR (1 to 10 kVA). See <a href="/blog/stabilizer-for-laser-cnc-medical-equipment">stabilizers for laser, CNC and medical equipment</a>.</li>
<li><strong>Single-phase heavy loads on a weak line:</strong> the <a href="/products/vt-svc-30k-60v">30 kVA servo that works from 60V</a>.</li>
<li><strong>Three-phase machines:</strong> a three-phase servo stabilizer with phase-failure protection. See <a href="/industrial">industrial stabilizers</a> and the <a href="/blog/stabilizer-for-50-kva-factory">50 kVA sizing steps</a>.</li>
</ul>
<p>For any machine, size from the nameplate kW or kVA, add 25%, and allow for motor starting surge.</p>

<h2>When can I skip the stabilizer?</h2>
<p>If your measured voltage stays well inside the equipment's rated range all day, a stabilizer adds cost without adding much. If your problem is short outages rather than bad voltage, you need a UPS or battery, not a stabilizer. And no stabilizer replaces proper earthing and correctly sized cables — have those checked when you install any new equipment.</p>

<h2>Does using a stabilizer affect my warranty?</h2>
<p>A correctly sized stabilizer does not harm your equipment. Read your equipment's warranty terms: some exclude damage from abnormal voltage, so steady voltage from day one helps you avoid a claim being refused.</p>
${CTA(WA_NEW, "Send the model or nameplate of your new equipment and your voltage readings.")}
`,
    faqs: [
      {
        q: "Do I need a stabilizer for a new inverter AC?",
        a: "Only if your voltage goes outside the AC's rated range. Measure at the evening peak. If it falls below the range, fit a stabilizer: servo if voltage stays above 150V, SCR (from 95V) or IGBT (from 90V) for lower voltage.",
      },
      {
        q: "Naye AC ke liye stabilizer zaroori hai?",
        a: "Agar aap ke area mein voltage AC ki rated range se neeche ya upar jaata hai to haan. Pehle shaam ke waqt voltage check karein, phir us hisaab se stabilizer lein.",
      },
      {
        q: "My new equipment has built-in protection. Why do I need a stabilizer?",
        a: "Built-in protection switches the equipment off when voltage goes bad. A stabilizer corrects the voltage so the equipment keeps running, and its own cutoff adds a second layer of protection.",
      },
      {
        q: "Which stabilizer is right for a new CNC or laser machine?",
        a: "A solid-state stabilizer for single-phase sensitive machines: IGBT (220V ±2%, 0 ms rated, from 90V) or SCR (220V ±5%, about 20 ms, from 95V). Three-phase machines need a three-phase stabilizer with phase-failure protection.",
      },
      {
        q: "Where do I connect a stabilizer for a solar inverter?",
        a: "On the inverter's AC grid input, between the grid and the inverter. As a guide, use a 10 kVA servo for a 6–8 kVA inverter and 15 kVA for a 10 kVA inverter.",
      },
      {
        q: "When is a stabilizer not needed?",
        a: "When your measured voltage stays well inside the equipment's rated range all day. If your problem is power cuts, you need a UPS or battery instead.",
      },
    ],
  },

  // ───────────────────────────────────────────── 5. LOW VOLTAGE FACTORY
  {
    id: "p-pain-005",
    slug: "low-voltage-factory-servo-scr-igbt",
    title: "Low Voltage in My Factory: Servo, SCR or IGBT Stabilizer — Which Should I Choose?",
    category: "Buyer Guide",
    cover: "stripes-industrial",
    readTime: 7,
    excerpt:
      "End-of-line factory areas in Punjab and KPK see voltage fall far below 220V. Here is how servo, SCR and IGBT stabilizers compare, and which fits a whole factory versus one sensitive machine.",
    metaTitle: "Low Voltage in Factory: Servo vs SCR vs IGBT",
    metaDescription:
      "Low voltage at the end of the line in Punjab or KPK? How servo, SCR and IGBT stabilizers compare on input range, speed and size, and which to choose.",
    keywords: [
      "low voltage factory pakistan",
      "low voltage solution factory",
      "servo vs scr vs igbt stabilizer",
      "stabilizer for low voltage area",
      "factory mein voltage kam",
      "60v stabilizer",
      "industrial low voltage stabilizer punjab",
    ],
    takeaways: [
      "For a whole three-phase factory on low voltage, a three-phase servo stabilizer is still the practical choice.",
      "For very weak single-phase lines, the Voltec 30 kVA servo works from 60V and holds 220V ±3%.",
      "For single sensitive machines, solid-state is faster: IGBT works from 90V (±2%, 0 ms rated); SCR from 95V (±5%, about 20 ms).",
      "Check the cause first: undersized cables, a loose joint or an overloaded transformer can be the real problem.",
      "If voltage falls below what any stabilizer can work from, the fix is on the supply side — a complaint about the transformer or line.",
    ],
    body: `
<p><strong>For a whole factory on a low-voltage three-phase line, choose a three-phase servo stabilizer with an input range that covers your lowest reading on every phase.</strong> For one sensitive single-phase machine, choose solid-state: IGBT if voltage falls toward 90V or the machine needs clean power, SCR if voltage stays above 95V and ±5% is enough. Before buying, check your cables and joints — sometimes the voltage drop is inside the factory.</p>

<h2>Why is voltage so low at the end of the line?</h2>
<p>Factories in industrial areas of Punjab and KPK are often far from the transformer, at the end of a long line shared with many other loads. The voltage falls along the line, and it falls further when everyone runs machines at the same time. The result: motors run hot, machines stall, controllers reset and lights dim when a large motor starts.</p>

<h2>Is the low voltage coming from outside or inside the factory?</h2>
<p>Check before you buy. Measure voltage at the incoming meter and again at the machine. If the meter reads fine but the machine reads low, the drop is inside: cables too thin for the load, a loose or burnt joint, or an overloaded distribution board. An electrician can fix that, and a stabilizer will not. If the voltage is already low at the meter, the problem is the supply — that is where a stabilizer helps.</p>

<h2>Servo vs SCR vs IGBT: how do they compare?</h2>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Servo (SVC)</th><th>SCR (thyristor)</th><th>IGBT (inverter)</th></tr></thead>
<tbody>
<tr><td>Output</td><td>220V ±1%</td><td>220V ±5%, stepped</td><td>220V ±2%, pure sine</td></tr>
<tr><td>Input range</td><td>Standard 150–270V; 30 kVA model from 60V</td><td>95–250V</td><td>90–310V</td></tr>
<tr><td>Speed</td><td>About 25–30 V per second</td><td>About 20 ms</td><td>0 ms rated</td></tr>
<tr><td>Sizes Voltec supplies</td><td>Single-phase up to 30 kVA; three-phase industrial</td><td>1–10 kVA</td><td>550VA–20 kVA</td></tr>
<tr><td>Moving parts</td><td>Motor and carbon brush</td><td>None in the correction</td><td>None in the correction</td></tr>
</tbody></table></div>

<h2>Which should I choose for the whole factory?</h2>
<p>Servo. Above 20 kVA, and on any three-phase supply, a servo stabilizer is the practical choice today. For three-phase, the <a href="/products/vt-ind-50k">Voltec SJW 50 kVA</a> takes 150–260V per phase (260–450V three-phase) and has phase-failure protection, which matters on weak lines where a phase can drop out. Larger units are built to order: see <a href="/industrial">industrial stabilizers</a> and the <a href="/blog/stabilizer-for-50-kva-factory">50 kVA sizing steps</a>.</p>
<p>If your supply is single-phase and very weak, the <a href="/products/vt-svc-30k-60v">30 kVA servo</a> starts working at 60V and holds 220V ±3% up to 250V. It is single-phase, not three-phase.</p>

<h2>Which should I choose for one sensitive machine?</h2>
<p>Solid-state. A servo corrects at about 25–30 volts per second, so a sudden drop from 220V to 160V — for example when a large motor starts nearby — takes about two seconds to correct. A CNC controller or laser can reset in that time. SCR reacts in about 20 ms; IGBT is rated 0 ms and works from 90V. Choose IGBT for the lowest voltage and cleanest power; choose SCR when voltage stays above 95V and ±5% is enough. Compare: <a href="/blog/scr-vs-servo-stabilizer">SCR vs servo</a>, <a href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</a>.</p>

<h2>Can I mix them?</h2>
<p>Yes, and many factories should. A servo on the main feed for motors and general load, plus a solid-state unit in front of each sensitive machine, gives each load what it needs.</p>

<h2>When will no stabilizer fix low voltage?</h2>
<p>If voltage falls below the input range of every option, or the supply simply cannot carry your load, a stabilizer will cut off to protect itself and your machines. Then the fix is on the supply side: a complaint to your electricity company about the transformer or line, or your own transformer for larger loads. Also remember a stabilizer draws more current from the line when it boosts low voltage, so the incoming cable and breaker must be sized for that.</p>
${CTA(WA_LOWV, "Send your lowest voltage reading on each phase, your load, and photos of your main machines.")}
`,
    faqs: [
      {
        q: "Which stabilizer is right for low voltage in a factory?",
        a: "For the whole three-phase factory, a three-phase servo stabilizer. For one sensitive single-phase machine, a solid-state unit: IGBT from 90V (±2%, 0 ms rated) or SCR from 95V (±5%, about 20 ms).",
      },
      {
        q: "Factory mein voltage bohat kam hai, kaun sa stabilizer lagaoon?",
        a: "Poori factory ke liye 3-phase servo stabilizer. Agar line single-phase aur bohat weak hai to 30 kVA servo jo 60V se kaam karta hai. CNC ya laser jaisi sensitive machine ke liye IGBT ya SCR.",
      },
      {
        q: "Servo vs SCR vs IGBT: what is the difference?",
        a: "Servo uses a motor and carbon brush: 220V ±1%, about 25–30 V per second. SCR uses silicon switches: 220V ±5% stepped, about 20 ms, from 95V. IGBT builds the voltage electronically: 220V ±2% pure sine, 0 ms rated, from 90V.",
      },
      {
        q: "Is there a stabilizer that works at 60V?",
        a: "Yes. The Voltec 30 kVA single-phase servo works from 60V to 250V input and holds 220V ±3%. It is single-phase, not three-phase.",
      },
      {
        q: "Can a stabilizer fix low voltage caused by thin cables?",
        a: "No. If the voltage is fine at the meter but low at the machine, the drop is inside the factory — thin cables, loose joints or an overloaded board. An electrician must fix that.",
      },
      {
        q: "What if my voltage is too low for any stabilizer?",
        a: "Then the fix is on the supply side: complain to your electricity company about the transformer or line, or consider your own transformer for a large load.",
      },
    ],
  },
];

const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

if (process.argv.includes("--dry")) {
  for (const p of posts) {
    console.log(`\n── /blog/${p.slug}  (${p.id})`);
    console.log(`   ${p.title}`);
    console.log(
      `   ${p.readTime} min · ${p.keywords.length} kw · ${p.takeaways.length} takeaways · ` +
        `${p.faqs.length} FAQs · ${words(p.body)} words`,
    );
    console.log(`   metaTitle [${p.metaTitle.length}] ${p.metaTitle}`);
    console.log(`   metaDesc  [${p.metaDescription.length}]`);
  }
  console.log("\nDRY RUN — nothing written.");
  process.exit(0);
}

// Default and ONLY write path: upsert as drafts. Publishing is a separate,
// reviewed step.
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

// --publish (Raheel's "push + publish", 2026-10-22) makes them live; default stays drafts.
const PUBLISH = process.argv.includes("--publish");
const rows = posts.map((p) => ({ ...p, ...AUTHOR, date: DATE, published: PUBLISH }));
const { error } = await sb.from("posts").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("UPSERT ERROR:", error);
  process.exit(1);
}
console.log(`${PUBLISH ? "PUBLISHED" : "Saved as drafts"}: ${rows.map((r) => "/blog/" + r.slug).join(", ")}`);
