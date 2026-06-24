import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site";

// Welcome both classic search crawlers and AI/answer-engine crawlers
// (AEO/LLM optimization): GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
// Google-Extended, etc. are explicitly allowed. Only the admin panel and the
// internal analytics API are disallowed.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: "/", disallow: ["/admin", "/api/"] })),
    ],
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl("/"),
  };
}
