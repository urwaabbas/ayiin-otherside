"use client";

import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { useHydrated, useShop } from "@/lib/store";
import { addBusinessDays, fmtDay, todayUTC } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";

export function TrackView() {
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const orders = useShop((s) => s.orders);
  const [id, setId] = useState(sp.get("order") ?? "");
  const [lookup, setLookup] = useState(sp.get("order") ?? "");
  const [error, setError] = useState("");
  const found =
    hydrated && lookup
      ? orders.find((o) => o.id.toLowerCase() === lookup.toLowerCase())
      : undefined;
  const demo = lookup && !found && /^AY-\d{6}$/i.test(lookup);
  const t = todayUTC();

  const steps = [
    { label: "Order confirmed", when: fmtDay(t), done: true },
    { label: "Packed at Portland, OR", when: fmtDay(t), done: !!demo },
    {
      label: "In transit — Sacramento hub",
      when: fmtDay(addBusinessDays(t, 1)),
      done: false,
      live: !!demo,
    },
    {
      label: "Out for delivery",
      when: fmtDay(addBusinessDays(t, 2)),
      done: false,
    },
    {
      label: "Delivered",
      when: `${fmtDay(addBusinessDays(t, 2))} · by 8pm`,
      done: false,
    },
  ];

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^AY-\d{6}$/i.test(id.trim())) {
            setError(
              "Order numbers look like AY-123456 — it's in your confirmation email.",
            );
            return;
          }
          setError("");
          setLookup(id.trim().toUpperCase());
        }}
        className="self-start rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]"
      >
        <label htmlFor="order" className="field-label">
          Order number
        </label>
        <input
          id="order"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="AY-123456"
          className="field num"
          aria-invalid={!!error}
          aria-describedby={error ? "order-err" : undefined}
        />
        {error && (
          <p id="order-err" className="mt-1.5 text-meta text-danger">
            {error}
          </p>
        )}
        <label htmlFor="track-email" className="field-label mt-4">
          Email or ZIP
        </label>
        <input
          id="track-email"
          placeholder="you@example.com"
          className="field"
        />
        <button type="submit" className="btn btn-primary mt-5 w-full">
          Track
        </button>
        <p className="mt-4 text-meta text-mute">
          No account needed. Every order also gets a live tracking link by email
          and SMS.
        </p>
      </form>

      <div>
        {!lookup ? (
          <div className="grid h-full min-h-[320px] place-items-center rounded-surface border border-dashed border-line-strong p-10 text-center text-body text-mute">
            Enter an order number to see exactly where it is.
          </div>
        ) : (
          <div className="rounded-surface bg-white p-6 shadow-[var(--shadow-hair)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="num text-support text-mute">{lookup}</p>
                <p className="display mt-1 text-display-sm">
                  {found
                    ? found.status === "awaiting-approval"
                      ? "Awaiting approval"
                      : "Confirmed"
                    : "Arriving " + fmtDay(addBusinessDays(t, 2))}
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-support font-medium">
                <SignalDot live /> On schedule
              </span>
            </div>
            <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-soft">
              <div
                className={clsx(
                  "h-full rounded-full bg-ink transition-[width] duration-1000",
                  demo ? "w-[55%]" : "w-[18%]",
                )}
              />
            </div>
            <ol className="mt-8 space-y-5">
              {steps.map((s) => (
                <li key={s.label} className="flex items-start gap-4">
                  <span
                    className={clsx(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      s.done
                        ? "bg-ink text-brand"
                        : s.live
                          ? "bg-brand shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                          : "border border-line-strong",
                    )}
                  >
                    {s.done && (
                      <Icon name="check" size={12} strokeWidth={2.6} />
                    )}
                  </span>
                  <div className="flex-1">
                    <p
                      className={clsx(
                        "text-body",
                        s.done || s.live ? "font-medium" : "text-ink-2",
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="text-support text-mute">{s.when}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
              {[
                ["returns", "Start a return"],
                ["chat", "Message the seller"],
                ["pin", "Change delivery"],
              ].map(([icon, label]) => (
                <button key={label} type="button" className="btn btn-secondary">
                  <Icon name={icon as "returns"} size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
