"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

export type HeroSlide = {
  key: string;
  href: string;
  img: string;
  alt: string;
  // "cover" = full-bleed photo; "contain" = studio shot on white, shown whole.
  fit: "cover" | "contain";
  tech: string;
  badge: string;
  title: string;
  sub: string;
  link: string;
};

const INTERVAL_MS = 5500;

// Homepage hero feature: auto-rotating crossfade through the lines we sell, so
// the hero shows stabilizers as well as the EVE cells. Pauses on hover/focus,
// when the tab is hidden, and never auto-advances under reduced motion.
export default function HeroSlider({
  slides,
  labels,
}: {
  slides: HeroSlide[];
  labels: { prev: string; next: string; go: string };
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) go(i + 1);
    }, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [i, paused, reduced, n, go]);

  return (
    <div
      className="vhero-feature vhero-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={slides[i]?.title}
      data-paused={paused || reduced ? "" : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((s, idx) => (
        <div
          key={s.key}
          className="vhero-slide"
          data-active={idx === i ? "" : undefined}
          data-fit={s.fit}
          aria-hidden={idx !== i}
          role="group"
          aria-roledescription="slide"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.img}
            alt={s.alt}
            className="vhero-feature-img"
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "low"}
          />
          <div className="vhero-feature-overlay"></div>
          <div className="vhero-feature-badge">
            <span className="ec-tech" data-tech={s.tech}>
              {s.badge}
            </span>
            <div className="vhero-feature-title">{s.title}</div>
            <div className="vhero-feature-sub">{s.sub}</div>
            <Link
              href={s.href}
              className="vhero-feature-link"
              tabIndex={idx === i ? 0 : -1}
              onClick={() => track("hero_slide_click", { slide: s.key, position: idx + 1 })}
            >
              {s.link} →
            </Link>
          </div>
        </div>
      ))}

      {n > 1 && (
        <div className="vhero-slider-nav">
          <button type="button" className="vhero-slider-arrow" aria-label={labels.prev} onClick={() => go(i - 1)}>
            ‹
          </button>
          <div className="vhero-slider-dots">
            {slides.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                className="vhero-slider-dot"
                aria-label={`${labels.go} ${idx + 1}: ${s.title}`}
                aria-current={idx === i}
                data-active={idx === i ? "" : undefined}
                onClick={() => go(idx)}
              >
                <span style={{ animationDuration: `${INTERVAL_MS}ms` }} />
              </button>
            ))}
          </div>
          <button type="button" className="vhero-slider-arrow" aria-label={labels.next} onClick={() => go(i + 1)}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
