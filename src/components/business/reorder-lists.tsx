"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { productById } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import { ProductArt } from "@/components/product/product-art";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI, type ProcurementList } from "@/lib/store";
import { fmtShort, todayUTC } from "@/lib/format";

const SCHEDULE_LABEL: Record<ProcurementList["schedule"], string> = {
  none: "Manual",
  weekly: "Every week",
  biweekly: "Every 2 weeks",
  monthly: "Every month",
};

export function listTotal(list: ProcurementList) {
  return list.items.reduce((sum, i) => {
    const p = productById(i.productId);
    return p ? sum + unitPrice(p, i.qty, { contract: true }) * i.qty : sum;
  }, 0);
}

export function nextRun(list: ProcurementList) {
  const days = { none: 0, weekly: 7, biweekly: 14, monthly: 30 }[list.schedule];
  if (!days) return null;
  const now = todayUTC().getTime();
  let t = Date.parse(list.updatedAt);
  while (t <= now) t += days * 86_400_000;
  return fmtShort(new Date(t));
}

export function ReorderLists({ limit = 3 }: { limit?: number }) {
  const { fmt } = usePrefs();
  const hydrated = useHydrated();
  const lists = useShop((s) => s.lists);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const shown = lists.slice(0, limit);

  const reorder = (l: ProcurementList) => {
    l.items.forEach((i) => addToCart(i.productId, i.variantId, i.qty, true));
    notify(`“${l.name}” added to cart`, `${l.items.length} items · ${fmt(listTotal(l), { cents: true })}`);
  };

  return (
    <div className={clsx("grid gap-4 md:grid-cols-3", !hydrated && "opacity-90")}>
      {shown.map((l) => {
        const run = nextRun(l);
        return (
          <div key={l.id} className="flex flex-col rounded-[26px] bg-white p-6 shadow-[var(--shadow-hair)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-medium leading-snug">{l.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-mute">
                  <Icon name="repeat" size={13} /> {SCHEDULE_LABEL[l.schedule]}
                  {run && <> · next {run}</>}
                </p>
              </div>
              <Link href={`/business?tab=lists&list=${l.id}`} aria-label={`Edit ${l.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-mist">
                <Icon name="more" size={18} />
              </Link>
            </div>
            <div className="mt-5 flex -space-x-2">
              {l.items.slice(0, 5).map((i) => {
                const p = productById(i.productId);
                if (!p) return null;
                return (
                  <ProductArt
                    key={i.productId}
                    kind={p.kind}
                    color={p.variants.find((v) => v.id === i.variantId)?.color ?? p.variants[0].color}
                    accent={p.variants[0].accent}
                    tint={p.tint}
                    className="h-12 w-12 rounded-xl ring-2 ring-white"
                  />
                );
              })}
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
              <div>
                <p className="text-[12px] text-mute">{l.items.length} lines · {l.items.reduce((n, i) => n + i.qty, 0)} units</p>
                <p className="num text-[20px] font-medium tracking-[-0.02em]">{fmt(listTotal(l), { cents: true })}</p>
              </div>
              <button type="button" onClick={() => reorder(l)} className="btn btn-ink btn-sm">
                <Icon name="repeat" size={15} /> Reorder
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
