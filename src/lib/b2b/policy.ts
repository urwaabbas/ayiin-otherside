import { productById } from "@/lib/catalog/products";
import { categories } from "@/lib/catalog/categories";
import { addBusinessDays, todayUTC } from "@/lib/format";
import { ESCALATION_ID, SPEND_HISTORY, VIEWER_ID, company } from "@/lib/b2b/seed";
import type {
  ApprovalRule,
  CostCenter,
  Invoice,
  Line,
  Member,
  PurchaseOrder,
  Requisition,
  Rfq,
} from "@/lib/b2b/types";

/* ─── Approval policy ────────────────────────────────────────── */

export type Decision =
  | { kind: "auto"; reason: string }
  | { kind: "approval"; approverId: string; ruleId: string; reason: string; escalated: boolean };

type PolicyInput = {
  requester: Member;
  total: number;
  lines: Line[];
  costCenterId: string;
  rules: ApprovalRule[];
  costCenters: CostCenter[];
};

export function ruleMatches(rule: ApprovalRule, i: Pick<PolicyInput, "total" | "lines" | "costCenterId">) {
  if (!rule.enabled) return false;
  if (rule.kind === "amount") return i.total > (rule.threshold ?? Infinity);
  if (rule.kind === "category") return i.lines.some((l) => productById(l.productId)?.category === rule.category);
  return i.costCenterId === rule.costCenterId;
}

/**
 * Decides whether a purchase can go straight to a PO or needs a second pair of eyes.
 * 1. The first enabled rule that matches picks the approver.
 * 2. With no matching rule, a requester within their own limit buys directly;
 *    over it, the cost centre owner approves.
 * 3. Nobody approves their own request — it escalates to the finance controller.
 */
export function decide(i: PolicyInput): Decision {
  const rule = i.rules.find((r) => ruleMatches(r, i));
  let approverId: string | undefined;
  let ruleId = "limit";
  let reason: string;

  if (rule) {
    approverId = rule.approverId;
    ruleId = rule.id;
    reason = ruleLabel(rule, i.costCenters);
  } else {
    const limit = i.requester.limit;
    if (limit === null || i.total <= limit) {
      return { kind: "auto", reason: limit === null ? "No spending limit" : "Within the requester's own limit" };
    }
    approverId = i.costCenters.find((c) => c.id === i.costCenterId)?.ownerId ?? ESCALATION_ID;
    reason = limit === 0 ? "Requester role needs approval" : "Over the requester's limit";
  }

  let escalated = false;
  if (approverId === i.requester.id) {
    approverId = i.requester.id === ESCALATION_ID ? VIEWER_ID : ESCALATION_ID;
    escalated = true;
  }
  return { kind: "approval", approverId, ruleId, reason, escalated };
}

export function ruleLabel(rule: ApprovalRule, costCenters: CostCenter[]) {
  if (rule.kind === "amount") return `Orders over ${usd(rule.threshold ?? 0)}`;
  if (rule.kind === "category") return `Any ${categories.find((c) => c.slug === rule.category)?.name ?? rule.category} purchase`;
  return `Anything charged to ${costCenters.find((c) => c.id === rule.costCenterId)?.name ?? "this cost centre"}`;
}

export function reasonFor(ruleId: string, rules: ApprovalRule[], costCenters: CostCenter[]) {
  const rule = rules.find((r) => r.id === ruleId);
  return rule ? ruleLabel(rule, costCenters) : "Over the requester's limit";
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/* ─── Dates ─────────────────────────────────────────────────── */

const DAY = 86_400_000;

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Whole days from today (UTC) to an ISO date; negative when past. */
export function daysFromToday(iso: string, today = todayUTC()) {
  return Math.round((Date.parse(iso.slice(0, 10)) - today.getTime()) / DAY);
}

export function etaFor(lines: Line[], from = todayUTC()) {
  const lead = Math.max(1, ...lines.map((l) => productById(l.productId)?.b2b.leadDays ?? 3));
  return isoDay(addBusinessDays(from, lead));
}

export function quarterStart(today = todayUTC()) {
  const q = Math.floor(today.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(today.getUTCFullYear(), q, 1));
}

export function quarterLabel(today = todayUTC()) {
  return `Q${Math.floor(today.getUTCMonth() / 3) + 1} ${today.getUTCFullYear()}`;
}

/** Fraction of the current quarter elapsed, for budget pacing. */
export function quarterProgress(today = todayUTC()) {
  const start = quarterStart(today).getTime();
  const end = Date.UTC(today.getUTCFullYear(), Math.floor(today.getUTCMonth() / 3) * 3 + 3, 1);
  return Math.min(1, Math.max(0, (today.getTime() + DAY - start) / (end - start)));
}

/**
 * Straight-line forecast for the quarter. Early on a single order would project
 * wildly, so the elapsed share is floored at a third of the quarter.
 */
export function forecastQuarter(spent: number, today = todayUTC()) {
  return Math.round(spent / Math.max(quarterProgress(today), 1 / 3));
}

export type Pacing = "over" | "track" | "under";

export function pacing(spent: number, budget: number, today = todayUTC()): Pacing {
  const f = forecastQuarter(spent, today);
  if (spent > budget || f > budget * 1.05) return "over";
  if (quarterProgress(today) > 0.5 && f < budget * 0.6) return "under";
  return "track";
}

/** "Today" · "Yesterday" · "Oct 3" — day-level, so server and client agree. */
export function dayAgo(iso: string, today = todayUTC()) {
  const diff = -daysFromToday(iso, today);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

/* ─── Derived figures ───────────────────────────────────────── */

type Books = { pos: PurchaseOrder[]; invoices: Invoice[] };

/** Credit in use = open and scheduled invoices + orders not invoiced yet. */
export function creditUsed({ pos, invoices }: Books) {
  const billed = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const unbilled = pos.filter((p) => !p.invoiceId).reduce((s, p) => s + p.total, 0);
  return Math.round(billed + unbilled);
}

export function creditAvailable(b: Books) {
  return Math.max(0, company.creditLimit - creditUsed(b));
}

export function quarterSpend(pos: PurchaseOrder[], costCenterId?: string, today = todayUTC()) {
  const start = quarterStart(today).getTime();
  const total = pos
    .filter((p) => Date.parse(p.createdAt) >= start && (!costCenterId || p.costCenterId === costCenterId))
    .reduce((s, p) => s + p.total, 0);
  return Math.round(total);
}

/** List-price value of a PO's lines, for savings reporting. */
export function listValue(lines: Line[]) {
  return lines.reduce((s, l) => s + (productById(l.productId)?.price ?? l.unit) * l.qty, 0);
}

export function savings(pos: PurchaseOrder[]) {
  return Math.round(pos.reduce((s, p) => s + Math.max(0, listValue(p.lines) - p.total), 0));
}

const monthKey = (iso: string) => iso.slice(0, 7);

/** Monthly spend by department: static history, then live purchase orders. */
export function monthlySpend(pos: PurchaseOrder[], today = todayUTC()) {
  const months = new Map<string, Record<string, number>>();
  for (const h of SPEND_HISTORY) months.set(h.month, { ...h.byCategory });
  const first = Date.UTC(2026, 7, 1);
  for (let t = first; t <= today.getTime(); ) {
    const d = new Date(t);
    months.set(monthKey(d.toISOString()), months.get(monthKey(d.toISOString())) ?? {});
    t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  for (const p of pos) {
    const key = monthKey(p.createdAt);
    if (Date.parse(p.createdAt) < first) continue;
    const bucket = months.get(key) ?? {};
    for (const l of p.lines) {
      const cat = productById(l.productId)?.category ?? "office";
      bucket[cat] = (bucket[cat] ?? 0) + l.unit * l.qty;
    }
    months.set(key, bucket);
  }
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([month, byCategory]) => ({
      month,
      label: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`)),
      byCategory,
      total: Math.round(Object.values(byCategory).reduce((a, b) => a + b, 0)),
    }));
}

export function spendBySupplier(pos: PurchaseOrder[]) {
  const m = new Map<string, number>();
  for (const p of pos) for (const l of p.lines) {
    const s = productById(l.productId)?.sellerId ?? "brightline";
    m.set(s, (m.get(s) ?? 0) + l.unit * l.qty);
  }
  return [...m.entries()].map(([k, v]) => [k, Math.round(v)] as [string, number]).sort((a, b) => b[1] - a[1]);
}

/* ─── Queues ────────────────────────────────────────────────── */

export const waitingOn = (reqs: Requisition[], memberId = VIEWER_ID) =>
  reqs.filter((r) => r.status === "pending" && r.approverId === memberId);

export const inFlight = (pos: PurchaseOrder[]) =>
  pos.filter((p) => p.status !== "delivered").sort((a, b) => a.eta.localeCompare(b.eta));

export const unpaid = (invoices: Invoice[]) =>
  invoices.filter((i) => i.status !== "paid").sort((a, b) => a.due.localeCompare(b.due));

/** Simulated supplier latency: a reply sent N minutes after the request becomes visible after N/2 seconds. */
export const REPLY_SECONDS_PER_MINUTE = 0.5;

export function visibleResponses(rfq: Rfq, now: number) {
  const elapsed = (now - Date.parse(rfq.createdAt)) / 1000;
  return rfq.responses
    .filter((r) => elapsed >= r.repliedIn * REPLY_SECONDS_PER_MINUTE)
    .sort((a, b) => a.unit * rfq.qty - b.unit * rfq.qty);
}

/** Score = price first, then reliability and lead time. Recommends one response. */
export function recommended(rfq: Rfq, responses: Rfq["responses"], deliverByOk: (r: Rfq["responses"][number]) => boolean) {
  const ok = responses.filter(deliverByOk);
  return (ok.length ? ok : responses).slice().sort((a, b) => a.unit - b.unit || a.leadDays - b.leadDays)[0];
}
