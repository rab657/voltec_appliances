"use client";
import type { Product } from "@/lib/types";
import type { FamilyMeta } from "@/lib/showcase-data";
import { useI18n } from "@/components/I18nProvider";
import { variantLabel } from "@/lib/variant-label";
import { acModel } from "@/lib/ac-products";
import { SITE } from "@/lib/site";
import PdpShell, { type PdpModel, type PdpTrust } from "@/components/pdp/PdpShell";

const spec = (p: Product, re: RegExp) => (p.specs.find((s) => re.test(s[0])) || [])[1];

// Family masthead on the shared Alladin-style PDP shell. Shows the range's
// lead model; every model in the range is a LINK chip to its own
// /products/[id] page (no in-page model switching — user decision 2026-08-19).
export default function ProductConfigurator({
  family,
  members,
  valueProp,
}: {
  family: FamilyMeta;
  members: Product[];
  valueProp: string;
}) {
  const { t, lc } = useI18n();
  const isAvr = family.slug === "avr";

  // Lead model: AVR prefers the most-popular A-100 R3; otherwise the first
  // model that isn't a pre-order.
  const preferred = isAvr ? members.findIndex((p) => /\bR3\b/.test(p.name)) : -1;
  const firstNonUpcoming = Math.max(0, members.findIndex((p) => p.status !== "upcoming"));
  const p = members[preferred >= 0 ? preferred : firstNonUpcoming] || members[0];
  if (!p) return null;

  const rMatch = p.name.match(/\bR[2-9]\b/);
  const ac = rMatch ? acModel(rMatch[0]) : undefined;
  const price = p.price ?? ac?.price;
  const imgs = (p.images && p.images.length ? p.images : [p.image]).filter(Boolean);

  const model: PdpModel = {
    id: p.id,
    name: lc(p.name),
    waName: p.name,
    sku: p.id.toUpperCase(),
    type: lc(p.category),
    price,
    compareAt: p.compareAt,
    unitNote: price ? t("cfg.perunit") : undefined,
    media: imgs.map((src) => ({ type: "img" as const, src })),
    status: p.status,
    tech: p.tech,
    badge: p.badge,
    glance: [
      [t("cfg.bestfor"), lc(p.useFor || spec(p, /capacity/i) || "")],
      [t("cfg.input"), lc(spec(p, /input/i) || spec(p, /works from/i) || "")],
      [t("cfg.output"), lc(spec(p, /output/i) || "")],
      [t("cfg.efficiency"), lc(spec(p, /efficiency/i) || spec(p, /response|correction/i) || "")],
    ],
    buyHref: ac ? `/checkout?model=${ac.code}` : undefined,
    lead: false,
  };

  const trust: PdpTrust[] = isAvr
    ? [
        { icon: "shield", k: "pp.trust.wty1" },
        { icon: "store", k: "cfg.moq" },
        { icon: "truck", k: "pp.trust.deliv" },
        { icon: "bank", k: "pp.trust.pay" },
      ]
    : [
        { icon: "check", k: "pp.trust.cert" },
        { icon: "box", k: "pp.trust.custom" },
        { icon: "truck", k: "pp.trust.deliv" },
        { icon: "bank", k: "pp.trust.pay" },
      ];

  return (
    <PdpShell
      h1={lc(family.name)}
      lede={isAvr ? undefined : valueProp}
      model={model}
      badges={[
        ...(family.tag ? [family.tag] : []),
        t(family.originTagKey || "cfg.built"),
        `${members.length} ${t("cfg.models")}`,
      ]}
      familySlug={family.slug}
      trust={trust}
      phone={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
    />
  );
}
