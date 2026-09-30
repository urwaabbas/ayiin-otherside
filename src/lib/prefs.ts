import type { Mode } from "@/lib/types";
import type { Currency } from "@/lib/format";

export const MODE_COOKIE = "ayiin-mode";
export const CURRENCY_COOKIE = "ayiin-currency";

export type Prefs = { mode: Mode; currency: Currency };

export function parseMode(v: string | undefined): Mode {
  return v === "business" ? "business" : "personal";
}

export function parseCurrency(v: string | undefined): Currency {
  return v === "EUR" || v === "GBP" ? v : "USD";
}
