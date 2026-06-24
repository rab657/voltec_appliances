"use client";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog-render";

export default function ArticleAside({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hs = Array.from(document.querySelectorAll<HTMLElement>(".prose h2"));
      const y = window.scrollY + 120;
      let current: string | null = null;
      for (const h of hs) {
        if (h.offsetTop <= y) current = h.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard?.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <aside className="tocol">
      <div className="toc">
        <div className="label">Contents</div>
        {headings.map((h) => (
          <a key={h.id} href={`#${h.id}`} className={active === h.id ? "active" : ""}>
            {h.label}
          </a>
        ))}
        <div className="label" style={{ marginTop: 28, borderBottom: 0, paddingBottom: 0 }}>
          Share
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="#" onClick={copyLink}>
            {copied ? "Copied!" : "Copy link"}
          </a>
        </div>
      </div>
    </aside>
  );
}
