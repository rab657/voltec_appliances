"use client";
import { useState } from "react";
import Link from "next/link";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/icons";

// Guided "which stabilizer do I need?" selector. Mirrors how the sales team
// qualifies a buyer (what are you powering → capacity → grid voltage), routes to
// the right series, and hands WhatsApp a fully-contextualised opening message.

type Protect = "appliance" | "home" | "sensitive" | "factory";
type Volt = "vlow" | "low" | "normal" | "high" | "swing";

const PROTECT: { id: Protect; label: string; sub: string }[] = [
  { id: "appliance", label: "One appliance", sub: "A fridge, deep freezer or a single AC" },
  { id: "home", label: "A whole home or shop", sub: "Several ACs, fridge, electronics" },
  { id: "sensitive", label: "Sensitive / precision gear", sub: "Lab, medical, laser, CNC, servers" },
  { id: "factory", label: "A factory / 3-phase load", sub: "Mills, plants, commercial buildings" },
];
const CAPACITY = ["≤1 kVA", "2–3 kVA", "5 kVA", "10 kVA", "15 kVA", "20 kVA +", "Not sure"];
const VOLTAGE: { id: Volt; label: string }[] = [
  { id: "vlow", label: "Very low — below 150V" },
  { id: "low", label: "Low — 150 to 200V" },
  { id: "normal", label: "Normal — around 220V" },
  { id: "high", label: "High — 250 to 270V" },
  { id: "swing", label: "It swings a lot" },
];

const SERIES: Record<Protect, { name: string; slug: string; why: string }> = {
  appliance: {
    name: "AVR A-series",
    slug: "avr",
    why: "Plug-and-play protection for a single appliance, in 100% pure copper.",
  },
  home: {
    name: "Servo (SVC) stabilizer",
    slug: "svc",
    why: "Smooth, stepless ±1% correction sized for a whole home or shop — pure copper, wide input.",
  },
  sensitive: {
    name: "Inverter (IGBT) stabilizer",
    slug: "smart-inverter-voltage-stabilizer",
    why: "±1% accuracy, instant 0 ms correction and a clean pure sine — the only safe choice for precision equipment.",
  },
  factory: {
    name: "Three-phase industrial (SJW)",
    slug: "industrial",
    why: "Each phase corrected on its own, built to order from 100 kVA and up.",
  },
};

function voltageNote(v: Volt): string {
  switch (v) {
    case "vlow":
      return "Your voltage drops very low, so you need a model that works from as little as 75V (our A-120SP) and holds output through deep sags.";
    case "low":
      return "Evening voltage drops far at your site — a wide-input model will keep a steady 220V when the feeder collapses.";
    case "high":
      return "Your grid runs high (a common solar-export problem) — you need a wide-input model that holds 220V even at 250–300V.";
    case "swing":
      return "Your voltage swings a lot, so a wide-input model is essential — it holds a steady 220V across the full range.";
    default:
      return "Your voltage is in the normal band, so any model in the series will protect you well.";
  }
}

export default function StabilizerSelector() {
  const [protect, setProtect] = useState<Protect | null>(null);
  const [capacity, setCapacity] = useState<string | null>(null);
  const [voltage, setVoltage] = useState<Volt | null>(null);

  const done = protect && capacity && voltage;
  const rec = protect ? SERIES[protect] : null;
  const protectLabel = PROTECT.find((p) => p.id === protect)?.label ?? "";
  const voltageLabel = VOLTAGE.find((v) => v.id === voltage)?.label ?? "";

  const waMsg =
    `Hi Voltec! Help me pick the right stabilizer.\n` +
    `• Protecting: ${protectLabel}\n` +
    `• Capacity: ${capacity}\n` +
    `• Grid voltage: ${voltageLabel}\n` +
    `What do you recommend?`;
  const waLink = `https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(waMsg)}`;

  const Step = ({
    n,
    label,
    children,
  }: {
    n: number;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="sel-step">
      <div className="sel-step-label">
        <span className="sel-step-n">{n}</span>
        {label}
      </div>
      <div className="sel-opts">{children}</div>
    </div>
  );

  return (
    <div className="sel">
      <div className="sel-head">
        <div className="sel-eyebrow">Find your stabilizer</div>
        <h2>
          Not sure which one? <em>Answer 3 questions.</em>
        </h2>
        <p>The two things that decide it: how much you need to power, and what voltage you actually get.</p>
      </div>

      <Step n={1} label="What are you protecting?">
        {PROTECT.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`sel-opt is-rich ${protect === p.id ? "is-on" : ""}`}
            aria-pressed={protect === p.id}
            onClick={() => {
              setProtect(p.id);
              track("selector_answer", { step: "protect", value: p.id });
            }}
          >
            <span className="sel-opt-t">{p.label}</span>
            <span className="sel-opt-s">{p.sub}</span>
          </button>
        ))}
      </Step>

      <Step n={2} label="How much do you need to power?">
        {CAPACITY.map((c) => (
          <button
            key={c}
            type="button"
            className={`sel-opt ${capacity === c ? "is-on" : ""}`}
            aria-pressed={capacity === c}
            onClick={() => {
              setCapacity(c);
              track("selector_answer", { step: "capacity", value: c });
            }}
          >
            {c}
          </button>
        ))}
      </Step>

      <Step n={3} label="What voltage do you get from the grid?">
        {VOLTAGE.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`sel-opt ${voltage === v.id ? "is-on" : ""}`}
            aria-pressed={voltage === v.id}
            onClick={() => {
              setVoltage(v.id);
              track("selector_answer", { step: "voltage", value: v.id });
            }}
          >
            {v.label}
          </button>
        ))}
      </Step>

      {done && rec && (
        <div className="sel-rec">
          <div className="sel-rec-tag">Our recommendation</div>
          <h3>{rec.name}</h3>
          <p className="sel-rec-why">{rec.why}</p>
          <ul className="sel-rec-points">
            <li>
              <strong>Capacity:</strong>{" "}
              {capacity === "Not sure"
                ? "Send us your appliance list and we'll size it (we add headroom for start-up surge)."
                : `Around ${capacity} — we'll confirm the exact model and add headroom for start-up.`}
            </li>
            <li>
              <strong>Your voltage:</strong> {voltageNote(voltage!)}
            </li>
          </ul>
          <div className="sel-rec-cta">
            <a
              href={waLink}
              target="_blank"
              rel="noopener"
              className="btn btn-wa"
              onClick={() => track("whatsapp_click", { from: "selector", series: rec.slug })}
            >
              <WhatsAppIcon /> <span>Get my recommendation &amp; price</span>
            </a>
            <Link href={`/showcase/${rec.slug}`} className="btn btn-ghost">
              See the {rec.name} range →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
