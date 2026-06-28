import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";
import { getPostSeo } from "@/lib/blog-data";
import { coverFor } from "@/lib/blog-covers";
import { renderBody } from "@/lib/blog-render";
import { whatsappLink } from "@/lib/products";
import Placeholder from "@/components/Placeholder";
import ArticleAside from "@/components/ArticleAside";
import JsonLd from "@/components/JsonLd";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { getT, getContent } from "@/lib/i18n-server";
import { BLOG_BODY } from "@/lib/blog-i18n";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  const seo = getPostSeo(post);
  const cover = coverFor(post.slug);
  const ogImages = cover ? [{ url: absUrl(`/${cover}`), width: 1200, height: 630, alt: post.title }] : undefined;
  return {
    title: post.metaTitle || post.title,
    description: seo.metaDescription,
    keywords: seo.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: seo.metaDescription,
      url: absUrl(`/blog/${post.slug}`),
      publishedTime: post.date,
      section: post.category,
      images: ogImages,
    },
    twitter: { card: "summary_large_image", title: post.title, description: seo.metaDescription, images: ogImages?.map((i) => i.url) },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const t = await getT();
  const { lc, locale } = await getContent();
  const localizedBody = BLOG_BODY[locale]?.[post.id] ?? post.body;
  const { html, headings } = renderBody(localizedBody);
  const seo = getPostSeo(post);
  const all = await getPublishedPosts();
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);
  const initials = post.author.split(" ").map((n) => n[0]).join("");

  return (
    <main>
      <JsonLd
        id="ld-article"
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: seo.metaDescription,
          keywords: seo.keywords.join(", "),
          articleSection: post.category,
          datePublished: post.date,
          dateModified: post.date,
          author: { "@type": "Organization", name: SITE.name },
          publisher: VOLTEC_ORG,
          inLanguage: SITE.locale,
          mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(`/blog/${post.slug}`) },
        }}
      />
      <JsonLd
        id="ld-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "Blog", item: absUrl("/blog") },
            { "@type": "ListItem", position: 3, name: post.title },
          ],
        }}
      />
      {seo.faqs && (
        <JsonLd
          id="ld-faq"
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: seo.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <article>
        <section className="article-hero">
          <div className="container">
            <div
              className="crumbs"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                display: "flex",
                gap: 10,
                marginBottom: 28,
              }}
            >
              <Link href="/">{t("nav.home")}</Link> <span>/</span>
              <Link href="/blog">{t("nav.blog")}</Link> <span>/</span>
              <span>{lc(post.category)}</span>
            </div>
            <div className="meta-line" style={{ marginBottom: 8 }}>
              <span className="category">{lc(post.category)}</span>
              <span className="sep"></span>
              <span>{post.date}</span>
              <span className="sep"></span>
              <span>{post.readTime} {t("blog.minread")}</span>
            </div>
            <h1>{lc(post.title)}</h1>
            <p className="lede" style={{ maxWidth: "50ch" }}>
              {lc(post.excerpt)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "var(--paper-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontStyle: "italic",
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{lc(post.author)}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em" }}>
                  {lc(post.authorRole)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0 0" }}>
          <div className="container">
            <div className="article-cover">
              <Placeholder image={coverFor(post.slug)} contain={false} label={lc(post.category).toUpperCase() + " · COVER"} />
            </div>
          </div>
        </section>

        {seo.takeaways && (
          <section style={{ padding: "48px 0 0" }}>
            <div className="container">
              <div className="tldr">
                <div className="tldr-label">{t("blog.takeaways")}</div>
                <ul>
                  {seo.takeaways.map((tk, i) => (
                    <li key={i}>{lc(tk)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="container">
            <div className="article-body">
              <ArticleAside headings={headings} />
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              <div className="sidemeta">
                <div style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 10, marginBottom: 14 }}>
                  {t("blog.metadata")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 11 }}>
                  <div>
                    <div style={{ color: "var(--ink-3)" }}>{t("blog.cat")}</div>
                    <div style={{ color: "var(--ink)", marginTop: 3 }}>{lc(post.category)}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--ink-3)" }}>{t("blog.published")}</div>
                    <div style={{ color: "var(--ink)", marginTop: 3 }}>{post.date}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--ink-3)" }}>{t("blog.readingtime")}</div>
                    <div style={{ color: "var(--ink)", marginTop: 3 }}>{post.readTime} {t("blog.min")}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--ink-3)" }}>{t("blog.author")}</div>
                    <div style={{ color: "var(--ink)", marginTop: 3 }}>{lc(post.author)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {seo.faqs && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container">
              <div className="faq-wrap">
                <div className="faq-aside">
                  <div
                    className="num"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                      marginBottom: 14,
                    }}
                  >
                    {t("blog.faq.n")}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "clamp(30px,3.6vw,46px)",
                      lineHeight: 1.02,
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                    dangerouslySetInnerHTML={{ __html: t("blog.faq.t") }}
                  />
                  <p style={{ marginTop: 16, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
                    {t("blog.faq.d1")}{" "}
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noopener"
                      style={{ color: "var(--accent-deep)", borderBottom: "1px solid currentColor" }}
                    >
                      {t("blog.faq.wa")}
                    </a>{" "}
                    {t("blog.faq.d2")}
                  </p>
                </div>
                <div className="faq-list">
                  {seo.faqs.map((f, i) => (
                    <details key={i} className="faq-item" open={i === 0}>
                      <summary>
                        {lc(f.q)}
                        <span className="faq-plus"></span>
                      </summary>
                      <div className="faq-a">{lc(f.a)}</div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="section hairline-top">
          <div className="container">
            <div className="section-head">
              <div className="num">{t("blog.continue")}</div>
              <h2 dangerouslySetInnerHTML={{ __html: t("blog.more.t") }} />
              <Link href="/blog" className="btn-link">
                {t("blog.allarticles")} <span className="arrow">→</span>
              </Link>
            </div>
            <div className="blog-list" style={{ marginTop: 0 }}>
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="article-card">
                  <div className="article-thumb">
                    <Placeholder image={coverFor(p.slug)} contain={false} label={lc(p.category).toUpperCase()} />
                  </div>
                  <div className="meta-row">
                    <span>{lc(p.category)}</span>
                    <span>{p.readTime} {t("blog.min")}</span>
                  </div>
                  <h3>{lc(p.title)}</h3>
                  <p>{lc(p.excerpt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
