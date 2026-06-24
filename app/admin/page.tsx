"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import {
  loadPosts,
  savePost,
  deletePostStore,
  resetLocal,
  logout,
  type AdminMode,
} from "@/lib/admin-store";

function AdminTopBar({
  savedToast,
  dirty,
  onSave,
  mode,
}: {
  savedToast?: string;
  dirty?: boolean;
  onSave?: () => void;
  mode: AdminMode;
}) {
  return (
    <header className="topbar" style={{ position: "static" }}>
      <div className="container topbar-inner" style={{ gridTemplateColumns: "auto 1fr auto", gap: 24 }}>
        <Link href="/" className="brand" style={{ textAlign: "left" }}>
          Voltec
          <small>Editor · CMS</small>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/admin/analytics" className="nav-link">
            Analytics
          </Link>
          <Link href="/blog" className="nav-link">
            View public blog ↗
          </Link>
          <span
            className="mono"
            title={mode === "supabase" ? "Saving to Supabase" : "Saving to this browser (Supabase not configured)"}
            style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: mode === "supabase" ? "var(--ok)" : "var(--ink-3)" }}
          >
            ● {mode === "supabase" ? "Supabase" : "Local"}
          </span>
          <button className="nav-link" onClick={() => logout().then(() => location.reload())}>
            Log out
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <span
            className="mono"
            style={{ fontSize: 11, letterSpacing: "0.08em", color: savedToast ? "var(--ok)" : dirty ? "var(--warn)" : "var(--ink-3)" }}
          >
            {savedToast || (dirty ? "Unsaved changes" : "All changes saved")}
          </span>
          {onSave && (
            <button className="btn btn-primary" onClick={onSave} disabled={!dirty} style={{ padding: "8px 14px", fontSize: 13 }}>
              Save
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<AdminMode>("local");
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState("");
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts().then(({ mode, posts }) => {
      setMode(mode);
      setPosts(posts);
      setActiveId(posts[0]?.id || null);
      setLoaded(true);
    });
  }, []);

  const active = posts.find((p) => p.id === activeId);

  useEffect(() => {
    if (active && editorRef.current) editorRef.current.innerHTML = active.body || "";
    if (active && titleRef.current) titleRef.current.value = active.title || "";
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const toast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(""), 1800);
  };

  const updateActive = (patch: Partial<BlogPost>) => {
    setPosts((prev) => prev.map((p) => (p.id === activeId ? { ...p, ...patch } : p)));
    setDirty(true);
  };

  const persistOne = async (next: BlogPost, list: BlogPost[]) => {
    try {
      await savePost(next, mode, list);
    } catch {
      toast("Save failed");
    }
  };

  const handleSave = async () => {
    if (!active) return;
    const body = editorRef.current?.innerHTML || "";
    const title = titleRef.current?.value || active.title;
    const next = { ...active, body, title };
    const list = posts.map((p) => (p.id === activeId ? next : p));
    setPosts(list);
    setDirty(false);
    await persistOne(next, list);
    toast("Saved");
  };

  const togglePublish = async () => {
    if (!active) return;
    const next = { ...active, published: !active.published };
    const list = posts.map((p) => (p.id === activeId ? next : p));
    setPosts(list);
    await persistOne(next, list);
    toast(next.published ? "Published" : "Unpublished");
  };

  const handleNew = async () => {
    const id = "p-" + Date.now().toString(36);
    const newPost: BlogPost = {
      id,
      title: "Untitled draft",
      slug: "untitled-" + id,
      category: "Technical",
      excerpt: "Write a compelling summary of this post here.",
      cover: "stripes-generic",
      author: "Rabeet Khan",
      authorRole: "Head of Engineering",
      readTime: 4,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
      published: false,
      body: "<p>Start writing…</p>",
    };
    const list = [newPost, ...posts];
    setPosts(list);
    setActiveId(id);
    await persistOne(newPost, list);
  };

  const handleDelete = async () => {
    if (!active) return;
    if (!confirm(`Delete "${active.title}"? This cannot be undone.`)) return;
    const list = posts.filter((p) => p.id !== activeId);
    setPosts(list);
    setActiveId(list[0]?.id || null);
    try {
      await deletePostStore(active.id, mode, posts);
    } catch {
      toast("Delete failed");
    }
  };

  const handleResetAll = () => {
    if (mode === "supabase") {
      alert("Reset is only available in local mode.");
      return;
    }
    if (!confirm("Reset to default demo posts? Your changes will be lost.")) return;
    const fresh = resetLocal();
    setPosts(fresh);
    setActiveId(fresh[0]?.id || null);
  };

  const exec = (cmd: string, val: string | undefined = undefined) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setDirty(true);
  };

  const insertBlock = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    setDirty(true);
  };

  if (!loaded) {
    return (
      <>
        <AdminTopBar mode={mode} />
        <div style={{ padding: "120px 40px", textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
      </>
    );
  }

  if (!active) {
    return (
      <>
        <AdminTopBar mode={mode} />
        <div style={{ padding: "120px 40px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, letterSpacing: "-0.02em" }}>No posts yet.</div>
          <p style={{ color: "var(--ink-3)", fontSize: 16, marginTop: 12, marginBottom: 28 }}>
            Start by creating your first article.
          </p>
          <button className="btn btn-primary" onClick={handleNew}>
            Create new post <span className="arrow">→</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar savedToast={savedToast} dirty={dirty} onSave={handleSave} mode={mode} />
      <div className="admin-shell">
        <aside className="admin-side">
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Journal
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              Editor · v1
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleNew} style={{ justifyContent: "center" }}>
            ＋ New post
          </button>
          <div>
            <h3>All posts · {posts.length}</h3>
            <div className="admin-post-list" style={{ marginTop: 10 }}>
              {posts.map((p) => (
                <div
                  key={p.id}
                  className={`admin-post-item ${p.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className="title">{p.title || "Untitled"}</div>
                  <div className="sub">
                    <span className={`badge ${p.published ? "badge-published" : "badge-draft"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                    <span>{p.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--rule)" }}>
            <button className="btn-link" onClick={handleResetAll}>
              Reset demo content
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <div className="editor-head">
            <div style={{ flex: 1 }}>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}
              >
                <span>Editing · {active.id}</span>
                <span>·</span>
                <span className={`badge ${active.published ? "badge-published" : "badge-draft"}`}>
                  {active.published ? "Published" : "Draft"}
                </span>
              </div>
              <input
                ref={titleRef}
                defaultValue={active.title}
                className="editor-title"
                placeholder="Post title…"
                onChange={() => setDirty(true)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 2, padding: 4, border: "1px solid var(--rule)", borderRadius: 2, background: "var(--paper-2)" }}>
                <button
                  className="filter-chip"
                  style={{ border: 0, background: viewMode === "editor" ? "var(--ink)" : "transparent", color: viewMode === "editor" ? "var(--paper)" : "var(--ink-2)" }}
                  onClick={() => setViewMode("editor")}
                >
                  Edit
                </button>
                <button
                  className="filter-chip"
                  style={{ border: 0, background: viewMode === "preview" ? "var(--ink)" : "transparent", color: viewMode === "preview" ? "var(--paper)" : "var(--ink-2)" }}
                  onClick={() => {
                    const body = editorRef.current?.innerHTML || "";
                    const title = titleRef.current?.value || active.title;
                    updateActive({ body, title });
                    setViewMode("preview");
                  }}
                >
                  Preview
                </button>
              </div>
              <button className="btn btn-ghost" onClick={handleSave} disabled={!dirty}>
                {dirty ? "Save changes" : "Saved"}
              </button>
              <button className="btn btn-accent" onClick={togglePublish}>
                {active.published ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>

          {viewMode === "editor" ? (
            <>
              <div className="editor-row">
                <div className="field">
                  <label>Category</label>
                  <select value={active.category} onChange={(e) => updateActive({ category: e.target.value })}>
                    <option>Technical</option>
                    <option>Case Study</option>
                    <option>Buyer Guide</option>
                    <option>Industry</option>
                    <option>Company</option>
                  </select>
                </div>
                <div className="field">
                  <label>Author</label>
                  <input type="text" value={active.author} onChange={(e) => updateActive({ author: e.target.value })} />
                </div>
                <div className="field">
                  <label>Read time (min)</label>
                  <input
                    type="number"
                    value={active.readTime}
                    onChange={(e) => updateActive({ readTime: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 24 }}>
                <label>Excerpt · shown in listing cards and article header</label>
                <textarea value={active.excerpt} rows={3} onChange={(e) => updateActive({ excerpt: e.target.value })} />
              </div>

              <div style={{ marginBottom: 28, padding: "20px 22px", border: "1px solid var(--accent)", background: "var(--accent-soft)", borderRadius: 10 }}>
                <div className="eyebrow" style={{ marginBottom: 4, color: "var(--accent-deep)" }}>
                  ⚡ SEO &amp; AEO
                </div>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  These fields power Google search snippets and AI answer engines. Takeaways &amp; FAQs are emitted as
                  structured data (Schema.org) automatically.
                </p>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Meta description · search snippet (≤ 160 chars)</label>
                  <textarea
                    rows={2}
                    value={active.metaDescription || ""}
                    placeholder="Leave blank to use the excerpt."
                    onChange={(e) => updateActive({ metaDescription: e.target.value })}
                  />
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
                    {(active.metaDescription || active.excerpt || "").length} / 160
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Focus keywords · comma-separated</label>
                  <input
                    type="text"
                    value={Array.isArray(active.keywords) ? active.keywords.join(", ") : active.keywords || ""}
                    placeholder="voltage stabilizer Pakistan, lithium battery price"
                    onChange={(e) => updateActive({ keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 4 }}
                  />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Key takeaways · one per line (shown as TL;DR + AI summary)</label>
                  <textarea
                    rows={4}
                    value={(active.takeaways || []).join("\n")}
                    placeholder={"Size your battery to load × backup hours.\nLFP is safest for Pakistan's heat.\nAlways verify genuine cells via QR code."}
                    onChange={(e) => updateActive({ takeaways: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                  />
                </div>
                <div className="field">
                  <label>FAQs · one per line, format: Question :: Answer</label>
                  <textarea
                    rows={4}
                    value={(active.faqs || []).map((f) => `${f.q} :: ${f.a}`).join("\n")}
                    placeholder={"What size stabilizer for one AC? :: A 5kVA servo stabilizer is ideal for a 1-ton AC plus lights and a fridge."}
                    onChange={(e) =>
                      updateActive({
                        faqs: e.target.value
                          .split("\n")
                          .map((l) => {
                            const idx = l.indexOf("::");
                            if (idx === -1) return null;
                            return { q: l.slice(0, idx).trim(), a: l.slice(idx + 2).trim() };
                          })
                          .filter((f): f is { q: string; a: string } => Boolean(f && f.q && f.a)),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", display: "block", marginBottom: 6 }}
                >
                  Body
                </label>
                <div className="editor-toolbar">
                  <button onClick={() => exec("bold")} title="Bold"><b>B</b></button>
                  <button onClick={() => exec("italic")} title="Italic"><i>I</i></button>
                  <button onClick={() => exec("underline")} title="Underline"><u>U</u></button>
                  <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }}></span>
                  <button onClick={() => exec("formatBlock", "<h2>")}>H2</button>
                  <button onClick={() => exec("formatBlock", "<h3>")}>H3</button>
                  <button onClick={() => exec("formatBlock", "<p>")}>¶</button>
                  <button onClick={() => exec("formatBlock", "<blockquote>")}>❝</button>
                  <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }}></span>
                  <button onClick={() => exec("insertUnorderedList")}>• List</button>
                  <button onClick={() => exec("insertOrderedList")}>1. List</button>
                  <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }}></span>
                  <button
                    onClick={() => {
                      const url = prompt("Link URL:");
                      if (url) exec("createLink", url);
                    }}
                  >
                    🔗 Link
                  </button>
                  <button onClick={() => insertBlock('<div class="callout"><div class="c-label">Engineer\'s Note</div><div>Write your note here.</div></div><p></p>')}>
                    ＋ Callout
                  </button>
                  <button onClick={() => insertBlock('<figure><div class="figure-img"><div class="ph-stripes"></div><div class="ph-label">FIGURE</div></div><figcaption>Caption</figcaption></figure><p></p>')}>
                    ＋ Figure
                  </button>
                  <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }}></span>
                  <button onClick={() => exec("removeFormat")}>Clear</button>
                </div>
                <div
                  ref={editorRef}
                  className="editor-content"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => setDirty(true)}
                  onBlur={() => {
                    const body = editorRef.current?.innerHTML || "";
                    if (body !== active.body) updateActive({ body });
                  }}
                  dangerouslySetInnerHTML={{ __html: active.body }}
                />
              </div>

              <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    Post metadata
                  </div>
                  <table className="kv-table">
                    <tbody>
                      <tr>
                        <td>Slug</td>
                        <td>
                          <input type="text" value={active.slug} onChange={(e) => updateActive({ slug: e.target.value })} style={{ width: "100%", padding: "4px 8px", border: "1px solid var(--rule)", background: "var(--paper)" }} />
                        </td>
                      </tr>
                      <tr>
                        <td>Published date</td>
                        <td>
                          <input type="text" value={active.date} onChange={(e) => updateActive({ date: e.target.value })} style={{ width: "100%", padding: "4px 8px", border: "1px solid var(--rule)", background: "var(--paper)" }} />
                        </td>
                      </tr>
                      <tr>
                        <td>Author role</td>
                        <td>
                          <input type="text" value={active.authorRole} onChange={(e) => updateActive({ authorRole: e.target.value })} style={{ width: "100%", padding: "4px 8px", border: "1px solid var(--rule)", background: "var(--paper)" }} />
                        </td>
                      </tr>
                      <tr>
                        <td>Post ID</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>{active.id}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    Actions
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <a href={`/blog/${active.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ justifyContent: "space-between" }}>
                      Open live preview ↗
                    </a>
                    <button
                      className="btn btn-ghost"
                      style={{ justifyContent: "space-between", borderColor: "var(--warn)", color: "var(--warn)" }}
                      onClick={handleDelete}
                    >
                      Delete post
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ border: "1px solid var(--rule)", padding: "40px 48px", background: "var(--paper)" }}>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, display: "flex", gap: 10 }}
              >
                <span style={{ color: "var(--accent-ink)", border: "1px solid var(--accent)", padding: "2px 8px", borderRadius: 99 }}>
                  {active.category}
                </span>
                <span>·</span>
                <span>{active.date}</span>
                <span>·</span>
                <span>{active.readTime} min</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 20px 0" }}>
                {active.title}
              </h1>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.35, margin: "0 0 40px 0", maxWidth: "50ch" }}>
                {active.excerpt}
              </p>
              <div className="prose" style={{ fontSize: 17, maxWidth: 680 }} dangerouslySetInnerHTML={{ __html: active.body }} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
