"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductArt } from "@/components/product/product-art";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";

export function Bundle({ items }: { items: Product[] }) {
  const { fmt } = usePrefs();
  const [on, setOn] = useState(items.map(() => true));
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const chosen = items.filter((_, i) => on[i]);
  const total = chosen.reduce((s, p) => s + p.price, 0);

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-hair)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <ul className="flex flex-1 flex-wrap items-center gap-3">
          {items.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              {i > 0 && <Icon name="plus" size={18} className="text-mute" />}
              <label className={clsx("group relative block w-[132px] cursor-pointer transition-opacity sm:w-[160px]", !on[i] && "opacity-45")}>
                <input
                  type="checkbox"
                  checked={on[i]}
                  disabled={i === 0}
                  onChange={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
                  className="absolute right-2 top-2 z-10 h-5 w-5 accent-ink"
                  aria-label={`Include ${p.name}`}
                />
                <ProductArt kind={p.kind} color={p.variants[0].color} accent={p.variants[0].accent} tint={p.tint} className="aspect-square w-full rounded-2xl" />
                <span className="mt-2 block truncate text-[13px] font-medium">{i === 0 ? "This item" : <Link href={`/p/${p.slug}`} className="hover:underline">{p.name}</Link>}</span>
                <span className="num text-[13px] text-mute">{fmt(p.price)}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="shrink-0 lg:w-[240px]">
          <p className="text-[13px] text-mute">Total for {chosen.length} items</p>
          <p className="num text-[30px] font-medium tracking-[-0.03em]">{fmt(total, { cents: !Number.isInteger(total) })}</p>
          <p className="text-[12.5px] text-mute">Ships together · one delivery date</p>
          <button
            type="button"
            onClick={() => {
              chosen.forEach((p) => addToCart(p.id, p.variants[0].id, 1));
              notify(`${chosen.length} items added to bag`, "Delivered together");
            }}
            className="btn btn-ink mt-4 w-full"
          >
            Add {chosen.length} to bag
          </button>
        </div>
      </div>
    </div>
  );
}
