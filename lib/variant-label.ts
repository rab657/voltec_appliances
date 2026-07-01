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
  // R-series AC-stabilizer variants (A-100 R2 / R3 / R4): chip by R-code + input range.
  const rcode = p.name.match(/\bR[2-9]\b/);
  if (rcode) {
    const withModel = p.name.match(/\b(A-\d{2,3})\s+(R[2-9])\b/);
    const label = withModel ? `${withModel[1]} ${withModel[2]}` : rcode[0];
    const input = (p.specs.find((s) => /input/i.test(s[0])) || [])[1] || "";
    const range = input.match(/(\d+)\s*V?\s*[–-]\s*(\d+)\s*V/);
    return range ? `${label} (${range[1]}–${range[2]}V)` : label;
  }
  // Model-code lines (Voltec A-25 / A-120SP, Wirell T73 / T90) chip by their code.
  const model = p.name.match(/\b(A-\d{2,3}\w*|T\d{2,3})\b/i);
  if (model) return model[1].toUpperCase();
  const amp = p.name.match(/(\d+)\s*A\b/);
  if (amp) return amp[1] + "A";
  const tail = p.name.split("—").pop()!.trim();
  return tail.length <= 12 ? tail : p.tech || "Spec";
}
