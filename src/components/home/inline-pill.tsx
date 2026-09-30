"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";

/** An image capsule set into display type — a recurring Ayiin editorial device. */
export function InlinePill({ items, className, interval = 2600 }: { items: Product[]; className?: string; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items.length, interval]);
  return (
    <span
      aria-hidden
      className={clsx(
        "relative inline-block h-[0.74em] w-[1.42em] overflow-hidden rounded-full align-[-0.02em] shadow-[inset_0_0_0_1px_rgb(var(--rgb-ink)/0.06)]",
        className,
      )}
    >
      {items.map((p, n) => (
        <ProductImage
          key={p.id}
          product={p}
          sizes="220px"
          zoom={1.35}
          className={clsx(
            "absolute inset-0 h-full w-full transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)]",
            n === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
          )}
        />
      ))}
    </span>
  );
}
