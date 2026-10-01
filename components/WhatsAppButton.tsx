"use client";
import { whatsappLink } from "@/lib/products";
import { WhatsAppIcon } from "./icons";
import { track } from "@/lib/analytics";

export default function WhatsAppButton({
  productName,
  variant = "default",
  children,
  className = "",
  lead = false,
  message,
  from,
}: {
  productName?: string;
  variant?: "default" | "light";
  children?: React.ReactNode;
  className?: string;
  /** On lead-gen landing pages, a WhatsApp inquiry IS a lead — fire `lead`
   *  (Pixel Lead) instead of `whatsapp_click` (Pixel Contact) so ad
   *  optimization + reporting see it as a conversion. */
  lead?: boolean;
  /** Overrides the pre-filled WhatsApp text (e.g. the dealer inquiry). */
  message?: string;
  /** Where the tap came from, for funnel reporting. */
  from?: string;
}) {
  const cls = variant === "light" ? "btn-wa-light" : "btn-wa";
  const inner = children || (productName ? "WhatsApp to inquire" : "WhatsApp us");
  return (
    <a
      href={whatsappLink(productName, message)}
      target="_blank"
      rel="noopener"
      className={`btn ${cls} ${className}`}
      onClick={() =>
        track(lead ? "lead" : "whatsapp_click", {
          product: productName || "general",
          channel: "whatsapp",
          ...(from ? { from } : {}),
        })
      }
    >
      <WhatsAppIcon /> <span>{inner}</span>
    </a>
  );
}
