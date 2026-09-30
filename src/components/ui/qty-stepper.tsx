"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99999,
  step = 1,
  size = "md",
  label = "Quantity",
  allowZero = false,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  allowZero?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setDraft(String(value));
  }
  const h = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-11";
  const commit = (raw: string) => {
    const n = Math.round(Number(raw.replace(/[^\d]/g, "")));
    if (!Number.isFinite(n) || n < min) {
      setDraft(String(value));
      return;
    }
    onChange(Math.min(max, n));
  };
  return (
    <div className={clsx("inline-flex items-center rounded-full border border-line-strong bg-white", h, className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(allowZero ? 0 : min, value - step))}
        disabled={value <= (allowZero ? 0 : min)}
        className={clsx("grid h-full place-items-center rounded-l-full text-ink-2 hover:text-ink disabled:opacity-40", size === "sm" ? "w-8" : "w-11")}
      >
        <Icon name="minus" size={size === "sm" ? 14 : 16} />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
        className={clsx("num h-full bg-transparent text-center font-medium outline-none", size === "sm" ? "w-9 text-[13px]" : size === "lg" ? "w-20 text-[17px]" : "w-14 text-[15px]")}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + step))}
        className={clsx("grid h-full place-items-center rounded-r-full text-ink-2 hover:text-ink", size === "sm" ? "w-8" : "w-11")}
      >
        <Icon name="plus" size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
}
