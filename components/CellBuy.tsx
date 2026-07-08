"use client";
import { useState } from "react";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

// Carton-based buy block for a priced cell (e.g. EVE LF100LA). Cells ship in
// cartons, so quantity is locked to whole cartons. Opens a pre-filled WhatsApp
// order and fires `lead`. Sits in the cell masthead under the spec tiles.
function fmt(n: number) {
  return "Rs " + n.toLocaleString("en-PK");
}

export default function CellBuy({ price, cartonSize, name }: { price: number; cartonSize: number; name: string }) {
  const [qty, setQty] = useState(cartonSize);
  const cartons = qty / cartonSize;
  const total = qty * price;

  const order = () => {
    const msg =
      `Hi Voltec! I'd like to order ${name} (LiFePO4 lithium cell).\n\n` +
      `Quantity: ${qty} cells (${cartons} carton${cartons > 1 ? "s" : ""} of ${cartonSize})\n` +
      `At ${fmt(price)}/cell = ${fmt(total)} (before delivery).\n\n` +
      `Please confirm stock, packing and delivery to my city.`;
    track("lead", { product: name, channel: "whatsapp", qty, cartons, value: total, from: "cell_page" });
    window.open(`https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <div className="cellpg-buy">
      <div className="cell-price">
        <span className="cell-price-v">{fmt(price)}</span>
        <span className="cell-price-u">per cell · sold by the carton ({cartonSize} cells) · min 1 carton</span>
      </div>
      <div className="cell-qtyrow">
        <span className="cell-qty-label">Cartons</span>
        <div className="cell-chips">
          {[1, 2, 4].map((c) => (
            <button key={c} type="button" className={`cell-chip ${cartons === c ? "is-active" : ""}`} onClick={() => setQty(c * cartonSize)}>
              {c}
            </button>
          ))}
        </div>
        <div className="cell-stepper">
          <button type="button" onClick={() => setQty((q) => Math.max(cartonSize, q - cartonSize))} aria-label="Fewer cartons">−</button>
          <span>{cartons}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(cartonSize * 40, q + cartonSize))} aria-label="More cartons">+</button>
        </div>
      </div>
      <div className="cell-total">
        <span>{cartons} carton{cartons > 1 ? "s" : ""} · {qty} cells</span>
        <strong>{fmt(total)}</strong>
      </div>
      <button type="button" className="btn btn-wa cell-order" onClick={order}>
        <WhatsAppIcon /> <span>Order {cartons} carton{cartons > 1 ? "s" : ""} on WhatsApp</span>
      </button>
      <p className="cell-note">+ delivery — confirmed on WhatsApp. Bulk &amp; dealer pricing on larger orders.</p>
    </div>
  );
}
