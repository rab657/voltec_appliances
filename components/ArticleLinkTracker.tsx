"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Blog bodies are CMS HTML, so their WhatsApp links can't carry an onClick.
// One delegated listener on the article counts them — and the FAQ aside link —
// like every other WhatsApp CTA on the site.
export default function ArticleLinkTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const article = document.querySelector("main article");
    if (!article) return;
    const onClick = (e: Event) => {
      const link = (e.target as Element | null)?.closest?.('a[href*="wa.me/"]');
      if (link) track("whatsapp_click", { from: "blog", post: slug });
    };
    article.addEventListener("click", onClick);
    return () => article.removeEventListener("click", onClick);
  }, [slug]);
  return null;
}
