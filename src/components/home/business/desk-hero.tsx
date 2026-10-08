"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { QuickOrder } from "@/components/business/quick-order";
import { Meter } from "@/components/business/console/ui";
import { ReorderLists } from "@/components/business/reorder-lists";
import { RequestCard } from "@/components/business/console/records";
import { CountUp, EASE } from "@/components/motion/primitives";

type Mode = "paste" | "quote" | "find" | "reorder";

const MODES: { id: Mode; label: string; icon: IconName }[] = [
  { id: "paste", label: "Paste an order", icon: "bolt" },
  { id: "quote", label: "Request a quote", icon: "file" },
  { id: "find", label: "Find a product", icon: "search" },
  { id: "reorder", label: "Reorder", icon: "repeat" },
];

const noSubscribe = () => () => {};
/** "Good evening" from the visitor's own clock; a neutral line while rendering on the server. */
function useGreeting() {
  const part = useSyncExternalStore(
    noSubscribe,
    () => {
      const h = new Date().getHours();
      return h < 5 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    },
    () => "",
  );
  return part ? (part === "night" ? "Working late" : `Good ${part}`) : "Welcome back";
}

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
  const greeting = useGreeting();

  const line = [
    mine.length ? `${mine.length} approval${mine.length === 1 ? "" : "s"}` : null,
    arriving.length ? `${arriving.length} deliver${arriving.length === 1 ? "y" : "ies"}` : null,
    bills.length && daysFromToday(bills[0].due) <= 7 ? `an invoice due ${fmtShort(new Date(bills[0].due + "T00:00:00Z"))}` : null,
  ].filter(Boolean) as string[];
  const status = line.length ? `${line.slice(0, -1).join(", ")}${line.length > 1 ? " and " : ""}${line[line.length - 1]} need you this week.` : "Nothing needs you right now.";

  // Shortcuts the desk offers on its own, each one a real destination built from live records.
  const nudges: { label: string; href: string; icon: IconName; alert?: boolean }[] = [];
  if (mine.length) nudges.push({ label: `Review ${mine.length} approval${mine.length === 1 ? "" : "s"}`, href: "/business?tab=approvals", icon: "approve", alert: true });
  if (arriving[0]) nudges.push({ label: `Track ${arriving[0].id}`, href: `/business?tab=orders&po=${arriving[0].id}`, icon: "truck" });
  if (bills[0]) nudges.push({ label: `Pay ${bills[0].id}`, href: "/business?tab=invoices", icon: "receipt" });
  nudges.push({ label: "See where spend is going", href: "/business?tab=spend", icon: "trend" });

  const rise = (delay: number, y = 14) => ({ initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay } });

  return (
    <section className="shell pt-3 sm:pt-5" data-nomotion>
      <div className="biz-deck p-5 sm:p-8 lg:p-[clamp(1rem,2.6svh,3rem)]">
        <motion.div {...rise(0, -8)} className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow flex items-center gap-2.5 !text-mute-dark">
            <span className="biz-live" aria-hidden />
            <span className="whitespace-nowrap text-porcelain">Ayiin Business</span>
            <span aria-hidden className="hidden h-px w-6 bg-graphite-line sm:block" />
            <span className="hidden truncate sm:inline">{company.name}</span>
          </p>
          <button
            type="button"
            onClick={() => setMarketplaceMode("personal")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-support font-medium text-porcelain ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
          >
            <Icon name="chevronLeft" size={13} />
            Back to Personal
          </button>
        </motion.div>

        <div className="mt-8 grid items-start gap-10 lg:mt-[clamp(0.5rem,2svh,3rem)] lg:grid-cols-12 lg:gap-[clamp(1.5rem,3.4svh,3rem)]">
          <div className="lg:col-span-7">
            <motion.p {...rise(0.05)} className="text-emphasis text-mute-dark">
              {greeting}, <span className="text-porcelain">{viewer.name.split(" ")[0]}</span>.
            </motion.p>
            <h1 className="display mt-3 text-[2.75rem] leading-[0.95] sm:text-display-lg lg:mt-[clamp(0.25rem,1svh,0.75rem)] lg:text-[clamp(2.25rem,5.8svh,5.5rem)]">
              <motion.span {...rise(0.12, 36)} className="block">
                What are we
              </motion.span>
              <motion.span {...rise(0.2, 36)} className="block">
                buying today<span className="text-brand">?</span>
              </motion.span>
            </h1>
            <motion.p {...rise(0.3)} className="mt-5 max-w-[560px] text-body leading-relaxed text-mute-dark sm:text-emphasis sm:leading-snug lg:mt-[clamp(0.5rem,1.6svh,1.25rem)] lg:text-[clamp(0.9375rem,2svh,1.25rem)]">
              <span className="[@media(min-width:1024px)_and_(max-height:860px)]:hidden">Paste an order, get quotes, or reorder.{" "}</span>
              {ready ? <span className="text-porcelain/90">{status}</span> : <span className="inline-block h-[0.9em] w-56 max-w-full translate-y-0.5 animate-pulse rounded-full bg-white/10 align-middle" aria-hidden />}
            </motion.p>

            <motion.div {...rise(0.4, 24)} className="mt-8 lg:mt-[clamp(0.5rem,2.4svh,2rem)]">
              <div role="tablist" aria-label="Start a purchase" className="scroll-x flex gap-1.5 pb-3 lg:pb-[clamp(0.25rem,1svh,0.75rem)]">
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
                      "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-support transition-colors",
                      mode === m.id ? "font-medium text-ink" : "text-porcelain/75 hover:text-porcelain",
                    )}
                  >
                    {mode === m.id && <motion.span layoutId="desk-mode" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                    <Icon name={m.icon} size={16} className="relative" />
                    <span className="relative">{m.label}</span>
                  </button>
                ))}
              </div>
              <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${mode}`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={mode} className="text-ink" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: EASE }}>
                    {mode === "paste" && <QuickOrder variant="hero" />}
                    {mode === "quote" && <QuickQuote />}
                    {mode === "find" && <QuickFind />}
                    {mode === "reorder" && (
                      <div className="rounded-surface bg-white p-4 text-ink shadow-[var(--shadow-soft)] sm:p-5">
                        <ReorderLists thumbnails={false} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <motion.aside {...rise(0.3, 30)} aria-label="Company account" className="lg:col-span-5">
            {accountCard()}
          </motion.aside>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="mt-10 lg:mt-[clamp(0.5rem,2.2svh,3.5rem)] [@media(min-width:1024px)_and_(max-height:740px)]:hidden">
          <div className="biz-rule" />
          <div className="mt-5 flex flex-wrap items-center gap-2.5 lg:mt-[clamp(0.5rem,1.4svh,1.25rem)]">
            <span className="eyebrow mr-1 !text-mute-dark">Suggested</span>
            {ready &&
              nudges.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={clsx(
                    "group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-support ring-1 transition-colors",
                    n.alert ? "bg-brand/15 text-brand ring-brand/30 hover:bg-brand/25" : "bg-white/[0.05] text-porcelain ring-white/10 hover:bg-white/[0.1]",
                  )}
                >
                  <Icon name={n.icon} size={15} />
                  {n.label}
                  <Icon name="arrowRight" size={14} className="-ml-0.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );

  function accountCard() {
    if (!ready)
      return (
        <div className="biz-glass space-y-6 p-6 sm:p-7" aria-busy="true" aria-label="Loading company account">
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
      <div className="biz-glass relative overflow-hidden">
        <div aria-hidden className="biz-sheen pointer-events-none absolute inset-x-0 top-0 h-px" />
        <div className="relative p-6 sm:p-7 lg:p-[clamp(1rem,2.4svh,1.75rem)]">
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
            <Link href="/business" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control bg-brand px-4 text-support font-semibold text-ink transition-colors hover:bg-brand-hover">
              Console <Icon name="arrowUpRight" size={15} />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-5 lg:mt-[clamp(0.75rem,2svh,1.75rem)]">
            <div>
              <p className="text-meta text-mute-dark">Available credit</p>
              <p className="display mt-1.5 text-heading leading-none tabular-nums sm:text-display-sm">
                <CountUp value={Math.round(available)} format={(n) => fmt(Math.round(n))} />
              </p>
              <Meter value={available} max={company.creditLimit} tone="dark" className="mt-3" />
              <p className="num mt-2 text-meta text-mute-dark">of {fmt(Math.round(company.creditLimit))}</p>
            </div>
            <div>
              <p className="text-meta text-mute-dark">{quarterLabel()} spend</p>
              <p className="display mt-1.5 text-heading leading-none tabular-nums sm:text-display-sm">
                <CountUp value={Math.round(spent)} format={(n) => fmt(Math.round(n))} />
              </p>
              <Meter value={spent} max={budget} mark={pace} tone="dark" className="mt-3" />
              <p className="num mt-2 text-meta text-mute-dark">of {fmt(Math.round(budget))} budget</p>
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-control bg-white/10 text-meta lg:mt-[clamp(0.75rem,1.8svh,1.5rem)]">
            <DeskLink href="/business?tab=approvals" n={mine.length} label="to approve" alert={mine.length > 0} />
            <DeskLink href="/business?tab=orders" n={arriving.length} label="on the way" />
            <DeskLink href="/business?tab=invoices" n={bills.length} label="open invoices" />
          </ul>

          {nextBill && (
            <p className="mt-4 flex items-center justify-between gap-3 text-meta text-mute-dark [@media(min-width:1024px)_and_(max-height:860px)]:hidden">
              <span>
                Next invoice <span className="num text-porcelain">{nextBill.id}</span> · due {fmtShort(new Date(nextBill.due + "T00:00:00Z"))}
              </span>
              <span className="num text-porcelain">{fmt(nextBill.amount, { cents: true })}</span>
            </p>
          )}
        </div>

        {mine.length > 0 && (
          <div className="relative border-t border-white/10 p-6 pt-5 sm:p-7 sm:pt-5 lg:p-[clamp(1rem,2.4svh,1.75rem)] lg:pt-[clamp(0.75rem,1.8svh,1.25rem)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow !text-mute-dark">Waiting on you</p>
              <Link href="/business?tab=approvals" className="text-meta text-brand hover:underline">
                All {mine.length} →
              </Link>
            </div>
            <div className="space-y-2">
              {mine.slice(0, 2).map((r, i) => (
                <div key={r.id} className={i > 0 ? "[@media(min-width:1024px)_and_(max-height:860px)]:hidden" : undefined}>
                  <RequestCard r={r} tone="dark" compact />
                </div>
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
      <Link href={href} className="group flex h-full flex-col bg-[#1d1c1a] px-3.5 py-3 transition-colors hover:bg-[#262522]">
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
      className="rounded-surface bg-white text-ink shadow-[var(--shadow-soft)] ring-1 ring-line"
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
    <div className="rounded-surface bg-white p-5 text-ink shadow-[var(--shadow-soft)] ring-1 ring-line">
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
