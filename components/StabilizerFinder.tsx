"use client";
import { useState } from "react";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

// Solar funnel step: customer picks their inverter size, we open WhatsApp with a
// dynamic, pre-filled message. Fires a Lead event (with the kVA) for ad measurement.
const KVA = ["3", "5", "6", "8", "10", "12", "15", "20+"];

export default function StabilizerFinder({
  label = "Get my stabilizer now",
  block = false,
}: {
  label?: string;
  block?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [kva, setKva] = useState<string | null>(null);

  const send = () => {
    const sized = kva && kva !== "?";
    const msg = sized
      ? `Assalam o Alaikum Voltec! Mera solar inverter ${kva} kVA ka hai aur high voltage par trip karta hai. Mujhe SVC servo stabilizer chahiye — please price bata dein.`
      : `Assalam o Alaikum Voltec! Mera solar inverter high voltage par trip karta hai. Mujhe SVC servo stabilizer chahiye — please price bata dein.`;
    track("lead", { inverter_kva: kva || "unspecified", from: "solar_finder" });
    window.open(`https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-wa"
        style={block ? { display: "inline-flex" } : undefined}
        onClick={() => {
          setOpen(true);
          track("finder_open", { from: "solar" });
        }}
      >
        <WhatsAppIcon /> <span>{label}</span>
      </button>

      {open && (
        <div className="finder-scrim" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="finder-card" onClick={(e) => e.stopPropagation()}>
            <button className="finder-close" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
            <div className="finder-eyebrow">Step 1 of 1</div>
            <h3 className="finder-h">Aapka solar inverter kitnay kVA ka hai?</h3>
            <p className="finder-p">
              Select karein — hum aapko sahi SVC stabilizer ka price WhatsApp par bhej dein ge.
            </p>
            <div className="finder-chips">
              {KVA.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`finder-chip ${kva === k ? "is-active" : ""}`}
                  onClick={() => setKva(k)}
                >
                  {k} kVA
                </button>
              ))}
              <button
                type="button"
                className={`finder-chip is-muted ${kva === "?" ? "is-active" : ""}`}
                onClick={() => setKva("?")}
              >
                Pata nahi
              </button>
            </div>
            <button type="button" className="btn btn-wa finder-send" disabled={!kva} onClick={send}>
              <WhatsAppIcon /> <span>WhatsApp par price lein</span>
            </button>
            <div className="finder-note">High voltage par bhi inverter chalta rahe · Voltec since 1995</div>
          </div>
        </div>
      )}
    </>
  );
}
