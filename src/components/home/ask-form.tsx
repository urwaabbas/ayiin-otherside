"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/ui/money";
import { SignalDot } from "@/components/ui/signal";
import { useRotatingPlaceholder, useSearchModel } from "@/components/layout/search";
import { usePrefs } from "@/components/providers";
import { EXAMPLE_PROMPTS } from "@/lib/search";
import { useHydrated, useShop } from "@/lib/store";
import { deliveryLabel, stockSignal } from "@/lib/commerce";

/**
 * The elevated "Ask Ayiin" discovery interface.
 * Supports natural language queries, real-time intent parsing, live product
 * autocomplete, and fast one-tap discovery intent chips.
 */
export function AskForm({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const router = useRouter();
  const { mode } = usePrefs();
  const hydrated = useHydrated();
  const searches = useShop((s) => s.searches);
  const pushSearch = useShop((s) => s.pushSearch);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const placeholder = useRotatingPlaceholder(!focused && !q);
  const dark = tone === "dark";

  const { intent, results, cats } = useSearchModel(q);

  const go = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    pushSearch(trimmed);
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [focused]);

  const quickPrompts = [
    { label: "Quiet headphones under $300", icon: "sparkle" as const },
    { label: "A gift under $60 that arrives by Friday", icon: "box" as const },
    { label: "Ergonomic chair for long desk work", icon: "sparkle" as const },
    { label: "Running shoes for daily training", icon: "sparkle" as const },
  ];

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      <form
        action="/search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className={clsx(
          "group relative flex items-center gap-2 rounded-surface p-2 pl-4 transition-all duration-300",
          dark
            ? "bg-graphite ring-1 ring-graphite-line focus-within:ring-mute-dark focus-within:shadow-[0_8px_30px_rgb(0_0_0/0.4)]"
            : "bg-white ring-1 ring-line shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-brand focus-within:shadow-[0_12px_36px_-10px_rgb(var(--rgb-ink)/0.18)]",
        )}
      >
        <span
          className={clsx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors",
            dark ? "bg-white/10 text-brand" : "bg-brand-soft text-brand-deep",
          )}
        >
          <Icon name="sparkle" size={17} strokeWidth={2.2} />
        </span>
        <label htmlFor={`ask-${tone}`} className="sr-only">
          Describe what you need
        </label>
        <input
          ref={inputRef}
          id={`ask-${tone}`}
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={clsx(
            "h-12 min-w-0 flex-1 bg-transparent text-body font-normal outline-none sm:text-body",
            dark
              ? "text-porcelain placeholder:text-mute-dark"
              : "text-ink placeholder:text-mute",
          )}
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-mute hover:text-ink"
            aria-label="Clear input"
          >
            <Icon name="close" size={16} />
          </button>
        )}
        <button
          type="submit"
          suppressHydrationWarning
          className="btn btn-primary h-11 shrink-0 px-5 font-medium shadow-[0_2px_8px_rgb(var(--rgb-brand)/0.35)] transition-transform hover:scale-[1.02]"
        >
          <span>{mode === "business" ? "Find & price" : "Find it"}</span>
          <Icon name="arrowRight" size={16} />
        </button>
      </form>

      {/* Floating autocomplete & natural-language interpretation panel */}
      {focused && (
        <div
          role="region"
          aria-label="Search suggestions"
          className={clsx(
            "absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-surface border p-4 shadow-[var(--shadow-float)] backdrop-blur-xl animate-fade",
            dark
              ? "border-graphite-line bg-graphite/95 text-porcelain"
              : "border-line bg-white/98 text-ink",
          )}
        >
          {q.trim() ? (
            <div className="space-y-4">
              {/* Intent breakdown */}
              {intent && intent.chips.length > 0 && (
                <div className="border-b border-line pb-3">
                  <p className="eyebrow mb-2 flex items-center gap-1.5">
                    <Icon name="sparkle" size={12} className="text-brand-deep" /> Understood intent
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {intent.chips.map((c) => (
                      <span
                        key={c.key}
                        className="inline-flex h-6 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 text-meta font-medium text-ink"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-deep" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instant results preview */}
              {results.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Matching products</p>
                  <ul className="space-y-1">
                    {results.slice(0, 3).map((r) => {
                      const p = r.product;
                      const stock = stockSignal(p);
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/p/${p.slug}`}
                            onClick={() => {
                              pushSearch(p.name);
                              setFocused(false);
                            }}
                            className={clsx(
                              "flex items-center gap-3 rounded-control p-2 transition-colors",
                              dark ? "hover:bg-white/5" : "hover:bg-mist",
                            )}
                          >
                            <ProductImage
                              product={p}
                              sizes="48px"
                              className="h-11 w-11 shrink-0 rounded-compact"
                              imgClassName="!object-contain"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-support font-medium text-ink">
                                {p.name}
                              </span>
                              <span className="mt-0.5 flex items-center gap-2 text-meta text-mute">
                                <span className="font-semibold text-ink">★ {p.rating.toFixed(1)}</span>
                                <span>·</span>
                                <SignalDot tone={stock.tone} />
                                <span>Arrives {deliveryLabel(p)}</span>
                              </span>
                            </div>
                            <Price usd={p.price} size="sm" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Matched categories */}
              {cats.length > 0 && (
                <div className="border-t border-line pt-2.5">
                  <p className="eyebrow mb-1.5">Departments</p>
                  <div className="flex flex-wrap gap-2">
                    {cats.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/c/${c.slug}`}
                        onClick={() => setFocused(false)}
                        className="chip text-meta"
                      >
                        {c.name} →
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Full search button */}
              <button
                type="button"
                onClick={() => go(q)}
                className="mt-1 flex w-full items-center justify-between rounded-control border border-line p-2.5 text-support font-medium text-brand-deep hover:bg-brand-soft"
              >
                <span>Search catalogue for “{q}”</span>
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Icon name="sparkle" size={12} className="text-brand" /> Real discovery examples
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {EXAMPLE_PROMPTS[mode].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => go(ex)}
                      className={clsx(
                        "flex items-center justify-between rounded-control p-2.5 text-left text-support text-ink-2 transition-colors",
                        dark ? "hover:bg-white/5 hover:text-white" : "hover:bg-mist hover:text-ink",
                      )}
                    >
                      <span className="truncate">“{ex}”</span>
                      <Icon name="arrowUpRight" size={14} className="shrink-0 text-mute" />
                    </button>
                  ))}
                </div>
              </div>

              {hydrated && searches.length > 0 && (
                <div className="border-t border-line pt-3">
                  <p className="eyebrow mb-2">Recent searches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {searches.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => go(s)}
                        className="chip text-meta"
                      >
                        <Icon name="clock" size={12} /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instant one-tap prompt chips directly below */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1 text-[11px] text-mute">Try:</span>
        {quickPrompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => go(p.label)}
            suppressHydrationWarning
            className={clsx(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-meta font-medium transition-all hover:scale-[1.02]",
              dark
                ? "bg-graphite text-mute-dark hover:bg-graphite-2 hover:text-porcelain ring-1 ring-graphite-line"
                : "bg-white text-ink-2 hover:text-ink hover:bg-mist shadow-[0_1px_3px_rgb(var(--rgb-ink)/0.06)] ring-1 ring-line",
            )}
          >
            <Icon name={p.icon} size={12} className="text-brand-deep" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
