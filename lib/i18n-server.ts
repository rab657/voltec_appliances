import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, DEFAULT_LOCALE, translate, type LocaleCode } from "./i18n";
import { L, deepLocalize } from "./content-i18n";

// Server-side locale read (cookie). Keep next/headers out of lib/i18n so client
// components can import the dictionaries safely.
export async function getLocale(): Promise<LocaleCode> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Returns a bound translator for a server component: const t = await getT(). */
export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  return (key: string) => translate(locale, key);
}

/** Server content localizers: const { lc, dl } = await getContent(). */
export async function getContent(): Promise<{
  locale: LocaleCode;
  lc: (text: string) => string;
  dl: <T>(v: T) => T;
}> {
  const locale = await getLocale();
  return { locale, lc: (text: string) => L(locale, text), dl: (v) => deepLocalize(locale, v) };
}
