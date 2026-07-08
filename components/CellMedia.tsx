"use client";
import { useState } from "react";

// Masthead media gallery for a cell page — photos + product videos, thumbnail
// switcher. Reuses the .cell-gallery/.cell-stage/.cell-thumbs styles.
export type CellMediaItem = { type: "img" | "video"; src: string; poster?: string; alt: string };

export default function CellMedia({ media, format }: { media: CellMediaItem[]; format?: string }) {
  const [active, setActive] = useState(0);
  const m = media[active] || media[0];
  return (
    <div className="cell-gallery">
      <div className="cell-stage">
        {format && <span className="cellpg-format" style={{ zIndex: 2 }}>{format}</span>}
        {m.type === "img" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.src} alt={m.alt} />
        ) : (
          <video src={m.src} poster={m.poster} controls playsInline preload="none" />
        )}
      </div>
      {media.length > 1 && (
        <div className="cell-thumbs" style={{ gridTemplateColumns: `repeat(${media.length}, 1fr)` }}>
          {media.map((x, i) => (
            <button key={x.src} type="button" className={`cell-thumb ${i === active ? "is-active" : ""}`} onClick={() => setActive(i)} aria-label={x.alt}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.type === "img" ? x.src : x.poster} alt="" />
              {x.type === "video" && <span className="cell-thumb-play" aria-hidden="true">▶</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
