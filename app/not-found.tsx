import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/products";

// A URL that cannot be rescued (see lib/slug-rescue.ts) still must not be a dead
// end. Next's default 404 is a bare string; this one keeps the reader moving and
// gives an answer engine something to read instead of an empty page.
//
// This is deliberately NOT a redirect. Bouncing every unknown URL to the homepage
// is a "soft 404": Google discards the equity and can distrust the whole site.
// A real 404 with real onward links is the correct behaviour.
export const metadata = { robots: { index: false, follow: true } };

export default async function NotFound() {
  const t = await getT();
  const links: [string, string][] = [
    ["/products", t("nav.shopAll")],
    ["/products?cat=stabilizers", t("cat.stabilizers")],
    ["/products?cat=cells", t("cat.cells")],
    ["/industrial", t("cat.industrial")],
    ["/blog", t("nav.blog")],
    ["/contact", t("nav.contact")],
  ];
  return (
    <main className="section">
      <div className="container med-narrow" style={{ paddingBlock: "48px 72px" }}>
        <div className="eyebrow">404</div>
        <h1 style={{ marginTop: 12 }}>{t("nf.title")}</h1>
        <p className="page-lede" style={{ marginTop: 12 }}>
          {t("nf.body")}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "28px 0 36px" }}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="btn btn-ghost">
              {label}
            </Link>
          ))}
        </div>

        <p>
          {t("nf.help")}{" "}
          <a href={whatsappLink(t("nf.wa"))} target="_blank" rel="noopener noreferrer">
            {SITE.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
