"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { parseQuickOrder } from "@/lib/quick-order";
import { unitPrice, tierSavingPct } from "@/lib/commerce";
import { productBySlug } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";

const example = () =>
  [
    `${productBySlug("nitrile-gloves-4mil")!.b2b.sku}, 40`,
    "12 cases copy paper",
    "shipping cartons x 60",
    "ergonomic chair 8",
  ].join("\n");

export function QuickOrder({
  variant = "full",
  tone = "light",
  initial = "",
  className,
}: {
  variant?: "hero" | "full";
  tone?: "light" | "dark";
  /** Pre-filled lines, e.g. from an uploaded spreadsheet */
  initial?: string;
  className?: string;
}) {
  const { fmt } = usePrefs();
  const [text, setText] = useState(initial);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const lines = useMemo(() => parseQuickOrder(text), [text]);
  const matched = lines.filter((l) => l.product);
  const total = matched.reduce(
    (sum, l) => sum + unitPrice(l.product!, l.qty, { contract: true }) * l.qty,
    0,
  );
  const list = matched.reduce((sum, l) => sum + l.product!.price * l.qty, 0);
  const dark = tone === "dark";

  const addAll = () => {
    matched.forEach((l) =>
      addToCart(l.product!.id, l.product!.variants[0].id, l.qty, true),
    );
    notify(
      `${matched.length} lines added to cart`,
      `Contract & volume pricing applied · ${fmt(total, { cents: true })}`,
    );
    setText("");
  };

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-surface",
        className,
        dark
          ? "bg-graphite ring-1 ring-graphite-line"
          : "bg-white shadow-[var(--shadow-soft)] ring-1 ring-line",
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-between px-5 pt-4",
          dark ? "text-porcelain" : "",
        )}
      >
        <p className="flex items-center gap-2 text-support font-medium">
          <Icon name="bolt" size={16} className={dark ? "text-brand" : ""} />{" "}
          {variant === "hero" ? "One item per line" : "Quick order"}
        </p>
        <button
          type="button"
          onClick={() => setText(example())}
          className={clsx(
            "h-7 px-1.5 text-meta underline-offset-2 hover:underline",
            dark ? "text-mute-dark" : "text-mute",
          )}
        >
          Try an example
        </button>
      </div>
      <label htmlFor={`qo-${variant}`} className="sr-only">
        Paste SKUs or describe items, one per line
      </label>
      <textarea
        id={`qo-${variant}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={variant === "hero" ? 4 : 6}
        spellCheck={false}
        placeholder={`Paste SKUs or describe items — one per line\n${productBySlug("nitrile-gloves-4mil")!.b2b.sku}, 40\n12 cases copy paper`}
        className={clsx(
          "num block w-full resize-none bg-transparent px-5 py-3 text-support leading-[1.7] outline-none",
          dark
            ? "text-porcelain placeholder:text-mute-dark"
            : "text-ink placeholder:text-mute",
        )}
      />
      {lines.length > 0 && (
        <ul
          className={clsx(
            "max-h-[260px] overflow-y-auto border-t px-3 py-2 thin-scroll",
            dark ? "border-graphite-line" : "border-line",
          )}
        >
          {lines.map((l, i) => {
            const p = l.product;
            const unit = p ? unitPrice(p, l.qty, { contract: true }) : 0;
            return (
              <li
                key={i}
                className="flex items-center gap-3 rounded-control px-2 py-2"
              >
                {p ? (
                  <ProductImage
                    product={p}
                    sizes="40px"
                    className="h-10 w-10 shrink-0 rounded-control"
                  />
                ) : (
                  <span
                    className={clsx(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-control",
                      dark ? "bg-graphite-2" : "bg-mist",
                    )}
                  >
                    <Icon name="help" size={16} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      "truncate text-support font-medium",
                      dark ? "text-porcelain" : "",
                    )}
                  >
                    {p ? (
                      p.name
                    ) : (
                      <span className="text-danger">
                        No match for “{l.raw}”
                      </span>
                    )}
                  </p>
                  <p
                    className={clsx(
                      "truncate text-meta",
                      dark ? "text-mute-dark" : "text-mute",
                    )}
                  >
                    {p ? (
                      <>
                        {l.match === "sku"
                          ? "SKU match"
                          : "Matched by description"}{" "}
                        · {p.b2b.sku}
                        {tierSavingPct(p, unit) > 0 && (
                          <span className={dark ? "text-brand" : "text-sale"}>
                            {" "}
                            · −{tierSavingPct(p, unit)}% volume
                          </span>
                        )}
                      </>
                    ) : (
                      "Try a SKU or a simpler description"
                    )}
                  </p>
                </div>
                {p && (
                  <div
                    className={clsx(
                      "text-right text-meta",
                      dark ? "text-porcelain" : "",
                    )}
                  >
                    <p className="num font-medium">
                      {fmt(unit * l.qty, { cents: true })}
                    </p>
                    <p
                      className={clsx(
                        "num",
                        dark ? "text-mute-dark" : "text-mute",
                      )}
                    >
                      {l.qty} × {fmt(unit, { cents: true })}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div
        className={clsx(
          "flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5",
          dark ? "border-graphite-line" : "border-line",
        )}
      >
        <p className={clsx("text-meta", dark ? "text-mute-dark" : "text-mute")}>
          {matched.length ? (
            <>
              <span
                className={clsx(
                  "num text-body font-medium",
                  dark ? "text-porcelain" : "text-ink",
                )}
              >
                {fmt(total, { cents: true })}
              </span>
              {list > total && (
                <span className="num"> · saves {fmt(list - total)}</span>
              )}
            </>
          ) : (
            "SKUs, product names or spreadsheet rows all work"
          )}
        </p>
        <div className="flex gap-2">
          {variant === "hero" && (
            <Link href="/business?tab=quick" className="btn btn-secondary">
              Upload CSV
            </Link>
          )}
          <button
            type="button"
            disabled={!matched.length}
            onClick={addAll}
            className="btn btn-primary"
          >
            Add {matched.length || ""} to cart
          </button>
        </div>
      </div>
    </div>
  );
}
