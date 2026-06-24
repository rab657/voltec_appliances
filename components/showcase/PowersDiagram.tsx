// "Speaks to people" use-case diagram — the stabilizer in the middle, wired to
// the everyday appliances it protects (AC, fridge, TV, washing machine).
// On-brand SVG, no photography needed. Mirrors the product brochure's use-case page.

type ApplianceIcon = "laser" | "medical" | "cnc" | "server" | "ac" | "fridge" | "tv" | "wash" | "generic";

function pickIcon(label: string, key?: string): ApplianceIcon {
  const s = `${key || ""} ${label}`.toLowerCase();
  if (/laser/.test(s)) return "laser";
  if (/medical|imaging|clinic|diagnost/.test(s)) return "medical";
  if (/cnc|precision|machine|mill/.test(s)) return "cnc";
  if (/lab|server|it\b|broadcast|instrument/.test(s)) return "server";
  if (/ac|air|cond/.test(s)) return "ac";
  if (/fridge|refriger|cool/.test(s)) return "fridge";
  if (/tv|electron|screen/.test(s)) return "tv";
  if (/wash|laundr/.test(s)) return "wash";
  return "generic";
}

function ApplianceGlyph({ kind }: { kind: ApplianceIcon }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "laser":
      return (
        <g {...common}>
          <rect x="-22" y="-10" width="30" height="20" rx="3" />
          <path d="M-14 -3h14M-14 3h10" />
          <path d="M8 0h16" />
          <path d="M24 -4v8" />
        </g>
      );
    case "medical":
      return (
        <g {...common}>
          <rect x="-16" y="-16" width="32" height="32" rx="6" />
          <path d="M0 -8v16M-8 0h16" />
        </g>
      );
    case "cnc":
      return (
        <g {...common}>
          <circle cx="0" cy="0" r="8" />
          <path d="M0 -14v6M0 8v6M-14 0h6M8 0h6M-10 -10l4 4M10 10l-4-4M-10 10l4-4M10 -10l-4 4" />
        </g>
      );
    case "server":
      return (
        <g {...common}>
          <rect x="-16" y="-16" width="32" height="13" rx="2" />
          <rect x="-16" y="3" width="32" height="13" rx="2" />
          <path d="M-11 -9.5h.01M-11 9.5h.01M-7 -9.5h.01M-7 9.5h.01" />
        </g>
      );
    case "ac":
      return (
        <g {...common}>
          <rect x="-22" y="-12" width="44" height="20" rx="4" />
          <path d="M-15 2h30M-15 5.5h22" />
          <path d="M-12 13c2 3 6 3 8 0M4 13c2 3 6 3 8 0" />
        </g>
      );
    case "fridge":
      return (
        <g {...common}>
          <rect x="-14" y="-20" width="28" height="40" rx="4" />
          <path d="M-14 -4h28" />
          <path d="M-8 -16v6M-8 0v8" />
        </g>
      );
    case "tv":
      return (
        <g {...common}>
          <rect x="-22" y="-16" width="44" height="28" rx="3" />
          <path d="M-8 18h16M0 12v6" />
        </g>
      );
    case "wash":
      return (
        <g {...common}>
          <rect x="-18" y="-20" width="36" height="40" rx="4" />
          <circle cx="0" cy="4" r="10" />
          <path d="M-12 -13h.01M-4 -13h.01" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <path d="M-2 -18 -12 2h10l-2 16 12-22H-2z" />
        </g>
      );
  }
}

export default function PowersDiagram({
  items,
}: {
  items: { label: string; key?: string }[];
}) {
  // Up to four appliances, one per corner around the central unit.
  const nodes = items.slice(0, 4);
  const slots = [
    { x: 150, y: 118 }, // top-left
    { x: 770, y: 118 }, // top-right
    { x: 150, y: 322 }, // bottom-left
    { x: 770, y: 322 }, // bottom-right
  ];
  const hub = { x: 460, y: 220 };

  return (
    <div className="pd-wrap">
      <svg viewBox="0 0 920 440" role="img" aria-label="Voltec stabilizer powering home appliances" className="pd-svg">
        {/* connecting wires (behind everything) */}
        {nodes.map((n, i) => (
          <line key={`l${i}`} className="pd-line" x1={hub.x} y1={hub.y} x2={slots[i].x} y2={slots[i].y} />
        ))}

        {/* central stabilizer unit */}
        <g>
          <rect className="pd-hub" x={hub.x - 78} y={hub.y - 86} width="156" height="172" rx="16" />
          <rect className="pd-hub-screen" x={hub.x - 50} y={hub.y - 60} width="100" height="40" rx="6" />
          <text className="pd-hub-reading" x={hub.x} y={hub.y - 33}>220V</text>
          <text className="pd-hub-name" x={hub.x} y={hub.y + 20}>VOLTEC</text>
          <text className="pd-hub-sub" x={hub.x} y={hub.y + 44}>Inverter Stabilizer</text>
          <circle className="pd-hub-dot" cx={hub.x} cy={hub.y + 64} r="4" />
        </g>

        {/* appliance nodes */}
        {nodes.map((n, i) => {
          const kind = pickIcon(n.label, n.key);
          const { x, y } = slots[i];
          return (
            <g key={`n${i}`}>
              <circle className="pd-node" cx={x} cy={y} r="46" />
              <g className="pd-node-ic" transform={`translate(${x} ${y - 4})`}>
                <ApplianceGlyph kind={kind} />
              </g>
              <text className="pd-node-label" x={x} y={y + (y < 220 ? -62 : 70)}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
