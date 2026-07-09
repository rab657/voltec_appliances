import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/stabilizer.css";
import {
  FAMILIES,
  familyBySlug,
  membersOf,
  leadOf,
  showcaseFor,
} from "@/lib/showcase-data";
import Showcase from "@/components/showcase/Showcase";
import CellsHub from "@/components/showcase/CellsHub";
import JsonLd from "@/components/JsonLd";
import ViewItemTracker from "@/components/ViewItemTracker";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { productOffer } from "@/lib/product-offer";
import { getMediaMap, resolveProducts } from "@/lib/product-media";

export function generateStaticParams() {
  return FAMILIES.filter((f) => !f.hidden).map((f) => ({ family: f.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/showcase/[family]">): Promise<Metadata> {
  const { family: slug } = await params;
  const family = familyBySlug(slug);
  if (!family || family.hidden) return { title: "Range not found" };
  const c = showcaseFor(leadOf(membersOf(family)));
  return {
    title: `${family.name} — Showcase & all models`,
    description: c.tagline || family.blurb,
    alternates: { canonical: `/showcase/${family.slug}` },
    openGraph: {
      type: "website",
      title: `${family.name} | ${SITE.name}`,
      description: c.tagline || family.blurb,
      url: absUrl(`/showcase/${family.slug}`),
      images: [{ url: absUrl(`/${family.image}`) }],
    },
  };
}

export default async function ShowcasePage({
  params,
}: PageProps<"/showcase/[family]">) {
  const { family: slug } = await params;
  const family = familyBySlug(slug);
  if (!family || family.hidden) notFound();

  const mediaMap = await getMediaMap();
  // Resolve = code products (name/media applied) + admin-created variants.
  const merged = membersOf(family, resolveProducts(mediaMap));
  const visible = merged.filter((p) => !p.hidden);
  // Fall back to the full (merged) set if an editor hid every model, so the
  // model picker never renders empty.
  const members = visible.length ? visible : merged;
  const lead = leadOf(members);

  return (
    <>
      <ViewItemTracker id={family.slug} name={family.name} category={family.category} />
      {/* Collection + every model as an ItemList — strong product-grid SEO/AEO signal */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${family.name} — ${SITE.shortName}`,
          description: showcaseFor(lead).tagline || family.blurb,
          url: absUrl(`/showcase/${family.slug}`),
          isPartOf: { "@type": "WebSite", name: SITE.name, url: absUrl("/") },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: members.length,
            // Google requires Product markup to carry offers, review or
            // aggregateRating — a bare Product is a "critical issue" in the
            // Product snippets report. So: full Product only for priced
            // members; inquiry-only members stay plain ListItems (name + url).
            itemListElement: members.map((p, i) => {
              const offers = productOffer(p);
              return {
                "@type": "ListItem",
                position: i + 1,
                ...(offers
                  ? {
                      item: {
                        "@type": "Product",
                        name: p.name,
                        description: p.description,
                        category: p.category,
                        sku: p.id.toUpperCase(),
                        brand: { "@type": "Brand", name: SITE.shortName },
                        image: absUrl(`/${p.image}`),
                        manufacturer: VOLTEC_ORG,
                        url: absUrl(`/products/${p.id}`),
                        additionalProperty: p.specs.map(([k, v]) => ({
                          "@type": "PropertyValue",
                          name: k,
                          value: v,
                        })),
                        offers,
                      },
                    }
                  : { name: p.name, url: absUrl(`/products/${p.id}`) }),
              };
            }),
          },
        }}
      />
      {(() => {
        const faqs = showcaseFor(lead).faqs;
        return faqs && faqs.length > 0 ? (
          <JsonLd
            id="ld-faq"
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }}
          />
        ) : null;
      })()}
      {family.slug === "cells" ? (
        <CellsHub family={family} members={members} />
      ) : (
        <Showcase family={family} lead={lead} members={members} />
      )}
    </>
  );
}
