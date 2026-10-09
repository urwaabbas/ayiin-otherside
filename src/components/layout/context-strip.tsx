"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

type ContextMessage = {
  id: string;
  icon: IconName;
  primary: string;
  secondary: string;
};

const MESSAGES: ContextMessage[] = [
  {
    id: "location",
    icon: "pin",
    primary: "Deliver to San Francisco 94107",
    secondary: "Same-day & next-day slots available",
  },
  {
    id: "shipping",
    icon: "box",
    primary: "Free delivery on orders over $50",
    secondary: "Guaranteed transit dates at checkout",
  },
  {
    id: "sellers",
    icon: "shield",
    primary: "Verified independent makers across Ayiin",
    secondary: "Audited workshops & authentic provenance",
  },
  {
    id: "global",
    icon: "sparkle",
    primary: "Shop local craft · Discover global design",
    secondary: "From Nordic furniture to Japanese precision",
  },
];

export function ContextStrip({
  className,
  transparent = false,
}: {
  className?: string;
  transparent?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = MESSAGES[index];

  return (
    <aside
      aria-label="Marketplace live context"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative h-8 w-full overflow-hidden transition-colors duration-300 ${
        transparent
          ? "bg-black/25 text-white/90 backdrop-blur-md border-b border-white/10"
          : "bg-ink text-white/90"
      } ${className ?? ""}`}
    >
      <div className="mx-auto flex h-full max-w-[1520px] items-center justify-between px-4 sm:px-6 text-[12px] tracking-[0.01em]">
        {/* Animated dynamic context item */}
        <div
          key={current.id}
          className="flex min-w-0 items-center gap-2 transition-all duration-400 ease-[var(--ease-out-expo)]"
        >
          <span className="grid h-4 w-4 shrink-0 place-items-center text-brand">
            <Icon name={current.icon} size={13} strokeWidth={2} />
          </span>
          <span className="truncate font-medium text-white">
            {current.primary}
          </span>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="hidden sm:inline truncate text-white/70">
            {current.secondary}
          </span>
        </div>

        {/* Minimal indicator dots & navigation */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5" aria-hidden>
            {MESSAGES.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Jump to message ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-brand" : "w-1 bg-white/20 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <span className="hidden lg:inline text-white/30">|</span>

          <span className="hidden lg:inline text-white/60">
            Standard: <strong className="font-medium text-white">Carbon neutral delivery</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}
