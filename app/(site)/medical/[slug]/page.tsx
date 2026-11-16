import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MedicalLanding from "@/components/MedicalLanding";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";
import { MEDICAL_PAGES, getMedicalPage } from "@/lib/medical-pages";

// One page per medical equipment type. Content lives in lib/medical-pages.ts.
export function generateStaticParams() {
  return MEDICAL_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getMedicalPage(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/medical/${slug}` },
    openGraph: { type: "website", title: p.title, description: p.description, url: absUrl(`/medical/${slug}`) },
  };
}

export default async function MedicalSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getMedicalPage(slug);
  if (!p) notFound();
  const t = await getT();
  return <MedicalLanding page={p} homeLabel={t("nav.home")} />;
}
