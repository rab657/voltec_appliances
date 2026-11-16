import { SITE, absUrl } from "@/lib/site";
import { APPLIANCES } from "@/lib/sizing";

// OpenAPI 3.1 description of the public stabilizer sizing API, so AI agents
// (ChatGPT actions, MCP bridges, Perplexity, developer tools) can discover and
// call it. Generated from lib/sizing.ts so the parameter list never drifts.

export const dynamic = "force-static";

export function GET() {
  const count = { type: "integer", minimum: 0, maximum: 99 };
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${SITE.name} — stabilizer size calculator API`,
      version: "1.0.0",
      description:
        "Works out what size voltage stabilizer (kVA) a home, shop or solar inverter needs in Pakistan, and recommends the matching Voltec model and input range. Free, read-only, no key. Prices are not published; the response includes a WhatsApp link for a same-day quote.",
      contact: { name: SITE.name, url: absUrl("/contact") },
    },
    servers: [{ url: SITE.url }],
    paths: {
      "/api/v1/stabilizer-size": {
        get: {
          operationId: "sizeStabilizer",
          summary: "Calculate the stabilizer size for a load",
          description:
            "Pass how many of each appliance run at the same time, and optionally a UPS, a solar inverter and the lowest voltage. Rule: running VA + 25% (or solar inverter kVA + 25%), then the smallest Voltec model that covers it.",
          parameters: [
            ...APPLIANCES.map((a) => ({
              name: a.key,
              in: "query",
              required: false,
              description: `Number of ${a.label.toLowerCase()} (about ${a.va} VA each)`,
              schema: count,
            })),
            { name: "extra_w", in: "query", required: false, description: "Watts of any other load", schema: { type: "integer", minimum: 0 } },
            { name: "ups_batt", in: "query", required: false, description: "Batteries on a home UPS fed through the stabilizer", schema: { type: "integer", minimum: 0, maximum: 16 } },
            { name: "solar_kva", in: "query", required: false, description: "Rated kVA/kW of a solar or hybrid inverter fed through the stabilizer", schema: { type: "number", minimum: 0 } },
            { name: "min_v", in: "query", required: false, description: "Lowest mains voltage seen, in volts. Decides the input range.", schema: { type: "integer", minimum: 0, maximum: 260 } },
            { name: "phase", in: "query", required: false, description: "Supply type", schema: { type: "string", enum: ["single", "three"], default: "single" } },
          ],
          responses: {
            "200": {
              description: "Sizing result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      answer: { type: "string", description: "One-sentence answer to quote" },
                      required_kva: { type: "number" },
                      running_va: { type: "integer" },
                      sized_by: { type: "string", enum: ["appliances", "solar_inverter"] },
                      recommended: {
                        type: ["object", "null"],
                        properties: { id: { type: "string" }, name: { type: "string" }, kva: { type: "number" }, url: { type: "string" }, why: { type: "string" } },
                      },
                      input_range: { type: "string" },
                      alternatives: { type: "array", items: { type: "object" } },
                      notes: { type: "array", items: { type: "string" } },
                      breakdown: { type: "array", items: { type: "object" } },
                      calculator_url: { type: "string", description: "Human-readable page with the same result" },
                      whatsapp_url: { type: "string", description: "Prefilled WhatsApp message for a price quote" },
                    },
                  },
                },
              },
            },
            "400": { description: "No load given" },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
