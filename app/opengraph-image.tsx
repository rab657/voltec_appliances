import { ImageResponse } from "next/og";

// Branded default social-share card (1200×630). Applies to the homepage and any
// route that doesn't set its own openGraph image. Clean corporate look — brand
// maroon, wordmark, value prop — no stock imagery.
export const alt = "Voltec Appliances — Power you can rely on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #2a1417 0%, #4a1f23 58%, #1a1012 100%)",
          padding: "72px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#e8d9c4",
              color: "#4a1f23",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
            VOLTEC APPLIANCES
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.05, maxWidth: 940 }}>
            Power you can rely on. Power that never quits.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#e8d9c4", maxWidth: 900 }}>
            Voltage stabilizers · EVE lithium cells · power electronics — Lahore, since 1995.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#d8c4b0",
            borderTop: "1px solid rgba(232,217,196,0.25)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex" }}>voltecappliances.com</div>
          <div style={{ display: "flex" }}>Pakistan · UAE · China</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
