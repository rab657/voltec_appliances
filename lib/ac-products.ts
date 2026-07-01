// AC stabilizer line — the buyable products (direct e-commerce, retail).
// Prices are in PKR. Shared by the /ac page and /checkout so price + model
// data has a single source of truth. The order API re-derives price from here
// server-side (never trusts a client-sent price).

export type AcModel = {
  code: string;        // R2 / R3 / R4
  name: string;        // display + order line name
  price: number;       // PKR
  fromV: string;       // low-voltage floor
  fits: string;
  image: string;      // studio product photo (per-variant)
  badge?: string;
  popular?: boolean;
};

export const AC_MODELS: AcModel[] = [
  { code: "R2", name: "Voltec R2 — AC Stabilizer", price: 24000, fromV: "150V", fits: "Inverter AC · 1 / 1.5 ton", image: "/assets/r2_voltec.webp", badge: "Lighter sag" },
  { code: "R3", name: "Voltec R3 — AC Stabilizer", price: 29000, fromV: "120V", fits: "Inverter & Normal AC · 1 / 1.5 ton", image: "/assets/r3_voltec.webp", badge: "Most popular", popular: true },
  { code: "R4", name: "Voltec R4 — AC Stabilizer", price: 32000, fromV: "100V", fits: "Inverter & Normal AC · 1 / 1.5 ton", image: "/assets/r4_voltec.webp", badge: "Severe low-voltage" },
];

export function acModel(code: string): AcModel | undefined {
  return AC_MODELS.find((m) => m.code === code);
}

export function fmtPKR(n: number): string {
  return "Rs " + n.toLocaleString("en-PK");
}
