"use client";

import { clsx } from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { productById } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import { fmtShort } from "@/lib/format";
import type { PoStatus } from "@/lib/b2b/types";
import { ccName, memberName, useWorkspace } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { Badge, Empty, PageHead, Panel, Segmented, downloadCsv, td, th } from "@/components/business/console/ui";
import { PO_STATUS, PoDrawer, SOURCE_LABEL, etaText } from "@/components/business/console/records";

type Filter = "all" | PoStatus;

export function OrdersView() {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const poId = sp.get("po");
  const setPo = (id: string | null) => router.replace(`${pathname}?tab=orders${id ? `&po=${id}` : ""}`, { scroll: false });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ws.pos
      .filter((p) => filter === "all" || p.status === filter)
      .filter((p) => {
        if (!needle) return true;
        const hay = [p.id, p.reference ?? "", ccName(ws.costCenters, p.costCenterId), memberName(ws.members, p.buyerId), ...p.lines.map((l) => productById(l.productId)?.name ?? "")]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [ws.pos, ws.costCenters, ws.members, filter, q]);

  const count = (s: PoStatus) => ws.pos.filter((p) => p.status === s).length;

  const exportCsv = () =>
    downloadCsv(`northwind-orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["PO", "Date", "Status", "Buyer", "Cost centre", "Supplier", "SKU", "Item", "Qty", "Unit", "Line total", "Reference"],
      ...rows.flatMap((p) =>
        p.lines.map((l) => {
          const pr = productById(l.productId);
          return [p.id, p.createdAt.slice(0, 10), PO_STATUS[p.status].label, memberName(ws.members, p.buyerId), ccName(ws.costCenters, p.costCenterId), sellerById(pr?.sellerId ?? "")?.name ?? "", pr?.b2b.sku ?? "", pr?.name ?? "", l.qty, l.unit.toFixed(2), (l.unit * l.qty).toFixed(2), p.reference ?? ""];
        }),
      ),
    ]);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Track"
        title="Orders"
        description="Every purchase order across the company — from checkout, approvals, quotes and scheduled reorders — with live delivery status."
        actions={
          <button type="button" onClick={exportCsv} className="btn btn-secondary">
            <Icon name="upload" size={16} className="rotate-180" /> Export CSV
          </button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Filter orders"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: ws.pos.length },
            { value: "confirmed", label: "Confirmed", count: count("confirmed") },
            { value: "shipped", label: "In transit", count: count("shipped") },
            { value: "delivered", label: "Delivered", count: count("delivered") },
          ]}
        />
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search orders</span>
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="PO, item, buyer or reference" className="field !h-10 !pl-10 !text-support" />
        </label>
      </div>

      <Panel flush>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-support">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Items</th>
                  <th className={th}>Cost centre</th>
                  <th className={th}>Status</th>
                  <th className={clsx(th, "text-right")}>Total</th>
                  <th className={th}>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const first = productById(p.lines[0].productId);
                  return (
                    <tr key={p.id} onClick={() => setPo(p.id)} className="cursor-pointer border-t border-line transition-colors first:border-t-0 hover:bg-porcelain">
                      <td className={td}>
                        <button type="button" onClick={() => setPo(p.id)} className="num text-left font-medium hover:underline">
                          {p.id}
                        </button>
                        <p className="text-meta text-mute">
                          {fmtShort(new Date(p.createdAt))} · {SOURCE_LABEL[p.source]}
                        </p>
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {p.lines.slice(0, 3).map((l) => {
                              const pr = productById(l.productId);
                              return pr ? <ProductImage key={l.productId} product={pr} sizes="36px" className="h-9 w-9 rounded-control ring-2 ring-white" /> : null;
                            })}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[240px] truncate font-medium">{first?.name}</p>
                            <p className="text-meta text-mute">
                              {p.lines.length} {p.lines.length === 1 ? "line" : "lines"} · {memberName(ws.members, p.buyerId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={clsx(td, "text-ink-2")}>{ccName(ws.costCenters, p.costCenterId)}</td>
                      <td className={td}>
                        <Badge tone={PO_STATUS[p.status].tone} dot>
                          {PO_STATUS[p.status].label}
                        </Badge>
                        <p className="mt-1 text-meta text-mute">{etaText(p)}</p>
                      </td>
                      <td className={clsx(td, "num text-right font-medium")}>{fmt(p.total, { cents: true })}</td>
                      <td className={clsx(td, "w-10 text-mute")}>
                        <Icon name="chevronRight" size={16} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="box" title="No orders match" body="Try a different filter or search term." />
        )}
      </Panel>
      <PoDrawer poId={poId} onClose={() => setPo(null)} />
    </div>
  );
}
