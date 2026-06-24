"use client";
import { useState } from "react";
import Placeholder from "./Placeholder";

export default function PdpGallery({
  image,
  category,
}: {
  image: string;
  category: string;
}) {
  const [activeThumb, setActiveThumb] = useState(0);
  return (
    <div className="pdp-viewer">
      <div className="pdp-main-image">
        <Placeholder
          label={`${category.toUpperCase()} · ${(activeThumb + 1)
            .toString()
            .padStart(2, "0")}`}
          image={image}
        />
      </div>
      <div className="pdp-thumbs">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`pdp-thumb ${activeThumb === i ? "active" : ""}`}
            onClick={() => setActiveThumb(i)}
          >
            <Placeholder
              label={(i + 1).toString().padStart(2, "0")}
              image={i === 0 ? image : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
