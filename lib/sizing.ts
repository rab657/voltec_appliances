import { getProduct, whatsappLink } from "./products";
import { absUrl } from "./site";

// ─────────────────────────────────────────────────────────────────────────────
// Stabilizer sizing engine — the ONE source of truth for "what size do I need?"
//
// Used by: /stabilizer-size-calculator (server-rendered from the URL), the
// /stabilizer-size/[slug] answer pages, GET /api/v1/stabilizer-size (JSON for AI
// agents), /openapi.json and llms.txt. Change a number here and every surface
// changes with it — they can never disagree.
//
// WHY it is server-side and URL-driven (2026-11-13): buyers now arrive with a
// spec written by ChatGPT ("3–5 kVA copper servo, 100–270V input"). Answer
// engines read pages and quote them; they do not run our JavaScript. So every
// result lives at a real URL whose HTML already contains the answer.
//
// ⚠️ The VA figures and the rule below are published estimates. They match the
// blog guide /blog/what-size-stabilizer-pakistan-home (1.5 ton AC ≈ 1,800 VA,
// fridge ≈ 400 VA, +25%) and the price page (10 kVA for a 6–8 kVA solar
// inverter, 15 kVA for a 10 kVA inverter). Have the Voltec engineers confirm any
// change before it ships — answer engines will quote these numbers verbatim.
// Only products we SELL TODAY may be recommended (no SCR / IGBT — coming soon).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * REVIEW GATE (Raheel, 2026-11-16: "build it so I can get it tested from my father").
 * false = pages are live at their URLs for testing but carry noindex, and are left
 * out of the sitemap, llms.txt and the price page. The engineers' checklist is at
 * /stabilizer-size/review. Flip to true only after the figures are signed off.
 */
export const SIZING_PUBLIC = false;

/** Robots meta for every sizing page while the review gate is closed. */
export const SIZING_ROBOTS = SIZING_PUBLIC ? undefined : { index: false, follow: false };

export const MARGIN = 0.25;
/** VA per battery for a home UPS's charger, when the UPS is fed by the stabilizer. */
export const UPS_CHARGE_VA_PER_BATTERY = 150;
/** Power factor used to turn plain watts into VA. */
export const POWER_FACTOR = 0.8;

export type Phase = "single" | "three";

export type ApplianceKey =
  | "ac1"
  | "ac15"
  | "ac2"
  | "fridge"
  | "freezer"
  | "fans"
  | "lights"
  | "tv"
  | "pc"
  | "washer"
  | "motor"
  | "iron"
  | "microwave"
  | "geyser"
  | "dispenser";

export type Appliance = { key: ApplianceKey; label: string; one: string; va: number; group: "ac" | "home" };

/** Typical running load of each appliance in a Pakistani home, in VA. */
export const APPLIANCES: Appliance[] = [
  { key: "ac1", label: "1 ton AC", one: "1 ton AC", va: 1200, group: "ac" },
  { key: "ac15", label: "1.5 ton AC", one: "1.5 ton AC", va: 1800, group: "ac" },
  { key: "ac2", label: "2 ton AC", one: "2 ton AC", va: 2400, group: "ac" },
  { key: "fridge", label: "Refrigerators", one: "refrigerator", va: 400, group: "home" },
  { key: "freezer", label: "Deep freezers", one: "deep freezer", va: 500, group: "home" },
  { key: "fans", label: "Ceiling fans", one: "ceiling fan", va: 100, group: "home" },
  { key: "lights", label: "LED lights", one: "LED light", va: 25, group: "home" },
  { key: "tv", label: "TVs", one: "TV", va: 150, group: "home" },
  { key: "pc", label: "Computers", one: "computer", va: 250, group: "home" },
  { key: "washer", label: "Washing machines", one: "washing machine", va: 500, group: "home" },
  { key: "motor", label: "Water motors (1 hp)", one: "1 hp water motor", va: 1000, group: "home" },
  { key: "iron", label: "Irons", one: "iron", va: 1000, group: "home" },
  { key: "microwave", label: "Microwaves", one: "microwave", va: 1200, group: "home" },
  { key: "geyser", label: "Electric geysers / heaters", one: "electric geyser", va: 2000, group: "home" },
  { key: "dispenser", label: "Water dispensers", one: "water dispenser", va: 500, group: "home" },
];

export type SizingInput = Record<ApplianceKey, number> & {
  /** Watts of anything not in the list (converted to VA at PF 0.8). */
  extraW: number;
  /** Rated kVA of a solar / hybrid inverter the stabilizer will feed (0 = none). */
  solarKva: number;
  /** Batteries on a home UPS the stabilizer will feed (0 = none). */
  upsBatteries: number;
  /** Lowest voltage the customer sees at home (0 = unknown). */
  minVoltage: number;
  phase: Phase;
};

export const EMPTY_INPUT: SizingInput = {
  ...(Object.fromEntries(APPLIANCES.map((a) => [a.key, 0])) as Record<ApplianceKey, number>),
  extraW: 0,
  solarKva: 0,
  upsBatteries: 0,
  minVoltage: 0,
  phase: "single",
};

export type ModelPick = {
  id: string;
  name: string;
  kva: number;
  url: string;
  path: string;
  why: string;
};

export type SizingLine = { label: string; qty: number; vaEach: number; va: number };

export type SizingResult = {
  input: SizingInput;
  hasLoad: boolean;
  lines: SizingLine[];
  runningVA: number;
  marginPct: number;
  requiredVA: number;
  requiredKva: number;
  basis: "appliances" | "solar_inverter";
  recommended: ModelPick | null;
  alternatives: ModelPick[];
  inputRange: string;
  notes: string[];
  /** One plain sentence an answer engine can quote. */
  summary: string;
  calculatorUrl: string;
  whatsappUrl: string;
};

// The models we stock today, smallest first. Single-phase servo, then the
// three-phase choices (servo 20/30 kVA can be built 3-phase; SJW for 50 kVA+).
const SINGLE_PHASE: { id: string; kva: number }[] = [
  { id: "vt-svc-1k", kva: 1 },
  { id: "vt-svc-3k", kva: 3 },
  { id: "vt-svc-5k", kva: 5 },
  { id: "vt-svc-7k", kva: 7 },
  { id: "vt-svc-10k", kva: 10 },
  { id: "vt-svc-15k", kva: 15 },
  { id: "vt-svc-20k", kva: 20 },
  { id: "vt-svc-30k", kva: 30 },
];
const THREE_PHASE: { id: string; kva: number }[] = [
  { id: "vt-svc-20k", kva: 20 },
  { id: "vt-svc-30k", kva: 30 },
  { id: "vt-ind-50k", kva: 50 },
  { id: "vt-ind-100k", kva: 100 },
  { id: "vt-ind-200k", kva: 200 },
  { id: "vt-ind-500k", kva: 500 },
];

/** Plain-language method, shown on every page and in the API/llms.txt. */
export const METHOD: string[] = [
  "List what runs at the same time on a hot evening, and add up its running load in VA (1.5 ton AC ≈ 1,800 VA, fridge ≈ 400 VA, fan ≈ 100 VA, LED light ≈ 25 VA). For plain watts, divide by 0.8.",
  `If a home UPS is fed through the stabilizer, add about ${UPS_CHARGE_VA_PER_BATTERY} VA per battery for its charger.`,
  `Add ${MARGIN * 100}% for the start-up surge of AC and fridge compressors.`,
  `For a solar or hybrid inverter, size to the inverter instead: inverter kVA + ${MARGIN * 100}% (10 kVA servo for a 6–8 kVA inverter, 15 kVA for a 10 kVA inverter).`,
  "Pick the smallest model that is at least that big, then choose the input range by the lowest voltage you see: standard servo works from 150V, low-voltage versions from 100V, and the 30 kVA ultra-low-voltage servo from 60V.",
];

function pick(id: string, why: string): ModelPick | null {
  const p = getProduct(id);
  if (!p) return null;
  const kva = Number((p.name.match(/(\d+)\s*kVA/i) || [])[1] || 0);
  const path = `/products/${id}`;
  return { id, name: p.name, kva, url: absUrl(path), path, why };
}

const clampInt = (v: unknown, max = 99) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
};

/** URL query keys → input. Unknown or bad values become 0. */
export function parseSizingParams(sp: Record<string, string | string[] | undefined>): SizingInput {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const out: SizingInput = { ...EMPTY_INPUT };
  for (const a of APPLIANCES) out[a.key] = clampInt(get(a.key));
  out.extraW = clampInt(get("extra_w"), 200000);
  const solar = Number(get("solar_kva"));
  out.solarKva = Number.isFinite(solar) && solar > 0 ? Math.min(Math.round(solar * 10) / 10, 500) : 0;
  out.upsBatteries = clampInt(get("ups_batt"), 16);
  out.minVoltage = clampInt(get("min_v"), 260);
  out.phase = get("phase") === "three" ? "three" : "single";
  return out;
}

/** Input → the shortest query string that reproduces it. */
export function toQuery(input: Partial<SizingInput>): string {
  const q = new URLSearchParams();
  for (const a of APPLIANCES) if (input[a.key]) q.set(a.key, String(input[a.key]));
  if (input.extraW) q.set("extra_w", String(input.extraW));
  if (input.solarKva) q.set("solar_kva", String(input.solarKva));
  if (input.upsBatteries) q.set("ups_batt", String(input.upsBatteries));
  if (input.minVoltage) q.set("min_v", String(input.minVoltage));
  if (input.phase === "three") q.set("phase", "three");
  return q.toString();
}

function loadSentence(input: SizingInput): string {
  const parts: string[] = [];
  for (const a of APPLIANCES) {
    const n = input[a.key];
    if (n) parts.push(`${n} × ${a.one}`);
  }
  if (input.extraW) parts.push(`${input.extraW} W other load`);
  if (input.upsBatteries) parts.push(`UPS with ${input.upsBatteries} batter${input.upsBatteries === 1 ? "y" : "ies"}`);
  if (input.solarKva) parts.push(`a solar inverter of ${input.solarKva} kVA`);
  return parts.join(", ");
}

export function sizeStabilizer(partial: Partial<SizingInput>): SizingResult {
  const input: SizingInput = { ...EMPTY_INPUT, ...partial };
  const lines: SizingLine[] = [];
  for (const a of APPLIANCES) {
    const qty = input[a.key];
    if (qty) lines.push({ label: a.label, qty, vaEach: a.va, va: qty * a.va });
  }
  if (input.extraW) {
    const va = Math.round(input.extraW / POWER_FACTOR);
    lines.push({ label: "Other load (watts ÷ 0.8)", qty: 1, vaEach: va, va });
  }
  if (input.upsBatteries) {
    lines.push({
      label: "UPS charger",
      qty: input.upsBatteries,
      vaEach: UPS_CHARGE_VA_PER_BATTERY,
      va: input.upsBatteries * UPS_CHARGE_VA_PER_BATTERY,
    });
  }

  const runningVA = lines.reduce((s, l) => s + l.va, 0);
  const applianceVA = Math.round(runningVA * (1 + MARGIN));
  const solarVA = Math.round(input.solarKva * 1000 * (1 + MARGIN));
  const basis: SizingResult["basis"] = solarVA > applianceVA ? "solar_inverter" : "appliances";
  const requiredVA = Math.max(applianceVA, solarVA);
  const requiredKva = Math.round(requiredVA / 100) / 10;
  const hasLoad = requiredVA > 0;

  const notes: string[] = [];
  const alternatives: ModelPick[] = [];
  let recommended: ModelPick | null = null;
  const v = input.minVoltage;

  // Only an AC, or only a fridge/freezer → the Voltec-made AVR A-series is the
  // natural fit (it is what the price page and llms.txt already recommend).
  const acCount = input.ac1 + input.ac15 + input.ac2;
  const otherLoad =
    APPLIANCES.filter((a) => a.group === "home").reduce((s, a) => s + input[a.key], 0) +
    input.extraW + input.solarKva + input.upsBatteries;
  const onlyOneAc = acCount === 1 && otherLoad === 0;
  const onlyFridge = acCount === 0 && input.fridge + input.freezer === 1 && otherLoad === input.fridge + input.freezer;

  const ladder = input.phase === "three" ? THREE_PHASE : SINGLE_PHASE;
  const idx = ladder.findIndex((m) => m.kva * 1000 >= requiredVA);
  const servo = idx >= 0 ? ladder[idx] : null;
  const nextUp = idx >= 0 ? ladder[idx + 1] : undefined;

  if (!hasLoad) {
    // Nothing entered — the page shows the form only.
  } else if (input.phase === "single" && v > 0 && v < 100) {
    recommended = pick(
      "vt-svc-30k-60v",
      "Your voltage falls below 100V. This is the only Voltec servo that works from 60V (single-phase, 30 kVA).",
    );
    if (requiredVA < 15000)
      notes.push("It is much bigger than your load, but standard units switch off below 100V. Also report the low voltage to your electricity company — the transformer or line may be overloaded.");
  } else if (onlyOneAc && input.phase === "single") {
    const avr = v >= 150 || v === 0 ? "vt-avr-a100-r2" : v >= 120 ? "vt-avr-a100-r3" : "vt-avr-a100-r4";
    const from = avr.endsWith("r2") ? "150V" : avr.endsWith("r3") ? "120V" : "100V";
    recommended = pick(avr, `Built for one 1–2 ton AC (inverter or normal). 10,000 W, 100% copper, works from ${from}.`);
    if (servo) {
      const alt = pick(servo.id, "A servo for the same AC if you prefer ±1% output, or plan to add more load later.");
      if (alt) alternatives.push(alt);
    }
  } else if (onlyFridge && input.phase === "single") {
    recommended = pick("vt-avr-a25", "Made for one refrigerator or deep freezer. 2,500 W, with low-voltage options down to 70V.");
    const alt = pick("vt-svc-1k", "A 1 kVA servo if you want ±1% output for the fridge plus a TV or router.");
    if (alt) alternatives.push(alt);
  } else if (servo) {
    const label = input.phase === "three" ? "three-phase" : "single-phase";
    recommended = pick(servo.id, `The smallest ${label} Voltec model that covers ${requiredKva} kVA.`);
    if (nextUp) {
      const alt = pick(nextUp.id, "One size up: more room if you add an AC or run everything at once.");
      if (alt) alternatives.push(alt);
    }
  } else {
    notes.push(
      input.phase === "single"
        ? "This load is above 30 kVA, the largest single-phase unit. Use a three-phase stabilizer, or send your load list on WhatsApp and we will size it."
        : "This load is above 500 kVA. Larger three-phase systems are built to order — send your load list on WhatsApp.",
    );
  }

  // Input range by the lowest voltage the customer sees.
  let inputRange: string;
  if (input.phase === "three") {
    inputRange = "150–260V per phase (260–450V three-phase in), 220V ±2.5% out";
    if (v > 0 && v < 150) notes.push("Your voltage is below what a standard three-phase unit accepts per phase. Send your readings on WhatsApp — a wider range is built to order.");
  } else if (recommended?.id === "vt-svc-30k-60v") {
    inputRange = "60–250V in, 220V ±3% out";
  } else if (recommended?.id.startsWith("vt-avr-a100")) {
    inputRange = recommended.id.endsWith("r2") ? "150–270V in" : recommended.id.endsWith("r3") ? "120–270V in" : "100–270V in";
  } else if (recommended?.id === "vt-avr-a25") {
    inputRange = v >= 150 || v === 0 ? "150V version" : v >= 120 ? "120V version" : v >= 100 ? "100V version" : "70V version";
  } else if (v === 0 || v >= 150) {
    inputRange = "150–270V in, 220V ±1% out (standard)";
    if (v === 0) notes.push("Tell us the lowest voltage you see in the evening. If it drops below 150V, order the low-voltage version.");
  } else {
    inputRange = "Low-voltage version, from 100V in, 220V ±1% out";
    notes.push("Your voltage drops below 150V, so order the low-voltage version. Say your lowest reading when you order.");
    if (recommended && recommended.kva < 10 && requiredVA <= 10000) {
      const ten = pick("vt-svc-10k", "Its input range is chosen when you order, from 100V up to 280V.");
      if (ten && !alternatives.some((a) => a.id === ten.id)) alternatives.push(ten);
    }
  }

  if (input.upsBatteries)
    notes.push("Put the stabilizer before the UPS, so the UPS and its charger also get steady 220V. The fans and lights the UPS runs are already counted above.");
  if (basis === "solar_inverter")
    notes.push("Sized to the solar inverter, because all of your house load passes through it. First set the inverter to its wide input range; the stabilizer goes on the inverter's AC input.");

  const load = loadSentence(input);
  const how =
    basis === "solar_inverter"
      ? `the inverter's ${input.solarKva} kVA + ${MARGIN * 100}%`
      : `running load ${runningVA.toLocaleString("en-US")} VA + ${MARGIN * 100}%`;
  const summary = !hasLoad
    ? "Enter your appliances to get a size."
    : recommended
    ? `For ${load}, you need about ${requiredKva} kVA (${how}). Voltec recommends the ${recommended.name}.`
    : `For ${load}, you need about ${requiredKva} kVA (${how}). Send your load list on WhatsApp and Voltec will size it.`;

  const q = toQuery(input);
  const calculatorUrl = absUrl(`/stabilizer-size-calculator${q ? `?${q}` : ""}`);
  const message = hasLoad
    ? `Hi Voltec! Your size calculator recommends ${recommended ? recommended.name : `about ${requiredKva} kVA`} for my load: ${load}.${v ? ` Lowest voltage: ${v}V.` : ""} City: ___. Please send the price.`
    : "Hi Voltec! Please help me choose the right stabilizer size. My appliances: ___ City: ___";

  return {
    input,
    hasLoad,
    lines,
    runningVA,
    marginPct: MARGIN * 100,
    requiredVA,
    requiredKva,
    basis,
    recommended,
    alternatives,
    inputRange,
    notes,
    summary,
    calculatorUrl,
    whatsappUrl: whatsappLink(undefined, message),
  };
}

/** The WhatsApp text alone (for components that build their own link). */
export function whatsappMessage(r: SizingResult): string {
  return decodeURIComponent(r.whatsappUrl.split("?text=")[1] || "");
}
