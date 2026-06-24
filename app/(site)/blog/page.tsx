import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { getPostSeo } from "@/lib/blog-data";
import WhatsAppButton from "@/components/WhatsAppButton";
import BlogList from "@/components/BlogList";
import JsonLd from "@/components/JsonLd";
import { SITE, VOLTEC_ORG } from "@/lib/site";
import { getT, getContent } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Blog — Solar, Batteries & Voltage Stabilizers in Pakistan",
  description:
    "Practical guides, buyer tips, and real case studies on solar storage, lithium batteries, and voltage stabilizers for Pakistani homes, shops, and factories.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Voltec Blog — Power & Energy Guides for Pakistan",
    description:
      "Practical guides, buyer tips, and real case studies on solar storage, lithium batteries, and voltage stabilizers.",
  },
};

export default async function BlogPage() {
  const t = await getT();
  const { lc } = await getContent();
  const published = await getPublishedPosts();
  const featured = published[0];

  // Aggregate FAQs across posts for an answer-engine-friendly Q&A block.
  const allFaqs: { q: string; a: string; slug: string }[] = [];
  published.forEach((p) => {
    const seo = getPostSeo(p);
    if (seo.faqs) seo.faqs.forEach((f) => allFaqs.push({ ...f, slug: p.slug }));
  });
  const topFaqs = allFaqs.slice(0, 8);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Voltec Blog",
          description:
            "Guides, buyer tips, and case studies on solar storage, lithium batteries, and voltage stabilizers for Pakistan.",
          publisher: VOLTEC_ORG,
          inLanguage: SITE.locale,
          blogPost: published.slice(0, 10).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            articleSection: p.category,
            author: { "@type": "Organization", name: SITE.name },
          })),
        }}
      />
      {topFaqs.length > 0 && (
        <JsonLd
          id="ld-faq"
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: topFaqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <section className="kb-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("blog.crumb")}</span>
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: t("blog.h1") }}></h1>
          <p>{t("blog.intro")}</p>
        </div>
      </section>

      {topFaqs.length > 0 && (
        <section className="kb-qa">
          <div className="container">
            <div className="kb-qa-grid">
              <div className="kb-qa-aside">
                <div className="eyebrow">{t("blog.qa.k")}</div>
                <h2 dangerouslySetInnerHTML={{ __html: t("blog.qa.t") }}></h2>
                <p>{t("blog.qa.d")}</p>
                <WhatsAppButton>{t("blog.qa.btn")}</WhatsAppButton>
              </div>
              <div className="kb-qa-list">
                {topFaqs.map((f, i) => (
                  <details key={i} className="kb-faq" open={i === 0}>
                    <summary>
                      {lc(f.q)}
                      <span className="kb-plus"></span>
                    </summary>
                    <div className="kb-faq-a">
                      <p>{lc(f.a)}</p>
                      <Link href={`/blog/${f.slug}`} className="kb-faq-more">
                        {t("blog.readfull")} →
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {featured && (
        <section className="section" style={{ paddingBottom: 32 }}>
          <div className="container">
            <Link href={`/blog/${featured.slug}`} className="kb-featured">
              <div className="kb-featured-text">
                <span className="kb-tag">{t("blog.featured")} · {lc(featured.category)}</span>
                <h2>{lc(featured.title)}</h2>
                <p>{lc(featured.excerpt)}</p>
                <span className="kb-featured-meta">
                  {lc(featured.author)} · {featured.readTime} {t("blog.minread")} · {featured.date}
                </span>
              </div>
              <span className="kb-featured-cta">{t("blog.readguide")} →</span>
            </Link>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <BlogList posts={published} />
        </div>
      </section>
    </main>
  );
}
