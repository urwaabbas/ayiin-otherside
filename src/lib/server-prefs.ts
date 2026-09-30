import "server-only";
import { cookies } from "next/headers";
import { CURRENCY_COOKIE, MODE_COOKIE, parseCurrency, parseMode, type Prefs } from "@/lib/prefs";

export async function getPrefs(): Promise<Prefs> {
  const jar = await cookies();
  return {
    mode: parseMode(jar.get(MODE_COOKIE)?.value),
    currency: parseCurrency(jar.get(CURRENCY_COOKIE)?.value),
  };
}
