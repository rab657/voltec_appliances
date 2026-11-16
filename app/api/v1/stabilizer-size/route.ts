import { NextResponse, after, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/analytics-server";
import { SITE, absUrl } from "@/lib/site";
import { APPLIANCES, MARGIN, METHOD, POWER_FACTOR, UPS_CHARGE_VA_PER_BATTERY, parseSizingParams, sizeStabilizer } from "@/lib/sizing";

export const runtime = "nodejs";

// Public, read-only JSON version of the stabilizer size calculator, for AI
// assistants, agents and developers. Same engine as the page
// (lib/sizing.ts); described in /openapi.json and listed in llms.txt.
// robots.ts allows /api/v1/ while the rest of /api/ stays disallowed.
//
// Every call is logged to the first-party `events` table as `sizing_api`
// (with user agent + reverse-DNS org), so we can see whether ChatGPT,
// Perplexity, Claude etc. actually use it.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function GET(req: NextRequest) {
  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const r = sizeStabilizer(parseSizingParams(sp));

  after(() =>
    recordEvent(req, {
      event: "sizing_api",
      path: req.nextUrl.pathname,
      ref: req.headers.get("referer") || "",
      params: { kva: r.requiredKva, model: r.recommended?.id || "none", basis: r.basis },
    }),
  );

  const body = {
    ok: true,
    provider: { name: SITE.name, url: absUrl("/"), whatsapp: SITE.phoneDisplay, established: SITE.established },
    has_load: r.hasLoad,
    ...(r.hasLoad
      ? {
          answer: r.summary,
          required_kva: r.requiredKva,
          required_va: r.requiredVA,
          running_va: r.runningVA,
          margin_pct: r.marginPct,
          sized_by: r.basis,
          phase: r.input.phase,
          recommended: r.recommended && {
            id: r.recommended.id,
            name: r.recommended.name,
            kva: r.recommended.kva,
            url: r.recommended.url,
            why: r.recommended.why,
          },
          input_range: r.inputRange,
          alternatives: r.alternatives.map((a) => ({ id: a.id, name: a.name, kva: a.kva, url: a.url, why: a.why })),
          notes: r.notes,
          breakdown: r.lines.map((l) => ({ load: l.label, qty: l.qty, va_each: l.vaEach, va: l.va })),
          price: "Quoted on WhatsApp the same day, in writing. Prices are not published.",
          warranty: "1 year on every Voltec stabilizer",
          calculator_url: r.calculatorUrl,
          whatsapp_url: r.whatsappUrl,
        }
      : {
          error: "No load given. Pass appliance counts, solar_kva or extra_w as query parameters.",
          example: absUrl("/api/v1/stabilizer-size?ac15=2&fridge=1&fans=6&lights=12&min_v=140"),
        }),
    method: METHOD,
    reference: {
      appliance_va: Object.fromEntries(APPLIANCES.map((a) => [a.key, { label: a.label, va: a.va }])),
      margin_pct: MARGIN * 100,
      power_factor_for_watts: POWER_FACTOR,
      ups_charger_va_per_battery: UPS_CHARGE_VA_PER_BATTERY,
      parameters: {
        "<appliance key>": "count of that appliance running at the same time (0–99)",
        extra_w: "watts of any other load",
        ups_batt: "batteries on a home UPS fed by the stabilizer",
        solar_kva: "rated kVA/kW of a solar or hybrid inverter fed by the stabilizer",
        min_v: "lowest mains voltage seen (V); decides the input range",
        phase: "'three' for a three-phase supply; default single",
      },
      note: "Typical figures for Pakistani homes. Voltec confirms the final size on WhatsApp.",
    },
  };

  return NextResponse.json(body, {
    status: r.hasLoad ? 200 : 400,
    headers: { ...CORS, "Cache-Control": "public, max-age=3600" },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
