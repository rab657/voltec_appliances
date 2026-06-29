import Link from "next/link";
import type { Product } from "@/lib/types";
import { SITE } from "@/lib/site";
import { showcaseFor, siblingFamilies, type FamilyMeta } from "@/lib/showcase-data";
import { getT, getContent } from "@/lib/i18n-server";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SbIcon, SbWave, PROT_ICONS, AnnoStage, Slot } from "./primitives";
import ShowcaseSpec from "./ShowcaseSpec";
import { variantLabel } from "@/lib/variant-label";
import PowersDiagram from "./PowersDiagram";
import ProductConfigurator from "./ProductConfigurator";

const tel = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;

// Turn an admin-entered video URL (YouTube / Vimeo / direct file) into an
// embeddable source. Returns null for anything we can't safely embed.
function videoSource(url: string): { kind: "iframe" | "file"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)) {
    return { kind: "file", src: url.startsWith("/") || url.startsWith("http") ? url : `/${url}` };
  }
  return null;
}

export default async function Showcase({
  family,
  lead,
  members,
}: {
  family: FamilyMeta;
  lead: Product;
  members: Product[];
}) {
  const t = await getT();
  const { lc, dl } = await getContent();
  const c = dl(showcaseFor(lead));
  const related = siblingFamilies(family);
  const packed = members.filter((p) => p.packing);

  const benefitsBlock = c.benefits ? (
    <section className="sb-section" style={{ background: "var(--paper-2)" }}>
      <div className="container">
        <div className="sb-head is-center">
          <div className="sb-eyebrow">{c.benefits.eyebrow}</div>
          <h2 dangerouslySetInnerHTML={{ __html: c.benefits.title }}></h2>
        </div>
        <div className="sb-adv-grid">
          {c.benefits.items.map((a) => (
            <div className="sb-adv" key={a.n}>
              <Slot src={a.img} label={a.title} cover />
              <div className="sb-adv-band">
                <div className="n">{a.n}</div>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : null;

  const prot = (c.benefits?.protections || []).map((k) => PROT_ICONS[k]).filter(Boolean);
  const PROT_WORD: Record<number, string> = { 3: "Three", 4: "Four", 5: "Five", 6: "Six" };
  const protectionsBlock = prot.length ? (
    <section className="sb-section sb-protect-section">
      <div className="container">
        <div className="sb-head is-center">
          <div className="sb-eyebrow">{lc("Built-in safety")}</div>
          <h2 dangerouslySetInnerHTML={{ __html: `${PROT_WORD[prot.length] || prot.length} layers of <em>protection</em>.` }}></h2>
          <p className="sb-section-sub">{lc("Every unit watches the grid and shuts the load out of harm automatically — no manual reset, no babysitting.")}</p>
        </div>
        <div className="sb-protect-grid">
          {prot.map((pi) => (
            <div className="sb-protect-card" key={pi.label}>
              <div className="sb-protect-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={pi.d} />
                </svg>
              </div>
              <div className="sb-protect-body">
                <h4>{lc(pi.label)}</h4>
                <p>{lc(pi.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <main>
      {/* ===== Masthead ===== */}
      <section className="sb-mast">
        <div className="container">
          <div className="sb-crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span>
            <Link href="/products">{t("nav.products")}</Link> <span>/</span>
            <Link href={`/products?cat=${family.categoryId}`}>{lc(family.category)}</Link> <span>/</span>
            <span>{lc(family.name)}</span>
          </div>
          <ProductConfigurator family={family} members={members} valueProp={c.tagline || lc(family.blurb)} />
          <div className="sb-mast-stats cfg-stats">
            {(c.stats || []).slice(0, 4).map((s, i) => (
              <div className="sb-stat" key={i}>
                <div className="v" dangerouslySetInnerHTML={{ __html: `${s[0]}<sup>${s[1]}</sup>` }}></div>
                <div className="k">{lc(s[2])}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Hero — annotated render + monitor ===== */}
      {c.hero && (
        <section className="sb-section">
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.hero.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.hero.title }}></h2>
              <p>{c.hero.intro}</p>
            </div>
            {c.monitor && (
              <div className="led-readout sb-hero-monitor">
                {c.monitor.rows.map((r, i) => (
                  <div className="led-row" key={i}>
                    <span className="led-label">{r[0]}</span>
                    <span className={`led-digits lg ${r[3] ? "is-out" : ""}`}>
                      <span className="led-ghost">{"8".repeat(String(r[1]).length)}</span>
                      <span className="led-on">{r[1]}</span>
                      <span className="led-unit">{r[2]}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="sb-uses sb-hero-feats">
              {c.hero.callouts.map((co, i) => (
                <div className="sb-use" key={i}>
                  <div className="sb-use-ic">
                    <SbIcon name={co.icon} />
                  </div>
                  <h4>{co.title}</h4>
                  <p>{co.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(() => {
        const v = lead.videos && lead.videos.length ? videoSource(lead.videos[0]) : null;
        if (!v) return null;
        return (
          <section className="sb-section" style={{ paddingTop: 0 }}>
            <div className="container">
              <div className="sb-head is-center">
                <div className="sb-eyebrow">See it in action</div>
                <h2>Watch the <em>{lc(family.name)}</em>.</h2>
              </div>
              <div className="sb-video">
                {v.kind === "iframe" ? (
                  <iframe
                    src={v.src}
                    title={`${lc(family.name)} video`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={v.src} controls playsInline preload="metadata" />
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {c.benefitsEarly && benefitsBlock}
      {c.benefitsEarly && protectionsBlock}

      {/* ===== Tech — how it works (flow or pillars) ===== */}
      {c.tech && (
        <section className="sb-section" style={{ background: "var(--paper-2)" }}>
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.tech.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.tech.title }}></h2>
              <p>{c.tech.intro}</p>
            </div>
            {c.tech.mode === "flow" && c.tech.flow ? (
              <>
                <div className="sb-flow">
                  {c.tech.flow.map((f, i) => (
                    <span key={i} style={{ display: "contents" }}>
                      {i > 0 && <div className="sb-flow-arrow">→</div>}
                      <div className={`sb-flow-stage ${i === 1 ? "is-mid" : ""}`}>
                        <div className="sb-flow-tag">{f.tag}</div>
                        <SbWave kind={f.wave} />
                        <h4>{f.title}</h4>
                        <p>{f.desc}</p>
                      </div>
                    </span>
                  ))}
                </div>
                {c.tech.integrate && (
                  <>
                    <div className="sb-head is-center" style={{ marginTop: 56 }}>
                      <h3 className="sb-integrate-title">{t("sh.diagram.t")}</h3>
                      <p>{t("sh.diagram.d")}</p>
                    </div>
                    <PowersDiagram
                      items={c.tech.integrate.map(([cap, key]) => ({ label: cap, key }))}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="sb-pillars">
                {(c.tech.pillars || []).map((p, i) => (
                  <div className="sb-pillar" key={i}>
                    <div className="sb-pillar-ic">
                      <SbIcon name={p.icon} />
                    </div>
                    <h4>{p.title}</h4>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Cutaway — dark exploded band ===== */}
      {c.cutaway && (
        <section className="sb-section sb-dark">
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.cutaway.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.cutaway.title }}></h2>
              <p>{c.cutaway.intro}</p>
            </div>
            <AnnoStage
              src={c.cutaway.img}
              slotPlaceholder={c.cutaway.slot}
              callouts={c.cutaway.callouts}
              dark
              cover
              stageClass="sb-explode-stage"
              slotClass="sb-explode-product"
              height={520}
            />
            {c.cutaway.inset && (
              <div className="sb-explode-inset">
                <Slot src={c.cutaway.inset.img} label={c.cutaway.inset.slot} height={200} cover />
                <div className="txt">
                  <h4>{c.cutaway.inset.title}</h4>
                  <p>{c.cutaway.inset.desc}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Use cases ===== */}
      {c.useCases && (
        <section className="sb-section">
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.useCases.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.useCases.title }}></h2>
            </div>
            <div className="sb-uses">
              {c.useCases.items.map((u, i) => (
                <div className="sb-use" key={i}>
                  <div className="sb-use-ic">
                    <SbIcon name={u.icon} />
                  </div>
                  <h4>{u.title}</h4>
                  <p>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Benefits + protections ===== */}
      {!c.benefitsEarly && benefitsBlock}
      {!c.benefitsEarly && protectionsBlock}

      {/* ===== Comparison — this tech vs servo / relay ===== */}
      {c.comparison && (
        <section className="sb-section">
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.comparison.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.comparison.title }}></h2>
              <p>{c.comparison.intro}</p>
            </div>
            <div className="sb-cmp-wrap">
              <table className="sb-cmp">
                <thead>
                  <tr>
                    <th className="is-feature"></th>
                    {c.comparison.cols.map((col, i) => (
                      <th key={col} className={i === 0 ? "is-win" : ""}>
                        {i === 0 && <span className="sb-cmp-flag">Best</span>}
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.comparison.rows.map((r) => (
                    <tr key={r.label}>
                      <td className="is-feature">{r.label}</td>
                      {r.vals.map((v, i) => (
                        <td key={i} className={i === 0 ? "is-win" : ""}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.comparison.note && <p className="sb-spec-note">{c.comparison.note}</p>}
          </div>
        </section>
      )}

      {/* ===== Local market context (e.g. built for Pakistan) ===== */}
      {c.local && (
        <section className="sb-section" style={{ background: "var(--paper-2)" }}>
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{c.local.eyebrow}</div>
              <h2 dangerouslySetInnerHTML={{ __html: c.local.title }}></h2>
              <p>{c.local.intro}</p>
            </div>
            <div className="sb-uses">
              {c.local.items.map((u, i) => (
                <div className="sb-use" key={i}>
                  <div className="sb-use-ic">
                    <SbIcon name={u.icon} />
                  </div>
                  <h4>{u.title}</h4>
                  <p>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Tech params ===== */}
      <section className="sb-section" id="spec">
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("sh.spec.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sh.spec.t") }}></h2>
            <p>{t("sh.spec.d")}</p>
          </div>
          <ShowcaseSpec product={lead} />
          <p className="sb-spec-note">{t("sh.spec.note")}</p>

          {packed.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <div className="sb-head is-center" style={{ marginBottom: 28 }}>
                <h3 className="sb-integrate-title">{t("sh.pack.t")}</h3>
                <p>{t("sh.pack.d")}</p>
              </div>
              <div className="sb-spec-wrap">
                <table className="sb-spec sb-pack">
                  <thead>
                    <tr>
                      <th className="is-class">{t("sh.pack.model")}</th>
                      <th>{t("sh.pack.psize")}</th>
                      <th>{t("sh.pack.csize")}</th>
                      <th>{t("sh.pack.nw")}</th>
                      <th>{t("sh.pack.gw")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packed.map((p) => (
                      <tr key={p.id}>
                        <td className="param">{variantLabel(p)}</td>
                        <td className="val">{p.packing!.productSize}</td>
                        <td className="val">{p.packing!.packSize}</td>
                        <td className="val">{p.packing!.nw}</td>
                        <td className="val">{p.packing!.gw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FAQ — visible + emitted as FAQPage schema for AEO ===== */}
      {c.faqs && c.faqs.length > 0 && (
        <section className="sb-section" id="faq" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{t("sh.faq.k")}</div>
              <h2 dangerouslySetInnerHTML={{ __html: t("sh.faq.t") }}></h2>
            </div>
            <div className="sb-faq">
              {c.faqs.map((f, i) => (
                <details className="sb-faq-item" key={i} open={i === 0}>
                  <summary>{f.q}</summary>
                  <div className="sb-faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== How / where to buy ===== */}
      <section className="sb-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("sh.buy.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sh.buy.t") }}></h2>
          </div>
          <div className="sb-buy">
            <div className="sb-buy-card">
              <div className="sb-buy-step">01</div>
              <h4>{t("sh.buy1.t")}</h4>
              <p>{t("sh.buy1.d")}</p>
              <WhatsAppButton productName={family.name}>WhatsApp {SITE.phoneDisplay}</WhatsAppButton>
            </div>
            <div className="sb-buy-card">
              <div className="sb-buy-step">02</div>
              <h4>{t("sh.buy2.t")}</h4>
              <p>{t("sh.buy2.d")}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(SITE.mapsQuery)}`} target="_blank" rel="noopener" className="btn btn-ghost">
                {t("sh.getdir")} →
              </a>
            </div>
            <div className="sb-buy-card">
              <div className="sb-buy-step">03</div>
              <h4>{t("sh.buy3.t")}</h4>
              <p>{t("sh.buy3.d")}</p>
              <a href={tel} className="btn btn-ghost">
                {t("sh.callorder")} →
              </a>
            </div>
          </div>
          <div className="sb-buy-note">
            <strong>{t("sh.bulk")}</strong> {t("sh.bulk.d")}
            <WhatsAppButton variant="light" productName={`Bulk enquiry — ${family.name}`}>
              {t("sh.bulkbtn")}
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* ===== Explore other ranges (sibling families) ===== */}
      {related.length > 0 && (
        <section className="sb-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="num"></div>
              <h2 dangerouslySetInnerHTML={{ __html: t("sh.other.t") }}></h2>
              <Link href={`/products?cat=${family.categoryId}`} className="btn-link">
                {t("sh.seeall")} <span className="arrow">→</span>
              </Link>
            </div>
            <div className="home-cat-grid">
              {related.map((f) => (
                <Link key={f.slug} href={`/showcase/${f.slug}`} className="cat-tile" data-cat={f.categoryId}>
                  <div className="cat-tile-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/${f.image}`} alt={lc(f.name)} />
                  </div>
                  <div className="cat-tile-overlay"></div>
                  <div className="cat-tile-text">
                    <div className="cat-tile-sub">{lc(f.category)}</div>
                    <div className="cat-tile-label">{lc(f.name)}</div>
                    <div className="cat-tile-cta">{t("cta.viewshowcase")} →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
