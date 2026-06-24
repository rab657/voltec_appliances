"use client";
import { useState } from "react";
import Placeholder from "./Placeholder";

export default function PdpGallery({
  image,
  images,
  category,
}: {
  image: string;
  images?: string[];
  category: string;
}) {
  // Effective gallery: admin-managed images if present, else the single image.
  const gallery = (images && images.length ? images : [image]).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = gallery[active] || image;
  // Keep at least 4 thumb cells so the layout stays stable for single-image products.
  const thumbCount = Math.max(gallery.length, 4);

  return (
    <div className="pdp-viewer">
      <div className="pdp-main-image">
        <Placeholder
          label={`${category.toUpperCase()} · ${(active + 1).toString().padStart(2, "0")}`}
          image={current}
        />
      </div>
      <div className="pdp-thumbs">
        {Array.from({ length: thumbCount }).map((_, i) => (
          <div
            key={i}
            className={`pdp-thumb ${active === i ? "active" : ""}`}
            onClick={() => i < gallery.length && setActive(i)}
            style={i >= gallery.length ? { cursor: "default" } : undefined}
          >
            <Placeholder label={(i + 1).toString().padStart(2, "0")} image={gallery[i] || null} />
          </div>
        ))}
      </div>
    </div>
  );
}
