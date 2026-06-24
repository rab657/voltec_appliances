"use client";
import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const { t, lc } = useI18n();
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? posts : posts.filter((p) => p.category === filter);

  return (
    <>
      <div className="kb-list-head">
        <h2 dangerouslySetInnerHTML={{ __html: t("blog.list.t") }} />
        <div className="kb-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-chip ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c === "All" ? t("blog.all") : lc(c)}
            </button>
          ))}
        </div>
      </div>
      <div className="kb-rows">
        {shown.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="kb-row">
            <div className="kb-row-cat">{lc(p.category)}</div>
            <div className="kb-row-main">
              <h3>{lc(p.title)}</h3>
              <p>{lc(p.excerpt)}</p>
            </div>
            <div className="kb-row-meta">
              <span>{p.readTime} {t("blog.min")}</span>
              <span className="kb-row-arrow">→</span>
            </div>
          </Link>
        ))}
        {shown.length === 0 && (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--ink-3)",
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontStyle: "italic",
            }}
          >
            {t("blog.none")}
          </div>
        )}
      </div>
    </>
  );
}
