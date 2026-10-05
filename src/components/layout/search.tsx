"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useMemo, useState, type KeyboardEvent, type RefObject } from "react";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { parseIntent, search, TRENDING, EXAMPLE_PROMPTS } from "@/lib/search";
import { categories } from "@/lib/catalog/categories";
import { productById } from "@/lib/catalog/products";
import { deliveryLabel, stockSignal, unitPrice } from "@/lib/commerce";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { SignalDot } from "@/components/ui/signal";

export function useRotatingPlaceholder(active: boolean) {
  const { mode } = usePrefs();
  const list = EXAMPLE_PROMPTS[mode];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 3600);
    return () => clearInterval(t);
  }, [active, list.length]);
  return `Try “${list[i % list.length]}”`;
}

type Option = { id: string; href: string; label: string };

export function useSearchModel(query: string) {
  const { mode } = usePrefs();
  return useMemo(() => {
    const q = query.trim();
    if (!q) return { intent: null, results: [], cats: [], options: [] as Option[] };
    const intent = parseIntent(q);
    const results = search(intent).slice(0, 5);
    const cats = categories
      .filter((c) => (intent.category ? c.slug === intent.category : intent.terms.some((t) => c.name.toLowerCase().includes(t))))
      .slice(0, 2);
    const options: Option[] = [
      ...results.map((r) => ({ id: `opt-${r.product.id}`, href: `/p/${r.product.slug}${intent.qty && mode === "business" ? `?qty=${intent.qty}` : ""}`, label: r.product.name })),
      ...cats.map((c) => ({ id: `opt-cat-${c.slug}`, href: `/c/${c.slug}`, label: c.name })),
      { id: "opt-all", href: `/search?q=${encodeURIComponent(q)}`, label: `See all results for ${q}` },
    ];
    return { intent, results, cats, options };
  }, [query, mode]);
}

export function SearchPanel({
  query,
  setQuery,
  active,
  onNavigate,
  className,
}: {
  query: string;
  setQuery: (q: string) => void;
  active: number;
  onNavigate: (href: string, q?: string) => void;
  className?: string;
}) {
  const { mode, fmt } = usePrefs();
  const hydrated = useHydrated();
  const searches = useShop((s) => s.searches);
  const recent = useShop((s) => s.recent);
  const clearSearches = useShop((s) => s.clearSearches);
  const { intent, results, cats, options } = useSearchModel(query);
  const business = mode === "business";

  if (!query.trim()) {
    const recentProducts = hydrated ? recent.map(productById).filter(Boolean).slice(0, 4) : [];
    return (
      <div className={clsx("grid gap-8 md:grid-cols-[1.2fr_1fr]", className)}>
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Icon name="sparkle" size={14} /> Describe what you need
          </p>
          <ul className="space-y-1">
            {EXAMPLE_PROMPTS[mode].map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => setQuery(ex)}
                  className="group flex w-full items-center justify-between gap-3 rounded-control px-3 py-2.5 text-left text-body text-ink-2 transition-colors hover:bg-mist hover:text-ink"
                >
                  <span>“{ex}”</span>
                  <Icon name="arrowUpRight" size={16} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 px-3 text-meta leading-relaxed text-mute">
            Ayiin understands budgets, quantities, delivery dates and use-cases — no filters required.
          </p>
        </div>
        <div className="space-y-7">
          {hydrated && searches.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">Recent</p>
                <button type="button" onClick={clearSearches} className="text-meta text-mute hover:text-ink">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searches.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => onNavigate(`/search?q=${encodeURIComponent(s)}`, s)}>
                    <Icon name="clock" size={13} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="eyebrow mb-3">Trending on Ayiin</p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button key={t} type="button" className="chip" onClick={() => onNavigate(`/search?q=${encodeURIComponent(t)}`, t)}>
                  <Icon name="trend" size={13} /> {t}
                </button>
              ))}
            </div>
          </div>
          {recentProducts.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Recently viewed</p>
              <div className="grid grid-cols-4 gap-2">
                {recentProducts.map((p) => (
                  <Link key={p!.id} href={`/p/${p!.slug}`} onClick={() => onNavigate(`/p/${p!.slug}`)} className="overflow-hidden rounded-control" title={p!.name}>
                    <ProductImage product={p!} className="aspect-square w-full" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {intent && intent.chips.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1 flex items-center gap-1.5">
            <Icon name="sparkle" size={13} /> Understood
          </span>
          {intent.chips.map((c) => (
            <span key={c.key} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 text-meta font-medium text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              {c.label}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="eyebrow mb-2">{results.length ? "Best matches" : "No exact matches"}</p>
          {results.length === 0 && (
            <p className="rounded-control bg-mist p-4 text-support text-ink-2">
              Nothing matches every condition. Try loosening the budget or delivery date — or{" "}
              <button type="button" className="underline" onClick={() => onNavigate(`/search?q=${encodeURIComponent(intent?.terms.join(" ") ?? "")}`)}>
                search without constraints
              </button>
              .
            </p>
          )}
          <ul role="listbox" id="search-options" aria-label="Search results" className="space-y-1">
            {results.map((r, idx) => {
              const p = r.product;
              const qty = intent?.qty;
              const unit = business && qty ? unitPrice(p, qty) : p.price;
              const stock = stockSignal(p);
              return (
                <li key={p.id} role="option" id={options[idx].id} aria-selected={active === idx}>
                  <Link
                    href={options[idx].href}
                    onClick={() => onNavigate(options[idx].href, query)}
                    className={clsx(
                      "flex items-center gap-3.5 rounded-surface p-2 pr-3 transition-colors",
                      active === idx ? "bg-mist" : "hover:bg-mist",
                    )}
                  >
                    <ProductImage product={p} sizes="56px" className="h-14 w-14 shrink-0 rounded-control" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-support font-medium text-ink">{p.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-meta text-mute">
                        <span className="inline-flex items-center gap-1.5">
                          <SignalDot tone={stock.tone} /> Arrives {deliveryLabel(p)}
                        </span>
                        <span>★ {p.rating.toFixed(1)}</span>
                        {r.reasons.slice(0, 2).map((reason) => (
                          <span key={reason} className="text-ink-2">
                            ✓ {reason}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="num block text-body font-medium">{fmt(unit)}</span>
                      {business && qty ? <span className="num block text-meta text-mute">/unit at {qty.toLocaleString("en-US")}</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-5">
          {cats.length > 0 && (
            <div>
              <p className="eyebrow mb-2">Categories</p>
              {cats.map((c, i) => {
                const idx = results.length + i;
                return (
                  <Link
                    key={c.slug}
                    id={options[idx].id}
                    href={`/c/${c.slug}`}
                    onClick={() => onNavigate(`/c/${c.slug}`, query)}
                    className={clsx("flex items-center justify-between rounded-control px-3 py-2.5 text-support", active === idx ? "bg-mist" : "hover:bg-mist")}
                  >
                    {c.name} <Icon name="arrowRight" size={15} />
                  </Link>
                );
              })}
            </div>
          )}
          {business && intent?.qty ? (
            <Link
              href={`/business?tab=quotes&q=${encodeURIComponent(query)}`}
              onClick={() => onNavigate(`/business?tab=quotes&q=${encodeURIComponent(query)}`, query)}
              className="block rounded-surface bg-ink p-4 text-porcelain"
            >
              <span className="eyebrow !text-mute-dark">Quantity detected</span>
              <span className="mt-1 block text-body font-medium">Request quotes for {intent.qty.toLocaleString("en-US")} units</span>
              <span className="mt-1 block text-meta text-mute-dark">Median supplier response: 3h 12m</span>
            </Link>
          ) : null}
          <Link
            id={options[options.length - 1].id}
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => onNavigate(`/search?q=${encodeURIComponent(query)}`, query)}
            className={clsx(
              "flex items-center justify-between rounded-control border border-line px-3 py-3 text-support font-medium",
              active === options.length - 1 ? "border-ink bg-white" : "hover:border-ink",
            )}
          >
            See all results <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Keyboard + navigation controller shared by desktop field and mobile sheet. */
export function useSearchController(inputRef: RefObject<HTMLInputElement | null>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const pushSearch = useShop((s) => s.pushSearch);
  const closeSearch = useUI((s) => s.closeSearch);
  const { options } = useSearchModel(query);

  const navigate = (href: string, q?: string) => {
    if (q) pushSearch(q);
    closeSearch();
    inputRef.current?.blur();
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) navigate(options[active].href, query);
      else if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`, query);
    } else if (e.key === "Escape") {
      closeSearch();
      inputRef.current?.blur();
    }
  };

  const update = (q: string) => {
    setQuery(q);
    setActive(-1);
  };

  return { query, setQuery: update, active, onKeyDown, navigate, activeId: active >= 0 ? options[active]?.id : undefined };
}
