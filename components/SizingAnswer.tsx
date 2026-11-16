import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import TrackEvent from "@/components/TrackEvent";
import { whatsappMessage, type SizingResult } from "@/lib/sizing";

// The answer block shared by the calculator and every /stabilizer-size page.
// Server-rendered on purpose: the number, the model and the working are all in
// the HTML, so an answer engine that fetches the URL can read and quote them.
export default function SizingAnswer({ r, from }: { r: SizingResult; from: string }) {
  if (!r.hasLoad) return null;
  const rec = r.recommended;

  return (
    <div className="sz-answer" id="answer">
      <TrackEvent
        event="sizing_result"
        params={{ from, kva: r.requiredKva, model: rec?.id || "none", basis: r.basis }}
      />
      <div className="sz-answer-top">
        <div>
          <div className="sz-k">You need about</div>
          <div className="sz-big">
            {r.requiredKva} <span>kVA</span>
          </div>
          <div className="sz-sub">
            {r.basis === "solar_inverter"
              ? `Inverter ${r.input.solarKva} kVA + ${r.marginPct}%`
              : `Running load ${r.runningVA.toLocaleString("en-US")} VA + ${r.marginPct}% for start-up surge`}
          </div>
        </div>
        {rec && (
          <div className="sz-rec">
            <div className="sz-k">Voltec recommends</div>
            <Link href={rec.path} className="sz-rec-name">
              {rec.name}
            </Link>
            <p className="sz-rec-why">{rec.why}</p>
            <div className="sz-rec-range">
              <span className="sz-k">Input range</span> {r.inputRange}
            </div>
          </div>
        )}
      </div>

      <p className="sz-summary">{r.summary}</p>

      <div className="sz-cta">
        <WhatsAppButton lead from={from} productName={rec?.name || "stabilizer sizing"} message={whatsappMessage(r)}>
          Get the price on WhatsApp
        </WhatsAppButton>
        <span className="sz-cta-note">We reply with today&apos;s price for your city, in writing.</span>
      </div>

      {r.notes.length > 0 && (
        <ul className="sz-notes">
          {r.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      {r.alternatives.length > 0 && (
        <div className="sz-alts">
          <div className="sz-k">Also consider</div>
          {r.alternatives.map((a) => (
            <p key={a.id}>
              <Link href={a.path}>{a.name}</Link> — {a.why}
            </p>
          ))}
        </div>
      )}

      {r.lines.length > 0 && (
        <table className="sz-table">
          <caption>How we worked it out</caption>
          <thead>
            <tr>
              <th>Load</th>
              <th className="num">Qty</th>
              <th className="num">VA each</th>
              <th className="num">VA</th>
            </tr>
          </thead>
          <tbody>
            {r.lines.map((l) => (
              <tr key={l.label}>
                <td>{l.label}</td>
                <td className="num">{l.qty}</td>
                <td className="num">{l.vaEach.toLocaleString("en-US")}</td>
                <td className="num">{l.va.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Running load</td>
              <td className="num">{r.runningVA.toLocaleString("en-US")}</td>
            </tr>
            <tr>
              <td colSpan={3}>+ {r.marginPct}% start-up margin</td>
              <td className="num">{Math.round(r.runningVA * (1 + r.marginPct / 100)).toLocaleString("en-US")}</td>
            </tr>
            {r.basis === "solar_inverter" && (
              <tr>
                <td colSpan={3}>Solar inverter {r.input.solarKva} kVA + {r.marginPct}% (larger, so used)</td>
                <td className="num">{r.requiredVA.toLocaleString("en-US")}</td>
              </tr>
            )}
          </tfoot>
        </table>
      )}
    </div>
  );
}
