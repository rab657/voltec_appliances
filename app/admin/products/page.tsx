"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { FAMILIES, familyOf, leadOf, type FamilyMeta } from "@/lib/showcase-data";
import { variantLabel } from "@/lib/variant-label";
import type { Product } from "@/lib/types";
import { logout } from "@/lib/admin-store";

type Media = {
  images: string[];
  videos: string[];
  hidden: boolean;
  price: number | null;
  name: string | null;
  baseId: string | null;
  isVariant: boolean;
};
type MediaMap = Record<string, Media>;

// Families whose variants (capacities) are admin-managed. Stabilizers + industrial
// only — cells & parts keep the flat editor below.
const VARIANT_FAMILIES = FAMILIES.filter(
  (f) => f.categoryId === "stabilizers" || f.categoryId === "industrial",
);

function imgSrc(s: string) {
  return s.startsWith("/") || s.startsWith("http") ? s : `/${s}`;
}

// Homepage category cover images live in product_overrides under reserved ids
// ("homecover-<key>"), separate from any product. The homepage band prefers
// this image over the lead model's photo.
const COVER_PREFIX = "homecover-";
const COVER_TARGETS: { key: string; label: string; fallback: string }[] = [
  ...["stab-svc", "stab-avr", "industrial", "cells"].map((k) => {
    const f = FAMILIES.find((x) => x.key === k);
    return { key: k, label: f?.name || k, fallback: f?.image || "" };
  }),
  { key: "parts", label: "Electric Parts", fallback: "assets/prod-relay.jpg" },
];

// Family display name without its capacity suffix, e.g. "SVC Servo Stabilizer".
function familyBaseName(famKey: string): string {
  const code = PRODUCTS.filter((p) => familyOf(p) === famKey);
  const lead = code.length ? leadOf(code) : undefined;
  return lead ? lead.name.split("—")[0].trim() : "";
}

export default function ProductAdmin() {
  const [map, setMap] = useState<MediaMap>({});
  const [activeId, setActiveId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [addingFamily, setAddingFamily] = useState<string | null>(null);
  const [newCap, setNewCap] = useState("");
  // Which sidebar groups are expanded (family key or "cat-cells"/"cat-parts").
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  // "product" = variant editor; "covers" = homepage category cover images.
  const [view, setView] = useState<"product" | "covers">("product");
  const [coverTargetKey, setCoverTargetKey] = useState<string>("");
  const coverRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!activeId && PRODUCTS[0]) setActiveId(PRODUCTS[0].id);
  }, [activeId]);

  // Group key for a product: family key for stabilizer/industrial, else "cat-<cat>".
  const groupKeyOf = (p: Product) => {
    const fam = familyOf(p);
    return fam.startsWith("stab-") || fam === "industrial" ? fam : `cat-${p.categoryId}`;
  };

  // Keep the active item's group expanded (on load and when selection changes).
  useEffect(() => {
    const b = PRODUCTS.find((p) => p.id === activeId) ||
      (map[activeId]?.baseId ? PRODUCTS.find((p) => p.id === map[activeId]?.baseId) : undefined);
    if (!b) return;
    const key = groupKeyOf(b);
    setOpen((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, [activeId, map]);

  const toggleOpen = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // The code product backing the active selection: itself (code product) or the
  // base of an admin-created variant.
  const baseProductFor = (id: string): Product | undefined => {
    const code = PRODUCTS.find((p) => p.id === id);
    if (code) return code;
    const m = map[id];
    return m?.isVariant && m.baseId ? PRODUCTS.find((p) => p.id === m.baseId) : undefined;
  };

  const base = baseProductFor(activeId);
  const stored = map[activeId];
  const isCreated = Boolean(stored?.isVariant);
  const inScope = base ? familyOf(base).startsWith("stab-") || familyOf(base) === "industrial" : false;

  // Effective override state for the active product (override row, else code defaults).
  const eff: Media = base
    ? {
        images: stored?.images ?? [],
        videos: stored?.videos ?? [],
        hidden: stored ? stored.hidden : Boolean(base.hidden),
        price: stored ? stored.price : base.price ?? null,
        name: stored?.name ?? null,
        baseId: stored?.baseId ?? null,
        isVariant: stored?.isVariant ?? false,
      }
    : { images: [], videos: [], hidden: false, price: null, name: null, baseId: null, isVariant: false };
  const effName = eff.name || base?.name || "";
  const gallery = eff.images.length ? eff.images : base ? [base.image] : [];
  const usingDefaultImg = eff.images.length === 0;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const patch = (p: Partial<Media>) => {
    setMap((prev) => ({ ...prev, [activeId]: { ...eff, ...p } }));
    setDirty(true);
  };

  // Visibility is a single click that's easy to lose if it waits for the global
  // Save (which only persists the open product). So persist it immediately.
  const toggleHidden = async () => {
    if (!base || busy) return;
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
    if (!base) return;
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

  // Create a new variant under a family: clone the family lead, capacity → name.
  const addVariant = async (fam: FamilyMeta) => {
    const cap = newCap.trim();
    if (!cap || busy) return;
    const code = PRODUCTS.filter((p) => familyOf(p) === fam.key);
    if (!code.length) {
      flash("This family has no base model to clone.");
      return;
    }
    const lead = leadOf(code);
    const baseName = familyBaseName(fam.key);
    const name = baseName ? `${baseName} — ${cap}` : cap;
    const slug = cap.toLowerCase().replace(/[^a-z0-9]+/g, "");
    let id = `${fam.slug}-${slug || "new"}`;
    const taken = (x: string) => PRODUCTS.some((p) => p.id === x) || Boolean(map[x]);
    let n = 2;
    while (taken(id)) id = `${fam.slug}-${slug || "new"}-${n++}`;
    const media: Media = {
      images: [],
      videos: [],
      hidden: false,
      price: null,
      name,
      baseId: lead.id,
      isVariant: true,
    };
    setBusy(true);
    try {
      const res = await fetch("/api/admin/product-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, media }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Create failed");
      setMap((prev) => ({ ...prev, [id]: media }));
      setActiveId(id);
      setView("product");
      setAddingFamily(null);
      setNewCap("");
      flash("Variant added · upload an image, then Save");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  const removeVariant = async () => {
    if (!isCreated || busy) return;
    if (!confirm(`Delete this variant (${effName})? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/product-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      setMap((prev) => {
        const next = { ...prev };
        delete next[activeId];
        return next;
      });
      setActiveId(PRODUCTS[0]?.id || "");
      setDirty(false);
      flash("Variant deleted · live on site");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  // ---- homepage category cover images ----
  const uploadCover = async (key: string, files: FileList | null) => {
    if (!key || !files || !files.length) return;
    const id = COVER_PREFIX + key;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      fd.append("productId", id);
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await up.json();
      if (!up.ok) throw new Error(d.error || "Upload failed");
      const media: Media = {
        images: [d.url], videos: [], hidden: false, price: null,
        name: null, baseId: null, isVariant: false,
      };
      const save = await fetch("/api/admin/product-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, media }),
      });
      if (!save.ok) throw new Error((await save.json()).error || "Save failed");
      setMap((prev) => ({ ...prev, [id]: media }));
      flash("Category image updated · live on site");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };
  const removeCover = async (key: string) => {
    if (busy) return;
    const id = COVER_PREFIX + key;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/product-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Remove failed");
      setMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      flash("Category image removed · live on site");
    } catch (e) {
      flash(String(e));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files || !files.length || !base) return;
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

  const addVideoUrl = () => {
    const u = videoUrl.trim();
    if (!u) return;
    patch({ videos: [...eff.videos, u] });
    setVideoUrl("");
  };
  const removeVideo = (i: number) => patch({ videos: eff.videos.filter((_, idx) => idx !== i) });
  const uploadVideo = async (files: FileList | null) => {
    if (!files || !files.length || !base) return;
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
      patch({ videos: [...eff.videos, ...added] });
      flash("Video added — remember to Save");
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

  // ---- left-rail data ----
  const q = query.trim().toLowerCase();
  const matches = (id: string, name: string) =>
    !q || name.toLowerCase().includes(q) || id.toLowerCase().includes(q);

  // Variants of a family = code members + admin-created variants, with effective name.
  const familyVariants = (fam: FamilyMeta) => {
    const code = PRODUCTS.filter((p) => familyOf(p) === fam.key).map((p) => ({
      id: p.id,
      name: map[p.id]?.name || p.name,
      created: false,
    }));
    const created = Object.entries(map)
      .filter(([, m]) => {
        if (!m.isVariant || !m.baseId) return false;
        const b = PRODUCTS.find((p) => p.id === m.baseId);
        return b ? familyOf(b) === fam.key : false;
      })
      .map(([id, m]) => ({ id, name: m.name || id, created: true }));
    return [...code, ...created].filter((v) => matches(v.id, v.name));
  };

  // Cells & parts keep the flat list (out of scope for variants).
  const flatGroups = useMemo(() => {
    const cats: { id: string; label: string }[] = [
      { id: "cells", label: "Lithium Cells" },
      { id: "parts", label: "Electric Parts" },
    ];
    return cats
      .map((c) => ({
        ...c,
        items: PRODUCTS.filter(
          (p) => p.categoryId === c.id && matches(p.id, map[p.id]?.name || p.name),
        ),
      }))
      .filter((g) => g.items.length);
  }, [query, map]);

  const effHidden = (id: string) => {
    const b = PRODUCTS.find((x) => x.id === id) || (map[id]?.baseId ? PRODUCTS.find((x) => x.id === map[id]?.baseId) : undefined);
    return map[id] ? map[id].hidden : Boolean(b?.hidden);
  };

  const activeFamily = base
    ? VARIANT_FAMILIES.find((f) => f.key === familyOf(base))
    : undefined;
  const liveHref = activeFamily ? `/showcase/${activeFamily.slug}` : `/products/${activeId}`;

  const renderItem = (id: string, name: string, created: boolean) => {
    const n = map[id]?.images?.length || 0;
    const hidden = effHidden(id);
    const b = baseProductFor(id);
    return (
      <div
        key={id}
        className={`admin-post-item ${id === activeId && view === "product" ? "active" : ""}`}
        onClick={() => { setActiveId(id); setView("product"); }}
        style={{ cursor: "pointer", opacity: hidden ? 0.55 : 1 }}
      >
        <div className="title" style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
          {b && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-deep)" }}>{variantLabel({ ...b, name } as Product)}</span>}
          <span>{name}</span>
        </div>
        <div className="sub" style={{ display: "flex", gap: 8 }}>
          <span className={`badge ${n ? "badge-published" : "badge-draft"}`}>
            {n ? `${n} image${n === 1 ? "" : "s"}` : "default img"}
          </span>
          {created && <span style={{ color: "var(--accent-deep)" }}>added</span>}
          {hidden && <span style={{ color: "var(--warn)" }}>hidden</span>}
        </div>
      </div>
    );
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
                Family · variants · media
              </div>
            </div>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 14 }}
            />
            <div className="admin-post-list" style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              {/* ---- Homepage category cover images ---- */}
              <button
                type="button"
                onClick={() => setView("covers")}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", marginBottom: 8, borderRadius: 8, border: "1px solid var(--rule)", background: view === "covers" ? "var(--accent-soft)" : "var(--paper)", color: view === "covers" ? "var(--accent-deep)" : "var(--ink)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                <span aria-hidden>🖼</span>
                <span style={{ flex: 1 }}>Homepage images</span>
              </button>

              {/* ---- Stabilizer & industrial families → variants (collapsible) ---- */}
              {VARIANT_FAMILIES.map((fam) => {
                const variants = familyVariants(fam);
                if (q && variants.length === 0) return null;
                const isOpen = Boolean(q) || open.has(fam.key);
                const hasActive = Boolean(base) && groupKeyOf(base!) === fam.key;
                return (
                  <div key={fam.key}>
                    <button
                      type="button"
                      onClick={() => toggleOpen(fam.key)}
                      className="admin-group-head"
                      style={{ width: "100%", display: "flex", gap: 8, alignItems: "center", padding: "8px 8px", background: isOpen ? "var(--paper-2)" : "transparent", border: 0, borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: hasActive ? "var(--accent-deep)" : "var(--ink-2)" }}
                    >
                      <span style={{ display: "inline-block", width: 9, color: "var(--ink-4)", transition: "transform .15s", transform: isOpen ? "rotate(90deg)" : "none" }}>▸</span>
                      <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fam.name}</span>
                      <span style={{ color: "var(--ink-4)" }}>{variants.length}</span>
                      {fam.hidden && <span style={{ color: "var(--warn)", fontSize: 9 }}>hidden</span>}
                    </button>
                    {isOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 0 10px 6px" }}>
                        {variants.map((v) => renderItem(v.id, v.name, v.created))}
                        {addingFamily === fam.key ? (
                          <div style={{ display: "flex", gap: 6, padding: "4px 0" }}>
                            <input
                              autoFocus
                              value={newCap}
                              onChange={(e) => setNewCap(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); addVariant(fam); }
                                if (e.key === "Escape") { setAddingFamily(null); setNewCap(""); }
                              }}
                              placeholder="Capacity e.g. 1kVA"
                              style={{ flex: 1, minWidth: 0, padding: "7px 9px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 13 }}
                            />
                            <button className="filter-chip" onClick={() => addVariant(fam)} disabled={!newCap.trim() || busy} title="Add">✓</button>
                            <button className="filter-chip" onClick={() => { setAddingFamily(null); setNewCap(""); }} title="Cancel">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAddingFamily(fam.key); setNewCap(""); }}
                            style={{ textAlign: "left", padding: "6px 8px", border: "1px dashed var(--rule-strong)", borderRadius: 6, background: "transparent", color: "var(--ink-3)", fontSize: 12, cursor: "pointer" }}
                          >
                            ＋ Add variant
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ---- Cells & parts (collapsible, flat) ---- */}
              {flatGroups.map((g) => {
                const key = `cat-${g.id}`;
                const isOpen = Boolean(q) || open.has(key);
                const hasActive = Boolean(base) && groupKeyOf(base!) === key;
                return (
                  <div key={g.id}>
                    <button
                      type="button"
                      onClick={() => toggleOpen(key)}
                      className="admin-group-head"
                      style={{ width: "100%", display: "flex", gap: 8, alignItems: "center", padding: "8px 8px", background: isOpen ? "var(--paper-2)" : "transparent", border: 0, borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: hasActive ? "var(--accent-deep)" : "var(--ink-2)" }}
                    >
                      <span style={{ display: "inline-block", width: 9, color: "var(--ink-4)", transition: "transform .15s", transform: isOpen ? "rotate(90deg)" : "none" }}>▸</span>
                      <span style={{ flex: 1, textAlign: "left" }}>{g.label}</span>
                      <span style={{ color: "var(--ink-4)" }}>{g.items.length}</span>
                    </button>
                    {isOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 0 10px 6px" }}>
                        {g.items.map((p) => renderItem(p.id, map[p.id]?.name || p.name, false))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="admin-main">
            {view === "covers" ? (
              <>
                <div className="editor-head">
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                      Homepage · category bands
                    </div>
                    <h1 className="editor-title" style={{ border: 0, padding: 0 }}>Homepage category images</h1>
                  </div>
                  <a href="/" target="_blank" rel="noreferrer" className="btn btn-ghost">View live ↗</a>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 20px", maxWidth: "62ch", lineHeight: 1.55 }}>
                  Upload a cover image for each homepage category band. Recommended <strong>16:9</strong> (e.g. 1600×900). When none is set, the band falls back to that line&apos;s lead product photo. A set cover fills the band edge-to-edge.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {COVER_TARGETS.map((c) => {
                    const cur = map[COVER_PREFIX + c.key]?.images?.[0];
                    const src = cur || c.fallback;
                    return (
                      <div key={c.key} style={{ border: "1px solid var(--rule)", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                        <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--paper-2)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgSrc(src)} alt="" style={{ width: "100%", height: "100%", objectFit: cur ? "cover" : "contain", padding: cur ? 0 : "10%", background: "#fff" }} />
                          {!cur && (
                            <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: "var(--ink-3)", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div style={{ padding: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{c.label}</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} disabled={busy} onClick={() => { setCoverTargetKey(c.key); coverRef.current?.click(); }}>
                              {cur ? "Replace" : "Upload"}
                            </button>
                            {cur && (
                              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px", color: "var(--warn)" }} disabled={busy} onClick={() => removeCover(c.key)}>
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { uploadCover(coverTargetKey, e.target.files); e.target.value = ""; }}
                />
              </>
            ) : !base ? (
              <p style={{ color: "var(--ink-3)" }}>Pick a product on the left.</p>
            ) : (
              <>
                <div className="editor-head">
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                      {activeFamily ? activeFamily.name : base.category} · {activeId}
                      {isCreated && <span style={{ color: "var(--accent-deep)" }}> · added variant</span>}
                    </div>
                    <h1 className="editor-title" style={{ border: 0, padding: 0 }}>{effName}</h1>
                  </div>
                  <a href={liveHref} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    View live ↗
                  </a>
                </div>

                {/* ---- Capacity / name (stabilizer & industrial only) ---- */}
                {inScope && (
                  <div className="field" style={{ marginBottom: 24, maxWidth: 460 }}>
                    <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", display: "block", marginBottom: 6 }}>
                      Variant name / capacity
                    </label>
                    <input
                      type="text"
                      value={effName}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        // Store an override only when it differs from the code name.
                        patch({ name: !v || v === base?.name ? null : v });
                      }}
                      placeholder="e.g. SVC Servo Stabilizer — 1kVA"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 14 }}
                    />
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 5 }}>
                      The capacity in the name (e.g. “1kVA”) becomes the chip label in the model picker. Remember to Save.
                    </div>
                  </div>
                )}

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
                <div className="eyebrow" style={{ margin: "8px 0 12px" }}>Variant images</div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Upload one or more photos for this variant. The <strong>first</strong> image is the cover shown on cards and the
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

                {/* ---- Videos ---- */}
                <div className="eyebrow" style={{ margin: "36px 0 12px" }}>Variant video</div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Paste a <strong>YouTube</strong> or video link, or upload a short clip (max 50&nbsp;MB).
                  Videos appear in the product&apos;s showcase. For long or large videos, a YouTube link is best.
                </p>

                {eff.videos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {eff.videos.map((v, i) => {
                      const isFile = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(v);
                      return (
                        <div key={v + i} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid var(--rule)", borderRadius: 8, padding: 10, background: "#fff" }}>
                          {isFile ? (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={imgSrc(v)} style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 4, background: "#000" }} muted />
                          ) : (
                            <div style={{ width: 120, height: 68, borderRadius: 4, background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>▶</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
                          <button className="filter-chip" title="Remove" onClick={() => removeVideo(i)} style={{ color: "var(--warn)" }}>✕ Remove</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="url"
                    value={videoUrl}
                    placeholder="https://youtu.be/…  or  https://…/video.mp4"
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideoUrl(); } }}
                    style={{ flex: 1, minWidth: 260, padding: "10px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 6, fontSize: 14 }}
                  />
                  <button className="btn btn-ghost" onClick={addVideoUrl} disabled={!videoUrl.trim() || busy}>Add link</button>
                  <button className="btn btn-ghost" onClick={() => videoRef.current?.click()} disabled={busy}>Upload file</button>
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => {
                      uploadVideo(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid var(--rule)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={save} disabled={!dirty || busy}>
                    {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
                  </button>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    Saves to the database — changes go live immediately.
                  </span>
                  {isCreated && (
                    <button
                      className="btn btn-ghost"
                      onClick={removeVariant}
                      disabled={busy}
                      style={{ marginLeft: "auto", color: "var(--warn)", borderColor: "var(--warn)" }}
                    >
                      Delete variant
                    </button>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </>
  );
}
