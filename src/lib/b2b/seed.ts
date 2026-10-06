import { productById, productBySlug } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import type {
  ApprovalRule,
  CostCenter,
  Invoice,
  Line,
  Location,
  Member,
  PurchaseOrder,
  Requisition,
  Rfq,
  SpendPoint,
} from "@/lib/b2b/types";

/**
 * Demo workspace — Northwind Studio, a 40-person design & fulfilment company
 * buying across four cost centres and three locations. Every total below is
 * computed from catalogue prices, so the console, cart and checkout agree.
 */

export const company = {
  name: "Northwind Studio",
  legal: "Northwind Studio LLC",
  initials: "NW",
  taxId: "EIN 84-2913377",
  taxExempt: true,
  exemptionCert: "CA resale certificate · valid to Mar 2027",
  terms: "Net 30",
  termsDays: 30,
  creditLimit: 60_000,
  plan: "Ayiin Business Plus",
};

/** The signed-in member. */
export const VIEWER_ID = "m-priya";

/** Policy constant: nobody approves their own request. Escalation goes here. */
export const ESCALATION_ID = "m-dana";

export const SEED_MEMBERS: Member[] = [
  { id: "m-priya", name: "Priya Raman", email: "priya@northwind.studio", role: "Admin", title: "Head of Operations", limit: null, costCenterId: "cc-hq", initials: "PR", status: "active" },
  { id: "m-dana", name: "Dana Ko", email: "dana@northwind.studio", role: "Approver", title: "Finance Controller", limit: null, costCenterId: "cc-hq", initials: "DK", status: "active" },
  { id: "m-theo", name: "Theo Park", email: "theo@northwind.studio", role: "Approver", title: "IT Manager", limit: 5000, costCenterId: "cc-hq", initials: "TP", status: "active" },
  { id: "m-jamie", name: "Jamie Ortiz", email: "jamie@northwind.studio", role: "Buyer", title: "Warehouse Lead", limit: 2500, costCenterId: "cc-warehouse", initials: "JO", status: "active" },
  { id: "m-ana", name: "Ana Lindqvist", email: "ana@northwind.studio", role: "Requester", title: "Design Lead", limit: 0, costCenterId: "cc-design", initials: "AL", status: "active" },
  { id: "m-marcus", name: "Marcus Bell", email: "marcus@northwind.studio", role: "Requester", title: "Events Manager", limit: 0, costCenterId: "cc-events", initials: "MB", status: "active" },
  { id: "m-ap", name: "Accounts Payable", email: "ap@northwind.studio", role: "Finance", title: "Finance team inbox", limit: 0, costCenterId: "cc-hq", initials: "AP", status: "active" },
];

export const SEED_COST_CENTERS: CostCenter[] = [
  { id: "cc-hq", name: "HQ Operations", code: "1000", ownerId: "m-priya", budget: 24_000 },
  { id: "cc-warehouse", name: "Warehouse — Reno", code: "3400", ownerId: "m-jamie", budget: 30_000 },
  { id: "cc-design", name: "Design", code: "2100", ownerId: "m-ana", budget: 9_000 },
  { id: "cc-events", name: "Events", code: "4200", ownerId: "m-priya", budget: 8_000 },
];

export const SEED_LOCATIONS: Location[] = [
  { id: "loc-hq", label: "HQ — San Francisco", line: "501 Folsom St, Floor 4", city: "San Francisco, CA 94107", contact: "Front desk", notes: "Deliveries 9am–5pm · lift to Floor 4", isDefault: true },
  { id: "loc-reno", label: "Warehouse — Reno", line: "1200 Valley Rd, Dock 3", city: "Reno, NV 89512", contact: "Jamie Ortiz", notes: "Dock appointments required · pallets OK", isDefault: false },
  { id: "loc-ny", label: "Studio — Brooklyn", line: "55 Water St, Unit 2B", city: "Brooklyn, NY 11201", contact: "Ana Lindqvist", notes: "Buzz 2B · no deliveries after 6pm", isDefault: false },
];

/** Evaluated top to bottom; the first enabled rule that matches decides the approver. */
export const SEED_RULES: ApprovalRule[] = [
  { id: "r-10k", kind: "amount", threshold: 10_000, approverId: "m-dana", enabled: true },
  { id: "r-tech", kind: "category", category: "audio-tech", approverId: "m-theo", enabled: true },
  { id: "r-events", kind: "costCenter", costCenterId: "cc-events", approverId: "m-priya", enabled: true },
  { id: "r-2500", kind: "amount", threshold: 2_500, approverId: "m-priya", enabled: true },
];

/* ─── Lines priced from the catalogue ─────────────────────────── */

export function line(slug: string, qty: number, variantId?: string): Line {
  const p = productBySlug(slug);
  if (!p) throw new Error(`Unknown product ${slug}`);
  return { productId: p.id, variantId: variantId ?? p.variants[0].id, qty, unit: unitPrice(p, qty, { contract: true }) };
}

export const linesTotal = (lines: Line[]) => Math.round(lines.reduce((s, l) => s + l.unit * l.qty, 0) * 100) / 100;

export const sellersOf = (lines: Line[]) => [...new Set(lines.map((l) => productById(l.productId)?.sellerId ?? "brightline"))];

function po(p: Omit<PurchaseOrder, "total" | "sellerIds">): PurchaseOrder {
  return { ...p, total: linesTotal(p.lines), sellerIds: sellersOf(p.lines) };
}

function req(r: Omit<Requisition, "total">): Requisition {
  return { ...r, total: linesTotal(r.lines) };
}

/* ─── Purchase orders ─────────────────────────────────────────── */

export const SEED_POS: PurchaseOrder[] = [
  po({ id: "PO-7809", createdAt: "2026-10-05T16:40:00.000Z", buyerId: "m-priya", lines: [line("ergo-task-chair-pro", 4), line("kova-vista-27-4k", 2)], costCenterId: "cc-hq", locationId: "loc-hq", status: "confirmed", eta: "2026-10-12", source: "checkout", reference: "NW-ERP-55120" }),
  po({ id: "PO-7802", createdAt: "2026-10-01T09:15:00.000Z", buyerId: "m-jamie", lines: [line("kraft-mailer-boxes", 40), line("nitrile-gloves-4mil", 50)], costCenterId: "cc-warehouse", locationId: "loc-reno", status: "shipped", eta: "2026-10-08", source: "reorder", invoiceId: "INV-21004" }),
  po({ id: "PO-7781", createdAt: "2026-09-18T11:05:00.000Z", buyerId: "m-ana", lines: [line("kova-book-14-air", 2), line("kova-keys-low-profile", 2)], costCenterId: "cc-design", locationId: "loc-ny", status: "delivered", eta: "2026-09-23", source: "approval", invoiceId: "INV-20931" }),
  po({ id: "PO-7766", createdAt: "2026-09-24T10:30:00.000Z", buyerId: "m-priya", lines: [line("vented-safety-helmet", 30), line("eco-surface-cleaner", 36), line("premium-copy-paper-a4", 20)], costCenterId: "cc-hq", locationId: "loc-hq", status: "delivered", eta: "2026-09-28", source: "reorder", invoiceId: "INV-20915" }),
  po({ id: "PO-7752", createdAt: "2026-09-10T08:50:00.000Z", buyerId: "m-jamie", lines: [line("double-wall-cartons-12x10x8", 80), line("kraft-mailer-boxes", 30), line("nitrile-gloves-4mil", 60)], costCenterId: "cc-warehouse", locationId: "loc-reno", status: "delivered", eta: "2026-09-11", source: "reorder", invoiceId: "INV-20889" }),
  po({ id: "PO-7744", createdAt: "2026-09-04T14:30:00.000Z", buyerId: "m-priya", lines: [line("premium-copy-paper-a4", 40), line("eco-surface-cleaner", 24), line("guji-single-origin-1kg", 12)], costCenterId: "cc-hq", locationId: "loc-hq", status: "delivered", eta: "2026-09-07", source: "reorder", invoiceId: "INV-20877" }),
  po({ id: "PO-7690", createdAt: "2026-08-21T10:00:00.000Z", buyerId: "m-jamie", lines: [line("double-wall-cartons-12x10x8", 60), line("nitrile-gloves-4mil", 200)], costCenterId: "cc-warehouse", locationId: "loc-reno", status: "delivered", eta: "2026-08-24", source: "quote", invoiceId: "INV-20702" }),
  po({ id: "PO-7668", createdAt: "2026-08-15T09:10:00.000Z", buyerId: "m-jamie", lines: [line("double-wall-cartons-12x10x8", 50), line("kraft-mailer-boxes", 40)], costCenterId: "cc-warehouse", locationId: "loc-reno", status: "delivered", eta: "2026-08-18", source: "reorder", invoiceId: "INV-20644" }),
  po({ id: "PO-7655", createdAt: "2026-08-12T13:20:00.000Z", buyerId: "m-priya", lines: [line("premium-copy-paper-a4", 30), line("guji-single-origin-1kg", 10)], costCenterId: "cc-hq", locationId: "loc-hq", status: "delivered", eta: "2026-08-14", source: "reorder", invoiceId: "INV-20620" }),
  po({ id: "PO-7612", createdAt: "2026-08-02T09:45:00.000Z", buyerId: "m-marcus", lines: [line("trail-bottle-750", 80)], costCenterId: "cc-events", locationId: "loc-hq", status: "delivered", eta: "2026-08-06", source: "approval", invoiceId: "INV-20541" }),
];

const poTotal = (id: string) => SEED_POS.find((p) => p.id === id)!.total;
const poSeller = (id: string) => SEED_POS.find((p) => p.id === id)!.sellerIds[0];

/* ─── Invoices ────────────────────────────────────────────────── */

export const SEED_INVOICES: Invoice[] = [
  { id: "INV-21004", poId: "PO-7802", sellerId: poSeller("PO-7802"), issued: "2026-10-02", due: "2026-11-01", amount: poTotal("PO-7802"), status: "open" },
  { id: "INV-20931", poId: "PO-7781", sellerId: poSeller("PO-7781"), issued: "2026-09-18", due: "2026-10-18", amount: poTotal("PO-7781"), status: "open" },
  { id: "INV-20915", poId: "PO-7766", sellerId: poSeller("PO-7766"), issued: "2026-09-28", due: "2026-10-28", amount: poTotal("PO-7766"), status: "paid", paidAt: "2026-10-02", method: "ACH" },
  { id: "INV-20889", poId: "PO-7752", sellerId: poSeller("PO-7752"), issued: "2026-09-11", due: "2026-10-11", amount: poTotal("PO-7752"), status: "paid", paidAt: "2026-09-30", method: "ACH" },
  { id: "INV-20877", poId: "PO-7744", sellerId: poSeller("PO-7744"), issued: "2026-09-09", due: "2026-10-09", amount: poTotal("PO-7744"), status: "open" },
  { id: "INV-20702", poId: "PO-7690", sellerId: poSeller("PO-7690"), issued: "2026-08-24", due: "2026-09-23", amount: poTotal("PO-7690"), status: "paid", paidAt: "2026-09-21", method: "ACH" },
  { id: "INV-20644", poId: "PO-7668", sellerId: poSeller("PO-7668"), issued: "2026-08-18", due: "2026-09-17", amount: poTotal("PO-7668"), status: "paid", paidAt: "2026-09-15", method: "ACH" },
  { id: "INV-20620", poId: "PO-7655", sellerId: poSeller("PO-7655"), issued: "2026-08-14", due: "2026-09-13", amount: poTotal("PO-7655"), status: "paid", paidAt: "2026-09-10", method: "ACH" },
  { id: "INV-20541", poId: "PO-7612", sellerId: poSeller("PO-7612"), issued: "2026-08-06", due: "2026-09-05", amount: poTotal("PO-7612"), status: "paid", paidAt: "2026-09-02", method: "Card" },
];

/* ─── Requisitions ────────────────────────────────────────────── */

export const SEED_REQUISITIONS: Requisition[] = [
  req({ id: "PR-4471", title: "Warehouse packaging — October", requesterId: "m-jamie", approverId: "m-priya", ruleId: "r-2500", lines: [line("double-wall-cartons-12x10x8", 40), line("kraft-mailer-boxes", 30), line("nitrile-gloves-4mil", 30)], costCenterId: "cc-warehouse", locationId: "loc-reno", submittedAt: "2026-10-06T14:10:00.000Z", status: "pending", urgent: true, note: "Peak season starts the 14th — need these on the dock by Friday." }),
  req({ id: "PR-4466", title: "Offsite merch — 120 bottles", requesterId: "m-marcus", approverId: "m-priya", ruleId: "r-events", lines: [line("trail-bottle-750", 120)], costCenterId: "cc-events", locationId: "loc-hq", submittedAt: "2026-10-05T16:45:00.000Z", status: "pending", note: "Client offsite on Oct 22. Chalk colourway to match the deck." }),
  req({ id: "PR-4462", title: "Task chairs for the design pod", requesterId: "m-ana", approverId: "m-priya", ruleId: "limit", lines: [line("ergo-task-chair-pro", 3)], costCenterId: "cc-design", locationId: "loc-ny", submittedAt: "2026-10-05T10:20:00.000Z", status: "pending" }),
  req({ id: "PR-4468", title: "2 × Kova Vista 27\" for new hires", requesterId: "m-ana", approverId: "m-theo", ruleId: "r-tech", lines: [line("kova-vista-27-4k", 2)], costCenterId: "cc-design", locationId: "loc-ny", submittedAt: "2026-10-05T13:05:00.000Z", status: "pending" }),
  req({ id: "PR-4440", title: "Laptops for design contractors", requesterId: "m-ana", approverId: "m-theo", ruleId: "r-tech", lines: [line("kova-book-14-air", 2), line("kova-keys-low-profile", 2)], costCenterId: "cc-design", locationId: "loc-ny", submittedAt: "2026-09-17T15:00:00.000Z", status: "approved", decidedAt: "2026-09-18T10:55:00.000Z", poId: "PO-7781" }),
];

/* ─── Requests for quote ──────────────────────────────────────── */

export const SEED_RFQS: Rfq[] = [
  {
    id: "RFQ-20418",
    createdAt: "2026-10-06T09:00:00.000Z",
    productId: productBySlug("nitrile-gloves-4mil")!.id,
    qty: 200,
    target: 9.75,
    deliverBy: "2026-10-12",
    locationId: "loc-reno",
    note: "Sizes M and L, split 50/50. Powder-free only.",
    status: "open",
    responses: [
      { sellerId: "guardline", unit: 9.62, leadDays: 1, note: "Pallet pricing, split delivery OK", repliedIn: 38 },
      { sellerId: "brightline", unit: 10.05, leadDays: 2, note: "Free dock delivery included", repliedIn: 112 },
      { sellerId: "parcel", unit: 9.4, leadDays: 4, note: "MOQ 20 cases, ships from Sparks NV", repliedIn: 192 },
    ],
  },
  {
    id: "RFQ-20377",
    createdAt: "2026-08-18T09:00:00.000Z",
    productId: productBySlug("double-wall-cartons-12x10x8")!.id,
    qty: 60,
    deliverBy: "2026-08-26",
    locationId: "loc-reno",
    note: "",
    status: "awarded",
    awardedTo: "parcel",
    poId: "PO-7690",
    responses: [
      { sellerId: "parcel", unit: 42.1, leadDays: 1, note: "Same-day dispatch", repliedIn: 24 },
      { sellerId: "brightline", unit: 45.6, leadDays: 2, note: "", repliedIn: 95 },
    ],
  },
];

/* ─── Closed spend before the order history above (USD) ───────── */
/* From August on, spend is computed from the purchase orders themselves. */

export const SPEND_HISTORY: SpendPoint[] = [
  { month: "2026-04", byCategory: { supplies: 3100, safety: 1450, office: 2350, "audio-tech": 900, kitchen: 400 } },
  { month: "2026-05", byCategory: { supplies: 3520, safety: 1610, office: 1980, "audio-tech": 1840, kitchen: 450 } },
  { month: "2026-06", byCategory: { supplies: 2980, safety: 1390, office: 2210, "audio-tech": 760, kitchen: 460 } },
  { month: "2026-07", byCategory: { supplies: 4250, safety: 2010, office: 2440, "audio-tech": 2050, kitchen: 450 } },
];
