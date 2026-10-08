"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { productById, products } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import { addBusinessDays, fmtShort, todayUTC } from "@/lib/format";
import {
  creditAvailable,
  daysFromToday,
  inFlight,
  isoDay,
  quarterLabel,
  quarterProgress,
  quarterSpend,
  unpaid,
  waitingOn,
} from "@/lib/b2b/policy";
import { company, useWorkspace, useWorkspaceReady, VIEWER_ID } from "@/lib/b2b/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";
import { ProductImage } from "@/components/product/product-image";
import { Icon, type IconName } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";
import { QuickOrder } from "@/components/business/quick-order";
import { Meter } from "@/components/business/console/ui";
import { RequestCard } from "@/components/business/console/records";

type Mode = "paste" | "quote" | "find";

const MODES: { id: Mode; label: string; icon: IconName; hint: string }[] = [
  { id: "paste", label: "Paste an order", icon: "bolt", hint: "SKUs, names or spreadsheet rows" },
  { id: "quote", label: "Request a quote", icon: "file", hint: "Suppliers compete for it" },
  { id: "find", label: "Find a product", icon: "search", hint: "Search the bulk catalogue" },
];

export function DeskHero() {
  const ws = useWorkspace();
  const { fmt, setMode: setMarketplaceMode } = usePrefs();
  const [mode, setMode] = useState<Mode>("paste");
  const ready = useWorkspaceReady();
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;
  const mine = waitingOn(ws.requisitions);
  const arriving = inFlight(ws.pos);
  const bills = unpaid(ws.invoices).filter((i) => i.status === "open");
  const tabsId = useId();

  const line = [
    mine.length ? `${mine.length} approval${mine.length === 1 ? "" : "s"}` : null,
    arriving.length ? `${arriving.length} deliver${arriving.length === 1 ? "y" : "ies"}` : null,
    bills.length && daysFromToday(bills[0].due) <= 7 ? `an invoice due ${fmtShort(new Date(bills[0].due + "T00:00:00Z"))}` : null,
  ].filter(Boolean) as string[];
  const status = line.length ? `${line.slice(0, -1).join(", ")}${line.length > 1 ? " and " : ""}${line[line.length - 1]} need you this week.` : "Nothing needs you right now.";

  return (
    <section className="shell pt-6 sm:pt-10 lg:pt-12">
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow flex animate-fade items-center gap-2">
              <span className="text-ink">Ayiin Business</span>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
              {company.name}
            </p>
            <button
              type="button"
              onClick={() => setMarketplaceMode("personal")}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-support font-medium text-ink shadow-[var(--shadow-hair)] hover:border-ink hover:bg-soft transition-all"
            >
              <Icon name="chevronLeft" size={13} />
              <span>Back to Personal</span>
            </button>
          </div>
          <h1 className="display mt-5 text-display-md sm:text-display-lg xl:text-display-xl">
            <span className="block animate-rise">Procurement,</span>
            <span className="block animate-rise [animation-delay:90ms]">
              handled<span className="text-brand">.</span>
            </span>
          </h1>
          <p className="mt-6 flex max-w-[600px] animate-rise items-start gap-2.5 text-body leading-relaxed text-ink-2 [animation-delay:180ms] sm:text-emphasis sm:leading-snug">
            <SignalDot live className="mt-2 sm:mt-2.5" />
            <span>
              Welcome back, {viewer.name.split(" ")[0]}.{" "}
              {ready ? status : <span className="inline-block h-[0.9em] w-64 max-w-full translate-y-0.5 animate-pulse rounded-full bg-soft align-middle" aria-hidden />}
            </span>
          </p>

          <div className="mt-8 animate-rise [animation-delay:260ms]">
            <div role="tablist" aria-label="Start a purchase" className="scroll-x flex gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  id={`${tabsId}-${m.id}`}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  aria-controls={`${tabsId}-panel`}
                  onClick={() => setMode(m.id)}
                  className={clsx(
                    "flex shrink-0 items-center gap-2 rounded-t-surface px-4 py-3 text-support transition-colors",
                    mode === m.id ? "bg-white font-medium text-ink shadow-[0_-1px_0_var(--color-line),1px_0_0_var(--color-line),-1px_0_0_var(--color-line)]" : "text-ink-2 hover:text-ink",
                  )}
                >
                  <Icon name={m.icon} size={16} className={mode === m.id ? "text-brand-deep" : undefined} />
                  {m.label}
                </button>
              ))}
            </div>
            <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${mode}`} className="-mt-px">
              {mode === "paste" && <QuickOrder variant="hero" className="rounded-tl-none" />}
              {mode === "quote" && <QuickQuote />}
              {mode === "find" && <QuickFind />}
            </div>
          </div>
        </div>

        <aside aria-label="Company account" className="animate-rise [animation-delay:220ms] lg:col-span-5">
          {accountCard()}
        </aside>
      </div>
    </section>
  );

  function accountCard() {
    if (!ready)
      return (
        <div className="panel-ink space-y-6 rounded-surface p-6 sm:p-7" aria-busy="true" aria-label="Loading company account">
          <div className="flex items-center gap-3">
            <Skeleton dark className="h-11 w-11" />
            <div className="flex-1 space-y-2">
              <Skeleton dark className="h-4 w-40" />
              <Skeleton dark className="h-3 w-52" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Skeleton dark className="h-20" />
            <Skeleton dark className="h-20" />
          </div>
          <Skeleton dark className="h-16" />
          <Skeleton dark className="h-28" />
        </div>
      );
    const available = creditAvailable(ws);
    const spent = quarterSpend(ws.pos);
    const budget = ws.costCenters.reduce((s, c) => s + c.budget, 0);
    const pace = quarterProgress();
    const nextBill = bills[0];
    return (
      <div className="panel-ink relative overflow-hidden rounded-surface">
        <div aria-hidden className="grid-texture-dark pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-porcelain font-mono text-support font-medium text-ink">{company.initials}</span>
              <div className="min-w-0">
                <p className="truncate text-body font-medium">{company.name}</p>
                <p className="truncate text-meta text-mute-dark">
                  {company.terms} · Tax exempt · {ws.members.length} members
                </p>
              </div>
            </div>
            <Link href="/business" className="btn btn-secondary !h-10 shrink-0 !text-support">
              Console <Icon name="arrowUpRight" size={15} />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-5">
            <div>
              <p className="text-meta text-mute-dark">Available credit</p>
              <p className="display mt-1.5 text-heading leading-none tabular-nums sm:text-display-sm">{fmt(Math.round(available))}</p>
              <Meter value={available} max={company.creditLimit} tone="dark" className="mt-3" />
              <p className="num mt-2 text-meta text-mute-dark">of {fmt(Math.round(company.creditLimit))}</p>
            </div>
            <div>
              <p className="text-meta text-mute-dark">{quarterLabel()} spend</p>
              <p className="display mt-1.5 text-heading leading-none tabular-nums sm:text-display-sm">{fmt(Math.round(spent))}</p>
              <Meter value={spent} max={budget} mark={pace} tone="dark" className="mt-3" />
              <p className="num mt-2 text-meta text-mute-dark">of {fmt(Math.round(budget))} budget</p>
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-control bg-graphite-line text-meta">
            <DeskLink href="/business?tab=approvals" n={mine.length} label="to approve" alert={mine.length > 0} />
            <DeskLink href="/business?tab=orders" n={arriving.length} label="on the way" />
            <DeskLink href="/business?tab=invoices" n={bills.length} label="open invoices" />
          </ul>

          {nextBill && (
            <p className="mt-4 flex items-center justify-between gap-3 text-meta text-mute-dark">
              <span>
                Next invoice <span className="num text-porcelain">{nextBill.id}</span> · due {fmtShort(new Date(nextBill.due + "T00:00:00Z"))}
              </span>
              <span className="num text-porcelain">{fmt(nextBill.amount, { cents: true })}</span>
            </p>
          )}
        </div>

        {mine.length > 0 && (
          <div className="relative border-t border-graphite-line p-6 pt-5 sm:p-7 sm:pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow !text-mute-dark">Waiting on you</p>
              <Link href="/business?tab=approvals" className="text-meta text-brand hover:underline">
                All {mine.length} →
              </Link>
            </div>
            <div className="space-y-2">
              {mine.slice(0, 2).map((r) => (
                <RequestCard key={r.id} r={r} tone="dark" compact />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

function DeskLink({ href, n, label, alert }: { href: string; n: number; label: string; alert?: boolean }) {
  return (
    <li>
      <Link href={href} className="group flex h-full flex-col bg-graphite px-3.5 py-3 transition-colors hover:bg-graphite-2">
        <span className={clsx("num text-emphasis font-medium leading-none", alert ? "text-brand" : "text-porcelain")}>{n}</span>
        <span className="mt-1.5 text-mute-dark group-hover:text-porcelain">{label}</span>
      </Link>
    </li>
  );
}

/* ─── Quote in two fields ─── */

function QuickQuote() {
  const ws = useWorkspace();
  const router = useRouter();
  const notify = useUI((s) => s.notify);
  const { fmt } = usePrefs();
  const options = useMemo(() => products.filter((p) => p.b2b.rfq && p.tags.includes("bulk")).sort((a, b) => a.name.localeCompare(b.name)), []);
  const [productId, setProductId] = useState(options.find((p) => p.slug === "double-wall-cartons-12x10x8")?.id ?? options[0].id);
  const [qty, setQty] = useState(250);
  const p = productById(productId)!;
  const today = unitPrice(p, qty, { contract: true });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (qty < 1) return;
        const id = ws.createRfq({ productId, qty, deliverBy: isoDay(addBusinessDays(todayUTC(), 7)), locationId: ws.locations.find((l) => l.isDefault)?.id ?? ws.locations[0].id, note: "" });
        notify(`${id} sent to qualified suppliers`, "First replies usually land within the hour.", false);
        router.push(`/business?tab=quotes&rfq=${id}`);
      }}
      className="rounded-surface bg-white shadow-[var(--shadow-soft)] ring-1 ring-line"
    >
      <div className="flex items-center gap-4 p-5">
        <ProductImage product={p} sizes="64px" className="h-16 w-16 shrink-0 rounded-control" />
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_120px]">
          <div>
            <label htmlFor="hq-p" className="field-label !text-meta">
              What do you need?
            </label>
            <select id="hq-p" value={productId} onChange={(e) => setProductId(e.target.value)} className="field !h-11 !text-support">
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hq-q" className="field-label !text-meta">
              Quantity
            </label>
            <input id="hq-q" inputMode="numeric" value={qty || ""} onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, "")) || 0)} className="field num !h-11 !text-support" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
        <p className="text-meta text-mute">
          Your price today <span className="num text-ink">{fmt(today, { cents: true })}</span>/{p.b2b.unit} · suppliers reply in ~40 min
        </p>
        <button type="submit" disabled={qty < 1} className="btn btn-primary">
          Get competing quotes
        </button>
      </div>
    </form>
  );
}

/* ─── Catalogue search with procurement shortcuts ─── */

const SHORTCUTS = ["nitrile gloves", "copy paper A4", "shipping cartons", "ergonomic chair", "surface cleaner", "barcode scanner"];

function QuickFind() {
  const router = useRouter();
  const pushSearch = useShop((s) => s.pushSearch);
  const [q, setQ] = useState("");
  const go = (term: string) => {
    if (!term.trim()) return;
    pushSearch(term);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };
  return (
    <div className="rounded-surface bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-line">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex items-center gap-2 rounded-full bg-porcelain p-1.5 pl-5 ring-1 ring-line focus-within:ring-ink"
      >
        <label htmlFor="hf-q" className="sr-only">
          Search the catalogue
        </label>
        <input id="hf-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product, SKU or “200 boxes of gloves for Reno”" className="h-10 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-mute" />
        <button type="submit" aria-label="Search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-ink hover:bg-brand-hover">
          <Icon name="search" size={18} strokeWidth={2.1} />
        </button>
      </form>
      <p className="eyebrow mt-5">Frequently restocked</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SHORTCUTS.map((s) => (
          <button key={s} type="button" onClick={() => go(s)} className="chip">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
