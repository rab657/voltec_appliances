import type { Callout } from "@/lib/showcase-data";

// Monoline icon set (currentColor).
const SB_ICONS: Record<string, string> = {
  display: "M3 5h18v14H3zM7 10h4M7 14h7",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  terminal: "M3 8h18v8H3zM8 8V6M16 8V6M8 16v2M16 16v2",
  shield: "M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  home: "M4 11 12 4l8 7M6 10v9h12v-9",
  pulse: "M3 12h4l2-6 4 12 2-6h6",
  server: "M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01",
};

export function SbIcon({ name }: { name: string }) {
  const fan = name === "fan";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {fan ? (
        <>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10c0-4 .5-6-1.5-6S7 7 12 10M14 12c4 0 6-.5 6 1.5S17 17 14 12M12 14c0 4-.5 6 1.5 6S17 17 12 14M10 12c-4 0-6 .5-6-1.5S7 7 10 12" />
        </>
      ) : (
        <path d={SB_ICONS[name] || SB_ICONS.chip} />
      )}
    </svg>
  );
}

export const PROT_ICONS: Record<string, { d: string; label: string }> = {
  "over-current": { d: "M13 2 5 13h6l-1 9 9-12h-6z", label: "Over-current protection" },
  "over-volt": { d: "M12 4v10M8 10l4 4 4-4M6 20h12", label: "Over-voltage protection" },
  "under-volt": { d: "M12 20V10M8 14l4-4 4 4M6 4h12", label: "Under-voltage protection" },
  "over-temp": { d: "M10 13V5a2 2 0 1 1 4 0v8a4 4 0 1 1-4 0ZM12 9v5", label: "Over-temperature cut-off" },
  short: { d: "M4 12h5l2-4 2 8 2-4h5", label: "Short-circuit protection" },
};

const SB_GEO: Record<Callout["pos"], { dot: { x: number; y: number }; line: { x1: number; y1: number; x2: number; y2: number } }> = {
  tl: { dot: { x: 31, y: 24 }, line: { x1: 19, y1: 41, x2: 31, y2: 24 } },
  bl: { dot: { x: 35, y: 60 }, line: { x1: 19, y1: 64, x2: 35, y2: 60 } },
  tr: { dot: { x: 67, y: 30 }, line: { x1: 81, y1: 43, x2: 67, y2: 30 } },
  br: { dot: { x: 65, y: 66 }, line: { x1: 81, y1: 63, x2: 65, y2: 66 } },
};

export function SbWave({ kind }: { kind: "messy" | "flat" | "sine" }) {
  if (kind === "flat")
    return (
      <svg className="sb-wave" viewBox="0 0 120 56" preserveAspectRatio="none" fill="none">
        <path d="M0 38 H120" stroke="var(--steel-bright)" strokeWidth="2.4" />
        <path d="M0 18 H120" stroke="oklch(70% 0.04 240)" strokeWidth="1.4" strokeDasharray="3 4" />
      </svg>
    );
  if (kind === "sine")
    return (
      <svg className="sb-wave" viewBox="0 0 120 56" preserveAspectRatio="none" fill="none">
        <path d="M0 28 Q15 -2 30 28 T60 28 T90 28 T120 28" stroke="oklch(58% 0.13 150)" strokeWidth="2.4" />
      </svg>
    );
  return (
    <svg className="sb-wave" viewBox="0 0 120 56" preserveAspectRatio="none" fill="none">
      <path
        d="M0 28 L10 12 L18 40 L26 18 L34 44 L44 10 L52 36 L60 16 L70 42 L78 22 L88 38 L96 14 L106 34 L114 20 L120 30"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Replacement for the prototype's <image-slot>: shows the asset when a src is
// provided, otherwise a labelled striped placeholder. Fills its parent.
export function Slot({
  src,
  label,
  height,
}: {
  src?: string | null;
  label?: string;
  height?: number;
}) {
  const style: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: height ? `${height}px` : "100%",
    overflow: "hidden",
  };
  if (src) {
    const url = src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
    return (
      <div style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label || ""}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8%", background: "var(--paper)" }}
        />
      </div>
    );
  }
  return (
    <div style={style}>
      <div className="ph-stripes"></div>
      <div className="ph-label">{label}</div>
    </div>
  );
}

// Annotated render stage with leader lines + callout chips (light or dark).
export function AnnoStage({
  src,
  slotPlaceholder,
  callouts,
  dark = false,
  stageClass,
  slotClass,
  height,
  center,
}: {
  src?: string | null;
  slotPlaceholder: string;
  callouts: Callout[];
  dark?: boolean;
  stageClass: string;
  slotClass: string;
  height: number;
  /** Optional node rendered in place of the product image (e.g. a live monitor). */
  center?: React.ReactNode;
}) {
  return (
    <div className={stageClass}>
      {dark && <div className="sb-explode-glow"></div>}
      <div className={slotClass}>
        {center ? (
          <div className="sb-anno-center" style={{ minHeight: height }}>
            {center}
          </div>
        ) : (
          <Slot src={src} label={slotPlaceholder} height={height} />
        )}
        {!center && (
          <svg className="sb-anno-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {callouts.map((c) => {
              const g = SB_GEO[c.pos];
              return (
                <line
                  key={c.pos}
                  x1={g.line.x1}
                  y1={g.line.y1}
                  x2={g.line.x2}
                  y2={g.line.y2}
                  stroke="var(--steel-bright)"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        )}
        {callouts.map((c) => {
          const g = SB_GEO[c.pos];
          return (
            <span key={`d-${c.pos}`}>
              {!center && <span className="sb-anno-dot" style={{ left: `${g.dot.x}%`, top: `${g.dot.y}%` }}></span>}
              <div className={`sb-anno ${c.pos} ${dark ? "dark" : ""}`}>
                <div className="sb-anno-chip">
                  <h4>
                    <SbIcon name={c.icon} />
                    {c.title}
                  </h4>
                  <p>{c.desc}</p>
                </div>
              </div>
            </span>
          );
        })}
      </div>
      <div className="sb-anno-list">
        {callouts.map((c) => (
          <div
            className="sb-anno-chip"
            key={c.pos}
            style={dark ? { background: "oklch(28% 0.02 255)", borderColor: "oklch(50% 0.04 240 / 0.5)" } : undefined}
          >
            <h4 style={dark ? { color: "#fff" } : undefined}>
              <SbIcon name={c.icon} />
              {c.title}
            </h4>
            <p style={dark ? { color: "oklch(75% 0.03 240)" } : undefined}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
