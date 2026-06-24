import type { Product } from "./types";

// Short column/chip label for a product (e.g. "10kVA", "280Ah", "16S", "30A").
// Pure + client-safe so both client (configurator) and server (spec table) can
// use it without pulling server-only modules into the client bundle.
export function variantLabel(p: Product): string {
  const kva = p.name.match(/(\d+)\s*kVA/i);
  if (kva) return kva[1] + "kVA";
  const cap = (p.specs.find((s) => /capacity/i.test(s[0])) || [])[1];
  const ah = cap && cap.match(/(\d+)\s*Ah/i);
  if (ah) return ah[1] + "Ah";
  const cfg = (p.specs.find((s) => /configuration/i.test(s[0])) || [])[1];
  if (cfg) {
    const m = cfg.match(/(\d+S)/i);
    if (m) return m[1].toUpperCase();
  }
  const amp = p.name.match(/(\d+)\s*A\b/);
  if (amp) return amp[1] + "A";
  const tail = p.name.split("—").pop()!.trim();
  return tail.length <= 12 ? tail : p.tech || "Spec";
}
