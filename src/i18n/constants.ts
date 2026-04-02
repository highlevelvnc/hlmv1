export const LANGS = ["en", "pt", "fr", "de"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "hlm-lang";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  pt: "PT",
  fr: "FR",
  de: "DE",
};
