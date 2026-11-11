"use client";
import { track } from "@/lib/analytics";
import { SITE } from "@/lib/site";

// A compact "Inquire" link that opens WhatsApp with the model already named and
// fires `lead`, so every price inquiry is counted and tied to the page it came from.
export default function InquireLink({ model, from }: { model: string; from: string }) {
  const text = `Hi Voltec! Price chahiye: ${model}. Quantity: ___ City: ___`;
  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener"
      onClick={() => track("lead", { from, product: model, channel: "whatsapp" })}
      style={{ fontWeight: 700, whiteSpace: "nowrap" }}
    >
      Inquire <span aria-hidden="true">→</span>
    </a>
  );
}
