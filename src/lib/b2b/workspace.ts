"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { productById } from "@/lib/catalog/products";
import { offersFor } from "@/lib/catalog/offers";
import { sellers } from "@/lib/catalog/sellers";
import { unitPrice } from "@/lib/commerce";
import { addBusinessDays, todayUTC } from "@/lib/format";
import { decide, etaFor, isoDay } from "@/lib/b2b/policy";
import {
  SEED_COST_CENTERS,
  SEED_INVOICES,
  SEED_LOCATIONS,
  SEED_MEMBERS,
  SEED_POS,
  SEED_REQUISITIONS,
  SEED_RFQS,
  SEED_RULES,
  VIEWER_ID,
  company,
  linesTotal,
  sellersOf,
} from "@/lib/b2b/seed";
import type {
  ApprovalRule,
  CostCenter,
  Invoice,
  Line,
  Location,
  Member,
  PoSource,
  PurchaseOrder,
  Requisition,
  Rfq,
  RfqResponse,
  Role,
} from "@/lib/b2b/types";

type Submit = {
  title: string;
  lines: Line[];
  costCenterId: string;
  locationId: string;
  requesterId?: string;
  reference?: string;
  note?: string;
  source?: PoSource;
};

export type SubmitResult =
  | { kind: "po"; id: string; reason: string }
  | { kind: "requisition"; id: string; approverId: string; reason: string; escalated: boolean };

type WorkspaceState = {
  members: Member[];
  costCenters: CostCenter[];
  locations: Location[];
  rules: ApprovalRule[];
  requisitions: Requisition[];
  pos: PurchaseOrder[];
  invoices: Invoice[];
  rfqs: Rfq[];
  seq: { po: number; pr: number; rfq: number };

  submit: (s: Submit) => SubmitResult;
  approve: (id: string, note?: string) => string | null;
  returnRequest: (id: string, note: string) => void;

  createRfq: (r: { productId: string; qty: number; target?: number; deliverBy: string; locationId: string; note: string }) => string;
  award: (rfqId: string, sellerId: string, costCenterId: string) => string | null;
  closeRfq: (rfqId: string) => void;

  pay: (invoiceId: string, method: Invoice["method"]) => void;
  schedule: (invoiceId: string, date: string) => void;
  cancelSchedule: (invoiceId: string) => void;

  invite: (m: { email: string; role: Role; costCenterId: string }) => string;
  updateMember: (id: string, patch: Partial<Pick<Member, "role" | "limit" | "costCenterId">>) => void;
  removeMember: (id: string) => void;

  setBudget: (id: string, budget: number) => void;

  addLocation: (l: Omit<Location, "id" | "isDefault">) => string;
  setDefaultLocation: (id: string) => void;
  removeLocation: (id: string) => void;

  toggleRule: (id: string) => void;
  updateRule: (id: string, patch: Partial<Pick<ApprovalRule, "threshold" | "approverId">>) => void;

  reset: () => void;
};

const seed = () => ({
  members: SEED_MEMBERS,
  costCenters: SEED_COST_CENTERS,
  locations: SEED_LOCATIONS,
  rules: SEED_RULES,
  requisitions: SEED_REQUISITIONS,
  pos: SEED_POS,
  invoices: SEED_INVOICES,
  rfqs: SEED_RFQS,
  seq: { po: 7813, pr: 4472, rfq: 20419 },
});

const nowIso = () => new Date().toISOString();

/** Small deterministic hash so generated supplier replies are stable per request. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

const NOTES = [
  "Split delivery OK",
  "Free dock delivery included",
  "Price held for 14 days",
  "Ships from a regional warehouse",
  "Includes liftgate delivery",
  "Can match the target on 2 more cases",
];

/** Builds supplier replies for a new request from real offers plus qualified sellers in the category. */
function responsesFor(id: string, productId: string, qty: number, target?: number): RfqResponse[] {
  const p = productById(productId);
  if (!p) return [];
  const base = unitPrice(p, qty, { contract: true });
  const offerSellers = offersFor(p).map((o) => ({ sellerId: o.sellerId, factor: o.factor, lead: o.leadDays }));
  const extra = sellers
    .filter((s) => s.business && !offerSellers.some((o) => o.sellerId === s.id) && s.id !== "kindred" && s.id !== "solace")
    .slice(0, Math.max(0, 3 - offerSellers.length))
    .map((s, i) => ({ sellerId: s.id, factor: 1.02 + i * 0.03, lead: p.b2b.leadDays + 2 + i }));
  return [...offerSellers, ...extra].slice(0, 4).map((o, i) => {
    const r = hash(`${id}:${o.sellerId}`);
    // Competing suppliers sharpen toward the target when one is given.
    const pull = target ? Math.min(1, Math.max(0, (base - target) / base)) * 0.6 : 0;
    const unit = Math.round(base * o.factor * (0.94 + r * 0.08) * (1 - pull * r) * 100) / 100;
    return {
      sellerId: o.sellerId,
      unit,
      leadDays: Math.max(1, o.lead),
      note: NOTES[Math.floor(r * NOTES.length)],
      repliedIn: Math.round(12 + i * 26 + r * 30),
    };
  });
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => {
      const createPo = (p: Omit<PurchaseOrder, "id" | "createdAt" | "total" | "sellerIds" | "status" | "eta"> & { id?: string }) => {
        const s = get();
        const id = p.id && !s.pos.some((x) => x.id === p.id) ? p.id : `PO-${s.seq.po}`;
        const order: PurchaseOrder = {
          ...p,
          id,
          createdAt: nowIso(),
          total: linesTotal(p.lines),
          sellerIds: sellersOf(p.lines),
          status: "confirmed",
          eta: etaFor(p.lines),
        };
        set((st) => ({ pos: [order, ...st.pos], seq: { ...st.seq, po: st.seq.po + 1 } }));
        return id;
      };

      return {
        ...seed(),

        submit: (s) => {
          const st = get();
          const requester = st.members.find((m) => m.id === (s.requesterId ?? VIEWER_ID))!;
          const total = linesTotal(s.lines);
          const d = decide({ requester, total, lines: s.lines, costCenterId: s.costCenterId, rules: st.rules, costCenters: st.costCenters });
          if (d.kind === "auto") {
            const id = createPo({ buyerId: requester.id, lines: s.lines, costCenterId: s.costCenterId, locationId: s.locationId, source: s.source ?? "checkout", reference: s.reference });
            return { kind: "po", id, reason: d.reason };
          }
          const id = `PR-${st.seq.pr}`;
          const r: Requisition = {
            id,
            title: s.title,
            requesterId: requester.id,
            approverId: d.approverId,
            ruleId: d.ruleId,
            lines: s.lines,
            total,
            costCenterId: s.costCenterId,
            locationId: s.locationId,
            submittedAt: nowIso(),
            status: "pending",
            note: s.note,
          };
          set((x) => ({ requisitions: [r, ...x.requisitions], seq: { ...x.seq, pr: x.seq.pr + 1 } }));
          return { kind: "requisition", id, approverId: d.approverId, reason: d.reason, escalated: d.escalated };
        },

        approve: (id, note) => {
          const r = get().requisitions.find((x) => x.id === id);
          if (!r || r.status !== "pending") return null;
          const poId = createPo({ buyerId: r.requesterId, lines: r.lines, costCenterId: r.costCenterId, locationId: r.locationId, source: "approval" });
          set((st) => ({
            requisitions: st.requisitions.map((x) => (x.id === id ? { ...x, status: "approved", decidedAt: nowIso(), poId, note: note || x.note } : x)),
          }));
          return poId;
        },

        returnRequest: (id, note) =>
          set((st) => ({
            requisitions: st.requisitions.map((x) => (x.id === id ? { ...x, status: "returned", decidedAt: nowIso(), note } : x)),
          })),

        createRfq: (r) => {
          const id = `RFQ-${get().seq.rfq}`;
          const rfq: Rfq = { ...r, id, createdAt: nowIso(), status: "open", responses: responsesFor(id, r.productId, r.qty, r.target) };
          set((st) => ({ rfqs: [rfq, ...st.rfqs], seq: { ...st.seq, rfq: st.seq.rfq + 1 } }));
          return id;
        },

        award: (rfqId, sellerId, costCenterId) => {
          const rfq = get().rfqs.find((r) => r.id === rfqId);
          const resp = rfq?.responses.find((x) => x.sellerId === sellerId);
          const p = rfq && productById(rfq.productId);
          if (!rfq || !resp || !p || rfq.status !== "open") return null;
          const poId = createPo({
            buyerId: VIEWER_ID,
            lines: [{ productId: p.id, variantId: p.variants[0].id, qty: rfq.qty, unit: resp.unit }],
            costCenterId,
            locationId: rfq.locationId,
            source: "quote",
            reference: rfq.id,
          });
          set((st) => ({
            rfqs: st.rfqs.map((x) => (x.id === rfqId ? { ...x, status: "awarded", awardedTo: sellerId, poId } : x)),
            pos: st.pos.map((x) => (x.id === poId ? { ...x, sellerIds: [sellerId], eta: isoDay(addBusinessDays(todayUTC(), resp.leadDays)) } : x)),
          }));
          return poId;
        },

        closeRfq: (rfqId) => set((st) => ({ rfqs: st.rfqs.map((x) => (x.id === rfqId ? { ...x, status: "closed" } : x)) })),

        pay: (invoiceId, method) =>
          set((st) => ({
            invoices: st.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "paid", paidAt: isoDay(todayUTC()), method, scheduledFor: undefined } : i)),
          })),

        schedule: (invoiceId, date) =>
          set((st) => ({ invoices: st.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "scheduled", scheduledFor: date, method: "ACH" } : i)) })),

        cancelSchedule: (invoiceId) =>
          set((st) => ({ invoices: st.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "open", scheduledFor: undefined } : i)) })),

        invite: ({ email, role, costCenterId }) => {
          const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
          const name = local.replace(/\b\w/g, (c) => c.toUpperCase()) || email;
          const id = `m-${Date.now().toString(36)}`;
          const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const limit = role === "Admin" || role === "Approver" ? null : role === "Buyer" ? 2500 : 0;
          set((st) => ({ members: [...st.members, { id, name, email, role, title: "Invited", limit, costCenterId, initials, status: "invited" }] }));
          return id;
        },

        updateMember: (id, patch) => set((st) => ({ members: st.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

        removeMember: (id) => set((st) => ({ members: st.members.filter((m) => m.id !== id || m.id === VIEWER_ID) })),

        setBudget: (id, budget) => set((st) => ({ costCenters: st.costCenters.map((c) => (c.id === id ? { ...c, budget: Math.max(0, budget) } : c)) })),

        addLocation: (l) => {
          const id = `loc-${Date.now().toString(36)}`;
          set((st) => ({ locations: [...st.locations, { ...l, id, isDefault: false }] }));
          return id;
        },

        setDefaultLocation: (id) => set((st) => ({ locations: st.locations.map((l) => ({ ...l, isDefault: l.id === id })) })),

        removeLocation: (id) =>
          set((st) => (st.locations.find((l) => l.id === id)?.isDefault ? st : { locations: st.locations.filter((l) => l.id !== id) })),

        toggleRule: (id) => set((st) => ({ rules: st.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),

        updateRule: (id, patch) => set((st) => ({ rules: st.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

        reset: () => set(seed()),
      };
    },
    {
      name: "ayiin-workspace",
      version: 3,
      // Older demo data is replaced wholesale rather than patched.
      migrate: () => seed() as unknown as WorkspaceState,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        members: s.members,
        costCenters: s.costCenters,
        locations: s.locations,
        rules: s.rules,
        requisitions: s.requisitions,
        pos: s.pos,
        invoices: s.invoices,
        rfqs: s.rfqs,
        seq: s.seq,
      }),
    },
  ),
);

/**
 * Subscribes to "saved data has loaded". A component can render before storage is
 * read but subscribe after it finished — so every subscription also schedules one
 * immediate re-check, and a late subscriber always catches up.
 */
function subscribeReady(onChange: () => void) {
  const offFinish = useWorkspace.persist.onFinishHydration(onChange);
  const recheck = setTimeout(onChange, 0);
  return () => {
    offFinish();
    clearTimeout(recheck);
  };
}

/** True once saved workspace data has loaded — gate live figures on it so seed values never flash. */
export function useWorkspaceReady() {
  return useSyncExternalStore(subscribeReady, () => useWorkspace.persist.hasHydrated(), () => false);
}

/* ─── Lookups ─── */

export const useMember = (id: string | undefined) => useWorkspace((s) => s.members.find((m) => m.id === id));
export const memberName = (members: Member[], id: string) => members.find((m) => m.id === id)?.name ?? "Unknown";
export const ccName = (ccs: CostCenter[], id: string) => ccs.find((c) => c.id === id)?.name ?? "—";
export const locLabel = (locs: Location[], id: string) => locs.find((l) => l.id === id)?.label ?? "—";

export { company, VIEWER_ID };
export { ESCALATION_ID } from "@/lib/b2b/seed";
