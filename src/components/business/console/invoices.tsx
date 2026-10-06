"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { sellerById } from "@/lib/catalog/sellers";
import { fmtShort } from "@/lib/format";
import { creditAvailable, creditUsed, daysFromToday } from "@/lib/b2b/policy";
import type { Invoice } from "@/lib/b2b/types";
import { company, useWorkspace } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";
import { Badge, Meter, PageHead, Panel, Segmented, Stat, downloadCsv, td, th } from "@/components/business/console/ui";

const day = (iso: string) => fmtShort(new Date(`${iso}T00:00:00Z`));

function dueLabel(i: Invoice) {
  if (i.status === "paid") return `Paid ${day(i.paidAt!)}`;
  if (i.status === "scheduled") return `Scheduled for ${day(i.scheduledFor!)}`;
  const d = daysFromToday(i.due);
  if (d < 0) return `Overdue by ${-d} ${-d === 1 ? "day" : "days"}`;
  if (d === 0) return "Due today";
  return `Due in ${d} ${d === 1 ? "day" : "days"}`;
}

export function InvoicesView({ go }: { go: (id: string, extra?: string) => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const [filter, setFilter] = useState<"unpaid" | "paid" | "all">("unpaid");
  const open = ws.invoices.filter((i) => i.status !== "paid");
  const overdue = open.filter((i) => i.status === "open" && daysFromToday(i.due) < 0);
  const due14 = open.filter((i) => daysFromToday(i.due) <= 14);
  const paid = ws.invoices.filter((i) => i.status === "paid");
  const used = creditUsed(ws);
  const unbilled = ws.pos.filter((p) => !p.invoiceId).reduce((s, p) => s + p.total, 0);
  const rows = ws.invoices
    .filter((i) => (filter === "all" ? true : filter === "paid" ? i.status === "paid" : i.status !== "paid"))
    .sort((a, b) => (a.status === "paid" ? 1 : 0) - (b.status === "paid" ? 1 : 0) || a.due.localeCompare(b.due));

  const statement = () =>
    downloadCsv(`northwind-statement-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Invoice", "PO", "Supplier", "Issued", "Due", "Amount (USD)", "Status", "Paid / scheduled", "Method"],
      ...ws.invoices.map((i) => [i.id, i.poId, sellerById(i.sellerId)?.name ?? i.sellerId, i.issued, i.due, i.amount.toFixed(2), i.status, i.paidAt ?? i.scheduledFor ?? "", i.method ?? ""]),
    ]);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Track"
        title="Invoices"
        description={`One statement for every supplier on Ayiin. ${company.terms}, PO-matched, with your ${company.exemptionCert.split(" · ")[0]} applied.`}
        actions={
          <button type="button" onClick={statement} className="btn btn-secondary">
            <Icon name="upload" size={16} className="rotate-180" /> Download statement
          </button>
        }
      />

      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Open balance" value={fmt(Math.round(open.reduce((s, i) => s + i.amount, 0)))} foot={`${open.length} invoices`} />
        <Stat label="Due in 14 days" value={fmt(Math.round(due14.reduce((s, i) => s + i.amount, 0)))} foot={due14.length ? `Next ${day(due14[0].due)}` : "Nothing due"} />
        <Stat label="Overdue" value={fmt(Math.round(overdue.reduce((s, i) => s + i.amount, 0)))} foot={overdue.length ? "Pay now to keep terms" : "None — on time"} tone={overdue.length ? "alert" : undefined} />
        <Stat label="Paid · last 90 days" value={fmt(Math.round(paid.reduce((s, i) => s + i.amount, 0)))} foot={`${paid.length} invoices`} />
      </dl>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Segmented
            label="Filter invoices"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "unpaid", label: "Unpaid", count: open.length },
              { value: "paid", label: "Paid", count: paid.length },
              { value: "all", label: "All", count: ws.invoices.length },
            ]}
          />
          <Panel flush>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-support">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Invoice</th>
                    <th className={th}>Supplier</th>
                    <th className={th}>Due</th>
                    <th className={clsx(th, "text-right")}>Amount</th>
                    <th className={clsx(th, "text-right")}>
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((i) => (
                    <InvoiceRow key={i.id} i={i} go={go} />
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Credit line" meta={`${company.terms} · reviewed quarterly`} className="self-start">
          <p className="text-meta text-mute">Available</p>
          <p className="display mt-1 text-display-sm leading-none tabular-nums">{fmt(Math.round(creditAvailable(ws)))}</p>
          <Meter value={used} max={company.creditLimit} tone="brand" className="mt-4" />
          <dl className="mt-4 space-y-2 text-support">
            <div className="flex justify-between">
              <dt className="text-mute">Invoiced, unpaid</dt>
              <dd className="num">{fmt(Math.round(used - unbilled))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Ordered, not invoiced</dt>
              <dd className="num">{fmt(Math.round(unbilled))}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-medium">
              <dt>Limit</dt>
              <dd className="num">{fmt(Math.round(company.creditLimit))}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-control bg-mist p-3 text-meta text-ink-2">Pay on time for 90 days to unlock Net 60 and a higher limit.</p>
        </Panel>
      </div>
    </div>
  );
}

function InvoiceRow({ i, go }: { i: Invoice; go: (id: string, extra?: string) => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const [menu, setMenu] = useState(false);
  const s = sellerById(i.sellerId);
  const d = daysFromToday(i.due);
  const late = i.status === "open" && d < 0;

  return (
    <tr className="border-t border-line first:border-t-0">
      <td className={td}>
        <p className="num font-medium">{i.id}</p>
        <button type="button" onClick={() => go("orders", `&po=${i.poId}`)} className="num text-meta text-mute hover:text-ink hover:underline">
          {i.poId} · issued {day(i.issued)}
        </button>
      </td>
      <td className={clsx(td, "text-ink-2")}>{s?.name ?? i.sellerId}</td>
      <td className={td}>
        <p className={clsx("text-support", late ? "font-medium text-danger" : i.status === "open" && d <= 3 ? "text-warning" : "text-ink-2")}>{dueLabel(i)}</p>
        <p className="text-meta text-mute">{day(i.due)}</p>
      </td>
      <td className={clsx(td, "num text-right font-medium")}>{fmt(i.amount, { cents: true })}</td>
      <td className={clsx(td, "relative text-right")}>
        {i.status === "paid" ? (
          <Badge tone="success" dot>
            Paid · {i.method}
          </Badge>
        ) : i.status === "scheduled" ? (
          <div className="flex items-center justify-end gap-2">
            <Badge tone="info" dot>
              Scheduled
            </Badge>
            <button
              type="button"
              onClick={() => {
                ws.cancelSchedule(i.id);
                notify(`${i.id} unscheduled`, "It's back in your open invoices.", false);
              }}
              className="text-meta text-mute hover:text-ink"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="inline-flex">
            <button
              type="button"
              onClick={() => {
                ws.pay(i.id, "ACH");
                notify(`${i.id} paid`, `${fmt(i.amount, { cents: true })} by ACH from Northwind Operating ••4021`, false);
              }}
              className="btn btn-primary !h-9 rounded-r-none !px-3.5 !text-support"
            >
              Pay now
            </button>
            <button
              type="button"
              aria-label="More payment options"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="btn btn-primary !h-9 rounded-l-none border-l border-ink/15 !px-2"
            >
              <Icon name="chevronDown" size={15} />
            </button>
            {menu && (
              <div className="absolute right-5 top-[calc(100%-6px)] z-20 w-56 rounded-surface bg-white p-1.5 text-left shadow-[var(--shadow-float)] sm:right-6">
                <button
                  type="button"
                  onClick={() => {
                    ws.schedule(i.id, i.due);
                    setMenu(false);
                    notify(`${i.id} scheduled`, `ACH on ${day(i.due)} — the due date, so your cash stays put until then.`, false);
                  }}
                  className="flex w-full flex-col rounded-control px-3 py-2 hover:bg-mist"
                >
                  <span className="text-support font-medium">Schedule for due date</span>
                  <span className="text-meta text-mute">ACH on {day(i.due)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ws.pay(i.id, "Card");
                    setMenu(false);
                    notify(`${i.id} paid`, "Charged to Corporate Visa ••8810", false);
                  }}
                  className="flex w-full flex-col rounded-control px-3 py-2 hover:bg-mist"
                >
                  <span className="text-support font-medium">Pay by corporate card</span>
                  <span className="text-meta text-mute">Visa ••8810 · instant</span>
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
