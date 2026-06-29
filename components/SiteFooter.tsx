import Link from "next/link";
import { SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

export default async function SiteFooter() {
  const t = await getT();
  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div className="brand-col">
            <h2>
              Voltec<em style={{ fontStyle: "italic" }}>.</em>
            </h2>
            <p>{t("foot.blurb")}</p>
          </div>
          <div>
            <h4>{t("foot.products")}</h4>
            <ul>
              <li>
                <Link href="/showcase/svc">{t("foot.igbt")}</Link>
              </li>
              <li>
                <Link href="/products?cat=cells">{t("foot.cells")}</Link>
              </li>
              <li>
                <Link href="/products?cat=industrial">{t("foot.industrial")}</Link>
              </li>
              <li>
                <Link href="/products?cat=stabilizers">{t("foot.homeavr")}</Link>
              </li>
              <li>
                <Link href="/products?cat=parts">{t("foot.parts")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t("foot.company")}</h4>
            <ul>
              <li>
                <Link href="/medical">{t("foot.medical")}</Link>
              </li>
              <li>
                <Link href="/about">{t("foot.about")}</Link>
              </li>
              <li>
                <Link href="/blog">{t("foot.blog")}</Link>
              </li>
              <li>
                <Link href="/admin">{t("foot.editor")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("foot.contact")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t("foot.reach")}</h4>
            <ul>
              <li>{SITE.email}</li>
              <li>UAE {SITE.phoneUae}</li>
              <li>PK {SITE.phoneDisplay}</li>
              <li>WeChat: {SITE.wechat}</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {SITE.established + 25} Voltec Appliances Global</span>
          <span>{SITE.cities.join(" · ")}</span>
        </div>
      </div>
    </footer>
  );
}
