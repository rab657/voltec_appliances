"use client";
import { LOCALES, LOCALE_COOKIE, localeMeta } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

// Flag dropdown. Native <select> can't render flag images, so this is a custom
// <details> menu. Choosing a language sets the cookie and reloads so the server
// layout re-renders with the new lang/dir (RTL for Arabic & Urdu).
export default function LanguageSwitcher() {
  const { locale } = useI18n();
  const current = localeMeta(locale);

  function choose(code: string) {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <details className="lang-switch">
      <summary aria-label="Select language">
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <svg className="lang-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="lang-menu" role="menu">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            role="menuitemradio"
            aria-checked={l.code === locale}
            className={`lang-opt ${l.code === locale ? "is-active" : ""}`}
            onClick={() => choose(l.code)}
          >
            <span className="lang-flag">{l.flag}</span>
            <span className="lang-native">{l.native}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
