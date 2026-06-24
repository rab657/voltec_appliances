import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics-query";

export const dynamic = "force-dynamic";

function StatList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: "18px 20px", background: "var(--paper)" }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        {title}
      </div>
      {rows.length === 0 && <div style={{ color: "var(--ink-3)", fontSize: 13 }}>No data yet.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.label}
              </div>
              <div style={{ height: 4, marginTop: 4, borderRadius: 2, background: "var(--paper-3)" }}>
                <div style={{ height: 4, borderRadius: 2, width: `${(r.count / max) * 100}%`, background: "var(--accent)" }} />
              </div>
            </div>
            <div className="mono" style={{ fontSize: 13, color: "var(--ink-2)" }}>
              {r.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const s = await getAnalyticsSummary(30);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "-0.02em" }}>
          Living site
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/admin" className="nav-link">
            ← Editor
          </Link>
          <Link href="/" className="nav-link">
            Site ↗
          </Link>
        </div>
      </div>
      <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 32 }}>
        First-party visitor analytics from the last 30 days — page views, product interest, and
        where visitors come from (reverse-DNS organisation). Complements GA4 &amp; the Facebook
        Pixel with data you own.
      </p>

      {!s.configured ? (
        <div style={{ padding: "28px 24px", border: "1px solid var(--accent)", background: "var(--accent-soft)", borderRadius: 10 }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: "var(--accent-deep)" }}>
            Connect Supabase to activate
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
            Events are being captured but not stored yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run <code>supabase-schema.sql</code> in your
            project. The dashboard will populate automatically.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
            <div style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: "18px 20px", background: "var(--paper)" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Total events
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, marginTop: 4 }}>{s.total}</div>
            </div>
            {s.byEvent.slice(0, 3).map((e) => (
              <div key={e.name} style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: "18px 20px", background: "var(--paper)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {e.name}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, marginTop: 4 }}>{e.count}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
            <StatList title="Top pages" rows={s.topPaths.map((r) => ({ label: r.path || "—", count: r.count }))} />
            <StatList title="Product interest" rows={s.topProducts.map((r) => ({ label: r.name, count: r.count }))} />
            <StatList title="Where visitors come from (org)" rows={s.topOrgs.map((r) => ({ label: r.org, count: r.count }))} />
            <StatList title="Top referrers" rows={s.topReferrers.map((r) => ({ label: r.ref, count: r.count }))} />
          </div>

          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Recent activity
          </div>
          <div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden" }}>
            <table className="kv-table" style={{ width: "100%", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Time</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Event</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Path</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Org / host</th>
                </tr>
              </thead>
              <tbody>
                {s.recent.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--rule)" }}>
                    <td className="mono" style={{ padding: "8px 12px", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                      {new Date(r.created_at).toLocaleString("en-PK")}
                    </td>
                    <td style={{ padding: "8px 12px" }}>{r.event}</td>
                    <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.path}</td>
                    <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.org || r.hostname || r.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
