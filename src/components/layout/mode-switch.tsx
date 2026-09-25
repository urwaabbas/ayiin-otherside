"use client";

import { clsx } from "clsx";
import { useRef } from "react";
import { usePrefs } from "@/components/providers";
import type { Mode } from "@/lib/types";

const OPTIONS: { value: Mode; kicker: string; label: string; hint: string }[] = [
  { value: "personal", kicker: "Shop", label: "Personal", hint: "Discovery, deals and fast checkout" },
  { value: "business", kicker: "Buy for", label: "Business", hint: "Volume pricing, quotes, approvals and net terms" },
];

/**
 * The Ayiin mode selector. Two states of the same marketplace:
 * a white "day" pill for personal shopping, an ink "night" pill with a lime signal for business.
 */
export function ModeSwitch({ compact = false, className, tone = "light" }: { compact?: boolean; className?: string; tone?: "light" | "dark" }) {
  const { mode, setMode } = usePrefs();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const business = mode === "business";

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next: Mode = business ? "personal" : "business";
      setMode(next);
      refs.current[next === "business" ? 1 : 0]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Shopping mode"
      onKeyDown={onKey}
      className={clsx(
        "relative isolate grid grid-cols-2 rounded-full p-[3px] transition-colors duration-500",
        tone === "dark" ? "bg-graphite" : business ? "bg-ink/[0.07]" : "bg-soft",
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "absolute inset-y-[3px] left-[3px] -z-10 w-[calc(50%-3px)] rounded-full transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
          business ? "translate-x-full bg-ink shadow-[0_6px_18px_-8px_rgb(10_11_13/0.7)]" : "translate-x-0 bg-white shadow-[0_1px_2px_rgb(10_11_13/0.08),0_6px_16px_-8px_rgb(10_11_13/0.25)]",
        )}
      />
      {OPTIONS.map((o, i) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            title={o.hint}
            onClick={() => setMode(o.value)}
            className={clsx(
              "group relative flex items-center justify-center gap-1.5 rounded-full px-3.5 text-center transition-colors duration-300",
              compact ? "h-9" : "h-11",
              active
                ? o.value === "business"
                  ? "text-porcelain"
                  : "text-ink"
                : tone === "dark"
                  ? "text-mute-dark hover:text-porcelain"
                  : "text-ink-2 hover:text-ink",
            )}
          >
            {o.value === "business" && (
              <span
                aria-hidden
                className={clsx("h-1.5 w-1.5 rounded-full transition-colors", active ? "bg-lime" : "bg-current opacity-40")}
              />
            )}
            <span className="flex flex-col items-start leading-none">
              <span
                className={clsx(
                  "font-mono text-[9.5px] uppercase tracking-[0.14em] transition-all duration-300",
                  compact ? "hidden" : "mb-[3px]",
                )}
              >
                {o.kicker}
              </span>
              <span className="text-[13.5px] font-medium tracking-[-0.01em]">{o.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
