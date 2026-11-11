// Pre-order options for lines that are announced but not in stock yet.
// Shared by the form (components/PreorderForm.tsx) and the API route that
// validates and stores a pre-order (app/api/preorder/route.ts).
//
// Owner, 2026-11-11: the solid-state stabilizers are coming soon — the SCR range
// arrives first, IGBT follows. Until they land we take pre-orders to learn who
// wants what: range, size, quantity, kind of buyer, city.
//
// Sizes are the data-sheet line-ups (see lib/products.ts). No prices: they are
// confirmed when the shipment lands.

export const PREORDER_RANGES = [
  {
    id: "scr",
    label: "SCR (thyristor)",
    note: "Arriving first",
    sizes: ["1 kVA", "2 kVA", "3 kVA", "5 kVA", "10 kVA"],
  },
  {
    id: "igbt",
    label: "IGBT (inverter)",
    note: "Follows the SCR range",
    sizes: ["550 VA", "2 kVA", "5 kVA", "10 kVA", "15 kVA", "20 kVA"],
  },
  {
    id: "unsure",
    label: "Not sure yet",
    note: "We will advise",
    sizes: [] as string[],
  },
] as const;

export type PreorderRangeId = (typeof PREORDER_RANGES)[number]["id"];

export const PREORDER_SIZE_UNSURE = "Not sure — size it for me";

export const PREORDER_BUYER_TYPES = [
  "Home",
  "Shop or office",
  "Clinic, lab or hospital",
  "Factory or workshop",
  "Dealer or reseller",
  "Installer or contractor",
] as const;

export function preorderRange(id: string) {
  return PREORDER_RANGES.find((r) => r.id === id);
}

/** True when `size` is a real option for `rangeId` (or the "size it for me" choice). */
export function isValidPreorderSize(rangeId: string, size: string): boolean {
  if (size === PREORDER_SIZE_UNSURE) return true;
  const r = preorderRange(rangeId);
  return !!r && (r.sizes as readonly string[]).includes(size);
}
