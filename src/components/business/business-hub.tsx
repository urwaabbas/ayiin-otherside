"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { addresses, approvals, company, invoices, rfqResponses, spendByMonth, team } from "@/lib/business";
import { productById, productBySlug, products } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import { parseIntent, search } from "@/lib/search";
import { unitPrice } from "@/lib/commerce";
import { fmtLong, fmtShort } from "@/lib/format";
import { useHydrated, useShop, useUI, type ProcurementList } from "@/lib/store";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { Icon, type IconName } from "@/components/ui/icon";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { QuickOrder } from "@/components/business/quick-order";
import { ApprovalQueue } from "@/components/business/approval-queue";
import { SpendChart } from "@/components/business/spend-chart";
import { listTotal, nextRun, ReorderLists } from "@/components/business/reorder-lists";
import { Loading, PanelsSkeleton } from "@/components/ui/skeleton";

const TABS: { id: string; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "quick", label: "Quick order", icon: "bolt" },
  { id: "lists", label: "Lists & reorders", icon: "repeat" },
  { id: "quotes", label: "Quotes", icon: "file" },
  { id: "approvals", label: "Approvals", icon: "approve" },
  { id: "invoices", label: "Orders & invoices", icon: "receipt" },
  { id: "team", label: "Team & budgets", icon: "users" },
  { id: "addresses", label: "Locations", icon: "pin" },
];

export function BusinessHub() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, setMode } = usePrefs();
  const tab = TABS.some((t) => t.id === sp.get("tab")) ? sp.get("tab")! : "overview";
  const go = (id: string) => router.replace(`${pathname}?tab=${id}`, { scroll: false });

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
      <nav aria-label="Business account" className="lg:sticky lg:top-[88px] lg:self-start">
        <ul className="scroll-x -mx-[var(--gutter)] flex gap-1 px-[var(--gutter)] lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map((t) => (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[14px] transition-colors lg:rounded-xl",
                  tab === t.id ? "bg-ink text-white" : "text-ink-2 hover:bg-soft hover:text-ink",
                )}
              >
                <Icon name={t.icon} size={17} />
                {t.label}
                {t.id === "approvals" && <span className={clsx("num ml-auto rounded-full px-1.5 text-[11px]", tab === t.id ? "bg-brand text-ink" : "bg-ink text-white")}>{approvals.length}</span>}
              </button>
            </li>
          ))}
        </ul>
        {mode !== "business" && (
          <div className="mt-6 hidden rounded-2xl bg-info-soft p-4 text-[13px] text-info lg:block">
            <p className="font-medium">You&apos;re in Personal mode</p>
            <p className="mt-1">Switch to see contract & volume pricing across Ayiin.</p>
            <button type="button" onClick={() => setMode("business")} className="btn btn-ink btn-sm mt-3">
              Switch to Business
            </button>
          </div>
        )}
      </nav>

      <div className="min-w-0">
        {tab === "overview" && <Overview go={go} />}
        {tab === "quick" && <QuickTab />}
        {tab === "lists" && <ListsTab />}
        {tab === "quotes" && <QuotesTab key={sp.toString()} />}
        {tab === "approvals" && <ApprovalsTab />}
        {tab === "invoices" && <InvoicesTab />}
        {tab === "team" && <TeamTab />}
        {tab === "addresses" && <AddressesTab />}
      </div>
    </div>
  );
}

function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-[26px] bg-white p-5 shadow-[var(--shadow-hair)] sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[16px] font-medium tracking-[-0.01em]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Overview({ go }: { go: (id: string) => void }) {
  const { fmt } = usePrefs();
  const available = company.creditLimit - company.creditUsed;
  const stats = [
    { label: "Spend this month", value: fmt(spendByMonth[spendByMonth.length - 1].v), delta: "+25% vs Aug" },
    { label: "Saved vs list price", value: fmt(2914), delta: "23% average" },
    { label: "Open orders", value: "4", delta: "2 arriving tomorrow" },
    { label: "Available credit", value: fmt(available), delta: `${company.terms} · of ${fmt(company.creditLimit)}` },
  ];
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[22px] bg-white p-5 shadow-[var(--shadow-hair)]">
            <dt className="text-[13px] text-mute">{s.label}</dt>
            <dd className="mt-2 text-[28px] font-semibold tracking-[-0.03em] tabular-nums">{s.value}</dd>
            <dd className="mt-1 text-[12.5px] text-ink-2">{s.delta}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Monthly spend" action={<span className="text-[12.5px] text-mute">All cost centres · 2026</span>}>
          <SpendChart data={spendByMonth} />
        </Panel>
        <Panel title="Waiting on you" action={<button type="button" onClick={() => go("approvals")} className="text-[13px] text-ink-2 hover:text-ink">All approvals →</button>}>
          <ApprovalQueue items={approvals} />
        </Panel>
      </div>
      <Panel title="Reorder" action={<button type="button" onClick={() => go("lists")} className="text-[13px] text-ink-2 hover:text-ink">Manage lists →</button>}>
        <ReorderLists />
      </Panel>
    </div>
  );
}

function QuickTab() {
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const [csv, setCsv] = useState<string | null>(null);
  const past = [productBySlug("premium-copy-paper-a4")!, productBySlug("nitrile-gloves-4mil")!, productBySlug("double-wall-cartons-12x10x8")!, productBySlug("guji-single-origin-1kg")!];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[40px] sm:text-[52px]">Quick order</h2>
        <p className="mt-2 max-w-xl text-[15px] text-mute">Paste SKUs, product names or spreadsheet rows. Ayiin matches each line, applies your contract and volume pricing, and builds the cart.</p>
      </div>
      <QuickOrder key={csv ?? "empty"} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Upload a CSV">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-porcelain px-6 py-8 text-center text-[13.5px] text-ink-2 hover:border-ink">
            <Icon name="upload" size={22} />
            <span>
              <span className="font-medium text-ink">Choose a file</span> — columns: SKU or name, quantity
            </span>
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                setCsv(text);
                notify("File read", `${text.split(/\n+/).filter(Boolean).length} rows — paste them into Quick order to review`);
              }}
            />
          </label>
          {csv && <pre className="num mt-3 max-h-40 overflow-auto rounded-xl bg-mist p-3 text-[12px]">{csv.slice(0, 800)}</pre>}
        </Panel>
        <Panel title="Buy again">
          <ul className="space-y-2">
            {past.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <ProductImage product={p} sizes="44px" className="h-11 w-11 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                  <span className="num block text-[12px] text-mute">{p.b2b.sku}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(p.id, p.variants[0].id, p.b2b.tiers[1]?.min ?? 1, true);
                    notify("Added to cart", p.name);
                  }}
                  className="btn btn-ghost btn-sm !h-8"
                >
                  Add {p.b2b.tiers[1]?.min ?? 1}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

const SCHEDULES: { v: ProcurementList["schedule"]; l: string }[] = [
  { v: "none", l: "Manual" },
  { v: "weekly", l: "Weekly" },
  { v: "biweekly", l: "Every 2 weeks" },
  { v: "monthly", l: "Monthly" },
];

function ListsTab() {
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
  const [activeId, setActiveId] = useState(sp.get("list") ?? lists[0]?.id);
  const [name, setName] = useState("");
  const list = lists.find((l) => l.id === activeId) ?? lists[0];

  if (!hydrated) return <Loading label="Loading"><PanelsSkeleton count={4} className="!mt-0 md:grid-cols-2" /></Loading>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[40px] sm:text-[52px]">Lists & reorders</h2>
          <p className="mt-2 max-w-xl text-[15px] text-mute">Every list reorders in one click. Put it on a schedule and Ayiin places the order — you get a heads-up two days before.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            setActiveId(createList(name.trim()));
            setName("");
          }}
          className="flex gap-2"
        >
          <label htmlFor="new-list" className="sr-only">New list name</label>
          <input id="new-list" value={name} onChange={(e) => setName(e.target.value)} placeholder="New list name" className="field !h-10 w-48 !text-[13.5px]" />
          <button type="submit" className="btn btn-ink btn-sm !h-10">
            <Icon name="plus" size={15} /> Create
          </button>
        </form>
      </div>
      <div className="scroll-x flex gap-2">
        {lists.map((l) => (
          <button key={l.id} type="button" onClick={() => setActiveId(l.id)} className="chip shrink-0" data-active={list?.id === l.id ? "true" : undefined}>
            {l.name} <span className="num opacity-60">{l.items.length}</span>
          </button>
        ))}
      </div>
      {list && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-[18px] font-medium tracking-[-0.02em]">{list.name}</p>
              <p className="text-[13px] text-mute">
                Updated {fmtShort(new Date(list.updatedAt))}
                {nextRun(list) && <> · next order {nextRun(list)}</>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="schedule" className="text-[13px] text-mute">Schedule</label>
              <select id="schedule" value={list.schedule} onChange={(e) => setSchedule(list.id, e.target.value as ProcurementList["schedule"])} className="field !h-10 !w-auto !text-[13.5px]">
                {SCHEDULES.map((s) => (
                  <option key={s.v} value={s.v}>{s.l}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!list.items.length}
                onClick={() => {
                  list.items.forEach((i) => addToCart(i.productId, i.variantId, i.qty, true));
                  notify(`“${list.name}” added to cart`, fmt(listTotal(list), { cents: true }));
                }}
                className="btn btn-ink btn-sm !h-10"
              >
                <Icon name="repeat" size={15} /> Reorder all · {fmt(listTotal(list))}
              </button>
            </div>
          </div>
          {list.items.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-mute">Empty list. Add items from any product page with “Add to list”.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13.5px]">
                <thead className="text-[12px] text-mute">
                  <tr>
                    <th className="py-3 font-normal">Item</th>
                    <th className="py-3 font-normal">Quantity</th>
                    <th className="py-3 text-right font-normal">Unit</th>
                    <th className="py-3 text-right font-normal">Line total</th>
                    <th className="py-3"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((i) => {
                    const p = productById(i.productId);
                    if (!p) return null;
                    const unit = unitPrice(p, i.qty, { contract: true });
                    return (
                      <tr key={i.productId} className="border-t border-line">
                        <td className="py-3 pr-4">
                          <Link href={`/p/${p.slug}`} className="flex items-center gap-3 hover:underline">
                            <ProductImage product={p} sizes="44px" className="h-11 w-11 shrink-0 rounded-xl" />
                            <span>
                              <span className="block font-medium">{p.name}</span>
                              <span className="num block text-[12px] text-mute">{p.b2b.sku} · {p.b2b.unit}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="py-3">
                          <QtyStepper value={i.qty} onChange={(q) => setListQty(list.id, p.id, q)} size="sm" label={`Quantity of ${p.name}`} />
                        </td>
                        <td className="num py-3 text-right">{fmt(unit, { cents: true })}</td>
                        <td className="num py-3 text-right font-medium">{fmt(unit * i.qty, { cents: true })}</td>
                        <td className="py-3 text-right">
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
          )}
        </Panel>
      )}
    </div>
  );
}

function QuotesTab() {
  const sp = useSearchParams();
  const { fmt } = usePrefs();
  const hydrated = useHydrated();
  const quotes = useShop((s) => s.quotes);
  const addQuote = useShop((s) => s.addQuote);
  const notify = useUI((s) => s.notify);
  const initial = useMemo(() => {
    const slug = sp.get("product");
    const q = sp.get("q");
    if (slug && productBySlug(slug)) return [{ productId: productBySlug(slug)!.id, qty: Number(sp.get("qty")) || 100, target: "" }];
    if (q) {
      const intent = parseIntent(q);
      const hit = search(intent)[0];
      if (hit) return [{ productId: hit.product.id, qty: intent.qty ?? 100, target: "" }];
    }
    return [{ productId: productBySlug("nitrile-gloves-4mil")!.id, qty: 200, target: "9.75" }];
  }, [sp]);
  const [items, setItems] = useState(initial);
  const [deliverBy, setDeliverBy] = useState("2026-10-06");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const options = products.filter((p) => p.b2b.rfq);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[40px] sm:text-[52px]">Request quotes</h2>
        <p className="mt-2 max-w-xl text-[15px] text-mute">One request goes to every qualified, verified supplier. Responses arrive normalised to landed cost — median first response 3h 12m.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="New request">
          {sent ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand shadow-[inset_0_0_0_1.5px_var(--color-ink)]">
                <Icon name="check" size={20} strokeWidth={2.4} />
              </span>
              <p className="mt-4 text-[18px] font-medium">{sent} sent to 6 suppliers</p>
              <p className="mt-1 text-[14px] text-mute">You&apos;ll get a notification as each quote arrives.</p>
              <button type="button" onClick={() => setSent(null)} className="btn btn-ghost btn-sm mt-5">New request</button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const id = addQuote({
                  items: items.map((i) => ({ productId: i.productId, qty: i.qty, target: Number(i.target) || undefined })),
                  note,
                  deliverBy,
                  sellers: 6,
                });
                setSent(id);
                notify(`${id} sent`, "Suppliers typically respond within a few hours.");
              }}
              className="space-y-4"
            >
              {items.map((it, idx) => (
                <div key={idx} className="grid gap-3 rounded-2xl bg-porcelain p-3 sm:grid-cols-[1fr_110px_120px_auto] sm:items-end">
                  <div>
                    <label htmlFor={`rfq-p-${idx}`} className="field-label">Item</label>
                    <select id={`rfq-p-${idx}`} value={it.productId} onChange={(e) => setItems((s) => s.map((x, j) => (j === idx ? { ...x, productId: e.target.value } : x)))} className="field !h-10 !text-[13.5px]">
                      {options.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`rfq-q-${idx}`} className="field-label">Quantity</label>
                    <input id={`rfq-q-${idx}`} inputMode="numeric" value={it.qty} onChange={(e) => setItems((s) => s.map((x, j) => (j === idx ? { ...x, qty: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))} className="field num !h-10 !text-[13.5px]" />
                  </div>
                  <div>
                    <label htmlFor={`rfq-t-${idx}`} className="field-label">Target / unit</label>
                    <input id={`rfq-t-${idx}`} inputMode="decimal" placeholder="Optional" value={it.target} onChange={(e) => setItems((s) => s.map((x, j) => (j === idx ? { ...x, target: e.target.value } : x)))} className="field num !h-10 !text-[13.5px]" />
                  </div>
                  <button type="button" aria-label="Remove item" disabled={items.length === 1} onClick={() => setItems((s) => s.filter((_, j) => j !== idx))} className="grid h-10 w-10 place-items-center rounded-full text-mute hover:bg-soft disabled:opacity-30">
                    <Icon name="trash" size={16} />
                  </button>
                  {(() => {
                    const p = productById(it.productId);
                    return p ? (
                      <p className="text-[12px] text-mute sm:col-span-4">
                        Today&apos;s best listed price at this quantity: <span className="num text-ink">{fmt(unitPrice(p, it.qty), { cents: true })}</span>/{p.b2b.unit}
                      </p>
                    ) : null;
                  })()}
                </div>
              ))}
              <button type="button" onClick={() => setItems((s) => [...s, { productId: options[0].id, qty: 50, target: "" }])} className="chip">
                <Icon name="plus" size={14} /> Add item
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="rfq-date" className="field-label">Deliver by</label>
                  <input id="rfq-date" type="date" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} className="field !h-10 !text-[13.5px]" />
                </div>
                <div>
                  <label htmlFor="rfq-ship" className="field-label">Ship to</label>
                  <select id="rfq-ship" className="field !h-10 !text-[13.5px]">
                    {addresses.map((a) => (
                      <option key={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="rfq-note" className="field-label">Notes for suppliers <span className="font-normal text-mute">(optional)</span></label>
                <textarea id="rfq-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sizes, branding, packaging, certifications…" className="field !h-auto py-3 !text-[13.5px]" />
              </div>
              <button type="submit" className="btn btn-ink w-full">Send to qualified suppliers</button>
            </form>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="RFQ-20418 · responses" action={<span className="rounded-full bg-brand px-2.5 py-1 text-[11.5px] font-medium">3 in</span>}>
            <p className="text-[13px] text-mute">200 boxes nitrile gloves · target $9.75 · by Oct 6</p>
            <ul className="mt-4 space-y-2">
              {rfqResponses.map((r, i) => {
                const s = sellerById(r.seller);
                return (
                  <li key={r.seller} className={clsx("rounded-2xl border p-3.5", i === 0 ? "border-ink" : "border-line")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium">{s.name}</p>
                      <p className="num text-[14px] font-medium">{fmt(r.price, { cents: true })}</p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-mute">
                      {r.lead}d lead · {r.note} · replied in {r.time}
                    </p>
                    {i === 0 && (
                      <button type="button" onClick={() => notify("Quote accepted", `PO-7813 created · ${fmt(r.price * 200, { cents: true })} on Net 30`)} className="btn btn-ink btn-sm mt-3 !h-8">
                        Accept & create PO
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
          {hydrated && quotes.length > 0 && (
            <Panel title="Your requests">
              <ul className="divide-y divide-line text-[13.5px]">
                {quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between py-2.5">
                    <span>
                      <span className="num font-medium">{q.id}</span>
                      <span className="text-mute"> · {q.items.length} item{q.items.length > 1 ? "s" : ""} · {q.sellers} suppliers</span>
                    </span>
                    <span className="rounded-full bg-mist px-2.5 py-1 text-[12px]">Awaiting responses</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalsTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[40px] sm:text-[52px]">Approvals</h2>
        <p className="mt-2 max-w-xl text-[15px] text-mute">Rules decide what needs a second look. Everything else just ships.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title={`Waiting on you · ${approvals.length}`}>
          <ApprovalQueue items={approvals} detailed />
        </Panel>
        <Panel title="Rules">
          <ol className="space-y-3 text-[13.5px]">
            {[
              ["Under $500", "Auto-approve", "approve"],
              ["$500 – $2,500", "Buyer's own limit", "users"],
              ["Over $2,500", "Manager (Priya Raman)", "building"],
              ["Electronics, any amount", "IT review (Ana Lindqvist)", "layers"],
              ["Events cost centre", "Budget owner", "wallet"],
            ].map(([when, who, icon]) => (
              <li key={when} className="flex items-center gap-3 rounded-2xl bg-porcelain p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white">
                  <Icon name={icon as IconName} size={16} />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{when}</span>
                  <span className="block text-mute">{who}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[12.5px] text-mute">Approvers can act from email or Slack. Median approval time last month: 42 minutes.</p>
        </Panel>
      </div>
    </div>
  );
}

function InvoicesTab() {
  const { fmt } = usePrefs();
  const hydrated = useHydrated();
  const orders = useShop((s) => s.orders).filter((o) => o.mode === "business");
  const notify = useUI((s) => s.notify);
  const open = invoices.filter((i) => i.status === "open").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[40px] sm:text-[52px]">Orders & invoices</h2>
          <p className="mt-2 text-[15px] text-mute">
            <span className="num text-ink">{fmt(open, { cents: true })}</span> open on {company.terms} · {company.exemptionCert}
          </p>
        </div>
        <button type="button" onClick={() => notify("Statement exported", "September statement · CSV + PDF")} className="btn btn-ghost btn-sm">
          <Icon name="upload" size={15} className="rotate-180" /> Export statement
        </button>
      </div>
      {hydrated && orders.length > 0 && (
        <Panel title="Recent orders">
          <ul className="divide-y divide-line text-[13.5px]">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="num font-medium">{o.id}</span>
                  {o.po && <span className="num text-mute"> · {o.po}</span>}
                  <span className="text-mute"> · {o.items.length} lines</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="num">{fmt(o.total, { cents: true })}</span>
                  <span className={clsx("rounded-full px-2.5 py-1 text-[12px]", o.status === "awaiting-approval" ? "bg-info-soft text-info" : "bg-success-soft text-success")}>
                    {o.status === "awaiting-approval" ? "Awaiting approval" : "Confirmed"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="text-[12px] text-mute">
              <tr>
                <th className="pb-3 font-normal">Invoice</th>
                <th className="pb-3 font-normal">PO</th>
                <th className="pb-3 font-normal">Issued</th>
                <th className="pb-3 font-normal">Due</th>
                <th className="pb-3 text-right font-normal">Amount</th>
                <th className="pb-3 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="num py-3.5 font-medium">{i.id}</td>
                  <td className="num py-3.5 text-mute">{i.po}</td>
                  <td className="py-3.5">{fmtLong(i.date)}</td>
                  <td className="py-3.5">{fmtLong(i.due)}</td>
                  <td className="num py-3.5 text-right">{fmt(i.amount, { cents: true })}</td>
                  <td className="py-3.5 text-right">
                    {i.status === "open" ? (
                      <button type="button" onClick={() => notify(`${i.id} scheduled`, "ACH payment on the due date")} className="btn btn-ink btn-sm !h-8">
                        Pay
                      </button>
                    ) : (
                      <span className="rounded-full bg-success-soft px-2.5 py-1 text-[12px] text-success">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function TeamTab() {
  const { fmt } = usePrefs();
  const notify = useUI((s) => s.notify);
  const [email, setEmail] = useState("");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[40px] sm:text-[52px]">Team & budgets</h2>
          <p className="mt-2 max-w-xl text-[15px] text-mute">Everyone buys under one account, within limits you set. Spend rolls up by person and cost centre.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/\S+@\S+\.\S+/.test(email)) return;
            notify("Invite sent", `${email} joins as Requester`);
            setEmail("");
          }}
          className="flex gap-2"
        >
          <label htmlFor="invite" className="sr-only">Invite by email</label>
          <input id="invite" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@northwind.studio" className="field !h-10 w-56 !text-[13.5px]" />
          <button type="submit" className="btn btn-ink btn-sm !h-10">Invite</button>
        </form>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="text-[12px] text-mute">
              <tr>
                <th className="pb-3 font-normal">Member</th>
                <th className="pb-3 font-normal">Role</th>
                <th className="pb-3 font-normal">Limit</th>
                <th className="pb-3 text-right font-normal">Spend this quarter</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.email} className="border-t border-line">
                  <td className="py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-soft text-[12px] font-medium">{m.initials}</span>
                      <span>
                        <span className="block font-medium">{m.name}</span>
                        <span className="block text-[12px] text-mute">{m.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={clsx("rounded-full px-2.5 py-1 text-[12px]", m.role === "Admin" ? "bg-ink text-white" : "bg-mist")}>{m.role}</span>
                  </td>
                  <td className="py-3.5 text-ink-2">{m.limit}</td>
                  <td className="num py-3.5 text-right">{m.spend ? fmt(m.spend) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AddressesTab() {
  const notify = useUI((s) => s.notify);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[40px] sm:text-[52px]">Locations</h2>
        <p className="mt-2 max-w-xl text-[15px] text-mute">Ship any line to any location. Dock hours and receiving notes travel with every order.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {addresses.map((a) => (
          <Panel key={a.id}>
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mist">
                <Icon name="pin" size={18} />
              </span>
              {a.default && <span className="rounded-full bg-ink px-2.5 py-1 text-[11.5px] text-white">Default</span>}
            </div>
            <p className="mt-4 text-[15px] font-medium">{a.label}</p>
            <p className="mt-1 text-[13.5px] text-ink-2">{a.line}</p>
            <p className="mt-2 text-[12.5px] text-mute">{a.contact}</p>
          </Panel>
        ))}
        <button type="button" onClick={() => notify("Add location", "Address verification runs automatically")} className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[26px] border border-dashed border-line-strong text-[14px] text-ink-2 hover:border-ink hover:text-ink">
          <Icon name="plus" size={20} /> Add location
        </button>
      </div>
    </div>
  );
}
