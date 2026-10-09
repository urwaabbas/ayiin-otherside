"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useRef, useState } from "react";
import { productById } from "@/lib/catalog/products";
import { addBusinessDays, relativeDay, todayUTC } from "@/lib/format";
import {
  deliveryLabel,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/commerce";
import { cartSummary, lineUnitPrice, useHydrated, useShop, useUI } from "@/lib/store";
import { decide } from "@/lib/b2b/policy";
import { line as priceLine } from "@/lib/b2b/seed";
import { company, memberName, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { Loading, SplitSkeleton } from "@/components/ui/skeleton";

type Errors = Record<string, string>;

function Field({
  id,
  label,
  error,
  hint,
  className,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={clsx("field", error && "!border-danger")}
        {...input}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-meta text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-meta text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Step({
  n,
  title,
  children,
  aside,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`step-${n}`}
      className="rounded-surface bg-white p-5 shadow-[var(--shadow-hair)] sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2
          id={`step-${n}`}
          className="flex items-center gap-3 text-emphasis font-medium tracking-[-0.02em]"
        >
          <span className="num grid h-7 w-7 place-items-center rounded-full bg-ink text-meta text-brand">
            {n}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const cart = useShop((s) => s.cart);
  const placeOrder = useShop((s) => s.placeOrder);
  const notify = useUI((s) => s.notify);
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [express, setExpress] = useState(false);
  const [pay, setPay] = useState<"card" | "paypal" | "invoice" | "ach">(
    business ? "invoice" : "card",
  );
  const ws = useWorkspace();
  const viewer = ws.members.find((m) => m.id === VIEWER_ID)!;
  const addresses = ws.locations.map((l) => ({ id: l.id, label: l.label, line: `${l.line}, ${l.city}`, contact: l.notes || l.contact }));
  const [shipTo, setShipTo] = useState(ws.locations.find((l) => l.isDefault)?.id ?? ws.locations[0].id);
  const [costCenterId, setCostCenterId] = useState(viewer.costCenterId);
  const [placing, setPlacing] = useState(false);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");

  if (!hydrated)
    return (
      <Loading label="Loading checkout">
        <SplitSkeleton rows={4} tall />
      </Loading>
    );

  if (placing && cart.length === 0)
    return (
      <div className="mt-10 grid h-[400px] place-items-center rounded-surface bg-white text-body text-mute shadow-[var(--shadow-hair)]">
        Confirming your order…
      </div>
    );

  if (cart.length === 0) {
    return (
      <div className="mt-10 rounded-surface bg-white p-12 text-center shadow-[var(--shadow-hair)]">
        <p className="display text-display-sm">Nothing to check out.</p>
        <Link href="/search" className="btn btn-primary mt-6">
          Find something good
        </Link>
      </div>
    );
  }

  const sum = cartSummary(cart);
  const standardShip = business
    ? 0
    : sum.subtotal >= FREE_SHIPPING_THRESHOLD
      ? sum.shipping
      : Math.max(sum.shipping, 5.99);
  const shipping = express ? standardShip + 9.99 : standardShip;
  const tax =
    business && company.taxExempt ? 0 : (sum.subtotal + shipping) * TAX_RATE;
  const total = sum.subtotal + shipping + tax;
  const businessLines = cart.map((l) => {
    const p = productById(l.productId)!;
    return { ...priceLine(p.slug, l.qty, l.variantId), unit: lineUnitPrice(l) };
  });
  const decision = business
    ? decide({ requester: viewer, total, lines: businessLines, costCenterId, rules: ws.rules, costCenters: ws.costCenters })
    : null;
  const needsApproval = decision?.kind === "approval";
  const slowest = cart
    .map((l) => productById(l.productId)!)
    .sort((a, b) => b.delivery.max - a.delivery.max)[0];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Errors = {};
    if (!business) {
      if (!/^\S+@\S+\.\S+$/.test(v("email")))
        errs.email = "Enter an email so we can send your receipt and tracking.";
      if (!v("name")) errs.name = "Who should we deliver to?";
      if (!v("address")) errs.address = "Enter a street address.";
      if (!v("city")) errs.city = "Enter a city.";
      if (!/^\d{5}(-\d{4})?$/.test(v("zip")))
        errs.zip = "Use a 5-digit ZIP code.";
      if (pay === "card") {
        if (card.replace(/\s/g, "").length < 15)
          errs.card = "Card number looks incomplete.";
        if (!/^\d{2} \/ \d{2}$/.test(exp)) errs.exp = "Use MM / YY.";
        if (!/^\d{3,4}$/.test(v("cvc"))) errs.cvc = "3 or 4 digits.";
      }
    } else if (!v("po")) {
      errs.po = "Your finance team requires a PO number on every order.";
    }
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      (
        formRef.current?.querySelector(
          `[name="${first}"]`,
        ) as HTMLElement | null
      )?.focus();
      return;
    }
    setPlacing(true);
    if (business) {
      const res = ws.submit({
        title: cart.length === 1 ? `${productById(cart[0].productId)?.name ?? "Order"}` : `Checkout — ${cart.length} items`,
        lines: businessLines,
        costCenterId,
        locationId: shipTo,
        reference: v("po"),
        note: v("notes") || undefined,
        source: "checkout",
      });
      notify(
        res.kind === "po" ? `${res.id} issued` : `${res.id} sent for approval`,
        res.kind === "po" ? "Suppliers have your purchase order." : `${memberName(ws.members, res.approverId)} will review it.`,
        { label: res.kind === "po" ? "View PO" : "Track", href: res.kind === "po" ? `/business?tab=orders&po=${res.id}` : "/business?tab=approvals" },
      );
    }
    const id = placeOrder({
      total,
      mode,
      status: needsApproval ? "awaiting-approval" : "confirmed",
      po: business ? v("po") : undefined,
      email: business ? viewer.email : v("email"),
      items: cart.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
        price: lineUnitPrice(l),
      })),
    });

    // Sync order with backend so it immediately appears in Admin Dashboard & Orders
    try {
      const customerName = `${v("firstName") || ""} ${v("lastName") || ""}`.trim() || (business ? viewer.name : "Customer");
      const customerEmail = (business ? viewer.email : v("email")) || "customer@example.com";
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          user: { name: customerName, email: customerEmail },
          items: cart.map((l) => {
            const prod = productById(l.productId);
            return {
              title: prod?.name || l.productId,
              quantity: l.qty,
              price: lineUnitPrice(l),
              productId: l.productId,
              variantId: l.variantId,
            };
          }),
          total,
          mode,
          po: business ? v("po") : undefined,
          status: needsApproval ? "pending" : "paid",
        }),
      }).catch((err) => console.error("Error syncing order to admin backend:", err));
    } catch (e) {
      console.error(e);
    }

    router.push(`/checkout/confirmation?order=${id}`);
  };

  const formatCard = (s: string) =>
    s
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp = (s: string) => {
    const d = s.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12"
    >
      <div className="space-y-5">
        {!business && (
          <div className="rounded-surface bg-white p-5 shadow-[var(--shadow-hair)] sm:p-7">
            <p className="text-center text-support text-mute">
              Express checkout
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPay("card")}
                className="btn btn-secondary"
              >
                <Icon name="wallet" size={17} /> Wallet Pay
              </button>
              <button
                type="button"
                onClick={() => setPay("paypal")}
                className="btn btn-secondary"
              >
                PayPal
              </button>
            </div>
            <div className="mt-5 flex items-center gap-3 text-meta text-mute">
              <span className="h-px flex-1 bg-line" /> or continue as a guest{" "}
              <span className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

        {business ? (
          <>
            <Step
              n={1}
              title="Buyer"
              aside={
                <span className="rounded-full bg-mist px-3 py-1 text-meta">
                  Net 30 · Tax exempt
                </span>
              }
            >
              <div className="flex items-center gap-3 rounded-surface bg-porcelain p-4">
                <span className="grid h-11 w-11 place-items-center rounded-surface bg-ink font-mono text-meta text-porcelain">
                  NW
                </span>
                <div className="text-support">
                  <p className="font-medium">{company.legal}</p>
                  <p className="text-mute">
                    {viewer.name} · {viewer.email} · {company.taxId}
                  </p>
                </div>
              </div>
            </Step>
            <Step n={2} title="Ship to">
              <div className="grid gap-3 sm:grid-cols-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={clsx(
                      "cursor-pointer rounded-surface border p-4 transition-colors",
                      shipTo === a.id
                        ? "border-ink bg-porcelain"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="shipTo"
                      value={a.id}
                      checked={shipTo === a.id}
                      onChange={() => setShipTo(a.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between text-support font-medium">
                      {a.label}
                      {shipTo === a.id && <Icon name="check" size={16} />}
                    </span>
                    <span className="mt-1 block text-meta text-mute">
                      {a.line}
                    </span>
                    <span className="mt-1 block text-meta text-ink-2">
                      {a.contact}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-meta text-mute">
                Need to split this order across locations? Set a destination per
                line from the cart — one PO, one invoice.
              </p>
            </Step>
            <Step n={3} title="Purchase details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="po"
                  label="PO number"
                  placeholder="PO-7812"
                  error={errors.po}
                />
                <div>
                  <label htmlFor="cc" className="field-label">
                    Cost centre
                  </label>
                  <select id="cc" name="cc" value={costCenterId} onChange={(e) => setCostCenterId(e.target.value)} className="field">
                    {ws.costCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="field-label">
                    Receiving notes{" "}
                    <span className="font-normal text-mute">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="field !h-auto py-3"
                    placeholder="Dock 3 · deliveries 8am–2pm"
                  />
                </div>
              </div>
            </Step>
            <Step n={4} title="Payment">
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    [
                      "invoice",
                      "Invoice · Net 30",
                      "Due Oct 25 · consolidated monthly",
                    ],
                    ["ach", "ACH transfer", "Pay on invoice via bank"],
                    ["card", "Company card", "Visa ending 4412"],
                  ] as const
                ).map(([k, t, d]) => (
                  <label
                    key={k}
                    className={clsx(
                      "cursor-pointer rounded-surface border p-4 transition-colors",
                      pay === k
                        ? "border-ink bg-porcelain"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value={k}
                      checked={pay === k}
                      onChange={() => setPay(k)}
                      className="sr-only"
                    />
                    <span className="block text-support font-medium">{t}</span>
                    <span className="mt-1 block text-meta text-mute">{d}</span>
                  </label>
                ))}
              </div>
            </Step>
          </>
        ) : (
          <>
            <Step
              n={1}
              title="Contact"
              aside={
                <span className="text-meta text-mute">No account needed</span>
              }
            >
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email}
                hint="For your receipt and live tracking. You can save your details after ordering."
              />
            </Step>
            <Step n={2} title="Delivery">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Full name"
                  autoComplete="name"
                  error={errors.name}
                  className="sm:col-span-2"
                />
                <Field
                  id="address"
                  label="Street address"
                  autoComplete="street-address"
                  placeholder="501 Folsom St, Apt 4"
                  error={errors.address}
                  className="sm:col-span-2"
                />
                <Field
                  id="city"
                  label="City"
                  autoComplete="address-level2"
                  defaultValue="San Francisco"
                  error={errors.city}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="state"
                    label="State"
                    autoComplete="address-level1"
                    defaultValue="CA"
                  />
                  <Field
                    id="zip"
                    label="ZIP"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    defaultValue="94107"
                    error={errors.zip}
                  />
                </div>
              </div>
              <fieldset className="mt-6">
                <legend className="field-label">Delivery speed</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      on: !express,
                      set: () => setExpress(false),
                      t: `Standard · ${standardShip ? fmt(standardShip, { cents: true }) : "Free"}`,
                      d: `Arrives ${deliveryLabel(slowest)}`,
                    },
                    {
                      on: express,
                      set: () => setExpress(true),
                      t: `Express · ${fmt(9.99)}`,
                      d: `Arrives ${relativeDay(addBusinessDays(todayUTC(), 1))}`,
                    },
                  ].map((o) => (
                    <label
                      key={o.t}
                      className={clsx(
                        "cursor-pointer rounded-surface border p-4 transition-colors",
                        o.on
                          ? "border-ink bg-porcelain"
                          : "border-line hover:border-line-strong",
                      )}
                    >
                      <input
                        type="radio"
                        name="speed"
                        checked={o.on}
                        onChange={o.set}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between text-support font-medium">
                        {o.t}
                        {o.on && <Icon name="check" size={16} />}
                      </span>
                      <span className="mt-1 block text-support text-ink-2">
                        {o.d}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Step>
            <Step
              n={3}
              title="Payment"
              aside={
                <span className="flex items-center gap-1.5 text-meta text-mute">
                  <Icon name="lock" size={13} /> Encrypted
                </span>
              }
            >
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="mb-5 flex gap-2"
              >
                {(
                  [
                    ["card", "Card"],
                    ["paypal", "PayPal"],
                  ] as const
                ).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={pay === k}
                    onClick={() => setPay(k)}
                    className="chip"
                    data-active={pay === k ? "true" : undefined}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {pay === "card" ? (
                <div className="grid gap-4 sm:grid-cols-4">
                  <Field
                    id="card"
                    label="Card number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    error={errors.card}
                    className="sm:col-span-2"
                  />
                  <Field
                    id="exp"
                    label="Expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    value={exp}
                    onChange={(e) => setExp(formatExp(e.target.value))}
                    error={errors.exp}
                  />
                  <Field
                    id="cvc"
                    label="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    error={errors.cvc}
                  />
                </div>
              ) : (
                <p className="rounded-surface bg-porcelain p-4 text-support text-ink-2">
                  You&apos;ll confirm with PayPal after placing your order.
                  Nothing is charged until then.
                </p>
              )}
            </Step>
          </>
        )}
      </div>

      <aside
        aria-label="Order summary"
        className="lg:sticky lg:top-[88px] lg:self-start"
      >
        <div className="rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]">
          <p className="text-emphasis font-medium tracking-[-0.02em]">
            Order summary
          </p>
          <ul className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1 thin-scroll">
            {cart.map((l) => {
              const p = productById(l.productId)!;
              const variant =
                p.variants.find((v) => v.id === l.variantId) ?? p.variants[0];
              return (
                <li key={l.key} className="flex items-center gap-3">
                  <span className="relative shrink-0">
                    <ProductImage
                      product={p}
                      variant={variant.id}
                      sizes="56px"
                      className="h-14 w-14 rounded-control"
                    />
                    <span className="num absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-meta text-white">
                      {l.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-support font-medium">
                      {p.name}
                    </span>
                    <span className="block text-meta text-mute">
                      Arrives{" "}
                      {express
                        ? relativeDay(addBusinessDays(todayUTC(), 1))
                        : deliveryLabel(p)}
                    </span>
                  </span>
                  <span className="num text-support">
                    {fmt(lineUnitPrice(l) * l.qty, { cents: true })}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-support">
            <div className="flex justify-between">
              <dt className="text-ink-2">Subtotal</dt>
              <dd className="num">{fmt(sum.subtotal, { cents: true })}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-2">Delivery</dt>
              <dd className="num">
                {shipping ? fmt(shipping, { cents: true }) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-2">
                {business ? "Tax (exemption on file)" : "Tax"}
              </dt>
              <dd className="num">{fmt(tax, { cents: true })}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3 font-medium">
              <dt className="text-body">Total</dt>
              <dd className="num text-section tracking-[-0.02em]">
                {fmt(total, { cents: true })}
              </dd>
            </div>
          </dl>
          {needsApproval && (
            <div className="mt-4 rounded-surface bg-info-soft p-4 text-support text-info">
              <p className="font-medium">Needs approval</p>
              <p className="mt-0.5">
                {decision?.kind === "approval" && (
                  <>
                    {decision.reason}. {memberName(ws.members, decision.approverId)} will be notified and can approve from email — median 42 minutes.
                  </>
                )}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={placing}
            className="btn btn-primary mt-5 w-full"
          >
            <Icon name="lock" size={16} />
            {placing
              ? "Placing…"
              : needsApproval
                ? "Submit for approval"
                : `Place order · ${fmt(total, { cents: true })}`}
          </button>
          <p className="mt-3 text-center text-meta text-mute">
            {business
              ? "Invoice issued on dispatch · PO matched automatically"
              : "You won't be charged anything beyond this total."}
          </p>
        </div>
      </aside>
    </form>
  );
}
