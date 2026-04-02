import type { Lang } from "../constants";
import type { Dict } from "../types";
import en from "./en";
import pt from "./pt";
import fr from "./fr";
import de from "./de";

const dicts: Record<Lang, Dict> = { en, pt, fr, de };

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}
