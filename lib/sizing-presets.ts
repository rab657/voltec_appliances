import type { SizingInput } from "./sizing";

// Pre-computed answers to the sizing questions buyers actually ask (Google,
// ChatGPT, WhatsApp). Each one becomes a static page at /stabilizer-size/<slug>
// whose answer is computed by lib/sizing.ts — never typed in by hand — so a
// preset can never disagree with the calculator or the API.
//
// The load lists are typical, not maximal: what runs at the same time on a hot
// evening. Add a preset when a new question keeps coming up on WhatsApp.

export type SizingPreset = {
  slug: string;
  /** The question, phrased the way buyers ask it. Used as H1 and FAQ question. */
  question: string;
  /** Short label for the hub list. */
  label: string;
  group: "ac" | "home" | "solar" | "business";
  /** One or two plain sentences of context above the answer. */
  intro: string;
  input: Partial<SizingInput>;
};

export const SIZING_PRESETS: SizingPreset[] = [
  // ── One AC / one appliance ────────────────────────────────────────────────
  {
    slug: "1-ton-ac",
    question: "What size stabilizer do I need for a 1 ton AC?",
    label: "One 1 ton AC",
    group: "ac",
    intro: "A 1 ton AC runs at about 1,200 VA, and its compressor pulls 2–3 times that for a few seconds when it starts.",
    input: { ac1: 1 },
  },
  {
    slug: "1-5-ton-ac",
    question: "What size stabilizer do I need for a 1.5 ton AC?",
    label: "One 1.5 ton AC",
    group: "ac",
    intro: "A 1.5 ton AC, inverter or normal, runs at about 1,800 VA. The start-up surge is why the stabilizer must be bigger than the running load.",
    input: { ac15: 1 },
  },
  {
    slug: "1-5-ton-ac-low-voltage",
    question: "Which stabilizer for a 1.5 ton AC when voltage drops to 110V?",
    label: "1.5 ton AC, voltage drops to 110V",
    group: "ac",
    intro: "At the end of a long line the evening voltage can fall to 110V. Most stabilizers switch off below 150V, so the input range matters more than the size.",
    input: { ac15: 1, minVoltage: 110 },
  },
  {
    slug: "2-ton-ac",
    question: "What size stabilizer do I need for a 2 ton AC?",
    label: "One 2 ton AC",
    group: "ac",
    intro: "A 2 ton AC runs at about 2,400 VA. Size for the start-up surge, not only the running load.",
    input: { ac2: 1 },
  },
  {
    slug: "refrigerator",
    question: "What size stabilizer do I need for a refrigerator?",
    label: "One refrigerator",
    group: "ac",
    intro: "A home refrigerator runs at about 400 VA. Low voltage is what burns fridge compressors, so the input range is the key spec.",
    input: { fridge: 1 },
  },
  {
    slug: "tv-computer-router",
    question: "What size stabilizer for a TV, computer and router?",
    label: "TV, computer and router",
    group: "ac",
    intro: "Electronics need steady voltage more than big capacity. A TV, a computer, a router and a few lights is a small load.",
    input: { tv: 1, pc: 1, lights: 6, fans: 2 },
  },

  // ── Whole home ────────────────────────────────────────────────────────────
  {
    slug: "1-ac-fridge-home",
    question: "What size stabilizer for one AC, a fridge, fans and lights?",
    label: "1 AC + fridge + fans + lights",
    group: "home",
    intro: "The most common Pakistani home load: one 1.5 ton inverter AC, a fridge, four fans, LED lights and a TV.",
    input: { ac15: 1, fridge: 1, fans: 4, lights: 8, tv: 1 },
  },
  {
    slug: "home-with-ups-2-batteries",
    question: "What size stabilizer for a home with a UPS on two batteries and one AC?",
    label: "Home with UPS (2 batteries) + 1 AC",
    group: "home",
    intro: "If the stabilizer feeds the UPS too, add the UPS charger to the load. The fans and lights the UPS runs are already in the list.",
    input: { ac15: 1, fridge: 1, fans: 4, lights: 8, tv: 1, upsBatteries: 2 },
  },
  {
    slug: "5-marla-house",
    question: "What size stabilizer for a 5 marla house?",
    label: "5 marla house",
    group: "home",
    intro: "A typical 5 marla house: one 1.5 ton AC, a fridge, five fans, LED lights, a TV and a washing machine.",
    input: { ac15: 1, fridge: 1, fans: 5, lights: 10, tv: 1, washer: 1 },
  },
  {
    slug: "2-acs-home",
    question: "What size stabilizer for a home with two ACs?",
    label: "Home with 2 ACs",
    group: "home",
    intro: "Two 1.5 ton ACs, a fridge, six fans, LED lights and a TV — the evening load of a family home in summer.",
    input: { ac15: 2, fridge: 1, fans: 6, lights: 12, tv: 1 },
  },
  {
    slug: "10-marla-house",
    question: "What size stabilizer for a 10 marla house?",
    label: "10 marla house",
    group: "home",
    intro: "A typical 10 marla house: two 1.5 ton ACs, a fridge, a deep freezer, eight fans, LED lights, two TVs, a washing machine and a water motor.",
    input: { ac15: 2, fridge: 1, freezer: 1, fans: 8, lights: 15, tv: 2, washer: 1, motor: 1 },
  },
  {
    slug: "2-acs-home-low-voltage",
    question: "What stabilizer for a home with two ACs when voltage drops to 120V?",
    label: "2 ACs, voltage drops to 120V",
    group: "home",
    intro: "The same two-AC home, but the evening voltage falls to 120V. The size stays the same; the input range must go lower.",
    input: { ac15: 2, fridge: 1, fans: 6, lights: 12, tv: 1, minVoltage: 120 },
  },
  {
    slug: "1-kanal-house",
    question: "What size stabilizer for a 1 kanal house?",
    label: "1 kanal house",
    group: "home",
    intro: "A typical 1 kanal house: four 1.5 ton ACs and one 2 ton AC, two fridges, a deep freezer, twelve fans, LED lights, two TVs, two computers, a washing machine and a water motor.",
    input: { ac15: 4, ac2: 1, fridge: 2, freezer: 1, fans: 12, lights: 25, tv: 2, pc: 2, washer: 1, motor: 1 },
  },

  // ── Solar / hybrid inverters ──────────────────────────────────────────────
  {
    slug: "5kw-solar-inverter",
    question: "What size stabilizer for a 5 kW solar inverter?",
    label: "5 kW solar inverter",
    group: "solar",
    intro: "When the grid voltage leaves the window your inverter accepts, it trips with \"AC input out of range\". A stabilizer on the inverter's AC input keeps it running.",
    input: { solarKva: 5 },
  },
  {
    slug: "6kw-solar-inverter",
    question: "What size stabilizer for a 6 kW solar inverter?",
    label: "6 kW solar inverter",
    group: "solar",
    intro: "All of the house load passes through a hybrid inverter, so the stabilizer is sized to the inverter, not to the appliances.",
    input: { solarKva: 6 },
  },
  {
    slug: "8kw-solar-inverter",
    question: "What size stabilizer for an 8 kW solar inverter?",
    label: "8 kW solar inverter",
    group: "solar",
    intro: "An 8 kW hybrid inverter is common on 10 marla homes. Size the stabilizer to the inverter plus a safety margin.",
    input: { solarKva: 8 },
  },
  {
    slug: "10kw-solar-inverter",
    question: "What size stabilizer for a 10 kW solar inverter?",
    label: "10 kW solar inverter",
    group: "solar",
    intro: "A 10 kW inverter carries a large home. The stabilizer goes on its AC input and must cover the inverter's full rating.",
    input: { solarKva: 10 },
  },
  {
    slug: "12kw-solar-inverter",
    question: "What size stabilizer for a 12 kW solar inverter?",
    label: "12 kW solar inverter",
    group: "solar",
    intro: "For a 12 kW inverter, size to the inverter rating plus a safety margin. Set the inverter to its wide input range first.",
    input: { solarKva: 12 },
  },

  // ── Shops and offices ─────────────────────────────────────────────────────
  {
    slug: "small-shop",
    question: "What size stabilizer for a small shop?",
    label: "Small shop",
    group: "business",
    intro: "A small shop: one 1.5 ton AC, a display fridge, four fans, LED lights, a computer and a water dispenser.",
    input: { ac15: 1, fridge: 1, fans: 4, lights: 12, pc: 1, dispenser: 1 },
  },
  {
    slug: "office-5-computers",
    question: "What size stabilizer for an office with five computers?",
    label: "Office with 5 computers",
    group: "business",
    intro: "A small office: five computers, two 1.5 ton ACs, LED lights, fans and a water dispenser.",
    input: { pc: 5, ac15: 2, lights: 15, fans: 4, dispenser: 1 },
  },
];

export function getPreset(slug: string): SizingPreset | undefined {
  return SIZING_PRESETS.find((p) => p.slug === slug);
}

export const PRESET_GROUPS: { id: SizingPreset["group"]; label: string }[] = [
  { id: "ac", label: "One AC or one appliance" },
  { id: "home", label: "Whole home" },
  { id: "solar", label: "Solar and hybrid inverters" },
  { id: "business", label: "Shops and offices" },
];
