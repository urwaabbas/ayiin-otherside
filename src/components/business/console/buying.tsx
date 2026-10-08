"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { productById } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import { fmtShort } from "@/lib/format";
import { line } from "@/lib/b2b/seed";
import { memberName, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { useHydrated, useShop, useUI, type ProcurementList } from "@/lib/store";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { QuickOrder } from "@/components/business/quick-order";
import { listTotal, nextRun } from "@/components/business/reorder-lists";
import { Loading, PanelsSkeleton } from "@/components/ui/skeleton";
import { Empty, PageHead, Panel, td, th } from "@/components/business/console/ui";

/* ─── Quick order ─── */

export function QuickView() {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const [csv, setCsv] = useState<string | null>(null);

  // Buy again: the most recent distinct items from the company's own orders.
  const again = useMemo(() => {
    const seen = new Map<string, { productId: string; variantId: string; qty: number; at: string }>();
    for (const p of [...ws.pos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      for (const l of p.lines) if (!seen.has(l.productId)) seen.set(l.productId, { ...l, at: p.createdAt });
    return [...seen.values()].slice(0, 6);
  }, [ws.pos]);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Buy"
        title="Quick order"
        description="Paste SKUs, product names or spreadsheet rows. Each line is matched to the catalogue and priced at your contract rate."
      />
      <QuickOrder key={csv ?? "empty"} initial={csv ?? undefined} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title="Upload a spreadsheet" meta="CSV with an item and a quantity on each row" className="self-start">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-surface border border-dashed border-line-strong bg-porcelain px-6 py-10 text-center text-support text-ink-2 transition-colors hover:border-ink">
            <Icon name="upload" size={22} />
            <span>
              <span className="font-medium text-ink">Choose a file</span> or drop it here
            </span>
            <span className="text-meta text-mute">SKU or product name, then quantity</span>
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = (await f.text()).split(/\r?\n/).filter((r) => r.trim() && !/^\s*(sku|item|product)\b/i.test(r)).slice(0, 50).join("\n");
                setCsv(text);
                notify(`${f.name} loaded`, `${text.split("\n").length} rows matched below — review, then add to cart`, false);
                e.target.value = "";
              }}
            />
          </label>
        </Panel>
        <Panel title="Buy again" meta="From your company's recent purchase orders" flush>
          <ul className="divide-y divide-line">
            {again.map((l) => {
              const p = productById(l.productId);
              if (!p) return null;
              const unit = unitPrice(p, l.qty, { contract: true });
              return (
                <li key={l.productId} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <ProductImage product={p} variant={l.variantId} sizes="44px" className="h-11 w-11 shrink-0 rounded-control" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-support font-medium">{p.name}</span>
                    <span className="num block truncate text-meta text-mute">
                      Last {l.qty} on {fmtShort(new Date(l.at))} · {fmt(unit, { cents: true })}/{p.b2b.unit}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(p.id, l.variantId, l.qty, true);
                      notify("Added to cart", `${l.qty} × ${p.name}`);
                    }}
                    className="btn btn-secondary !h-9 shrink-0 !text-support"
                  >
                    <Icon name="plus" size={15} /> {l.qty}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ─── Lists & reorders ─── */

const SCHEDULES: { v: ProcurementList["schedule"]; l: string }[] = [
  { v: "none", l: "Manual" },
  { v: "weekly", l: "Weekly" },
  { v: "biweekly", l: "Every 2 weeks" },
  { v: "monthly", l: "Monthly" },
];

export function ListsView() {
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const { fmt } = usePrefs();
  const lists = useShop((s) => s.lists);
  const setSchedule = useShop((s) => s.setListSchedule);
  const setListQty = useShop((s) => s.setListQty);
  const remove = useShop((s) => s.removeFromList);
  const createList = useShop((s) => s.createList);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const ws = useWorkspace();
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;
  const [activeId, setActiveId] = useState(sp.get("list") ?? lists[0]?.id);
  const [name, setName] = useState("");
  const [cc, setCc] = useState(viewer.costCenterId);
  const [loc, setLoc] = useState(ws.locations.find((l) => l.isDefault)?.id ?? ws.locations[0].id);
  const list = lists.find((l) => l.id === activeId) ?? lists[0];

  if (!hydrated)
    return (
      <Loading label="Loading lists">
        <PanelsSkeleton count={4} className="!mt-0 md:grid-cols-2" />
      </Loading>
    );

  const placeNow = () => {
    if (!list?.items.length) return;
    const lines = list.items.map((i) => {
      const p = productById(i.productId)!;
      return { ...line(p.slug, i.qty, i.variantId) };
    });
    const res = ws.submit({ title: list.name, lines, costCenterId: cc, locationId: loc, source: "reorder" });
    if (res.kind === "po") notify(`${res.id} placed`, `${list.name} · ${fmt(listTotal(list), { cents: true })} · ${res.reason.toLowerCase()}`, { label: "View PO", href: `/business?tab=orders&po=${res.id}` });
    else notify(`${res.id} sent for approval`, `${memberName(ws.members, res.approverId)} will review — ${res.reason.toLowerCase()}`, { label: "Track", href: "/business?tab=approvals" });
  };

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Buy"
        title="Lists & reorders"
        description="Reorder any list in one click, or put it on a schedule. We remind you two days before it runs."
        actions={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              setActiveId(createList(name.trim()));
              setName("");
            }}
            className="flex gap-2"
          >
            <label htmlFor="new-list" className="sr-only">
              New list name
            </label>
            <input id="new-list" value={name} onChange={(e) => setName(e.target.value)} placeholder="New list name" className="field !h-11 w-48" />
            <button type="submit" className="btn btn-secondary">
              <Icon name="plus" size={15} /> Create
            </button>
          </form>
        }
      />
      <div className="scroll-x flex gap-2">
        {lists.map((l) => (
          <button key={l.id} type="button" onClick={() => setActiveId(l.id)} className="chip shrink-0" data-active={list?.id === l.id ? "true" : undefined}>
            {l.name} <span className="num opacity-60">{l.items.length}</span>
          </button>
        ))}
      </div>
      {list && (
        <Panel
          flush
          title={list.name}
          meta={
            <>
              Updated {fmtShort(new Date(list.updatedAt))}
              {nextRun(list) && <> · next automatic order {nextRun(list)}</>}
            </>
          }
          action={
            <label className="flex items-center gap-2 text-support text-mute">
              Schedule
              <select value={list.schedule} onChange={(e) => setSchedule(list.id, e.target.value as ProcurementList["schedule"])} className="field !h-9 !w-auto !text-support">
                {SCHEDULES.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          {list.items.length === 0 ? (
            <Empty icon="list" title="This list is empty" body="Add items from any product page with “Add to list”, or from Quick order." action={<Link href="/search?bulk=1" className="btn btn-secondary">Browse bulk catalogue</Link>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-support">
                  <thead className="border-b border-line">
                    <tr>
                      <th className={th}>Item</th>
                      <th className={th}>Quantity</th>
                      <th className={`${th} text-right`}>Unit</th>
                      <th className={`${th} text-right`}>Line total</th>
                      <th className={th}>
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.items.map((i) => {
                      const p = productById(i.productId);
                      if (!p) return null;
                      const unit = unitPrice(p, i.qty, { contract: true });
                      return (
                        <tr key={i.productId} className="border-t border-line first:border-t-0">
                          <td className={td}>
                            <Link href={`/p/${p.slug}`} className="flex items-center gap-3 hover:underline">
                              <ProductImage product={p} variant={i.variantId} sizes="44px" className="h-11 w-11 shrink-0 rounded-control" />
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{p.name}</span>
                                <span className="num block text-meta text-mute">
                                  {p.b2b.sku} · {p.b2b.unit}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className={td}>
                            <QtyStepper value={i.qty} onChange={(q) => setListQty(list.id, p.id, q)} size="sm" label={`Quantity of ${p.name}`} />
                          </td>
                          <td className={`${td} num text-right`}>
                            {fmt(unit, { cents: true })}
                            {unit < p.price && <span className="block text-meta text-success">−{Math.round((1 - unit / p.price) * 100)}%</span>}
                          </td>
                          <td className={`${td} num text-right font-medium`}>{fmt(unit * i.qty, { cents: true })}</td>
                          <td className={`${td} w-12 text-right`}>
                            <button type="button" onClick={() => remove(list.id, p.id)} aria-label={`Remove ${p.name}`} className="grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-soft hover:text-ink">
                              <Icon name="trash" size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line px-5 py-4 sm:px-6">
                <div className="flex flex-wrap gap-3">
                  <label className="text-meta text-mute">
                    <span className="mb-1 block">Charge to</span>
                    <select value={cc} onChange={(e) => setCc(e.target.value)} className="field !h-9 !w-auto !text-support">
                      {ws.costCenters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-meta text-mute">
                    <span className="mb-1 block">Ship to</span>
                    <select value={loc} onChange={(e) => setLoc(e.target.value)} className="field !h-9 !w-auto !text-support">
                      {ws.locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      list.items.forEach((i) => addToCart(i.productId, i.variantId, i.qty, true));
                      notify(`“${list.name}” added to cart`, fmt(listTotal(list), { cents: true }));
                    }}
                    className="btn btn-secondary"
                  >
                    Add to cart
                  </button>
                  <button type="button" onClick={placeNow} className="btn btn-primary">
                    <Icon name="repeat" size={15} /> Order now · {fmt(Math.round(listTotal(list)))}
                  </button>
                </div>
              </div>
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
