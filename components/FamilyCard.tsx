"use client";
import Link from "next/link";
import { membersOf, type FamilyMeta } from "@/lib/showcase-data";
import { useI18n } from "./I18nProvider";
import Placeholder from "./Placeholder";

// Catalog card for a stabilizer family — links to the range page (model picker),
// not a per-model page.
export default function FamilyCard({
  family,
  count,
  soon: soonProp,
}: {
  family: FamilyMeta;
  /** Visible model count (server-computed, override-aware). Falls back to code. */
  count?: number;
  soon?: boolean;
}) {
  const { t, lc } = useI18n();
  const members = membersOf(family);
  const n = count ?? members.length;
  const soon = soonProp ?? (members.length > 0 && members.every((p) => p.status === "upcoming"));
  const href = `/showcase/${family.slug}`;
  return (
    <div className="ec-card" data-cat={family.categoryId}>
      <Link href={href} className="ec-thumb">
        <Placeholder label="" image={family.image} contain={false} />
        {family.tag && <span className="ec-soon" style={{ background: "var(--accent)" }}>{lc(family.tag)}</span>}
      </Link>
      <div className="ec-body">
        <div className="ec-cat">{lc(family.category)}</div>
        <Link href={href} className="ec-name">
          {lc(family.name)}
        </Link>
        <div className="ec-spec">
          {n} {t("fc.models")} · {t("fc.pickcap")}
        </div>
        <div className="ec-foot">
          <span className={`ec-stock ${soon ? "soon" : "in"}`}>{soon ? t("ec.preorder") : t("ec.instock")}</span>
          <Link href={href} className="ec-inquire">
            {t("cta.viewrange")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
