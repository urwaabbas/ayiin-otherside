/**
 * Ayiin Business — the procurement domain.
 *
 * The flow mirrors how companies actually buy:
 *   requisition ─(rule)→ approval ─→ purchase order ─(dispatch)→ invoice ─→ payment
 *   request for quote ─→ competing responses ─(award)→ purchase order
 * Every money figure is USD; display currency is applied at render.
 */

export type Role = "Admin" | "Approver" | "Buyer" | "Requester" | "Finance";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  /** Per-order limit in USD. `null` = unlimited, `0` = every order needs approval. */
  limit: number | null;
  costCenterId: string;
  initials: string;
  status: "active" | "invited";
};

export type CostCenter = {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  /** Quarterly budget, USD */
  budget: number;
};

export type Location = {
  id: string;
  label: string;
  line: string;
  city: string;
  contact: string;
  notes: string;
  isDefault: boolean;
};

export type RuleKind = "amount" | "category" | "costCenter";

export type ApprovalRule = {
  id: string;
  kind: RuleKind;
  /** amount: requests strictly above this USD total */
  threshold?: number;
  category?: string;
  costCenterId?: string;
  approverId: string;
  enabled: boolean;
};

export type Line = {
  productId: string;
  variantId: string;
  qty: number;
  /** Unit price agreed at the time the line was raised */
  unit: number;
};

export type Requisition = {
  id: string;
  title: string;
  requesterId: string;
  approverId: string;
  ruleId: string;
  lines: Line[];
  total: number;
  costCenterId: string;
  locationId: string;
  submittedAt: string;
  status: "pending" | "approved" | "returned";
  urgent?: boolean;
  note?: string;
  decidedAt?: string;
  poId?: string;
};

export type PoStatus = "confirmed" | "shipped" | "delivered";
export type PoSource = "checkout" | "approval" | "quote" | "reorder";

export type PurchaseOrder = {
  id: string;
  createdAt: string;
  buyerId: string;
  sellerIds: string[];
  lines: Line[];
  total: number;
  costCenterId: string;
  locationId: string;
  status: PoStatus;
  eta: string;
  source: PoSource;
  /** Buyer's own reference, e.g. an ERP PO number */
  reference?: string;
  invoiceId?: string;
};

export type InvoiceStatus = "open" | "scheduled" | "paid";

export type Invoice = {
  id: string;
  poId: string;
  sellerId: string;
  issued: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
  scheduledFor?: string;
  paidAt?: string;
  method?: "ACH" | "Card" | "Wire";
};

export type RfqResponse = {
  sellerId: string;
  unit: number;
  leadDays: number;
  note: string;
  /** Minutes after the request was sent that the supplier replied */
  repliedIn: number;
};

export type Rfq = {
  id: string;
  createdAt: string;
  productId: string;
  qty: number;
  target?: number;
  deliverBy: string;
  locationId: string;
  note: string;
  status: "open" | "awarded" | "closed";
  responses: RfqResponse[];
  awardedTo?: string;
  poId?: string;
};

export type SpendPoint = { month: string; byCategory: Record<string, number> };
