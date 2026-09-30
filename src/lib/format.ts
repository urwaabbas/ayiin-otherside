export type Currency = "USD" | "EUR" | "GBP";

export const CURRENCIES: { code: Currency; symbol: string; label: string; rate: number }[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", label: "British Pound", rate: 0.79 },
];

const formatters = new Map<string, Intl.NumberFormat>();
function nf(currency: Currency, cents: boolean) {
  const key = currency + cents;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
    formatters.set(key, f);
  }
  return f;
}

export function convert(usd: number, currency: Currency = "USD") {
  const rate = CURRENCIES.find((c) => c.code === currency)?.rate ?? 1;
  return Math.round(usd * rate * 100) / 100;
}

/** Formats a USD amount into the display currency. Whole numbers drop cents unless forced. */
export function money(usd: number, currency: Currency = "USD", opts: { cents?: boolean } = {}) {
  const value = convert(usd, currency);
  const cents = opts.cents ?? !Number.isInteger(value);
  return nf(currency, cents).format(value);
}

export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export function plural(n: number, one: string, many = one + "s") {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

/* ─── Dates — computed in UTC so server and client agree ─── */

const DAY = 86_400_000;

export function todayUTC(now = Date.now()) {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addBusinessDays(from: Date, days: number) {
  const d = new Date(from.getTime());
  let added = 0;
  while (added < days) {
    d.setTime(d.getTime() + DAY);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const weekdayFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });
const shortFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export const fmtDay = (d: Date) => dayFmt.format(d);
export const fmtWeekday = (d: Date) => weekdayFmt.format(d);
export const fmtShort = (d: Date) => shortFmt.format(d);
export const fmtLong = (d: Date | string) => longFmt.format(typeof d === "string" ? new Date(d) : d);

/** "Tomorrow", "Thursday" (within a week) or "Thu, Oct 2". */
export function relativeDay(d: Date, from = todayUTC()) {
  const diff = Math.round((d.getTime() - from.getTime()) / DAY);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return fmtWeekday(d);
  return fmtDay(d);
}
