"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  order_ref: string; created_at: string; model: string; product_name: string;
  qty: number; unit_price: number; total: number; customer_name: string;
  phone: string; address: string; city: string; status: string;
};

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  pending_payment: { label: "Pending", bg: "#FEF3C7", fg: "#92400E" },
  paid: { label: "Paid", bg: "#DBEAFE", fg: "#1E40AF" },
  shipped: { label: "Shipped", bg: "#D1FAE5", fg: "#065F46" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", fg: "#991B1B" },
};

function waLink(phone: string) {
  let d = (phone || "").replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  else if (!d.startsWith("92") && d.length === 10) d = "92" + d;
  return `https://wa.me/${d}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.status === 401) { setNeedLogin(true); return; }
    const d = await res.json();
    setOrders(d.orders || []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(ref: string, status: string) {
    setBusy(ref);
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref, status }) });
    setOrders((o) => (o ? o.map((x) => (x.order_ref === ref ? { ...x, status } : x)) : o));
    setBusy("");
  }

  const money = (n: number) => "Rs " + Number(n).toLocaleString("en-PK");

  if (needLogin) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", fontFamily: "system-ui" }}>
        <h1>Orders</h1>
        <p>Please <Link href="/admin/login" style={{ color: "#1E40AF" }}>log in</Link> to view orders.</p>
      </div>
    );
  }

  const pending = orders?.filter((o) => o.status === "pending_payment").length ?? 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui", color: "#1a1a1a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "#555", fontSize: 14 }}>← Admin</Link>
          <button onClick={load} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Refresh</button>
        </div>
      </div>
      <p style={{ color: "#666", marginTop: 0 }}>
        {orders == null ? "Loading…" : `${orders.length} orders · ${pending} awaiting payment`}
      </p>

      {orders != null && orders.length === 0 && <p style={{ color: "#888" }}>No orders yet.</p>}

      {orders != null && orders.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee", color: "#666" }}>
                <th style={{ padding: "10px 8px" }}>Order</th>
                <th style={{ padding: "10px 8px" }}>Customer</th>
                <th style={{ padding: "10px 8px" }}>Item</th>
                <th style={{ padding: "10px 8px" }}>Total</th>
                <th style={{ padding: "10px 8px" }}>Status</th>
                <th style={{ padding: "10px 8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = STATUS[o.status] || STATUS.pending_payment;
                return (
                  <tr key={o.order_ref} style={{ borderBottom: "1px solid #f0f0f0", verticalAlign: "top" }}>
                    <td style={{ padding: "12px 8px" }}>
                      <strong>{o.order_ref}</strong>
                      <div style={{ color: "#999", fontSize: 12 }}>{new Date(o.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</div>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {o.customer_name}
                      <div style={{ color: "#666", fontSize: 12.5 }}>
                        <a href={waLink(o.phone)} target="_blank" rel="noopener" style={{ color: "#1FA855" }}>{o.phone}</a> · {o.city}
                      </div>
                      <div style={{ color: "#999", fontSize: 12 }}>{o.address}</div>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{o.qty} × {o.model}</td>
                    <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>{money(o.total)}<div style={{ color: "#999", fontSize: 11 }}>+ delivery</div></td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {o.status !== "paid" && o.status !== "shipped" && (
                          <button disabled={busy === o.order_ref} onClick={() => setStatus(o.order_ref, "paid")} style={btn("#1E40AF")}>Mark paid</button>
                        )}
                        {o.status !== "shipped" && (
                          <button disabled={busy === o.order_ref} onClick={() => setStatus(o.order_ref, "shipped")} style={btn("#065F46")}>Mark shipped</button>
                        )}
                        {o.status !== "cancelled" && o.status !== "shipped" && (
                          <button disabled={busy === o.order_ref} onClick={() => setStatus(o.order_ref, "cancelled")} style={btn("#991B1B", true)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function btn(color: string, ghost = false): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: `1px solid ${color}`, background: ghost ? "#fff" : color, color: ghost ? color : "#fff",
  };
}
