"use client";
import { useState } from "react";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

// EVE LF100LA lithium-cell buy panel + media gallery. Cells ship in cartons of
// 8, so we sell ONLY in whole cartons — quantity is locked to multiples of 8
// (min 1 carton). Rs 11,500/cell. Qty picker → pre-filled WhatsApp order (fires
// `lead`). Bulk cells need freight/packing confirmed, so the close is on WhatsApp.
const PRICE = 11500;
const CARTON = 8; // cells per carton — never sold loose / below one carton

type Media = { type: "img" | "video"; src: string; poster?: string; alt: string };
const MEDIA: Media[] = [
  { type: "img", src: "/assets/cells/cell-hero.webp", alt: "EVE LF100LA Grade-A 3.2V 100Ah lithium cell — back in stock at Voltec" },
  { type: "img", src: "/assets/cells/cell-1.webp", alt: "EVE LF100LA Grade-A LiFePO4 prismatic cell" },
  { type: "img", src: "/assets/cells/cell-2.webp", alt: "EVE LF100LA 3.2V 100Ah lithium cell pair" },
  { type: "video", src: "/assets/cells/cell-video-1.mp4", poster: "/assets/cells/cell-video-1-poster.webp", alt: "EVE lithium cells — close look" },
  { type: "img", src: "/assets/cells/cell-3.webp", alt: "Grade-A EVE cells, each laser-etched with a traceable QR code" },
  { type: "img", src: "/assets/cells/cell-4.webp", alt: "Voltec EVE lithium cells in stock, Lahore" },
  { type: "video", src: "/assets/cells/cell-video-2.mp4", poster: "/assets/cells/cell-video-2-poster.webp", alt: "EVE lithium cells — batch" },
];

function fmt(n: number) {
  return "Rs " + n.toLocaleString("en-PK");
}

export default function CellShowcase() {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(CARTON);
  const total = qty * PRICE;
  const cartons = qty / CARTON;
  const m = MEDIA[active];

  const order = () => {
    const cartonTxt = `${cartons} carton${cartons > 1 ? "s" : ""} of ${CARTON}`;
    const msg =
      `Hi Voltec! I'd like to order EVE LF100LA Grade-A lithium cells (3.2V 100Ah).\n\n` +
      `Quantity: ${qty} cells (${cartonTxt})\nAt ${fmt(PRICE)}/cell = ${fmt(total)} (before delivery).\n\n` +
      `Please confirm stock, packing and delivery to my city.`;
    track("lead", { product: "EVE LF100LA lithium cell", channel: "whatsapp", qty, cartons, value: total, from: "cells" });
    window.open(`https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <div className="cell-buy">
      {/* Gallery */}
      <div className="cell-gallery">
        <div className="cell-stage">
          {m.type === "img" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.src} alt={m.alt} />
          ) : (
            <video src={m.src} poster={m.poster} controls playsInline preload="none" />
          )}
        </div>
        <div className="cell-thumbs">
          {MEDIA.map((x, i) => (
            <button
              key={x.src}
              type="button"
              className={`cell-thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={x.alt}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.type === "img" ? x.src : x.poster} alt="" />
              {x.type === "video" && <span className="cell-thumb-play" aria-hidden="true">▶</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Buy panel */}
      <div className="cell-panel">
        <div className="cell-brandrow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="cell-eve">EVE</span>
          <span className="cell-grade">Grade&nbsp;A</span>
        </div>
        <h1 className="cell-title">LF100LA Lithium Cell</h1>
        <p className="cell-sub">Lithium iron phosphate (LiFePO4) · 3.2V · 100Ah (320Wh) · 5000+ cycles</p>

        <ul className="cell-feats">
          <li>✓ Brand new, Grade-A — direct from EVE Energy</li>
          <li>✓ Lithium iron phosphate (LiFePO4) — safe, long-life chemistry</li>
          <li>✓ Build lithium batteries for solar &amp; UPS — 8 cells = 24V, 16 = 48V</li>
          <li>✓ QR-traceable, full test report — genuine &amp; verifiable</li>
        </ul>

        <div className="cell-price">
          <span className="cell-price-v">{fmt(PRICE)}</span>
          <span className="cell-price-u">per cell · sold by the carton ({CARTON} cells) · min 1 carton</span>
        </div>

        <div className="cell-qtyrow">
          <span className="cell-qty-label">Cartons</span>
          <div className="cell-chips">
            {[1, 2, 4].map((c) => (
              <button key={c} type="button" className={`cell-chip ${cartons === c ? "is-active" : ""}`} onClick={() => setQty(c * CARTON)}>
                {c}
              </button>
            ))}
          </div>
          <div className="cell-stepper">
            <button type="button" onClick={() => setQty((q) => Math.max(CARTON, q - CARTON))} aria-label="Fewer cartons">−</button>
            <span>{cartons}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(CARTON * 30, q + CARTON))} aria-label="More cartons">+</button>
          </div>
        </div>

        <div className="cell-total">
          <span>{cartons} carton{cartons > 1 ? "s" : ""} · {qty} cells</span>
          <strong>{fmt(total)}</strong>
        </div>
        <p className="cell-note">+ delivery — confirmed on WhatsApp. Bulk pricing on larger orders.</p>

        <button type="button" className="btn btn-wa cell-order" onClick={order}>
          <WhatsAppIcon /> <span>Order {cartons} carton{cartons > 1 ? "s" : ""} on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
