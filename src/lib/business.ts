/** Demo business account — Northwind Studio. */

export const company = {
  name: "Northwind Studio",
  legal: "Northwind Studio LLC",
  taxId: "EIN 84-2913377",
  taxExempt: true,
  exemptionCert: "CA resale certificate · valid to Mar 2027",
  terms: "Net 30",
  creditLimit: 60000,
  creditUsed: 11800,
  costCenters: ["HQ Operations", "Design", "Warehouse — Reno", "Events"],
};

export type Approval = {
  id: string;
  requester: string;
  role: string;
  title: string;
  items: number;
  total: number;
  costCenter: string;
  submitted: string;
  rule: string;
  urgency?: "high";
};

export const approvals: Approval[] = [
  { id: "PR-4471", requester: "Jamie Ortiz", role: "Operations", title: "Warehouse packaging — October", items: 3, total: 3184.2, costCenter: "Warehouse — Reno", submitted: "2h ago", rule: "Over $2,500 · Manager", urgency: "high" },
  { id: "PR-4468", requester: "Ana Lindqvist", role: "Design Lead", title: "2 × Kova Vista 27\" for new hires", items: 1, total: 858, costCenter: "Design", submitted: "5h ago", rule: "Electronics · IT review" },
  { id: "PR-4462", requester: "Marcus Bell", role: "Events", title: "Offsite merch — 120 bottles", items: 1, total: 3100.8, costCenter: "Events", submitted: "Yesterday", rule: "Over $2,500 · Manager" },
];

export const team = [
  { name: "Priya Raman", email: "priya@northwind.studio", role: "Admin", limit: "Unlimited", spend: 18420, initials: "PR" },
  { name: "Jamie Ortiz", email: "jamie@northwind.studio", role: "Buyer", limit: "$2,500 / order", spend: 9310, initials: "JO" },
  { name: "Ana Lindqvist", email: "ana@northwind.studio", role: "Requester", limit: "Needs approval", spend: 2240, initials: "AL" },
  { name: "Marcus Bell", email: "marcus@northwind.studio", role: "Requester", limit: "Needs approval", spend: 1180, initials: "MB" },
  { name: "Finance Team", email: "ap@northwind.studio", role: "Finance", limit: "Invoice access", spend: 0, initials: "FT" },
];

export const addresses = [
  { id: "hq", label: "HQ — San Francisco", line: "501 Folsom St, Floor 4, San Francisco, CA 94107", contact: "Front desk · 9am–5pm", default: true },
  { id: "reno", label: "Warehouse — Reno", line: "1200 Valley Rd, Dock 3, Reno, NV 89512", contact: "Receiving · dock appointments required" },
  { id: "ny", label: "Studio — Brooklyn", line: "55 Water St, Unit 2B, Brooklyn, NY 11201", contact: "Ana Lindqvist" },
];

export const invoices = [
  { id: "INV-20931", po: "PO-7781", date: "2026-09-18", due: "2026-10-18", amount: 4210.5, status: "open" as const },
  { id: "INV-20877", po: "PO-7744", date: "2026-09-04", due: "2026-10-04", amount: 1893.2, status: "open" as const },
  { id: "INV-20702", po: "PO-7690", date: "2026-08-21", due: "2026-09-20", amount: 5696.0, status: "paid" as const },
  { id: "INV-20541", po: "PO-7612", date: "2026-08-02", due: "2026-09-01", amount: 2310.75, status: "paid" as const },
];

export const spendByMonth = [
  { m: "Apr", v: 8200 },
  { m: "May", v: 9400 },
  { m: "Jun", v: 7800 },
  { m: "Jul", v: 11200 },
  { m: "Aug", v: 10100 },
  { m: "Sep", v: 12650 },
];

export const rfqResponses = [
  { seller: "guardline", price: 9.62, lead: 1, note: "Pallet pricing, split delivery OK", time: "38 min" },
  { seller: "brightline", price: 10.05, lead: 2, note: "Includes free dock delivery", time: "1h 52m" },
  { seller: "parcel", price: 9.4, lead: 4, note: "MOQ 20 cases", time: "3h 12m" },
];
