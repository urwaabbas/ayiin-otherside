"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useRotatingPlaceholder } from "@/components/layout/search";
import { usePrefs } from "@/components/providers";
import { EXAMPLE_PROMPTS } from "@/lib/search";
import { useShop } from "@/lib/store";

/**
 * The "Ask Ayiin" prompt. A plain GET form to /search so it works before JavaScript loads;
 * enhanced with rotating examples and one-tap prompts.
 */
export function AskForm({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const router = useRouter();
  const { mode } = usePrefs();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const placeholder = useRotatingPlaceholder(!focused && !q);
  const pushSearch = useShop((s) => s.pushSearch);
  const dark = tone === "dark";

  const go = (query: string) => {
    if (!query.trim()) return;
    pushSearch(query);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={className}>
      <form
        action="/search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className={clsx(
          "group relative flex items-center gap-2 rounded-[22px] p-2 pl-5 transition-shadow duration-500",
          dark ? "bg-graphite ring-1 ring-graphite-line focus-within:ring-mute-dark" : "bg-white shadow-[var(--shadow-soft)] ring-1 ring-line focus-within:ring-ink",
        )}
      >
        <Icon name="sparkle" size={20} className={clsx("shrink-0", dark ? "text-brand" : "text-brand-deep")} />
        <label htmlFor={`ask-${tone}`} className="sr-only">
          Describe what you need
        </label>
        <input
          id={`ask-${tone}`}
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className={clsx(
            "h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[17px]",
            dark ? "text-porcelain placeholder:text-mute-dark" : "text-ink placeholder:text-mute",
          )}
        />
        <button type="submit" className="btn btn-brand h-12 shrink-0 rounded-2xl px-5">
          <span className="hidden sm:inline">{mode === "business" ? "Find & price" : "Find it"}</span>
          <Icon name="arrowRight" size={18} />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS[mode].slice(0, 3).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => go(ex)}
            className={clsx(
              "inline-flex h-8 items-center rounded-full px-3 text-[12.5px] transition-colors",
              dark ? "bg-graphite text-mute-dark hover:text-porcelain" : "bg-soft/70 text-ink-2 hover:bg-soft hover:text-ink",
            )}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
