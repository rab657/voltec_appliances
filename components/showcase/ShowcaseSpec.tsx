import type { Product } from "@/lib/types";
import { PRODUCTS } from "@/lib/products";
import { familyOf } from "@/lib/showcase-data";
import { getT, getContent } from "@/lib/i18n-server";
import { variantLabel } from "@/lib/variant-label";

export default async function ShowcaseSpec({ product }: { product: Product }) {
  const t = await getT();
  const { lc } = await getContent();
  const fam = familyOf(product);
  const sibs = PRODUCTS.filter((p) => familyOf(p) === fam);

  // De-dupe identical variant labels, cap at 5 columns, keep the current product.
  const seen = new Set<string>();
  const cols: Product[] = [];
  for (const p of sibs) {
    const l = variantLabel(p);
    if (!seen.has(l) && cols.length < 6) {
      seen.add(l);
      cols.push(p);
    }
  }
  if (!cols.find((p) => p.id === product.id)) cols[0] = product;

  // Union of spec keys, ordered by current product then others.
  const keys: string[] = [];
  const push = (k: string) => {
    if (!keys.includes(k)) keys.push(k);
  };
  product.specs.forEach(([k]) => push(k));
  cols.forEach((p) => p.specs.forEach(([k]) => push(k)));

  const valFor = (p: Product, k: string) => {
    const r = p.specs.find((s) => s[0] === k);
    return r ? r[1] : "—";
  };
  const single = cols.length === 1;

  return (
    <div className="sb-spec-wrap">
      <table className="sb-spec">
        <thead>
          <tr>
            <th className="is-class">{t("tbl.param")}</th>
            {single ? (
              <th>{t("tbl.spec")}</th>
            ) : (
              cols.map((p) => <th key={p.id}>{variantLabel(p)}</th>)
            )}
          </tr>
        </thead>
        <tbody>
          {keys.map((k, i) => {
            const vals = cols.map((p) => lc(valFor(p, k)));
            const allSame = vals.every((v) => v === vals[0]);
            return (
              <tr key={i}>
                <td className="param">{lc(k)}</td>
                {single ? (
                  <td className="val">{vals[0]}</td>
                ) : allSame ? (
                  <td className="span" colSpan={cols.length}>
                    {vals[0]}
                  </td>
                ) : (
                  vals.map((v, vi) => (
                    <td className="val" key={vi}>
                      {v}
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
