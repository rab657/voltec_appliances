"use client";
import { whatsappLink } from "@/lib/products";
import { WhatsAppIcon } from "./icons";
import { track } from "@/lib/analytics";

export default function WhatsAppButton({
  productName,
  variant = "default",
  children,
  className = "",
}: {
  productName?: string;
  variant?: "default" | "light";
  children?: React.ReactNode;
  className?: string;
}) {
  const cls = variant === "light" ? "btn-wa-light" : "btn-wa";
  const inner = children || (productName ? "WhatsApp to inquire" : "WhatsApp us");
  return (
    <a
      href={whatsappLink(productName)}
      target="_blank"
      rel="noopener"
      className={`btn ${cls} ${className}`}
      onClick={() =>
        track("whatsapp_click", { product: productName || "general" })
      }
    >
      <WhatsAppIcon /> <span>{inner}</span>
    </a>
  );
}
