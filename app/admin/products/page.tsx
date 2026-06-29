"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { logout } from "@/lib/admin-store";

type Media = { images: string[]; hidden: boolean; price: number | null };
type MediaMap = Record<string, Media>;

const CAT_ORDER = ["stabilizers", "industrial", "cells", "parts"] as const;

function imgSrc(s: string) {
  return s.startsWith("/") || s.startsWith("http") ? s : `/${s}`;
}

export default function ProductAdmin() {
  const [map, setMap] = useState<MediaMap>({});
  const [activeId, setActiveId] = useState<string>(PRODUCTS[0]?.id || "");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/product-media", { cache: "no-store" })
      .then((r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.media) setMap(d.media);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const active = PRODUCTS.find((p) => p.id === activeId);

  // Effective state for the active product: override row if present, else the
  // code defaults (so the toggle/price reflect what the site currently shows).
  const eff: Media = active
    ? map[activeId] || { images: [], hidden: Boolean(active.hidden), price: active.price ?? null }
    : { images: [], hidden: false, price: null };
  const gallery = eff.images.length ? eff.images : active ? [active.image] : [];
  const usingDefaultImg = eff.images.length === 0;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const patch = (p: Partial<Media>) => {
    setMap((prev) => ({ ...prev, [activeId]: { ...eff, ...p } }));
    setDirty(true);
  };

  // Visibility is a single click that's easy to lose if it waits for the global
  // Save (which only persists the open product). So persist it immediately.
  const toggleHidden = async () => {
    if (!active || busy) return;
    const prevEff = eff;
    const next: Media = { ...eff, hidden: !eff.hidden };
    setMap((prev) => ({ ...prev, [activeId]: next })); // optimistic
    setBusy(true);
    try {
      const res = await fetch("/api/admin/product-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeId, media: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      flash(next.hidden ? "Hidden · live on site" : "Shown · live on site");
    } catch (e) {
      setMap((prev) => ({ ...prev, [activeId]: prevEff })); // revert on failure
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/product-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeId, media: eff }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setDirty(false);
      flash("Saved · live on site");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files || !files.length || !active) return;
    setBusy(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("productId", activeId);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Upload failed");
        added.push(d.url);
      }
      patch({ images: [...eff.images, ...added] });
      flash("Uploaded — remember to Save");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  const removeImage = (i: number) => patch({ images: eff.images.filter((_, idx) => idx !== i) });
  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= eff.images.length) return;
    const arr = [...eff.images];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    patch({ images: arr });
  };
  const makePrimary = (i: number) => {
    if (i === 0) return;
    const arr = [...eff.images];
    const [it] = arr.splice(i, 1);
    arr.unshift(it);
    patch({ images: arr });
  };

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => !q || p.name.toLowerCase().includes(q) || p.id.includes(q));
    return CAT_ORDER.map((cid) => ({
      cid,
      label: CATEGORIES.find((c) => c.id === cid)?.label || cid,
      items: list.filter((p) => p.categoryId === cid),
    })).filter((g) => g.items.length);
  }, [query]);

  const effHidden = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return map[id] ? map[id].hidden : Boolean(p?.hidden);
  };

  return (
    <>
      <header className="topbar" style={{ position: "static" }}>
        <div className="container topbar-inner" style={{ gridTemplateColumns: "auto 1fr auto", gap: 24 }}>
          <Link href="/" className="brand" style={{ textAlign: "left" }}>
            Voltec
            <small>Editor · Products</small>
          </Link>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link href="/admin" className="nav-link">Journal</Link>
            <Link href="/admin/products" className="nav-link" style={{ fontWeight: 600 }}>Products</Link>
            <Link href="/admin/analytics" className="nav-link">Analytics</Link>
            <button className="nav-link" onClick={() => logout().then(() => location.reload())}>Log out</button>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: toast ? "var(--ok)" : dirty ? "var(--warn)" : "var(--ink-3)" }}>
              {toast || (dirty ? "Unsaved changes" : "All changes saved")}
            </span>
            <button className="btn btn-primary" onClick={save} disabled={!dirty || busy} style={{ padding: "8px 14px", fontSize: 13 }}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      {!authed ? (
        <div style={{ padding: "120px 40px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "-0.02em" }}>Please log in</div>
          <p style={{ color: "var(--ink-3)", marginTop: 12, marginBottom: 24 }}>This admin is password-protected.</p>
          <Link href="/admin/login" className="btn btn-primary">Go to login →</Link>
        </div>
      ) : !loaded ? (
        <div style={{ padding: "120px 40px", textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
      ) : (
        <div className="admin-shell">
          <aside className="admin-side">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.01em", marginBottom: 2 }}>
                Products
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                Images · price · visibility
              </div>
            </div>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 14 }}
            />
            <div className="admin-post-list" style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 14 }}>
              {grouped.map((g) => (
                <div key={g.cid}>
                  <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", margin: "0 0 6px" }}>
                    {g.label}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {g.items.map((p) => {
                      const n = map[p.id]?.images?.length || 0;
                      const hidden = effHidden(p.id);
                      return (
                        <div
                          key={p.id}
                          className={`admin-post-item ${p.id === activeId ? "active" : ""}`}
                          onClick={() => setActiveId(p.id)}
                          style={{ cursor: "pointer", opacity: hidden ? 0.55 : 1 }}
                        >
                          <div className="title" style={{ fontSize: 13 }}>{p.name}</div>
                          <div className="sub" style={{ display: "flex", gap: 8 }}>
                            <span className={`badge ${n ? "badge-published" : "badge-draft"}`}>
                              {n ? `${n} image${n === 1 ? "" : "s"}` : "default img"}
                            </span>
                            {hidden && <span style={{ color: "var(--warn)" }}>hidden</span>}
                            {p.status === "upcoming" && <span>coming soon</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="admin-main">
            {!active ? (
              <p style={{ color: "var(--ink-3)" }}>Pick a product on the left.</p>
            ) : (
              <>
                <div className="editor-head">
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                      {active.category} · {active.id}
                    </div>
                    <h1 className="editor-title" style={{ border: 0, padding: 0 }}>{active.name}</h1>
                  </div>
                  <a href={`/products/${active.id}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    View live ↗
                  </a>
                </div>

                {/* ---- Visibility ---- */}
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", marginBottom: 24, border: "1px solid var(--rule-strong)", borderRadius: 12, background: eff.hidden ? "var(--paper-2)" : "var(--accent-soft)" }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {eff.hidden ? "Hidden from the site" : "Visible on the site"}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {eff.hidden ? "Not shown in listings, the model picker or search." : "Shown everywhere this product appears."}
                    </div>
                  </div>
                  <button
                    className={eff.hidden ? "btn btn-primary" : "btn btn-ghost"}
                    onClick={toggleHidden}
                    disabled={busy}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {eff.hidden ? "Show product" : "Hide product"}
                  </button>
                </div>

                {/* ---- Price ---- */}
                <div className="field" style={{ marginBottom: 28, maxWidth: 360 }}>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", display: "block", marginBottom: 6 }}>
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={eff.price ?? ""}
                    placeholder="e.g. 25000 — leave blank for inquiry-only"
                    onChange={(e) => patch({ price: e.target.value === "" ? null : Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 14 }}
                  />
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 5 }}>
                    Blank → the site shows “Request price”. Set a number → it’s shown on the product.
                  </div>
                </div>

                {/* ---- Images ---- */}
                <div className="eyebrow" style={{ margin: "8px 0 12px" }}>Product images</div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Upload one or more photos. The <strong>first</strong> image is the cover shown on cards and the
                  model picker; the rest appear in the product gallery. {usingDefaultImg && "Currently showing the built-in default image."}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
                  {gallery.map((src, i) => (
                    <div key={src + i} style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                      <div style={{ position: "relative", aspectRatio: "1", background: "#fff" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgSrc(src)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8%" }} />
                        {i === 0 && !usingDefaultImg && (
                          <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>
                            PRIMARY
                          </span>
                        )}
                      </div>
                      {usingDefaultImg ? (
                        <div style={{ padding: 8, fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>built-in default</div>
                      ) : (
                        <div style={{ display: "flex", gap: 2, padding: 6, borderTop: "1px solid var(--rule)", flexWrap: "wrap", justifyContent: "center" }}>
                          <button className="filter-chip" title="Move left" onClick={() => moveImage(i, -1)} disabled={i === 0}>←</button>
                          <button className="filter-chip" title="Make primary" onClick={() => makePrimary(i)} disabled={i === 0}>★</button>
                          <button className="filter-chip" title="Move right" onClick={() => moveImage(i, 1)} disabled={i === gallery.length - 1}>→</button>
                          <button className="filter-chip" title="Remove" onClick={() => removeImage(i)} style={{ color: "var(--warn)" }}>✕</button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    style={{ border: "2px dashed var(--rule-strong)", borderRadius: 8, background: "var(--paper-2)", color: "var(--ink-3)", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 13 }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>＋</span>
                    Upload image
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      upload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid var(--rule)", display: "flex", gap: 12, alignItems: "center" }}>
                  <button className="btn btn-primary" onClick={save} disabled={!dirty || busy}>
                    {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
                  </button>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    Saves to the database — changes go live immediately.
                  </span>
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </>
  );
}
