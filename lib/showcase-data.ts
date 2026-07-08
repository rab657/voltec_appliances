import type { Product, CategoryId, Faq } from "./types";
import { PRODUCTS } from "./products";

// Showcase content authored at the product-FAMILY level: every product in a
// family shares its tech story, use cases and benefits, while the spec table,
// stats and render slots stay per-product. Callout geometry is baked into the
// template by `pos`; families only supply { pos, icon, title, desc }.

export type CalloutPos = "tl" | "bl" | "tr" | "br";

export interface Callout {
  pos: CalloutPos;
  icon: string;
  title: string;
  desc: string;
}

export interface ShowcaseContent {
  tagline: string;
  stats: [string, string, string][];
  hero?: {
    eyebrow: string;
    title: string;
    intro: string;
    slot: string;
    callouts: Callout[];
  };
  monitor?: { rows: [string, string, string, boolean?][] };
  tech?: {
    eyebrow: string;
    title: string;
    intro: string;
    mode: "flow" | "pillars";
    flow?: { tag: string; wave: "messy" | "flat" | "sine"; title: string; desc: string }[];
    integrate?: [string, string][];
    pillars?: { icon: string; title: string; desc: string }[];
  };
  cutaway?: {
    eyebrow: string;
    title: string;
    intro: string;
    slot: string;
    img?: string;
    callouts: Callout[];
    inset?: { title: string; desc: string; slot: string; img?: string };
  };
  useCases?: {
    eyebrow: string;
    title: string;
    items: { icon: string; title: string; desc: string }[];
  };
  benefits?: {
    eyebrow: string;
    title: string;
    items: { n: string; title: string; desc: string; img?: string }[];
    protections?: string[];
  };
  /** Render the benefits ("Key advantages") block high up, right after the hero,
   *  instead of in its default lower position. */
  benefitsEarly?: boolean;
  // Local market context (e.g. "Built for Pakistan's grid")
  local?: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { icon: string; title: string; desc: string }[];
  };
  // Head-to-head: this tech vs the alternatives (servo / relay)
  comparison?: {
    eyebrow: string;
    title: string;
    intro: string;
    cols: [string, string, string]; // e.g. ["Inverter (IGBT)", "Servo (SVC)", "Relay (AVR)"]
    rows: { label: string; vals: [string, string, string] }[];
    note?: string;
  };
  // Buyer questions — rendered on-page AND emitted as FAQPage schema (AEO).
  faqs?: Faq[];
}

export function familyOf(p: Product): string {
  if (p.categoryId === "stabilizers") return "stab-" + (p.tech || "svc").toLowerCase();
  if (p.categoryId === "industrial") return "industrial";
  if (p.categoryId === "cells") return "cells";
  if (p.categoryId === "parts") {
    if (p.tech === "BMS") return "bms";
    if (p.tech === "Relay") return "relay";
    return "led"; // LED displays — no dedicated showcase, PDP only
  }
  return "generic";
}

export const SHOWCASE: Record<string, ShowcaseContent> = {
  // ===================================================================== IGBT
  "stab-igbt": {
    tagline: "The most accurate voltage protection made — for laser machines, medical and other sensitive equipment. The latest inverter (IGBT) technology, only at Voltec.",
    stats: [["0", "ms", "Response time"], ["±2", "%", "Output accuracy"], ["100", "%", "Pure sine"], ["90–310", "V", "Input range"]],
    hero: {
      eyebrow: "Premium · latest technology",
      title: "Built for your most <em>sensitive machines</em>.",
      intro: "If you run a laser cutter, a CNC, or medical and lab equipment worth lakhs, you cannot trust it to a cheap stabilizer. The inverter (IGBT) holds voltage to ±2% with instant 0 ms correction and a clean pure sine output — the most accurate protection on the market. The latest technology, and in Pakistan you get it only at Voltec.",
      slot: "Drop wall-mounted product photo",
      callouts: [
        { pos: "tl", icon: "display", title: "See everything live", desc: "LED screen shows voltage, load and temperature." },
        { pos: "bl", icon: "chip", title: "No moving parts", desc: "Fixes voltage with no motor and no brushes to wear out." },
        { pos: "tr", icon: "pulse", title: "±2% accuracy", desc: "Holds voltage tight enough for precision machines." },
        { pos: "br", icon: "shield", title: "Pure sine, silent", desc: "Clean power with no spark — safe for sensitive gear." },
      ],
    },
    monitor: { rows: [["Output Voltage", "220", "V", true], ["Input Voltage", "090", "V", false], ["Load", "072", "%", false]] },
    cutaway: {
      eyebrow: "From mechanical to digital", title: "A stabilizer <em>without the iron</em>.",
      intro: "Our fully electronic design drops the heavy transformer and switching contacts of an old unit. It runs more efficiently, lasts longer and has nothing to wear out.",
      slot: "Drop exploded / cutaway render",
      img: "assets/igbt/cutaway.jpg",
      callouts: [
        { pos: "tl", icon: "shield", title: "Top cover", desc: "Powder-coated steel with EMI shielding." },
        { pos: "bl", icon: "fan", title: "DC cooling fans", desc: "Two fans that turn on by temperature." },
        { pos: "tr", icon: "chip", title: "Inverter board", desc: "High-frequency IGBT switching stage." },
        { pos: "br", icon: "bolt", title: "Control PCB", desc: "DSP that keeps the voltage steady in real time." },
      ],
      inset: { title: "Inside the power stage", desc: "High-frequency IGBT modules sit on a finned heatsink next to the output coils. They switch tens of thousands of times a second to rebuild a clean waveform. An old stabilizer would instead drag a servo motor across a winding.", slot: "Drop internal board macro", img: "assets/igbt/power-stage.jpg" },
    },
    useCases: {
      eyebrow: "Where it belongs", title: "Built for equipment you <em>cannot afford to lose</em>.",
      items: [
        { icon: "bolt", title: "Laser & CNC machines", desc: "Laser cutters, engravers and CNC need exact voltage. ±2% output keeps cuts clean and protects the tube, motors and drivers." },
        { icon: "pulse", title: "Medical & imaging", desc: "MRI, CT, X-ray and lab analysers cannot take a sag. Silent, spark-free, pure sine power keeps diagnostic machines safe." },
        { icon: "shield", title: "Defense & critical systems", desc: "Radar, comms and control rooms demand uninterrupted, perfectly clean power. The inverter holds it within ±1% with zero spark." },
        { icon: "server", title: "Data centers & broadcast", desc: "Pure sine output keeps servers, UPS, transmitters and studio gear running error-free through every grid swing." },
        { icon: "chip", title: "Labs & precision instruments", desc: "Test benches, semiconductor tools and metrology gear get clean, steady voltage with no spikes or distortion." },
        { icon: "home", title: "High-end automation", desc: "Robotics, PLC lines and imaging stations stay calibrated on rock-steady, instantly-corrected 220 V." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "Why electronic <em>wins</em>.",
      items: [
        { n: "01", title: "30% lighter, stronger", desc: "High-frequency design drops the heavy iron transformer.", img: "assets/igbt/chip.jpg" },
        { n: "02", title: "Smart filtering", desc: "THD held under 3%, so you get a clean pure sine.", img: "assets/igbt/vp-medical.jpg" },
        { n: "03", title: "Long lifespan", desc: "Fully contactless IGBT design with nothing to wear out.", img: "assets/igbt/vp-precision.jpg" },
        { n: "04", title: "Silent operation", desc: "No sparks and no relay clicking, so it suits bedrooms and clinics.", img: "assets/igbt/vp-silent.jpg" },
        { n: "05", title: "0 ms instant response", desc: "Fixes the voltage the moment the mains goes wrong.", img: "assets/igbt/vp-speed.jpg" },
        { n: "06", title: "Ultra-wide input", desc: "Holds a steady 220 V from 100–300 V input.", img: "assets/igbt/vp-grid.jpg" },
      ],
      protections: ["over-current", "over-volt", "under-volt", "over-temp", "short"],
    },
    local: {
      eyebrow: "Built for Pakistan",
      title: "Made for <em>our grid</em>, not a lab bench.",
      intro:
        "WAPDA, LESCO, MEPCO, K-Electric — on a summer peak-hour evening the voltage at your meter can sag below 150 V and then surge past 250 V within minutes. That is what burns fridge compressors, trips inverter ACs and kills LED drivers. The inverter stabilizer is engineered for exactly this supply.",
      items: [
        { icon: "bolt", title: "Holds 220 V through the worst sags", desc: "A 100–300 V input window keeps your output rock-steady even when the feeder collapses to 150 V on a load-shedding evening." },
        { icon: "home", title: "Made for inverter ACs", desc: "Pakistan runs on inverter ACs now — their compressors and PCBs need clean pure sine, not the stepped jumps a relay stabilizer gives." },
        { icon: "pulse", title: "Lighter on the bijli bill", desc: "Over 98% efficient and runs cool — no servo motor or relay constantly burning power. Stable voltage also keeps your AC and fridge running at their rated efficiency." },
        { icon: "shield", title: "No brush to service in our dust & heat", desc: "Sealed and fully electronic — nothing to wear out in 50 °C summers, unlike servo units that need carbon-brush service." },
      ],
    },
    comparison: {
      eyebrow: "IGBT vs SVC vs AVR",
      title: "Cheaper to run than a <em>local stabilizer</em>.",
      intro:
        "Most stabilizers in Pakistani homes are the cheap relay type — AVR, the “local” stabilizer your electrician fits by default. It keeps your appliances alive, but it wastes more power and wears out faster. Here’s the plain difference, side by side.",
      cols: ["Inverter (IGBT)", "Servo (SVC)", "Local relay (AVR)"],
      rows: [
        { label: "Energy efficiency", vals: ["Over 98% — wastes the least power", "Around 96%", "~ 95% — the local type wastes the most"] },
        { label: "Effect on your bill", vals: ["Lowest — runs cool, like an inverter AC", "A little more", "Highest waste of the three"] },
        { label: "How steady the voltage is", vals: ["±1% — rock-steady, clean pure sine", "±1% — steady and smooth", "±5–10% — jumps up and down in steps"] },
        { label: "How fast it corrects", vals: ["Instant — under 20 ms", "Slow — a 1–3 second motor sweep", "Stepped, with a noticeable delay"] },
        { label: "Moving parts", vals: ["None — fully electronic", "Motor + carbon brush that wear out", "Relay contacts that burn out"] },
        { label: "Maintenance", vals: ["None, ever", "Brush & motor service needed", "Contacts wear and fail over time"] },
        { label: "How long it lasts", vals: ["10+ years, sealed for our heat & dust", "Years, until the brush wears", "Wears out the fastest of the three"] },
        { label: "Noise", vals: ["Silent — fine for a bedroom", "A faint motor hum", "Clicks every time the voltage changes"] },
        { label: "Cost to buy", vals: ["Costs more up front — pays you back on the bill", "Mid-range", "Cheapest to buy"] },
        { label: "Best for", vals: ["Inverter ACs, electronics, the whole modern home", "Homes, shops and motor loads", "One appliance on a tight budget"] },
      ],
      note: "“Local” stabilizers are almost always the relay type (AVR). We build those too — but the inverter (IGBT) is the one that costs the least to run.",
    },
    faqs: [
      { q: "Does an inverter stabilizer really lower my electricity bill?", a: "Yes, a little. An inverter (IGBT) stabilizer is over 96% efficient and has no servo motor running all the time, so it wastes less power than an old servo or relay stabilizer. It also holds a steady 220 V, so your AC and fridge run at their rated efficiency instead of drawing extra current on low voltage." },
      { q: "What size inverter stabilizer do I need for my home?", a: "Add up your load. A TV, router and lights need about 550VA–2kVA. One inverter AC plus a fridge needs about 5kVA. A full home with two ACs and a geyser needs 10–15kVA. A large home or shop needs 20kVA. If you are unsure, message us your appliance list and we will size it for you." },
      { q: "Is an IGBT inverter stabilizer better than a servo (SVC) stabilizer?", a: "For homes and sensitive electronics, yes. The inverter type corrects voltage instantly (0 ms) with no moving parts, runs silently, and needs no maintenance. A servo (SVC) stabilizer uses a motor and carbon brush that wear out over time. Servo is still a good choice for some heavy motor loads." },
      { q: "Will it protect my inverter AC and refrigerator?", a: "Yes. It gives a clean, pure sine output (THD under 3%) and holds 220 V across a wide 90–310 V input. That protects inverter AC compressors, fridge compressors, LED TVs and other sensitive appliances from low voltage and surges." },
      { q: "Do you deliver across Pakistan, and do you export?", a: "Yes. We ship Pakistan-wide from our Lahore facility, and we supply bulk and export orders to the UAE and the region. Message us on WhatsApp for stock, lead time and freight." },
    ],
  },

  // ====================================================================== SVC
  "stab-svc": {
    tagline: "Smooth, steady voltage correction. A real servo motor and autotransformer, not stepped relays.",
    stats: [["±1", "%", "Output accuracy"], ["140–280", "V", "Input range"], ["&gt;96", "%", "Efficiency"], ["25", "V/s", "Correction speed"]],
    hero: {
      eyebrow: "Proven & popular", title: "The servo stabilizer <em>built to last</em>.",
      intro: "Heavy copper windings, big contacts and a powder-coated steel cabinet — sized to keep your ACs, fridge and electronics safe through Pakistan's sags and surges.",
      slot: "Drop product photo",
      callouts: [
        { pos: "tl", icon: "display", title: "Voltage & load display", desc: "Shows live input, output and load." },
        { pos: "bl", icon: "fan", title: "Servo motor drive", desc: "Motor moves a slider for smooth correction." },
        { pos: "tr", icon: "terminal", title: "Copper windings", desc: "Smooth, stepless autotransformer." },
        { pos: "br", icon: "shield", title: "Steel cabinet", desc: "Powder-coated and heat-protected." },
      ],
    },
    tech: {
      eyebrow: "How it works", title: "Smooth, <em>continuous</em> correction.",
      intro: "A servo motor moves a carbon-brush slider across a stepless autotransformer. It fixes voltage in a smooth sweep, not the harsh jumps of a cheap relay unit.",
      mode: "pillars",
      pillars: [
        { icon: "fan", title: "Motorised slider", desc: "A servo motor moves a carbon brush along the winding to hold exactly 220 V." },
        { icon: "chip", title: "Continuously variable", desc: "No fixed taps, so correction is smooth and your AC compressor never gets a jolt." },
        { icon: "terminal", title: "Real copper autotransformer", desc: "Heavy copper windings and big contacts carry the full load without sagging." },
        { icon: "shield", title: "Thermal-protected control", desc: "A controller proven in Pakistani homes and shops for over 15 years." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "Sized for homes <em>and shops</em>.",
      items: [
        { icon: "home", title: "One or two AC homes", desc: "5–10 kVA covers one inverter AC, or two ACs plus the rest of the house." },
        { icon: "bolt", title: "Whole-home protection", desc: "15 kVA holds geyser, motors, ACs and electronics on one clean supply." },
        { icon: "server", title: "Shops & small offices", desc: "Keeps tills, lights and fridges steady through evening voltage drops." },
        { icon: "pulse", title: "Motor-driven appliances", desc: "Smooth correction keeps compressors, pumps and washing machines safe." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "The servo done <em>right</em>.",
      items: [
        { n: "01", title: "Smooth correction", desc: "A smooth sweep, not stepped jumps, so it is easy on compressors.", img: "assets/svc/vp-smooth.jpg" },
        { n: "02", title: "±1% output accuracy", desc: "Holds voltage tight across the full input range.", img: "assets/svc/vp-accuracy.jpg" },
        { n: "03", title: "Wide 140–280 V input", desc: "Keeps working when evening voltage drops far.", img: "assets/svc/vp-wideinput.jpg" },
        { n: "04", title: "Voltage + load display", desc: "Dual LED / LCD screen shows live status.", img: "assets/svc/vp-display.jpg" },
        { n: "05", title: "Copper, not aluminium", desc: "Real copper windings and big contacts for the full load.", img: "assets/svc/vp-copper.jpg" },
        { n: "06", title: "Service you can reach", desc: "Backed by our own service network — the strongest in the market.", img: "assets/svc/vp-service.jpg" },
      ],
      protections: ["over-volt", "under-volt", "over-temp", "short"],
    },
    faqs: [
      { q: "What size servo (SVC) stabilizer do I need for my home?", a: "Add up your load. One inverter AC plus a fridge and lights is about 5 kVA. Two ACs and the rest of the house is about 10 kVA. A full home with a geyser, motors and two–three ACs needs 15 kVA. If you are not sure, send us your appliance list on WhatsApp and we will size it for you." },
      { q: "Is a servo (SVC) stabilizer better than a relay (AVR) one?", a: "For whole-home use, yes. A servo stabilizer corrects voltage smoothly and holds a tight ±1%, while a relay AVR jumps in steps of ±5–10%. The smooth correction is much easier on AC compressors, fridges and motors, and it covers a wider input range." },
      { q: "Should I buy a servo (SVC) or an inverter (IGBT) stabilizer?", a: "For most homes and shops, the servo (SVC) is the proven, value choice and handles motor loads well. Choose the inverter (IGBT) if you run sensitive or precision equipment — laser, CNC, medical or lab gear — that needs instant 0 ms correction and a perfectly clean pure sine, or if you want silent, maintenance-free operation." },
      { q: "Does a servo stabilizer need maintenance?", a: "A little. It uses a motor and a carbon brush that move a slider across the winding, so the brush wears slowly over years and can be replaced. We service what we sell — our network is the strongest in the market." },
      { q: "What input voltage range does it work in?", a: "The Voltec SVC servo range holds a steady 220 V output across a wide 140–280 V input, so it keeps working through Pakistan's evening voltage drops and surges." },
      { q: "Do you deliver across Pakistan, and do you export?", a: "Yes. We ship Pakistan-wide and supply bulk and export orders to the UAE and the region. Message us on WhatsApp for stock, lead time and freight." },
    ],
  },

  // ====================================================================== SCR
  "stab-scr": {
    benefitsEarly: true,
    tagline: "Solid-state thyristor switching — faster than a servo, with no motor and no brushes to wear out. The cost-effective way to protect tier-1 sensitive equipment like laser machines.",
    stats: [["95–250", "V", "Input range"], ["±5", "%", "Output accuracy"], ["&ge;95", "%", "Efficiency"], ["20", "ms", "Response"]],
    hero: {
      eyebrow: "Solid-state · no moving parts", title: "Solid-state speed, <em>nothing to wear out</em>.",
      intro: "SCR (thyristor) stabilizers switch correction electronically with silicon — faster than a servo, and with no carbon brush or servo motor to wear out. They protect tier-1 sensitive equipment — laser machines, aesthetic and dental devices, ultrasound — with solid-state speed, at a lower cost than the inverter (IGBT).",
      slot: "Drop product photo",
      callouts: [
        { pos: "tl", icon: "display", title: "LED voltage meter", desc: "Live input, output and load at a glance." },
        { pos: "tr", icon: "chip", title: "Thyristor board", desc: "Solid-state switching — no motor, no brushes." },
        { pos: "bl", icon: "bolt", title: "Fast correction", desc: "Switches electronically in about 20 ms." },
        { pos: "br", icon: "shield", title: "Six-layer protection", desc: "Over/under-volt, overload, over-temp, short circuit." },
      ],
    },
    tech: {
      eyebrow: "How it works", title: "Switched by <em>silicon, not a motor</em>.",
      intro: "An SCR (thyristor) stabilizer reads the incoming voltage and switches transformer taps electronically with silicon-controlled rectifiers. There is no motor to move and no brush to wear — so it reacts faster than a servo and lasts longer.",
      mode: "pillars",
      pillars: [
        { icon: "chip", title: "Solid-state switching", desc: "Thyristors switch the correction electronically — silent and spark-free." },
        { icon: "bolt", title: "Faster than a servo", desc: "No motor to physically move, so it reacts in about 20 ms." },
        { icon: "shield", title: "Nothing to wear out", desc: "No carbon brush, no servo motor — far less to service or fail." },
        { icon: "terminal", title: "Stepped correction", desc: "Holds 220V ±5% across a wide 95–250V input — enough to protect tier-1 sensitive equipment." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "Protects <em>tier-1 sensitive equipment</em>.",
      items: [
        { icon: "bolt", title: "Laser machines", desc: "Aesthetic, dental and hair-removal lasers — solid-state speed protects the laser, with no motor lag." },
        { icon: "pulse", title: "Ultrasound & diagnostics", desc: "Clean, fast correction for ultrasound and clinical diagnostic units." },
        { icon: "chip", title: "Aesthetic & RF devices", desc: "RF, HIFU and body-contouring platforms that need steady, spark-free power." },
        { icon: "server", title: "Sensitive electronics", desc: "Servers, AV and electronics that want fast correction without a motor to wear out." },
        { icon: "home", title: "Home & shop, too", desc: "And everyday home and shop loads where solid-state speed and longevity matter." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "Solid-state, <em>without the premium</em>.",
      items: [
        { n: "01", title: "No moving parts", desc: "No servo motor and no carbon brush — nothing mechanical to wear out.", img: "assets/scr/scr-solidstate.jpg" },
        { n: "02", title: "Faster than servo", desc: "Switches electronically in about 20 ms, not a slow motor sweep.", img: "assets/scr/scr-fast.jpg" },
        { n: "03", title: "Silent & spark-free", desc: "100% spark-free and silent — fine for a bedroom or a clinic.", img: "assets/scr/scr-silent.jpg" },
        { n: "04", title: "Wide input range", desc: "Holds 220V ±5% from a wide 95–250V supply.", img: "assets/scr/scr-wideinput.jpg" },
        { n: "05", title: "Long lifespan", desc: "Solid-state design with no mechanical wear lasts far longer than a servo.", img: "assets/scr/scr-lifespan.jpg" },
        { n: "06", title: "Six-layer protection", desc: "Over-voltage, under-voltage, overload, over-temp and short-circuit.", img: "assets/scr/scr-safe.jpg" },
      ],
      protections: ["over-volt", "under-volt", "over-current", "over-temp", "short", "delay"],
    },
    faqs: [
      { q: "What is an SCR (thyristor) stabilizer?", a: "It corrects voltage with solid-state silicon switches (thyristors) instead of a motor. That makes it faster than a servo stabilizer with no carbon brush or motor to wear out. It corrects in steps to ±5% — the cost-effective way to protect tier-1 sensitive equipment like laser machines, where that is enough." },
      { q: "SCR or servo (SVC) — which is better for a laser?", a: "An SCR. It switches electronically, so it reacts faster than a servo and has no motor or brush to wear out — important when you're protecting a sensitive machine like a laser. A servo's motor is slower and the protection itself wears over time." },
      { q: "SCR or inverter (IGBT) — what's the difference?", a: "Both are solid-state with no moving parts and both protect sensitive equipment. The SCR corrects in steps to ±5% — great value for tier-1 sensitive machines like lasers. The inverter (IGBT) corrects steplessly with a pure-sine output and ±1% accuracy — the choice for your most sensitive, highest-precision equipment." },
      { q: "Is it silent?", a: "Yes — solid-state switching is 100% spark-free and silent, with no relay clicking or motor hum." },
      { q: "What size do I need?", a: "Match it to your load: about 1–3 kVA for a single appliance or AC, 5–10 kVA for a home or shop. Send us your appliance list on WhatsApp and we will size it." },
    ],
  },

  // ====================================================================== AVR
  "stab-avr": {
    tagline: "The Voltec A-series — pure-copper relay stabilizers for fridges, deep freezers and air-conditioners, working from as low as 75V.",
    stats: [["75", "V", "Works from"], ["2.5–12", "kW", "Capacity"], ["220", "V", "Output"], ["100", "%", "Pure copper"]],
    hero: {
      eyebrow: "At a glance", title: "Honest protection, <em>plug & play</em>.",
      intro: "A small relay AVR with a clear LED voltage meter. Hang it on the wall, plug it in, and it protects your appliance right away. No installation needed.",
      slot: "Drop product photo",
      callouts: [
        { pos: "tl", icon: "display", title: "LED voltage meter", desc: "Shows live mains voltage." },
        { pos: "bl", icon: "chip", title: "Relay board", desc: "Fast multi-tap relay switching." },
        { pos: "tr", icon: "terminal", title: "Tap windings", desc: "Multi-tap transformer that fixes the voltage." },
        { pos: "br", icon: "shield", title: "Steel housing", desc: "Mount it on a wall or a desk." },
      ],
    },
    tech: {
      eyebrow: "How it works", title: "Fast <em>relay tap-switching</em>.",
      intro: "An AVR reads the incoming voltage and switches transformer taps to bring it back near 220 V. It is reliable, low-cost protection for one appliance.",
      mode: "pillars",
      pillars: [
        { icon: "bolt", title: "Sub-second response", desc: "Spots an out-of-range voltage and fixes it in under a second." },
        { icon: "chip", title: "Multi-tap switching", desc: "Relays pick the right transformer tap for the current input." },
        { icon: "shield", title: "Built-in cutoff", desc: "Over / under-voltage cutoff with delayed restart keeps compressors safe." },
        { icon: "home", title: "Plug & play", desc: "Small and wall-mountable, with no electrician and no installation." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "One appliance, <em>well protected</em>.",
      items: [
        { icon: "server", title: "TV, router & PC", desc: "1 kVA keeps one set of sensitive electronics safe from spikes." },
        { icon: "bolt", title: "A single AC", desc: "3 kVA handles one 1-ton air-conditioner with delayed restart." },
        { icon: "home", title: "Entry-level homes", desc: "The low-cost first step into proper voltage protection." },
        { icon: "pulse", title: "Sound systems", desc: "Keeps audio and entertainment gear safe from sags and surges." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "Protection that <em>everyone can afford</em>.",
      items: [
        { n: "01", title: "Affordable entry", desc: "Proper voltage protection at a household price.", img: "assets/avr/vp-affordable.jpg" },
        { n: "02", title: "Fast relay correction", desc: "Sub-second tap switching across a wide range.", img: "assets/avr/vp-relay.jpg" },
        { n: "03", title: "OV / UV cutoff", desc: "Cuts off on dangerous over- or under-voltage.", img: "assets/avr/vp-ovuv.jpg" },
        { n: "04", title: "Time-delay restart", desc: "Stops AC compressors from switching on and off too fast.", img: "assets/avr/vp-delay.jpg" },
        { n: "05", title: "LED voltage meter", desc: "See your mains voltage at a glance.", img: "assets/svc/vp-display.jpg" },
        { n: "06", title: "Wall or desktop", desc: "Small housing fits anywhere, with no installation.", img: "assets/avr/vp-walldesktop.jpg" },
      ],
      protections: ["over-volt", "under-volt", "short"],
    },
    faqs: [
      { q: "What is an AVR (relay) stabilizer best for?", a: "A single appliance. The Voltec A-series is made to protect one fridge, deep freezer or air-conditioner. It is small, wall-mountable and plug-and-play, with a built-in over/under-voltage cutoff and a time-delay restart that keeps the compressor safe." },
      { q: "Which Voltec A-series model do I need?", a: "Match it to the appliance. A-25 (2500 W) suits a fridge or deep freezer; A-50 (5000 W) suits a 1–1.5 ton split AC; A-100 (10000 W) suits a larger AC; the A-120SP works from as low as 75 V for very low-voltage areas. Send us the appliance and your area voltage and we will pick the right one." },
      { q: "How low a voltage can the Voltec A-series work from?", a: "The A-120SP starts working from about 75 V, which is why it is popular in areas with very weak evening voltage. The rest of the A-series holds output across a wide range and cuts off safely if the voltage goes too low or too high." },
      { q: "Is the Voltec A-series pure copper?", a: "Yes. The A-series uses 100% pure-copper windings, which carry the load without overheating and last far longer than the aluminium-wound stabilizers common in the market." },
      { q: "AVR or servo (SVC) — which should I buy?", a: "AVR is the cheapest and is perfect for protecting one appliance like a fridge or a single AC. A servo (SVC) costs more but corrects more smoothly and covers a whole home or shop. For one appliance on a budget, the A-series AVR is the right choice." },
      { q: "Do I need an electrician to install it?", a: "No. The A-series is plug-and-play — hang it on the wall, plug the appliance in, and it protects right away. No wiring or electrician needed." },
    ],
  },

  // =============================================================== INDUSTRIAL
  industrial: {
    tagline: "Heavy three-phase servo stabilizers — built for factories that cannot lose a single shift.",
    stats: [["±1", "%", "Output accuracy"], ["50", "°C", "Continuous rating"], ["&gt;97", "%", "Efficiency"], ["500", "kVA", "Up to capacity"]],
    hero: {
      eyebrow: "Plant-grade build", title: "Made for <em>three shifts a day</em>.",
      intro: "Each phase is corrected on its own, so an unbalanced WAPDA supply becomes clean, balanced 400 V. It uses heavy copper, big contactors and forced cooling that runs all day.",
      slot: "Drop industrial cabinet photo",
      callouts: [
        { pos: "tl", icon: "display", title: "Control & metering", desc: "Shows voltage and load for each phase." },
        { pos: "bl", icon: "fan", title: "Forced-air cooling", desc: "Runs all day at 50 °C." },
        { pos: "tr", icon: "terminal", title: "Heavy busbars", desc: "Big copper for hundreds of amps." },
        { pos: "br", icon: "shield", title: "Steel enclosure", desc: "Floor-standing cabinet, ready for bypass." },
      ],
    },
    tech: {
      eyebrow: "How it works", title: "Each phase, <em>corrected on its own</em>.",
      intro: "Three servo systems, one per phase, drive stepless autotransformers. A lopsided incoming supply becomes a clean, balanced output. IGBT models do the same with no moving parts.",
      mode: "pillars",
      pillars: [
        { icon: "bolt", title: "Per-phase correction", desc: "Unbalanced input becomes balanced 400 V on all three phases." },
        { icon: "terminal", title: "Heavy copper path", desc: "Big windings and contactors carry the full industrial current." },
        { icon: "fan", title: "Continuous 50 °C duty", desc: "Forced cooling and heat protection for 24/7 running." },
        { icon: "shield", title: "Bypass & monitoring", desc: "Bypass cabinets and remote monitoring keep production going." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "Across Pakistan's <em>industry</em>.",
      items: [
        { icon: "server", title: "Textile mills", desc: "Keeps looms and motor drives safe from voltage swings across Punjab." },
        { icon: "pulse", title: "Food & poultry", desc: "Keeps grinders and cold rooms running, as at K&N's Kasur plant." },
        { icon: "bolt", title: "Cold storage", desc: "Steadies compressor loads to stop costly motor burnout." },
        { icon: "home", title: "Commercial buildings", desc: "Whole-building correction for malls, hospitals and offices." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "Uptime, <em>built in</em>.",
      items: [
        { n: "01", title: "Balanced output", desc: "Each phase fixed to a clean 400 V ±1%.", img: "assets/industrial/vp-balanced.jpg" },
        { n: "02", title: "Deep low-V correction", desc: "Holds output even when input drops to 260 V L-L.", img: "assets/industrial/vp-lowv.jpg" },
        { n: "03", title: "24/7 duty cycle", desc: "Runs all day at 50 °C, three shifts a day.", img: "assets/industrial/vp-duty.jpg" },
        { n: "04", title: "Oversized contactors", desc: "Heavy copper and contacts take surge and inrush.", img: "assets/industrial/vp-contactors.jpg" },
        { n: "05", title: "Service contract", desc: "Planned engineer visits keep the plant protected.", img: "assets/industrial/vp-service.jpg" },
        { n: "06", title: "Remote monitoring", desc: "Check voltage and load from your phone, anywhere.", img: "assets/industrial/vp-remote.jpg" },
      ],
      protections: ["over-current", "over-volt", "under-volt", "over-temp", "short"],
    },
    faqs: [
      { q: "What size three-phase stabilizer does my factory need?", a: "Size it to your total connected load in kVA, with headroom for motor start-up. Voltec builds SJW-series three-phase stabilizers from 100 kVA and 200 kVA up to 500 kVA and beyond, made to order. Send us your load list or a single-line diagram and our engineers will size it." },
      { q: "What type of three-phase stabilizer does Voltec build?", a: "Heavy servo (SVC) stabilizers that correct each phase on its own — proven, cost-effective, and great with motor loads. Built to order from 100 kVA to 500 kVA and beyond. Send us your load and our engineers will size it." },
      { q: "Can it fix an unbalanced WAPDA supply?", a: "Yes. Each phase is corrected on its own, so a lopsided incoming supply becomes a clean, balanced 400 V on all three phases — which is what protects three-phase motors and drives." },
      { q: "Do you provide installation and service contracts?", a: "Yes. We supply, install and service industrial systems, with bypass cabinets and remote monitoring, and planned engineer visits to keep the plant protected. We have done plants like K&N's in Kasur." },
      { q: "How long does a custom industrial stabilizer take?", a: "It is built to order, so lead time depends on capacity and configuration. Message us with your load and we will confirm the price and delivery time." },
    ],
  },

  // =================================================================== CELLS
  cells: {
    tagline: "Genuine EVE Grade-A prismatic LFP cells. Laser-welded, QR-traceable and matched before they ship.",
    stats: [["6,000", "+", "Cycle life"], ["3.2", "V", "Nominal"], ["-20–55", "°C", "Operating temp"], ["5", "yr", "Warranty"]],
    hero: {
      eyebrow: "Genuine, traceable", title: "Grade-A cells, <em>matched and checked</em>.",
      intro: "Every cell is laser-welded and carries a scannable factory QR code. We match each one for capacity and voltage at our Lahore facility before it joins your bank.",
      slot: "Drop prismatic cell render",
      callouts: [
        { pos: "tl", icon: "terminal", title: "Laser-welded terminals", desc: "Low-resistance posts that take vibration." },
        { pos: "bl", icon: "shield", title: "Prismatic steel case", desc: "Stiff, stackable and stable in heat." },
        { pos: "tr", icon: "display", title: "Factory QR code", desc: "Scan to check it is a genuine EVE cell." },
        { pos: "br", icon: "bolt", title: "Safety vent valve", desc: "Releases pressure if a fault happens." },
      ],
    },
    tech: {
      eyebrow: "The chemistry", title: "Why <em>LFP</em>, and why EVE.",
      intro: "Lithium iron phosphate is the safest common lithium chemistry. It stays stable in Pakistan's heat and lasts thousands of cycles. EVE is one of the three factories that supply the world's EV and storage industry.",
      mode: "pillars",
      pillars: [
        { icon: "shield", title: "Thermally stable LFP", desc: "Far safer than NMC under heat, so it is fine in rooms with no AC." },
        { icon: "chip", title: "Prismatic construction", desc: "A dense, stiff shape that stores more per cubic foot with fewer joins." },
        { icon: "terminal", title: "Grade-A matching", desc: "Matched within ±1–2 Ah and ±2 mV so packs balance and last." },
        { icon: "bolt", title: "EV-grade origin", desc: "The same chemistry as Tesla Megapack and BYD Blade, bought direct." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "From home solar to <em>commercial ESS</em>.",
      items: [
        { icon: "home", title: "Home solar storage", desc: "16 cells make a 48 V bank that lasts through an evening of load-shedding." },
        { icon: "server", title: "Telecom & UPS", desc: "4-in-series 12 V strings for towers and backup systems." },
        { icon: "bolt", title: "EV & light mobility", desc: "Dense packs for electric two- and three-wheelers." },
        { icon: "pulse", title: "Commercial ESS", desc: "Large banks for shops, offices and industrial backup." },
      ],
    },
    // "Built to last" advantages now live on the LF100LA product page (CellDetail),
    // not the cells hub — see components/CellDetail.tsx BENEFITS.
    faqs: [
      { q: "How many lithium cells do I need for a 48 V solar battery?", a: "Sixteen. A 48 V LFP battery is built from 16 cells in series (16S), each 3.2 V nominal. For 24 V use 8 cells, and for 12 V use 4 cells. Tell us your inverter voltage and backup hours and we will work out the cell count and capacity." },
      { q: "What cell size (Ah) should I choose?", a: "Match it to the energy you need. A common home bank uses 16× 280 Ah cells for about 14 kWh at 48 V — enough to run a home through an evening of load-shedding. For smaller backup, 100–150 Ah cells work; for bigger storage, use 304 Ah. Share your load in kW and the hours you need and we will size it." },
      { q: "Why genuine EVE LFP cells and not cheaper ones?", a: "EVE is one of the top global cell makers, supplying the EV and storage industry. Genuine Grade-A EVE LFP cells are safe in Pakistan's heat, last 6,000+ cycles (about 15 years of daily use), and carry a scannable QR code. We match every cell for capacity and voltage in Lahore before it ships." },
      { q: "Are LFP (LiFePO4) cells safe in Pakistan's heat?", a: "Yes. Lithium iron phosphate (LFP) is the most thermally stable common lithium chemistry and works from -20 °C to +55 °C, so it is safe in rooms with no air-conditioning — much safer than NMC." },
      { q: "Lithium or lead-acid for load-shedding — which is worth it?", a: "Lithium. LFP lasts 6,000+ cycles versus a few hundred for lead-acid, gives you most of its capacity instead of half, charges faster and needs no maintenance. It costs more up front but is far cheaper per year of use." },
      { q: "Do the cells come with a BMS, and which inverters do they work with?", a: "Cells are sold matched and ready to build, and we can supply a compatible BMS too. A 48 V LFP bank works with all the major inverter brands — Victron, Deye, SRNE and Growatt. Tell us your inverter and we will confirm the setup." },
    ],
  },

  // ===================================================================== BMS
  bms: {
    tagline: "Active-balancing battery management with plug-and-play inverter link and tested firmware.",
    stats: [["16", "S", "48 V LFP"], ["100", "A", "Continuous"], ["2", "A", "Active balance"], ["200", "A", "Peak current"]],
    hero: {
      eyebrow: "The brain of the pack", title: "Sixteen cells, <em>one smart board</em>.",
      intro: "Active balancing keeps every cell within millivolts of the next. Plug-and-play CAN protocols let the pack talk straight to your inverter out of the box.",
      slot: "Drop BMS board render",
      callouts: [
        { pos: "tl", icon: "chip", title: "Active balancer", desc: "A 2 A bridge keeps cells even." },
        { pos: "bl", icon: "bolt", title: "Power MOSFETs", desc: "100 A continuous switching path." },
        { pos: "tr", icon: "display", title: "Comms port", desc: "UART / RS485 / CAN 2.0B." },
        { pos: "br", icon: "terminal", title: "Current shunt", desc: "Reads current and SoC accurately." },
      ],
    },
    tech: {
      eyebrow: "How it works", title: "Protect, balance, <em>communicate</em>.",
      intro: "The BMS watches every cell, balances them as they drift, cuts the pack off on any fault, and reports state-of-charge straight to your inverter over CAN.",
      mode: "pillars",
      pillars: [
        { icon: "chip", title: "Active balancing", desc: "Moves charge between cells with a 2 A bridge, far faster than passive bleed." },
        { icon: "bolt", title: "Inverter integration", desc: "Talks Victron, Deye, SRNE and Growatt CAN protocols out of the box." },
        { icon: "shield", title: "Full fault protection", desc: "Cuts off on over-charge, over-discharge, over-current and high temperature." },
        { icon: "display", title: "Verified firmware", desc: "Ships pre-flashed and bench-tested, not generic AliExpress firmware." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "For anyone building <em>a 48 V bank</em>.",
      items: [
        { icon: "home", title: "Home solar packs", desc: "Turns 16 LFP cells into a safe, inverter-ready 48 V battery." },
        { icon: "bolt", title: "DIY pack builders", desc: "Plug-and-play protocols mean no firmware trouble." },
        { icon: "server", title: "Telecom backup", desc: "Reliable protection and SoC reports for tower sites." },
        { icon: "pulse", title: "Commercial ESS", desc: "Scales across many packs with the same comms." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "The board that makes it <em>a battery</em>.",
      items: [
        { n: "01", title: "2 A active balance", desc: "Keeps cells within 5 mV, even after years of use." },
        { n: "02", title: "100 A continuous", desc: "200 A peak for 10 s takes surge loads." },
        { n: "03", title: "Multi-protocol CAN", desc: "Talks to all the major inverter brands." },
        { n: "04", title: "Plug & play", desc: "Set up already, so you wire it up and it works." },
        { n: "05", title: "72-hour tested", desc: "Every board ships with a bench-test report." },
        { n: "06", title: "Service & support", desc: "Backed and supported by our own team." },
      ],
      protections: ["over-current", "over-volt", "under-volt", "over-temp", "short"],
    },
  },

  // =================================================================== RELAY
  relay: {
    tagline: "Wirell power relays — T73 (up to 10A) and T90 (up to 40A). Silver-alloy contacts, stocked by the thousand.",
    stats: [["5–40", "A", "Contact rating"], ["100k", "+", "Electrical life"], ["2M", "+", "Mechanical life"], ["≤10", "ms", "Operate time"]],
    hero: {
      eyebrow: "Drawer essential", title: "The relays engineers <em>keep in stock</em>.",
      intro: "Wirell's T73 (JQC-3F, up to 10A) and T90 (JQX-15F, up to 40A) PCB-mount relays. Silver-alloy contacts switch motor and inrush loads without welding. Standard footprint, through-hole pins, next-day dispatch.",
      slot: "Drop relay render",
      callouts: [
        { pos: "tl", icon: "bolt", title: "Silver-alloy contacts", desc: "Switch motor loads without welding." },
        { pos: "bl", icon: "chip", title: "Pure-copper coil", desc: "12 V / 24 V DC options." },
        { pos: "tr", icon: "terminal", title: "Through-hole pins", desc: "Standard PCB footprint." },
        { pos: "br", icon: "shield", title: "Two sizes", desc: "T73 for control, T90 for power." },
      ],
    },
    tech: {
      eyebrow: "Why it lasts", title: "Built for <em>inductive loads</em>.",
      intro: "Silver-alloy contacts and a sealed body let these relays switch motors, coils and transformers millions of times. The contacts do not weld shut the way cheaper parts do.",
      mode: "pillars",
      pillars: [
        { icon: "bolt", title: "Silver-alloy contacts", desc: "Take motor and inrush loads without welding shut." },
        { icon: "shield", title: "Sealed body", desc: "Keeps dust and solder flux out for a long, reliable life." },
        { icon: "chip", title: "Millions of cycles", desc: "Up to 2,000,000 mechanical operations." },
        { icon: "terminal", title: "Standard footprint", desc: "Through-hole pins fit common PCB layouts." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "Inside everything that <em>switches power</em>.",
      items: [
        { icon: "bolt", title: "Inverters & UPS", desc: "Transfer and bypass switching in power electronics." },
        { icon: "display", title: "Stabilizer controllers", desc: "The switching heart of AVR and servo control boards." },
        { icon: "home", title: "Charge controllers", desc: "Solar charge and load-disconnect switching." },
        { icon: "server", title: "Automation panels", desc: "All-round control across industrial panels." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "Small part, <em>serious spec</em>.",
      items: [
        { n: "01", title: "Up to 40 A @ 250 VAC", desc: "T90 takes real motor and power loads.", img: "assets/relay/vp-load.jpg" },
        { n: "02", title: "Inductive-load proof", desc: "Silver-alloy contacts that do not weld under motor loads.", img: "assets/relay/vp-inductive.jpg" },
        { n: "03", title: "≤10 ms operate", desc: "Fast, reliable switching.", img: "assets/relay/vp-fast.jpg" },
        { n: "04", title: "2,000,000-cycle life", desc: "Built to outlast the board it sits on.", img: "assets/relay/vp-life.jpg" },
        { n: "05", title: "Standard footprint", desc: "Through-hole pins fit common PCB designs.", img: "assets/relay/vp-footprint.jpg" },
        { n: "06", title: "Stocked deep", desc: "Thousands on the shelf for next-day dispatch.", img: "assets/parts/vp-stocked.jpg" },
      ],
    },
    faqs: [
      { q: "What is the difference between the Wirell T73 and T90 relay?", a: "Current. The T73 (JQC-3F) switches up to 10 A and is used on control and signal lines; the T90 (JQX-15F) switches up to 40 A for motor and power loads. Both use silver-alloy contacts." },
      { q: "Can these relays switch motor and inductive loads?", a: "Yes. The silver-alloy contacts are made for inductive loads and switch motors, coils and transformers millions of times without welding shut." },
      { q: "Do you stock them in bulk?", a: "Yes, by the thousand, for next-day dispatch. Message us with the model, coil voltage (12 V / 24 V) and quantity." },
    ],
  },

  // ===================================================================== LED
  led: {
    tagline: "Bright 7-segment LED display modules — 5630 and 4630 series — for stabilizer fronts, meters and instruments.",
    stats: [["2", "", "Sizes"], ["7", "seg", "Display"], ["wide", "°", "Viewing angle"], ["red", "", "Standard colour"]],
    hero: {
      eyebrow: "Panel ready", title: "Clear readouts for <em>every panel</em>.",
      intro: "7-segment LED display modules in two sizes — the larger 5630 and the compact 4630. Bright, even segments give crisp voltage and load readouts on stabilizer fronts, panel meters and instruments.",
      slot: "Drop LED display render",
      callouts: [
        { pos: "tl", icon: "display", title: "Bright segments", desc: "Clear from across a workshop." },
        { pos: "bl", icon: "chip", title: "Two sizes", desc: "5630 large · 4630 compact." },
        { pos: "tr", icon: "pulse", title: "Wide viewing angle", desc: "Readable from an angle." },
        { pos: "br", icon: "terminal", title: "Standard pinout", desc: "Drops into common panel designs." },
      ],
    },
    tech: {
      eyebrow: "The two modules", title: "5630 and <em>4630</em>.",
      intro: "Same crisp 7-segment readout in two footprints. Pick the 5630 for large, easy-to-read panels or the 4630 where space is tight.",
      mode: "pillars",
      pillars: [
        { icon: "display", title: "5630 — large", desc: "Bigger digits for stabilizer fronts and panel meters." },
        { icon: "chip", title: "4630 — compact", desc: "Small readouts for instruments and tight panels." },
        { icon: "pulse", title: "Bright & even", desc: "Uniform segments with a wide viewing angle." },
        { icon: "bolt", title: "Red standard", desc: "Other colours on request." },
      ],
    },
    useCases: {
      eyebrow: "Where it fits", title: "On the <em>front of the panel</em>.",
      items: [
        { icon: "display", title: "Stabilizer fronts", desc: "Live voltage and load on AVR and servo units." },
        { icon: "pulse", title: "Panel meters", desc: "Clear digital readouts for metering panels." },
        { icon: "chip", title: "Instruments", desc: "Compact readouts for test and lab gear." },
        { icon: "server", title: "Maker & repair", desc: "Supplied to makers and repair workshops." },
      ],
    },
    benefits: {
      eyebrow: "Key advantages", title: "A clean readout, <em>two sizes</em>.",
      items: [
        { n: "01", title: "5630 & 4630", desc: "Two footprints from one supplier.", img: "assets/led/vp-modules.jpg" },
        { n: "02", title: "Bright segments", desc: "Easy to read across a room.", img: "assets/led/vp-bright.jpg" },
        { n: "03", title: "Wide viewing angle", desc: "Clear from off-axis too.", img: "assets/led/vp-angle.jpg" },
        { n: "04", title: "Standard pinout", desc: "Drops into common panel layouts.", img: "assets/led/vp-pinout.jpg" },
        { n: "05", title: "Red standard", desc: "Other colours on request.", img: "assets/led/vp-red.jpg" },
        { n: "06", title: "Stocked deep", desc: "On the shelf for next-day dispatch.", img: "assets/parts/vp-stocked.jpg" },
      ],
    },
    faqs: [
      { q: "What is the difference between the 5630 and 4630 LED display?", a: "Size. The 5630 has larger digits for stabilizer fronts and panel meters; the 4630 is compact for instruments and tight panels. Both are bright 7-segment modules with a wide viewing angle." },
      { q: "What colour are they, and can I order others?", a: "Red is standard. Other colours are available on request. Message us with the size and quantity." },
      { q: "Do you supply them for repair and maker use?", a: "Yes. We stock the 5630 and 4630 modules deep and supply makers and repair workshops, with next-day dispatch. Tell us the size and quantity." },
    ],
  },
};

export function showcaseFor(p: Product): ShowcaseContent {
  return SHOWCASE[familyOf(p)] || SHOWCASE.relay;
}

// Products that have a dedicated showcase family worth a landing page.
export function hasShowcase(p: Product): boolean {
  return Boolean(SHOWCASE[familyOf(p)]);
}

// ===========================================================================
// FAMILIES — category-level showcases. Each family groups the SKUs/models that
// share a tech story (the SHOWCASE entry above) under one landing page, with
// the individual models listed as members. URLs are clean family slugs
// (/showcase/igbt) rather than per-SKU ids.
// ===========================================================================

export interface FamilyMeta {
  /** Clean URL slug, e.g. "igbt". */
  slug: string;
  /** Key into SHOWCASE. */
  key: string;
  /** Display name for the range. */
  name: string;
  /** Parent category. */
  category: string;
  categoryId: CategoryId;
  /** Short marketing line for tiles / cards. */
  blurb: string;
  /** Representative image. */
  image: string;
  /** Optional curated, full-bleed art for the homepage range band (takes
   *  precedence over the lead product photo there). */
  bandImage?: string;
  /** Optional positioning tag, e.g. "Latest generation". */
  tag?: string;
  /** Optional override for the origin chip's i18n key. Defaults to
   *  "cfg.built" ("Built in Lahore"); imported lines use "cfg.imported". */
  originTagKey?: string;
  /** Hide this whole line from the public site (range bands, catalog, nav,
   *  showcase route, sitemap). Members are kept in the data for easy re-enable
   *  once the line is ready to launch. */
  hidden?: boolean;
}

// Apple-style: a short, curated set of lines in business-priority order, led by
// the flagship. IGBT is branded "Inverter Stabilizer" (efficient, like an
// inverter AC); SVC servo is the home & appliance line.
export const FAMILIES: FamilyMeta[] = [
  {
    slug: "smart-inverter-voltage-stabilizer",
    key: "stab-igbt",
    name: "Voltec Inverter (IGBT)",
    category: "Voltage Stabilizers",
    categoryId: "stabilizers",
    blurb: "Our premium, latest-technology stabilizer — built for laser, CNC, medical and other sensitive equipment that needs exact voltage. Only at Voltec.",
    image: "assets/igbt/display.jpg",
    bandImage: "assets/igbt/range.jpg",
    tag: "Coming soon",
    originTagKey: "cfg.imported",
    hidden: true,
  },
  {
    slug: "cells",
    key: "cells",
    name: "EVE Lithium Cells",
    category: "Lithium Cells",
    categoryId: "cells",
    blurb: "Genuine Grade-A prismatic LFP. Laser-welded, QR-traceable and matched in Lahore. The heart of every solar storage build.",
    image: "assets/eve-cell.png",
  },
  {
    slug: "industrial",
    key: "industrial",
    name: "3-Phase Industrial Systems",
    category: "3-Phase Industrial",
    categoryId: "industrial",
    blurb: "Three-phase SJW-series systems, built to order — heavy servo stabilizers, line conditioners and buck-boost from 100kVA to 500kVA and up. Made to fit your plant.",
    image: "assets/industrial-sjw.png",
    tag: "Custom-built",
  },
  {
    slug: "svc",
    key: "stab-svc",
    name: "Servo Motor Stabilizers (SVC)",
    category: "Voltage Stabilizers",
    categoryId: "stabilizers",
    blurb: "SVC servo motor control. Smooth, stepless correction sized to keep home appliances, ACs and electronics safe.",
    image: "assets/svc-stabilizer.png",
    tag: "Best seller",
    originTagKey: "cfg.imported",
  },
  {
    slug: "scr",
    key: "stab-scr",
    name: "Voltec SCR — Thyristor",
    category: "Voltage Stabilizers",
    categoryId: "stabilizers",
    blurb: "Solid-state thyristor switching — faster than a servo, with no motor or brushes to wear out. The cost-effective way to protect tier-1 sensitive equipment like laser machines.",
    image: "assets/scr/itk-unit.jpg",
    bandImage: "assets/scr/itk-wall.jpg",
    tag: "Solid-state",
    originTagKey: "cfg.imported",
    hidden: true,
  },
  {
    slug: "avr",
    key: "stab-avr",
    name: "AVR Voltage Stabilizers",
    category: "Voltage Stabilizers",
    categoryId: "stabilizers",
    blurb: "Relay-type automatic stabilizers — the Voltec A-series for fridges, deep freezers and air-conditioners. Pure copper, and they work from very low voltage.",
    image: "assets/avr-a25.png",
    tag: "From 75V",
  },
  {
    slug: "relay",
    key: "relay",
    name: "Wirell PCB Relays",
    category: "Electric Parts",
    categoryId: "parts",
    blurb: "Wirell power relays — T73 (up to 10A) and T90 (up to 40A). Silver-alloy contacts, stocked by the thousand for next-day dispatch.",
    image: "assets/relay-t73.webp",
  },
  {
    slug: "led",
    key: "led",
    name: "7-Segment LED Displays",
    category: "Electric Parts",
    categoryId: "parts",
    blurb: "Bright 7-segment display modules — 5630 and 4630 series — for stabilizer fronts, panel meters and instruments.",
    image: "assets/prod-relay.jpg",
  },
];

const KEY_TO_SLUG: Record<string, string> = Object.fromEntries(
  FAMILIES.map((f) => [f.key, f.slug]),
);

export function familyBySlug(slug: string): FamilyMeta | undefined {
  return FAMILIES.find((f) => f.slug === slug);
}

/** Clean family slug for a product, e.g. "igbt" — for /showcase links. */
export function familySlugOf(p: Product): string | undefined {
  return KEY_TO_SLUG[familyOf(p)];
}

/** All SKUs/models that belong to a family, in catalogue order. Pass a resolved
 *  product list (code + admin-created variants) to include admin-added variants. */
export function membersOf(family: FamilyMeta, products: Product[] = PRODUCTS): Product[] {
  return products.filter((p) => familyOf(p) === family.key);
}

/** Pick the headline model for a family (flagship/best-seller, else first). */
export function leadOf(members: Product[]): Product {
  return (
    members.find((p) => p.badge === "Flagship") ||
    members.find((p) => p.badge === "Best seller") ||
    members.find((p) => p.badge === "Most shipped") ||
    members.find((p) => p.status !== "upcoming") ||
    members[0]
  );
}

/** Other families in the same category — for cross-sell. */
export function siblingFamilies(family: FamilyMeta): FamilyMeta[] {
  return FAMILIES.filter(
    (f) => f.categoryId === family.categoryId && f.slug !== family.slug && !f.hidden,
  );
}

/** Family keys that are hidden from the public site. */
const HIDDEN_FAMILY_KEYS = new Set(FAMILIES.filter((f) => f.hidden).map((f) => f.key));

/** True when a product belongs to a line that is hidden from the public site,
 *  so catalog/featured/SEO surfaces can drop it without per-product flags. */
export function isProductInHiddenFamily(p: Product): boolean {
  return HIDDEN_FAMILY_KEYS.has(familyOf(p));
}
