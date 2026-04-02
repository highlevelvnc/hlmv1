import { cookies } from "next/headers";
import { LANGS, LANG_COOKIE, DEFAULT_LANG, type Lang } from "./constants";

export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  const val = jar.get(LANG_COOKIE)?.value;
  if (val && (LANGS as readonly string[]).includes(val)) return val as Lang;
  return DEFAULT_LANG;
}
