"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { useMemo, useState, useTransition } from "react";
import type { Product } from "@/lib/types";
import { applyFilters, activeFilterCount, COLOR_FAMILIES, colorFamiliesOf, parseFilters, SORTS, type Filters } from "@/lib/listing";
import { ProductCard } from "@/components/product/product-card";
import { ProductRow } from "@/components/listing/product-row";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { bestTier } from "@/lib/commerce";

type Patch = Record<string, string | null>;

export function Listing({ base, subcategories, emptyHint }: { base: Product[]; subcategories?: string[]; emptyHint?: React.ReactNode }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const [pending, startTransition] = useTransition();
  const f = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const results = useMemo(() => applyFilters(base, f, { business }), [base, f, business]);
  // Listing is keyed by mode on each page, so this initial value re-applies on mode switch.
  const [view, setView] = useState<"grid" | "list">(business ? "list" : "grid");
  const [sheet, setSheet] = useState(false);

  const set = (patch: Patch) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if ("within" in patch) next.delete("fast");
    startTransition(() => router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };
  const clearAll = () => {
    const next = new URLSearchParams();
    const q = sp.get("q");
    if (q) next.set("q", q);
    startTransition(() => router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  const chips: { label: string; patch: Patch }[] = [];
  if (f.sub) chips.push({ label: f.sub, patch: { sub: null } });
  if (f.min != null || f.max != null)
    chips.push({ label: `${f.min != null ? fmt(f.min) : fmt(0)} – ${f.max != null ? fmt(f.max) : "any"}`, patch: { min: null, max: null } });
  if (f.within != null) chips.push({ label: f.within <= 1 ? "Arrives tomorrow" : `Arrives ≤ ${f.within} days`, patch: { within: null, fast: null } });
  if (f.rating != null) chips.push({ label: `${f.rating}★ & up`, patch: { rating: null } });
  if (f.deal) chips.push({ label: "Verified deals", patch: { deal: null } });
  f.brands.forEach((b) => chips.push({ label: b, patch: { brand: f.brands.filter((x) => x !== b).join(",") || null } }));
  f.colors.forEach((c) => chips.push({ label: COLOR_FAMILIES[c]?.label ?? c, patch: { color: f.colors.filter((x) => x !== c).join(",") || null } }));
  if (f.bulk) chips.push({ label: "Volume pricing", patch: { bulk: null } });
  if (f.moq != null) chips.push({ label: `MOQ ≤ ${f.moq}`, patch: { moq: null } });
  if (f.lead != null) chips.push({ label: `Lead ≤ ${f.lead}d`, patch: { lead: null } });

  const panel = <FilterPanel base={base} f={f} set={set} business={business} subcategories={subcategories} />;
  const count = activeFilterCount(f);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr] lg:gap-10">
      {/* Desktop filters */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-[88px] max-h-[calc(100vh-104px)] overflow-y-auto pb-10 pr-2 thin-scroll">{panel}</div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setSheet(true)} className="chip !h-10 lg:hidden" aria-haspopup="dialog">
            <Icon name="sliders" size={16} /> Filters{count ? ` · ${count}` : ""}
          </button>
          <p className="mr-auto text-[14px] text-ink-2" aria-live="polite">
            <span className="num font-medium text-ink">{results.length}</span> {results.length === 1 ? "result" : "results"}
            {pending && <span className="ml-2 text-mute">Updating…</span>}
          </p>
          <label className="relative flex items-center">
            <span className="sr-only">Sort by</span>
            <select
              value={f.sort}
              onChange={(e) => set({ sort: e.target.value === "match" ? null : e.target.value })}
              className="h-10 appearance-none rounded-full border border-line-strong bg-white pl-4 pr-9 text-[13.5px] outline-none hover:border-ink focus-visible:border-ink"
            >
              {SORTS.filter((s) => !s.business || business).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-3" />
          </label>
          <div className="hidden rounded-full border border-line-strong bg-white p-0.5 sm:flex" role="group" aria-label="View">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={v === "grid" ? "Grid view" : "List view"}
                onClick={() => setView(v)}
                className={clsx("grid h-9 w-9 place-items-center rounded-full transition-colors", view === v ? "bg-ink text-white" : "text-ink-2 hover:text-ink")}
              >
                <Icon name={v === "grid" ? "grid" : "rows"} size={16} />
              </button>
            ))}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={c.label} type="button" onClick={() => set(c.patch)} className="chip" data-active="true" aria-label={`Remove filter ${c.label}`}>
                <span className="chip-dot h-1.5 w-1.5 rounded-full" />
                {c.label}
                <Icon name="close" size={13} />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="px-2 text-[13px] text-mute underline-offset-2 hover:text-ink hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {results.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center shadow-[var(--shadow-hair)]">
            <p className="display text-[36px]">Nothing matches all of that.</p>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-mute">
              {emptyHint ?? "Try removing a filter — Ayiin would rather show you nothing than something that doesn't fit."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {chips.slice(0, 3).map((c) => (
                <button key={c.label} type="button" onClick={() => set(c.patch)} className="chip">
                  Remove “{c.label}”
                </button>
              ))}
              <Link href="/search" className="chip">
                Browse everything
              </Link>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className={clsx("mt-6 grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity md:grid-cols-3", pending && "opacity-60")}>
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <ul className={clsx("mt-6 space-y-3 transition-opacity", pending && "opacity-60")}>
            {results.map((p) => (
              <li key={p.id}>
                <ProductRow product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobile filter sheet */}
      <div
        aria-hidden
        onClick={() => setSheet(false)}
        className={clsx("fixed inset-0 z-[65] bg-ink/30 transition-opacity lg:hidden", sheet ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        inert={!sheet}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-[66] flex max-h-[88vh] flex-col rounded-t-[28px] bg-porcelain transition-transform duration-500 ease-[var(--ease-out-expo)] lg:hidden",
          sheet ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="text-[17px] font-medium">Filters</p>
          <button type="button" aria-label="Close filters" onClick={() => setSheet(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{panel}</div>
        <div className="flex gap-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={clearAll} className="btn btn-ghost flex-1">
            Clear
          </button>
          <button type="button" onClick={() => setSheet(false)} className="btn btn-ink flex-[2]">
            Show {results.length} results
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left text-[14px] font-medium">
        {title}
        <Icon name="chevronDown" size={16} className={clsx("transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FilterPanel({
  base,
  f,
  set,
  business,
  subcategories,
}: {
  base: Product[];
  f: Filters;
  set: (p: Patch) => void;
  business: boolean;
  subcategories?: string[];
}) {
  const { fmt } = usePrefs();
  const countWith = (patch: Partial<Filters>) => applyFilters(base, { ...f, ...patch, sort: "match" }, { business }).length;
  const prices = base.map((p) => (business ? bestTier(p).price : p.price));
  const lo = Math.floor(Math.min(...prices, 0));
  const hi = Math.ceil(Math.max(...prices, 1));
  const buckets = 16;
  const hist = Array.from({ length: buckets }, (_, i) => {
    const a = lo + ((hi - lo) * i) / buckets;
    const b = lo + ((hi - lo) * (i + 1)) / buckets;
    return prices.filter((x) => x >= a && (i === buckets - 1 ? x <= b : x < b)).length;
  });
  const maxH = Math.max(...hist, 1);
  const brands = Array.from(new Set(base.map((p) => p.brand))).sort();
  const colors = Object.keys(COLOR_FAMILIES).filter((c) => base.some((p) => colorFamiliesOf(p).includes(c)));
  const [min, setMin] = useState(f.min?.toString() ?? "");
  const [max, setMax] = useState(f.max?.toString() ?? "");
  const rangeKey = `${f.min ?? ""}-${f.max ?? ""}`;
  const [lastRange, setLastRange] = useState(rangeKey);
  if (lastRange !== rangeKey) {
    setLastRange(rangeKey);
    setMin(f.min?.toString() ?? "");
    setMax(f.max?.toString() ?? "");
  }

  const subs = subcategories ?? Array.from(new Set(base.map((p) => p.subcategory)));

  return (
    <div className="text-[13.5px]">
      {subs.length > 1 && (
        <Section title="Type">
          <ul className="space-y-0.5">
            {subs.map((s) => {
              const n = countWith({ sub: s });
              const active = f.sub === s;
              return (
                <li key={s}>
                  <button
                    type="button"
                    disabled={!n && !active}
                    onClick={() => set({ sub: active ? null : s })}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors disabled:opacity-40",
                      active ? "bg-ink text-white" : "hover:bg-soft",
                    )}
                  >
                    {s} <span className={clsx("num text-[12px]", active ? "text-white/70" : "text-mute")}>{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="Delivery">
        <div className="flex flex-wrap gap-1.5">
          {[
            [null, "Any time"],
            [1, "Tomorrow"],
            [3, "≤ 3 days"],
            [5, "≤ 5 days"],
          ].map(([v, label]) => (
            <button
              key={String(label)}
              type="button"
              aria-pressed={f.within === (v ?? undefined)}
              onClick={() => set({ within: v == null ? null : String(v) })}
              className="chip !h-8 !px-3"
            >
              {v === 1 && <span className="chip-dot h-1.5 w-1.5 rounded-full bg-brand" />}
              {label}
              {v != null && <span className="num text-[11px] opacity-60">{countWith({ within: Number(v) })}</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title={business ? "Volume unit price" : "Price"}>
        <div className="flex h-12 items-end gap-[3px]" aria-hidden>
          {hist.map((h, i) => {
            const a = lo + ((hi - lo) * i) / buckets;
            const inRange = (f.min == null || a >= f.min - (hi - lo) / buckets) && (f.max == null || a <= f.max);
            return <span key={i} className={clsx("flex-1 rounded-t-sm", inRange ? "bg-ink" : "bg-line-strong")} style={{ height: `${Math.max(6, (h / maxH) * 100)}%` }} />;
          })}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            set({ min: min || null, max: max || null });
          }}
        >
          <label className="relative flex-1">
            <span className="sr-only">Minimum price</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">{fmt(0).replace(/[\d.,]/g, "")}</span>
            <input value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder={String(lo)} className="field !h-10 !pl-7 !text-[13.5px]" />
          </label>
          <span className="text-mute">–</span>
          <label className="relative flex-1">
            <span className="sr-only">Maximum price</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">{fmt(0).replace(/[\d.,]/g, "")}</span>
            <input value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder={String(hi)} className="field !h-10 !pl-7 !text-[13.5px]" />
          </label>
          <button type="submit" aria-label="Apply price" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white">
            <Icon name="arrowRight" size={16} />
          </button>
        </form>
      </Section>

      <Section title="Rating">
        <div className="flex gap-1.5">
          {[4.5, 4.7].map((r) => (
            <button key={r} type="button" aria-pressed={f.rating === r} onClick={() => set({ rating: f.rating === r ? null : String(r) })} className="chip !h-8 !px-3">
              ★ {r}+ <span className="num text-[11px] opacity-60">{countWith({ rating: r })}</span>
            </button>
          ))}
        </div>
      </Section>

      {!business && (
        <Section title="Honest deals">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              Verified deals only
              <span className="block text-[12px] text-mute">Lowest or genuinely below the 12-week price</span>
            </span>
            <Toggle on={f.deal} onChange={() => set({ deal: f.deal ? null : "1" })} label="Verified deals only" />
          </label>
        </Section>
      )}

      {business && (
        <Section title="Procurement">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>Volume pricing available</span>
              <Toggle on={f.bulk} onChange={() => set({ bulk: f.bulk ? null : "1" })} label="Volume pricing available" />
            </label>
            <div>
              <p className="mb-1.5 text-mute">Lead time</p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 3, 7].map((d) => (
                  <button key={d} type="button" aria-pressed={f.lead === d} onClick={() => set({ lead: f.lead === d ? null : String(d) })} className="chip !h-8 !px-3">
                    ≤ {d}d
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-mute">Minimum order</p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 10].map((d) => (
                  <button key={d} type="button" aria-pressed={f.moq === d} onClick={() => set({ moq: f.moq === d ? null : String(d) })} className="chip !h-8 !px-3">
                    MOQ ≤ {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {colors.length > 1 && (
        <Section title="Colour">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const on = f.colors.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  title={COLOR_FAMILIES[c].label}
                  onClick={() => set({ color: (on ? f.colors.filter((x) => x !== c) : [...f.colors, c]).join(",") || null })}
                  className={clsx("flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-colors", on ? "border-ink bg-white" : "border-line hover:border-line-strong")}
                >
                  <span className="h-5 w-5 rounded-full ring-1 ring-inset ring-ink/10" style={{ background: COLOR_FAMILIES[c].swatch }} />
                  {COLOR_FAMILIES[c].label}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {brands.length > 1 && (
        <Section title="Brand" defaultOpen={brands.length < 6}>
          <ul className="space-y-1">
            {brands.map((b) => {
              const on = f.brands.includes(b);
              return (
                <li key={b}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-soft">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => set({ brand: (on ? f.brands.filter((x) => x !== b) : [...f.brands, b]).join(",") || null })}
                      className="h-4 w-4 accent-ink"
                    />
                    <span className="flex-1">{b}</span>
                    <span className="num text-[12px] text-mute">{base.filter((p) => p.brand === b).length}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      onClick={onChange}
      className={clsx("relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300", on ? "bg-ink" : "bg-line-strong")}
    >
      <span className={clsx("absolute top-1 h-4 w-4 rounded-full transition-all duration-300", on ? "left-5 bg-brand" : "left-1 bg-white")} />
    </button>
  );
}
