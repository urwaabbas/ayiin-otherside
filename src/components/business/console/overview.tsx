"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { fmtShort } from "@/lib/format";
import { productById } from "@/lib/catalog/products";
import {
  creditAvailable,
  daysFromToday,
  inFlight,
  pacing,
  quarterLabel,
  quarterProgress,
  quarterSpend,
  savings,
  unpaid,
  waitingOn,
} from "@/lib/b2b/policy";
import { company, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { ReorderLists } from "@/components/business/reorder-lists";
import { Badge, Empty, Meter, Panel, TextAction } from "@/components/business/console/ui";
import { CountUp, EASE } from "@/components/motion/primitives";
import { PO_STATUS, PoDrawer, RequestCard, etaText } from "@/components/business/console/records";

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function OverviewView({ go }: { go: (id: string, extra?: string) => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const [poId, setPoId] = useState<string | null>(null);
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;

  const mine = waitingOn(ws.requisitions);
  const arriving = inFlight(ws.pos);
  const bills = unpaid(ws.invoices);
  const due14 = bills.filter((i) => i.status === "open" && daysFromToday(i.due) <= 14);
  const spent = quarterSpend(ws.pos);
  const budget = ws.costCenters.reduce((s, c) => s + c.budget, 0);
  const pace = quarterProgress();
  const saved = savings(ws.pos);
  const available = creditAvailable(ws);
  const openQuotes = ws.rfqs.filter((r) => r.status === "open");

  const summary = [
    mine.length ? plural(mine.length, "approval") + " waiting on you" : null,
    arriving.length ? plural(arriving.length, "order") + " on the way" : null,
    due14.length ? `${fmt(Math.round(due14.reduce((s, i) => s + i.amount, 0)))} due in the next 14 days` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="biz-deck p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="min-w-0 max-w-2xl">
            <p className="eyebrow flex items-center gap-2.5 !text-mute-dark">
              <span className="biz-live" aria-hidden />
              {company.name} · {quarterLabel()}
            </p>
            <h1 className="display mt-4 text-heading sm:text-display-sm lg:text-display-md">Welcome back, {viewer.name.split(" ")[0]}.</h1>
            <p className="mt-3 text-body leading-relaxed text-mute-dark">{summary.length ? `${summary.join(", ")}.` : "Everything is handled. Nothing needs you right now."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => go("quotes")} className="inline-flex h-11 items-center gap-2 rounded-control bg-white/[0.07] px-4 text-support font-medium text-porcelain ring-1 ring-white/10 transition-colors hover:bg-white/[0.13]">
              <Icon name="file" size={16} /> Request a quote
            </button>
            <button type="button" onClick={() => go("quick")} className="btn btn-primary">
              <Icon name="bolt" size={16} /> Quick order
            </button>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: `Spend · ${quarterLabel()}`,
              node: <CountUp value={Math.round(spent)} format={(n) => fmt(Math.round(n))} />,
              foot: `${Math.round((spent / budget) * 100)}% of ${fmt(Math.round(budget))} budget · ${Math.round(pace * 100)}% through quarter`,
              to: "budgets",
              meter: { value: spent, max: budget, mark: pace },
            },
            { label: "Saved vs list price", node: <CountUp value={Math.round(saved)} format={(n) => fmt(Math.round(n))} />, foot: "Contract and volume pricing, last 90 days", to: "spend" },
            {
              label: "Orders in flight",
              node: <CountUp value={arriving.length} />,
              foot: arriving[0] ? `Next: ${arriving[0].id} · ${etaText(arriving[0]).replace("Arriving ", "")}` : "Nothing in transit",
              to: "orders",
            },
            { label: "Available credit", node: <CountUp value={Math.round(available)} format={(n) => fmt(Math.round(n))} />, foot: `${company.terms} · of ${fmt(Math.round(company.creditLimit))}`, to: "invoices", accent: true },
          ].map((k, i) => (
            <motion.button
              key={k.label}
              type="button"
              onClick={() => go(k.to)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.07 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={`group biz-glass flex flex-col p-5 text-left ${k.accent ? "!bg-brand/[0.12] ring-1 ring-brand/30" : ""}`}
            >
              <dt className="flex items-center justify-between text-support text-mute-dark">
                {k.label}
                <Icon name="arrowUpRight" size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </dt>
              <dd className="mt-2 text-heading font-semibold tracking-[-0.03em] tabular-nums">{k.node}</dd>
              {k.meter && <Meter value={k.meter.value} max={k.meter.max} mark={k.meter.mark} tone="dark" className="mt-3" />}
              <dd className="mt-2 text-meta text-mute-dark">{k.foot}</dd>
            </motion.button>
          ))}
        </dl>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel
            title="Waiting on you"
            meta={mine.length ? `${fmt(mine.reduce((s, r) => s + r.total, 0), { cents: true })} across ${plural(mine.length, "request")}` : undefined}
            action={<TextAction onClick={() => go("approvals")}>All approvals →</TextAction>}
          >
            {mine.length ? (
              <div className="space-y-3">
                {mine.map((r) => (
                  <RequestCard key={r.id} r={r} />
                ))}
              </div>
            ) : (
              <Empty icon="approve" title="You're all caught up" body="Requests that need your sign-off show up here, and in your email." />
            )}
          </Panel>

          <Panel title="On the way" meta="Live delivery tracking" action={<TextAction onClick={() => go("orders")}>All orders →</TextAction>} flush>
            {arriving.length ? (
              <ul className="divide-y divide-line">
                {arriving.map((po) => {
                  const p = productById(po.lines[0].productId);
                  return (
                    <li key={po.id}>
                      <button type="button" onClick={() => setPoId(po.id)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-porcelain sm:px-6">
                        {p && <ProductImage product={p} sizes="44px" className="h-11 w-11 shrink-0 rounded-control" />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-support font-medium">
                            {p?.name}
                            {po.lines.length > 1 && <span className="text-mute"> + {po.lines.length - 1} more</span>}
                          </span>
                          <span className="num block truncate text-meta text-mute">
                            {po.id} · {ws.locations.find((l) => l.id === po.locationId)?.label}
                          </span>
                        </span>
                        <span className="hidden text-right sm:block">
                          <Badge tone={PO_STATUS[po.status].tone} dot>
                            {PO_STATUS[po.status].label}
                          </Badge>
                          <span className="mt-1 block text-meta text-ink-2">{etaText(po)}</span>
                        </span>
                        <Icon name="chevronRight" size={16} className="shrink-0 text-mute" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty icon="truck" title="Nothing in transit" />
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={`Budgets · ${quarterLabel()}`} meta="The tick shows how far through the quarter we are" action={<TextAction onClick={() => go("budgets")}>Manage →</TextAction>}>
            <ul className="space-y-4">
              {ws.costCenters.map((c) => {
                const s = quarterSpend(ws.pos, c.id);
                const over = pacing(s, c.budget) === "over";
                return (
                  <li key={c.id}>
                    <div className="flex items-baseline justify-between gap-3 text-support">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="num shrink-0 text-meta text-mute">
                        <span className="text-ink">{fmt(Math.round(s))}</span> / {fmt(Math.round(c.budget))}
                      </span>
                    </div>
                    <Meter value={s} max={c.budget} mark={pace} className="mt-2" />
                    {over && <p className="mt-1.5 text-meta text-warning">Spending ahead of pace</p>}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Due soon" meta={`${company.terms} · autopay off`} action={<TextAction onClick={() => go("invoices")}>Invoices →</TextAction>} flush>
            {bills.length ? (
              <ul className="divide-y divide-line">
                {bills.slice(0, 4).map((i) => {
                  const d = daysFromToday(i.due);
                  return (
                    <li key={i.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="num block text-support font-medium">{i.id}</span>
                        <span className="block text-meta text-mute">
                          {i.status === "scheduled" ? `Scheduled ${fmtShort(new Date(i.scheduledFor! + "T00:00:00Z"))}` : d < 0 ? `Overdue ${-d}d` : d === 0 ? "Due today" : `Due in ${d} days`}
                        </span>
                      </span>
                      <span className="num text-support font-medium">{fmt(i.amount, { cents: true })}</span>
                      {i.status === "scheduled" ? <Badge tone="info">Scheduled</Badge> : d <= 3 ? <Badge tone="warning">Soon</Badge> : <Badge>Open</Badge>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty icon="receipt" title="Nothing due" />
            )}
          </Panel>

          {openQuotes.length > 0 && (
            <Panel title="Open quote requests" action={<TextAction onClick={() => go("quotes")}>Compare →</TextAction>} flush>
              <ul className="divide-y divide-line">
                {openQuotes.map((q) => {
                  const p = productById(q.productId);
                  const best = Math.min(...q.responses.map((r) => r.unit));
                  return (
                    <li key={q.id}>
                      <button type="button" onClick={() => go("quotes", `&rfq=${q.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-porcelain sm:px-6">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-support font-medium">
                            {q.qty.toLocaleString("en-US")} × {p?.name}
                          </span>
                          <span className="num block text-meta text-mute">
                            {q.id} · {q.responses.length} suppliers
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block text-meta text-mute">Best</span>
                          <span className="num block text-support font-medium">{fmt(best, { cents: true })}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>
      </div>

      <Panel title="Reorder" meta="Scheduled lists order themselves. You get a reminder two days before" action={<Link href="/business?tab=lists" className="text-support font-medium text-ink-2 hover:text-ink">Manage lists →</Link>}>
        <ReorderLists />
      </Panel>

      <PoDrawer poId={poId} onClose={() => setPoId(null)} />
    </div>
  );
}
