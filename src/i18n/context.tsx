"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "./types";
import type { Lang } from "./constants";

interface LangCtx { dict: Dict; lang: Lang }

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: ReactNode }) {
  return <Ctx.Provider value={{ dict, lang }}>{children}</Ctx.Provider>;
}

export function useT(): Dict {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT() must be used inside <LangProvider>");
  return ctx.dict;
}

export function useLang(): Lang {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang() must be used inside <LangProvider>");
  return ctx.lang;
}
