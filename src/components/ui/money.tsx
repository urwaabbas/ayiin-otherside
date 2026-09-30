"use client";

import { clsx } from "clsx";
import { usePrefs } from "@/components/providers";
import { convert } from "@/lib/format";

/** Inline formatted amount in the shopper's display currency. */
export function Money({ usd, cents, className, mono = true }: { usd: number; cents?: boolean; className?: string; mono?: boolean }) {
  const { fmt } = usePrefs();
  return <span className={clsx(mono ? "num" : "tabular-nums", className)}>{fmt(usd, { cents })}</span>;
}

/**
 * Signature price display: whole units at full size, cents raised and reduced.
 * "$249" / "$32⁹⁹"
 */
export function Price({
  usd,
  size = "md",
  className,
  strike,
}: {
  usd: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  strike?: number;
}) {
  const { currency, fmt } = usePrefs();
  const value = convert(usd, currency);
  const whole = Math.floor(value);
  const cents = Math.round((value - whole) * 100);
  const symbol = fmt(0).replace(/[\d.,\s]/g, "");
  const sizes = {
    sm: "text-[15px]",
    md: "text-[19px]",
    lg: "text-[30px]",
    xl: "text-[44px] sm:text-[52px]",
  }[size];
  return (
    <span className={clsx("inline-flex items-baseline gap-2", className)}>
      <span className={clsx("num font-medium tracking-[-0.03em] leading-none", sizes)}>
        <span className="sr-only">{fmt(usd, { cents: cents > 0 })}</span>
        <span aria-hidden className="mr-[0.04em] text-[0.62em] align-[0.34em] font-normal">
          {symbol}
        </span>
        <span aria-hidden>{whole.toLocaleString("en-US")}</span>
        {cents > 0 && (
          <span aria-hidden className="text-[0.52em] align-[0.62em] ml-[0.06em]">
            {String(cents).padStart(2, "0")}
          </span>
        )}
      </span>
      {strike != null && strike > usd && (
        <span className="num text-[13px] text-mute line-through decoration-[1px]">
          <span className="sr-only">was </span>
          {fmt(strike)}
        </span>
      )}
    </span>
  );
}
