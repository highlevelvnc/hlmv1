"use client";

import { LANGS, LANG_LABELS, LANG_COOKIE, type Lang } from "@/i18n/constants";
import { useLang } from "@/i18n/context";

export default function LangSwitcher() {
  const current = useLang();

  function switchLang(lang: Lang) {
    if (lang === current) return;
    document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => switchLang(lang)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors duration-200 cursor-pointer ${
            lang === current
              ? "bg-purple-600 text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
