"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { creditAvailable, inFlight, unpaid, waitingOn } from "@/lib/b2b/policy";
import {
  company,
  useWorkspace,
  useWorkspaceReady,
  VIEWER_ID,
} from "@/lib/b2b/workspace";
import {
  Loading,
  PageHeaderSkeleton,
  PanelsSkeleton,
} from "@/components/ui/skeleton";
import { usePrefs } from "@/components/providers";
import { Icon, type IconName } from "@/components/ui/icon";
import { Avatar, Meter } from "@/components/business/console/ui";
import { OverviewView } from "@/components/business/console/overview";
import { ApprovalsView } from "@/components/business/console/approvals";
import { OrdersView } from "@/components/business/console/orders";
import { QuotesView } from "@/components/business/console/quotes";
import { InvoicesView } from "@/components/business/console/invoices";
import { BudgetsView } from "@/components/business/console/budgets";
import { TeamView } from "@/components/business/console/team";
import { LocationsView } from "@/components/business/console/locations";
import { SpendView } from "@/components/business/console/spend";
import { ListsView, QuickView } from "@/components/business/console/buying";
import { CommandPalette } from "@/components/business/console/command-palette";
import { CountUp, EASE } from "@/components/motion/primitives";

type Tab = { id: string; label: string; icon: IconName };

const GROUPS: { label?: string; tabs: Tab[] }[] = [
  { tabs: [{ id: "overview", label: "Overview", icon: "grid" }] },
  {
    label: "Buy",
    tabs: [
      { id: "quick", label: "Quick order", icon: "bolt" },
      { id: "lists", label: "Lists & reorders", icon: "repeat" },
      { id: "quotes", label: "Quotes", icon: "file" },
    ],
  },
  {
    label: "Track",
    tabs: [
      { id: "orders", label: "Orders", icon: "box" },
      { id: "invoices", label: "Invoices", icon: "receipt" },
      { id: "spend", label: "Spend", icon: "trend" },
    ],
  },
  {
    label: "Control",
    tabs: [
      { id: "approvals", label: "Approvals", icon: "approve" },
      { id: "budgets", label: "Budgets", icon: "wallet" },
      { id: "team", label: "Team", icon: "users" },
      { id: "addresses", label: "Locations", icon: "pin" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.tabs);

export function Console() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, setMode, fmt } = usePrefs();
  const ws = useWorkspace();
  const ready = useWorkspaceReady();
  const tab = ALL.some((t) => t.id === sp.get("tab"))
    ? sp.get("tab")!
    : "overview";
  const [jumpOpen, setJumpOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) return;
      if (e.key.toLowerCase() === "j" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setJumpOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const go = (id: string, extra = "") => {
    router.replace(`${pathname}?tab=${id}${extra}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const counts: Record<string, { n: number; alert?: boolean }> = {
    approvals: { n: waitingOn(ws.requisitions).length, alert: true },
    orders: { n: inFlight(ws.pos).length },
    invoices: {
      n: unpaid(ws.invoices).filter((i) => i.status === "open").length,
    },
    quotes: { n: ws.rfqs.filter((r) => r.status === "open").length },
  };
  const available = creditAvailable(ws);
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;

  return (
    <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:sticky lg:top-[96px] lg:self-start">
        {/* Account identity */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="biz-deck hidden p-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-porcelain font-mono text-meta font-medium text-ink">
              {company.initials}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate text-support font-medium">
                {company.name}
                <span className="biz-live shrink-0" aria-hidden />
              </p>
              <p className="truncate text-meta text-mute-dark">
                {company.plan}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-meta">
              <span className="text-mute-dark">Available credit</span>
              <span className="num">
                {ready ? <CountUp value={Math.round(available)} format={(n) => fmt(Math.round(n))} /> : "—"}
              </span>
            </div>
            <Meter
              value={available}
              max={company.creditLimit}
              tone="dark"
              className="mt-2"
            />
            <p className="mt-2 text-meta text-mute-dark">
              {company.terms} · limit {fmt(Math.round(company.creditLimit))}
            </p>
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => setJumpOpen(true)}
          className="group mt-3 hidden w-full items-center gap-2.5 rounded-control bg-white px-3 py-2.5 text-left text-support text-mute shadow-[var(--shadow-hair)] transition-shadow hover:text-ink hover:shadow-[var(--shadow-soft)] lg:flex"
        >
          <Icon name="search" size={16} />
          <span className="flex-1">Jump to…</span>
          <kbd className="num rounded-compact bg-mist px-1.5 py-0.5 text-meta text-ink-2">J</kbd>
        </button>

        <nav aria-label="Business console" className="lg:mt-4">
          <ul className="scroll-x -mx-[var(--gutter)] flex gap-1 px-[var(--gutter)] lg:mx-0 lg:block lg:space-y-5 lg:px-0">
            {GROUPS.map((g, gi) => (
              <li key={gi} className="contents lg:block">
                {g.label && (
                  <p className="eyebrow mb-1.5 hidden px-3 lg:block">
                    {g.label}
                  </p>
                )}
                <ul className="contents lg:block lg:space-y-0.5">
                  {g.tabs.map((t) => {
                    const c = counts[t.id];
                    const active = tab === t.id;
                    return (
                      <li key={t.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => go(t.id)}
                          aria-current={active ? "page" : undefined}
                          className={clsx(
                            "relative flex w-full items-center gap-3 rounded-full px-3.5 py-2 text-left text-support transition-colors lg:rounded-control",
                            active
                              ? "text-porcelain"
                              : "text-ink-2 hover:bg-mist hover:text-ink",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="console-nav-pill"
                              className="absolute inset-0 rounded-full bg-ink shadow-[0_8px_20px_-10px_rgb(var(--rgb-ink)/0.7)] lg:rounded-control"
                              transition={{ type: "spring", stiffness: 420, damping: 38 }}
                            />
                          )}
                          <Icon
                            name={t.icon}
                            size={17}
                            className={clsx("relative", active && "text-brand")}
                          />
                          <span className="relative whitespace-nowrap">{t.label}</span>
                          {ready && c && c.n > 0 && (
                            <span
                              className={clsx(
                                "num relative ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-meta",
                                c.alert
                                  ? "bg-brand text-ink"
                                  : active
                                    ? "bg-graphite-2 text-porcelain"
                                    : "bg-soft text-ink-2",
                              )}
                            >
                              {c.n}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-5 hidden items-center gap-3 border-t border-line px-1 pt-4 lg:flex">
          <Avatar initials={viewer.initials} size={32} tone="ink" />
          <div className="min-w-0 text-meta">
            <p className="truncate text-support font-medium">{viewer.name}</p>
            <p className="truncate text-mute">
              {viewer.role} · {viewer.title}
            </p>
          </div>
        </div>

        {mode !== "business" && (
          <div className="mt-4 hidden rounded-surface bg-brand-soft p-4 text-support lg:block">
            <p className="font-medium">You&apos;re browsing in Personal mode</p>
            <p className="mt-1 text-ink-2">
              Switch to see contract and volume pricing everywhere on Ayiin.
            </p>
            <button
              type="button"
              onClick={() => setMode("business")}
              className="btn btn-secondary mt-3 !h-9 !text-support"
            >
              Switch to Business
            </button>
          </div>
        )}
      </aside>

      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: EASE }}
        className="min-w-0 pb-8"
      >
        {!ready ? (
          <Loading label="Loading your workspace">
            <PageHeaderSkeleton />
            <PanelsSkeleton count={4} />
          </Loading>
        ) : (
          <>
            {tab === "overview" && <OverviewView go={go} />}
            {tab === "quick" && <QuickView />}
            {tab === "lists" && <ListsView />}
            {tab === "quotes" && <QuotesView />}
            {tab === "orders" && <OrdersView />}
            {tab === "invoices" && <InvoicesView go={go} />}
            {tab === "spend" && <SpendView />}
            {tab === "approvals" && <ApprovalsView />}
            {tab === "budgets" && <BudgetsView go={go} />}
            {tab === "team" && <TeamView />}
            {tab === "addresses" && <LocationsView />}
          </>
        )}
      </motion.div>
      </AnimatePresence>
      <CommandPalette open={jumpOpen} onClose={() => setJumpOpen(false)} go={go} />
    </div>
  );
}
