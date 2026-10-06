"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { productById } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import { fmtDay, fmtShort } from "@/lib/format";
import { dayAgo, daysFromToday, reasonFor } from "@/lib/b2b/policy";
import type { Line, PoStatus, PurchaseOrder, Requisition } from "@/lib/b2b/types";
import { ccName, locLabel, memberName, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { Avatar, Badge, Drawer, type BadgeTone } from "@/components/business/console/ui";

export const PO_STATUS: Record<PoStatus, { label: string; tone: BadgeTone }> = {
  confirmed: { label: "Confirmed", tone: "info" },
  shipped: { label: "In transit", tone: "brand" },
  delivered: { label: "Delivered", tone: "success" },
};

export const SOURCE_LABEL: Record<PurchaseOrder["source"], string> = {
  checkout: "Checkout",
  approval: "Approved request",
  quote: "Awarded quote",
  reorder: "Scheduled reorder",
};

const iso = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00Z` : s);

export function etaText(po: PurchaseOrder) {
  if (po.status === "delivered") return `Delivered ${fmtShort(iso(po.eta))}`;
  const d = daysFromToday(po.eta);
  if (d <= 0) return "Arriving today";
  if (d === 1) return "Arriving tomorrow";
  return `Arriving ${fmtDay(iso(po.eta))}`;
}

/* ─── Line items ─── */

export function LineItems({ lines, dense }: { lines: Line[]; dense?: boolean }) {
  const { fmt } = usePrefs();
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => {
        const p = productById(l.productId);
        if (!p) return null;
        return (
          <li key={l.productId + l.variantId} className={clsx("flex items-center gap-3", dense ? "py-2.5" : "py-3")}>
            <ProductImage product={p} variant={l.variantId} sizes="48px" className={clsx("shrink-0 rounded-control", dense ? "h-10 w-10" : "h-12 w-12")} />
            <div className="min-w-0 flex-1">
              <Link href={`/p/${p.slug}`} className="block truncate text-support font-medium hover:underline">
                {p.name}
              </Link>
              <p className="num truncate text-meta text-mute">
                {p.b2b.sku} · {l.qty.toLocaleString("en-US")} × {fmt(l.unit, { cents: true })} / {p.b2b.unit}
              </p>
            </div>
            <p className="num shrink-0 text-support font-medium">{fmt(l.unit * l.qty, { cents: true })}</p>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── PO lifecycle ─── */

export function PoTimeline({ po }: { po: PurchaseOrder }) {
  const reached = { confirmed: 1, shipped: 2, delivered: 3 }[po.status];
  const steps = [
    { label: "Ordered", at: fmtShort(iso(po.createdAt)) },
    { label: "Confirmed by supplier", at: fmtShort(iso(po.createdAt)) },
    { label: "Shipped", at: reached >= 2 ? "Tracking live" : "Awaiting dispatch" },
    { label: po.status === "delivered" ? "Delivered" : "Expected", at: fmtDay(iso(po.eta)) },
  ];
  return (
    <ol className="relative grid grid-cols-4">
      {steps.map((s, i) => {
        const done = i <= reached;
        const current = i === reached + 1;
        return (
          <li key={s.label} className="relative pr-2">
            <div className="flex items-center">
              <span
                className={clsx(
                  "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                  done ? "bg-ink text-porcelain" : "bg-white text-faint ring-1 ring-line-strong",
                  current && "!bg-brand !text-ink ring-0",
                )}
              >
                {done ? <Icon name="check" size={13} strokeWidth={2.4} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              {i < steps.length - 1 && <span className={clsx("h-0.5 flex-1", i < reached ? "bg-ink" : "bg-line")} />}
            </div>
            <p className={clsx("mt-2.5 text-meta font-medium leading-tight", done || current ? "text-ink" : "text-mute")}>{s.label}</p>
            <p className="num mt-0.5 text-meta text-mute">{s.at}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function PoDrawer({ poId, onClose }: { poId: string | null; onClose: () => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const po = ws.pos.find((p) => p.id === poId);
  const invoice = po?.invoiceId ? ws.invoices.find((i) => i.id === po.invoiceId) : undefined;
  const notify = useUI((s) => s.notify);
  const addToCart = useShop((s) => s.addToCart);
  return (
    <Drawer
      open={!!po}
      onClose={onClose}
      eyebrow={po ? `${SOURCE_LABEL[po.source]} · ${dayAgo(po.createdAt)}` : ""}
      title={po ? <span className="num">{po.id}</span> : ""}
      footer={
        po && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-meta text-mute">Order total</p>
              <p className="num text-emphasis font-medium">{fmt(po.total, { cents: true })}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                po.lines.forEach((l) => addToCart(l.productId, l.variantId, l.qty, true));
                notify("Added to cart", `${po.lines.length} lines from ${po.id} at today's contract price`);
              }}
              className="btn btn-primary"
            >
              <Icon name="repeat" size={16} /> Buy again
            </button>
          </div>
        )
      }
    >
      {po && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={PO_STATUS[po.status].tone} dot>
              {PO_STATUS[po.status].label}
            </Badge>
            <span className="text-support text-ink-2">{etaText(po)}</span>
          </div>
          <div className="rounded-surface bg-white p-5 shadow-[var(--shadow-hair)]">
            <PoTimeline po={po} />
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-surface bg-white p-5 text-support shadow-[var(--shadow-hair)]">
            <Field label="Buyer" value={memberName(ws.members, po.buyerId)} />
            <Field label="Cost centre" value={ccName(ws.costCenters, po.costCenterId)} />
            <Field label="Ship to" value={locLabel(ws.locations, po.locationId)} />
            <Field label="Supplier" value={po.sellerIds.map((s) => sellerById(s)?.name ?? s).join(", ")} />
            {po.reference && <Field label="Your reference" value={<span className="num">{po.reference}</span>} />}
            <Field
              label="Invoice"
              value={
                invoice ? (
                  <Link href={`/business?tab=invoices`} className="num underline-offset-2 hover:underline">
                    {invoice.id} · {invoice.status === "paid" ? "Paid" : `Due ${fmtShort(iso(invoice.due))}`}
                  </Link>
                ) : (
                  "Issued on dispatch"
                )
              }
            />
          </dl>
          <div className="rounded-surface bg-white px-5 shadow-[var(--shadow-hair)]">
            <LineItems lines={po.lines} />
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-meta text-mute">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

/* ─── Approval card ─── */

export function RequestCard({ r, tone = "light", compact }: { r: Requisition; tone?: "light" | "dark"; compact?: boolean }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");
  const dark = tone === "dark";
  const requester = ws.members.find((m) => m.id === r.requesterId);
  const first = productById(r.lines[0]?.productId ?? "");
  const intended = ws.rules.find((x) => x.id === r.ruleId)?.approverId ?? ws.costCenters.find((c) => c.id === r.costCenterId)?.ownerId;
  const escalated = intended === r.requesterId;

  const approve = () => {
    const poId = ws.approve(r.id);
    if (poId) notify(`${r.id} approved`, `${poId} sent to suppliers · ${fmt(r.total, { cents: true })} on Net 30`, { label: "View PO", href: `/business?tab=orders&po=${poId}` });
  };
  const sendBack = () => {
    if (!note.trim()) return;
    ws.returnRequest(r.id, note.trim());
    notify(`${r.id} returned to ${requester?.name.split(" ")[0] ?? "requester"}`, "They'll see your note and can resubmit.", false);
    setReturning(false);
  };

  return (
    <article
      className={clsx(
        "rounded-surface p-4 transition-colors",
        dark ? "bg-graphite ring-1 ring-graphite-line" : "bg-white shadow-[var(--shadow-hair)]",
      )}
    >
      <div className="flex items-start gap-3">
        {!compact && first && <ProductImage product={first} sizes="48px" className="h-12 w-12 shrink-0 rounded-control" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={clsx("min-w-0 text-support font-medium leading-snug", dark && "text-porcelain")}>
              {r.urgent && <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-brand" aria-label="Urgent" />}
              {r.title}
            </p>
            <p className={clsx("num shrink-0 text-support font-medium", dark && "text-porcelain")}>{fmt(r.total, { cents: true })}</p>
          </div>
          <p className={clsx("mt-0.5 truncate text-meta", dark ? "text-mute-dark" : "text-mute")}>
            <span className="num">{r.id}</span> · {requester?.name} · {dayAgo(r.submittedAt)}
            {!compact && <> · {ccName(ws.costCenters, r.costCenterId)}</>}
          </p>
          {!compact && (
            <p className="mt-2 flex items-center gap-1.5 text-meta text-ink-2">
              <Icon name="info" size={13} className="shrink-0" />
              {reasonFor(r.ruleId, ws.rules, ws.costCenters)}
              {escalated && " · escalated (no self-approval)"}
            </p>
          )}
          {!compact && r.note && (
            <blockquote className="mt-3 rounded-control bg-porcelain px-3 py-2 text-support text-ink-2">&ldquo;{r.note}&rdquo;</blockquote>
          )}
        </div>
      </div>

      {r.status !== "pending" ? (
        <div className={clsx("mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-meta", dark ? "border-graphite-line text-mute-dark" : "border-line text-mute")}>
          {r.status === "approved" ? (
            <>
              <Badge tone="success" dot>Approved</Badge>
              <span>by {memberName(ws.members, r.approverId)}{r.decidedAt && ` · ${dayAgo(r.decidedAt)}`}</span>
              {r.poId && (
                <Link href={`/business?tab=orders&po=${r.poId}`} className="num ml-auto font-medium text-ink underline-offset-2 hover:underline">
                  {r.poId} →
                </Link>
              )}
            </>
          ) : (
            <>
              <Badge tone="warning" dot>Returned</Badge>
              {r.note && <span className="min-w-0 flex-1 truncate">&ldquo;{r.note}&rdquo;</span>}
            </>
          )}
        </div>
      ) : r.approverId !== VIEWER_ID ? (
        <div className={clsx("mt-3 flex items-center gap-2 border-t pt-3", dark ? "border-graphite-line" : "border-line")}>
          <MemberChip id={r.approverId} />
          <span className={clsx("text-meta", dark ? "text-mute-dark" : "text-mute")}>is reviewing</span>
          <button
            type="button"
            onClick={() => notify(`Reminder sent to ${memberName(ws.members, r.approverId).split(" ")[0]}`, "By email and Slack, with a one-tap approve link.", false)}
            className="btn btn-ghost ml-auto !h-8 !px-3 !text-meta"
          >
            <Icon name="bell" size={14} /> Nudge
          </button>
        </div>
      ) : returning ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendBack();
          }}
          className="mt-3 space-y-2"
        >
          <label htmlFor={`note-${r.id}`} className={clsx("text-meta font-medium", dark ? "text-porcelain" : "text-ink-2")}>
            What should {requester?.name.split(" ")[0]} change?
          </label>
          <textarea
            id={`note-${r.id}`}
            autoFocus
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Split into two orders, or use the contract SKU"
            className="field !h-auto py-2.5 !text-support"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={!note.trim()} className="btn btn-primary !h-9 !text-support">
              Send back
            </button>
            <button type="button" onClick={() => setReturning(false)} className={clsx("btn btn-ghost !h-9 !text-support", dark && "text-porcelain hover:!bg-graphite-2")}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={approve} className="btn btn-primary !h-9 !text-support">
            <Icon name="check" size={15} strokeWidth={2.2} /> Approve
          </button>
          <button type="button" onClick={() => setReturning(true)} className={clsx("btn btn-ghost !h-9 !text-support", dark && "text-porcelain hover:!bg-graphite-2")}>
            Return
          </button>
          <span className={clsx("ml-auto text-meta", dark ? "text-mute-dark" : "text-mute")}>
            {r.lines.length} {r.lines.length === 1 ? "line" : "lines"} · {r.lines.reduce((n, l) => n + l.qty, 0).toLocaleString("en-US")} units
          </span>
        </div>
      )}
    </article>
  );
}

export function MemberChip({ id }: { id: string }) {
  const m = useWorkspace((s) => s.members.find((x) => x.id === id));
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar initials={m.initials} size={24} />
      <span className="truncate">{m.name}</span>
    </span>
  );
}
