"use client";
import { createContext, useContext } from "react";
import { translate, type LocaleCode } from "@/lib/i18n";
import { L } from "@/lib/content-i18n";

const Ctx = createContext<LocaleCode>("en");

export function I18nProvider({
  locale,
  children,
}: {
  locale: LocaleCode;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const locale = useContext(Ctx);
  return {
    locale,
    t: (key: string) => translate(locale, key),
    lc: (text: string) => L(locale, text),
  };
}
