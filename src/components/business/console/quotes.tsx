"use client";

import { clsx } from "clsx";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { productById, productBySlug, products } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import { readableOn } from "@/lib/color";
import { unitPrice } from "@/lib/commerce";
import { addBusinessDays, fmtDay, fmtShort, todayUTC } from "@/lib/format";
import { parseIntent, search } from "@/lib/search";
import { dayAgo, isoDay, visibleResponses } from "@/lib/b2b/policy";
import type { Rfq } from "@/lib/b2b/types";
import { locLabel, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { useUI } from "@/lib/store";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { Badge, PageHead, Panel, Segmented, useNow } from "@/components/business/console/ui";

export function QuotesView() {
  const ws = useWorkspace();
  const sp = useSearchParams();
  const [filter, setFilter] = useState<"open" | "awarded" | "closed">("open");
  const [focus, setFocus] = useState<string | null>(sp.get("rfq"));
  const shown = ws.rfqs.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Buy"
        title="Quotes"
        description="Describe it once. Ayiin sends the request to every qualified supplier, normalises replies to landed cost and turns the winner into a purchase order."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <NewRequest
          onSent={(id) => {
            setFilter("open");
            setFocus(id);
          }}
        />
        <div className="space-y-4">
          <Segmented
            label="Filter requests"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "open", label: "Open", count: ws.rfqs.filter((r) => r.status === "open").length },
              { value: "awarded", label: "Awarded", count: ws.rfqs.filter((r) => r.status === "awarded").length },
              { value: "closed", label: "Closed", count: ws.rfqs.filter((r) => r.status === "closed").length },
            ]}
          />
          {shown.length ? (
            shown.map((r) => <RfqCard key={r.id} rfq={r} highlight={focus === r.id} />)
          ) : (
            <Panel>
              <p className="py-8 text-center text-support text-mute">No {filter} requests.</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function NewRequest({ onSent }: { onSent: (id: string) => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const sp = useSearchParams();
  const notify = useUI((s) => s.notify);
  const options = useMemo(() => products.filter((p) => p.b2b.rfq).sort((a, b) => a.name.localeCompare(b.name)), []);
  const initial = useMemo(() => {
    const slug = sp.get("product");
    if (slug && productBySlug(slug)) return { id: productBySlug(slug)!.id, qty: Number(sp.get("qty")) || 100 };
    const q = sp.get("q");
    if (q) {
      const intent = parseIntent(q);
      const hit = search(intent)[0];
      if (hit) return { id: hit.product.id, qty: intent.qty ?? 100 };
    }
    return { id: productBySlug("premium-copy-paper-a4")!.id, qty: 120 };
  }, [sp]);
  const [productId, setProductId] = useState(initial.id);
  const [qty, setQty] = useState(initial.qty);
  const [target, setTarget] = useState("");
  const [deliverBy, setDeliverBy] = useState(() => isoDay(addBusinessDays(todayUTC(), 7)));
  const [locationId, setLocationId] = useState(ws.locations.find((l) => l.isDefault)?.id ?? ws.locations[0].id);
  const [note, setNote] = useState("");
  const p = productById(productId)!;
  const listed = unitPrice(p, qty);
  const contract = unitPrice(p, qty, { contract: true });

  return (
    <Panel title="New request" meta="Median first reply: 38 minutes" className="self-start">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (qty < 1) return;
          const id = ws.createRfq({ productId, qty, target: Number(target) || undefined, deliverBy, locationId, note });
          notify(`${id} sent to qualified suppliers`, "Replies appear here as they arrive.", false);
          setTarget("");
          setNote("");
          onSent(id);
        }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 rounded-surface bg-porcelain p-3">
          <ProductImage product={p} sizes="56px" className="h-14 w-14 shrink-0 rounded-control" />
          <div className="min-w-0 flex-1">
            <label htmlFor="rfq-p" className="sr-only">
              Item
            </label>
            <select id="rfq-p" value={productId} onChange={(e) => setProductId(e.target.value)} className="field !h-10 !text-support">
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <p className="num mt-1.5 truncate text-meta text-mute">
              {p.b2b.sku} · sold per {p.b2b.unit}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rfq-q" className="field-label">
              Quantity
            </label>
            <input id="rfq-q" inputMode="numeric" value={qty || ""} onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, "")) || 0)} className="field num !h-11" />
          </div>
          <div>
            <label htmlFor="rfq-t" className="field-label">
              Target / {p.b2b.unit.split(" ")[0]} <span className="font-normal text-mute">(optional)</span>
            </label>
            <input id="rfq-t" inputMode="decimal" value={target} placeholder={contract.toFixed(2)} onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))} className="field num !h-11" />
          </div>
        </div>
        <p className="rounded-control bg-mist px-3 py-2.5 text-meta text-ink-2">
          Today at {qty.toLocaleString("en-US")}: listed <span className="num text-ink">{fmt(listed, { cents: true })}</span>
          {contract < listed && (
            <>
              {" "}
              · your contract <span className="num font-medium text-ink">{fmt(contract, { cents: true })}</span>
            </>
          )}{" "}
          — a quote usually beats both.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rfq-d" className="field-label">
              Deliver by
            </label>
            <input id="rfq-d" type="date" value={deliverBy} min={isoDay(todayUTC())} onChange={(e) => setDeliverBy(e.target.value)} className="field !h-11" />
          </div>
          <div>
            <label htmlFor="rfq-l" className="field-label">
              Ship to
            </label>
            <select id="rfq-l" value={locationId} onChange={(e) => setLocationId(e.target.value)} className="field !h-11">
              {ws.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="rfq-n" className="field-label">
            Notes for suppliers <span className="font-normal text-mute">(optional)</span>
          </label>
          <textarea id="rfq-n" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sizes, branding, packaging, certifications…" className="field !h-auto py-3" />
        </div>
        <button type="submit" disabled={qty < 1} className="btn btn-primary w-full">
          Send to qualified suppliers <Icon name="arrowRight" size={16} />
        </button>
      </form>
    </Panel>
  );
}

export function RfqCard({ rfq, highlight }: { rfq: Rfq; highlight?: boolean }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const now = useNow();
  const p = productById(rfq.productId);
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;
  const [cc, setCc] = useState(viewer.costCenterId);
  if (!p) return null;
  // Before the clock starts (server render) show everything that has already arrived.
  const replies = rfq.status !== "open" || !now ? rfq.responses.slice().sort((a, b) => a.unit - b.unit) : visibleResponses(rfq, now);
  const pending = rfq.responses.length - replies.length;
  const deadline = new Date(`${rfq.deliverBy}T00:00:00Z`);
  const onTime = (lead: number) => addBusinessDays(todayUTC(), lead).getTime() <= deadline.getTime();
  const best = replies.filter((r) => onTime(r.leadDays)).sort((a, b) => a.unit - b.unit)[0] ?? replies[0];
  const benchmark = unitPrice(p, rfq.qty, { contract: true });

  return (
    <section className={clsx("overflow-hidden rounded-surface bg-white shadow-[var(--shadow-hair)] transition-shadow", highlight && "ring-2 ring-brand")}>
      <div className="flex items-start gap-4 border-b border-line p-5 sm:p-6">
        <ProductImage product={p} sizes="56px" className="h-14 w-14 shrink-0 rounded-control" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="num text-meta text-mute">{rfq.id}</span>
            {rfq.status === "open" ? (
              <Badge tone={pending ? "brand" : "info"} dot>
                {pending ? `${replies.length} of ${rfq.responses.length} replied` : "All replies in"}
              </Badge>
            ) : rfq.status === "awarded" ? (
              <Badge tone="success" dot>
                Awarded · {rfq.poId}
              </Badge>
            ) : (
              <Badge>Closed</Badge>
            )}
          </div>
          <p className="mt-1.5 text-body font-medium leading-snug">
            {rfq.qty.toLocaleString("en-US")} × {p.name}
          </p>
          <p className="mt-0.5 text-meta text-mute">
            {rfq.target ? `Target ${fmt(rfq.target, { cents: true })} · ` : ""}by {fmtDay(deadline)} · {locLabel(ws.locations, rfq.locationId)} · sent {dayAgo(rfq.createdAt)}
          </p>
          {rfq.note && <p className="mt-2 text-meta text-ink-2">&ldquo;{rfq.note}&rdquo;</p>}
        </div>
      </div>

      <ul className="divide-y divide-line">
        {replies.map((r) => {
          const s = sellerById(r.sellerId);
          const total = r.unit * rfq.qty;
          const isBest = rfq.status === "open" && best?.sellerId === r.sellerId;
          const won = rfq.awardedTo === r.sellerId;
          const late = !onTime(r.leadDays);
          return (
            <li key={r.sellerId} className={clsx("animate-fade px-5 py-4 sm:px-6", (isBest || won) && "bg-porcelain")}>
              <div className="flex items-center gap-3">
                <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full text-meta font-medium" style={{ background: s.color, color: readableOn(s.color) }}>
                  {s.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-support font-medium">
                    {s.name}
                    {isBest && <Badge tone="brand">Recommended</Badge>}
                    {won && <Badge tone="success">Winner</Badge>}
                  </p>
                  <p className="truncate text-meta text-mute">
                    <span className="num">{s.onTime}%</span> on time · {r.leadDays}d lead{late && <span className="text-danger"> · misses date</span>} · replied in {r.repliedIn} min
                    {r.note && ` · ${r.note}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-body font-medium">{fmt(r.unit, { cents: true })}</p>
                  <p className="num text-meta text-mute">{fmt(total, { cents: true })}</p>
                </div>
              </div>
              {rfq.status === "open" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
                  {rfq.target != null && (
                    <span className={clsx("text-meta", r.unit <= rfq.target ? "text-success" : "text-mute")}>
                      {r.unit <= rfq.target ? "Meets target" : `${fmt(r.unit - rfq.target, { cents: true })} over target`}
                    </span>
                  )}
                  {r.unit < benchmark && (
                    <span className="text-meta text-success">
                      Saves {fmt(Math.round((benchmark - r.unit) * rfq.qty))} vs your contract price
                    </span>
                  )}
                  {isBest && (
                    <button
                      type="button"
                      onClick={() => {
                        const poId = ws.award(rfq.id, r.sellerId, cc);
                        if (poId) notify(`${poId} issued to ${s.name}`, `${fmt(total, { cents: true })} on ${s.netTerms?.split(" / ")[0] ?? "Net 30"} · arrives ${fmtShort(addBusinessDays(todayUTC(), r.leadDays))}`, { label: "View PO", href: `/business?tab=orders&po=${poId}` });
                      }}
                      className="btn btn-primary ml-auto !h-9 !text-support"
                    >
                      Award & create PO
                    </button>
                  )}
                  {!isBest && (
                    <button
                      type="button"
                      onClick={() => {
                        const poId = ws.award(rfq.id, r.sellerId, cc);
                        if (poId) notify(`${poId} issued to ${s.name}`, fmt(total, { cents: true }), { label: "View PO", href: `/business?tab=orders&po=${poId}` });
                      }}
                      className="btn btn-ghost ml-auto !h-9 !text-support"
                    >
                      Award
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {rfq.status === "open" &&
          Array.from({ length: pending }).map((_, i) => (
            <li key={`p${i}`} className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <span className="shimmer h-9 w-9 shrink-0 rounded-full" />
              <span className="flex-1 space-y-1.5">
                <span className="shimmer block h-3 w-40 rounded-full" />
                <span className="shimmer block h-2.5 w-56 rounded-full" />
              </span>
              <span className="text-meta text-mute">Waiting for reply…</span>
            </li>
          ))}
      </ul>

      {rfq.status === "open" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:px-6">
          <label className="flex items-center gap-2 text-meta text-mute">
            Charge to
            <select value={cc} onChange={(e) => setCc(e.target.value)} className="field !h-8 !w-auto !px-2 !text-meta">
              {ws.costCenters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              ws.closeRfq(rfq.id);
              notify(`${rfq.id} closed`, "Suppliers were told the request is no longer open.", false);
            }}
            className="text-meta font-medium text-mute hover:text-ink"
          >
            Close request
          </button>
        </div>
      )}
    </section>
  );
}
