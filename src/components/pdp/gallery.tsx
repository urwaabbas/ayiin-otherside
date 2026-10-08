"use client";

import { clsx } from "clsx";
import { useId, useRef, useState } from "react";
import type { Product, Variant } from "@/lib/types";
import { productPhoto, productViews, type ImageView } from "@/lib/images";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";

/**
 * Product gallery: view thumbnails, a main stage (no hover zoom; click opens the full-screen viewer),
 * swipe between views on touch, and a full-screen viewer.
 */
export function ProductGallery({ product: p, variant, overlay }: { product: Product; variant: Variant; overlay?: React.ReactNode }) {
  const views = productViews(p, variant.id);
  const [picked, setView] = useState<ImageView>("hero");
  // Colourways can have different views; fall back to the front view when the picked one is missing.
  const view = views.some((v) => v.id === picked) ? picked : "hero";
  const photo = productPhoto(p, variant.id, view);
  const single = views.length < 2;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipe = useRef<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const index = views.findIndex((v) => v.id === view);
  const current = views[index];
  const alt = `${p.name} in ${variant.name} — ${current.label.toLowerCase()} view`;

  const go = (step: number, focus = false) => {
    const n = (index + step + views.length) % views.length;
    setView(views[n].id);
    if (focus) tabs.current[n]?.focus();
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (keys[e.key]) {
      e.preventDefault();
      go(keys[e.key], true);
    }
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div role="tablist" aria-label="Product views" className={clsx("scroll-x -m-1 flex gap-2 p-1 sm:flex-col", single && "hidden")} onKeyDown={onTabKey}>
        {views.map((vw, n) => (
          <button
            key={vw.id}
            ref={(el) => {
              tabs.current[n] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${vw.id}`}
            aria-controls={`${id}-panel`}
            aria-selected={view === vw.id}
            tabIndex={view === vw.id ? 0 : -1}
            aria-label={vw.label}
            onClick={() => setView(vw.id)}
            className={clsx(
              "w-[72px] shrink-0 overflow-hidden rounded-surface ring-offset-2 ring-offset-porcelain transition-shadow sm:w-[84px]",
              view === vw.id ? "ring-[1.5px] ring-ink" : "ring-1 ring-line hover:ring-line-strong",
            )}
          >
            <ProductImage product={p} variant={variant.id} view={vw.id} sizes="84px" className="aspect-square w-full" />
          </button>
        ))}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${view}`}
        className="group/stage relative flex-1 touch-pan-y overflow-hidden rounded-surface bg-white"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipe.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipe.current == null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <div
          className="relative aspect-square w-full cursor-pointer"
          onClick={() => dialogRef.current?.showModal()}
        >
          <ProductImage
            key={`${variant.id}-${view}`}
            product={p}
            variant={variant.id}
            view={view}
            preload={view === "hero"}
            alt={alt}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full animate-fade"
          />
        </div>
        {overlay}
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label="Open full-screen viewer"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-hair)] backdrop-blur transition-transform hover:scale-105"
        >
          <Icon name="expand" size={17} />
        </button>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">

          <div className={clsx("flex gap-1.5 sm:hidden", single && "hidden")} aria-hidden>
            {views.map((vw) => (
              <span key={vw.id} className={clsx("h-1.5 rounded-full transition-all", vw.id === view ? "w-5 bg-ink" : "w-1.5 bg-ink/25")} />
            ))}
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${p.name} images`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-porcelain p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm open:animate-fade"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <p className="min-w-0 truncate text-support font-medium">
              {p.name} <span className="text-mute">· {variant.name} · {current.label}</span>
            </p>
            <form method="dialog">
              <button type="submit" aria-label="Close viewer" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)]">
                <Icon name="close" size={18} />
              </button>
            </form>
          </div>
          <div className="relative mx-auto min-h-0 w-full max-w-[min(100%,calc(100dvh-180px))] flex-1 px-5 sm:px-8">
            <div className="relative mx-auto aspect-square max-h-full w-full overflow-hidden rounded-surface">
              <ProductImage key={`${variant.id}-${view}-lb`} product={p} variant={variant.id} view={view} alt={alt} sizes="100vw" className="h-full w-full animate-fade" />
            </div>
            <button type="button" onClick={() => go(-1)} aria-label="Previous view" hidden={single} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)] sm:left-4">
              <Icon name="chevronLeft" size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next view" hidden={single} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)] sm:right-4">
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
          <div className={clsx("flex justify-center gap-2 px-5 py-5", single && "invisible")}>
            {views.map((vw) => (
              <button
                key={vw.id}
                type="button"
                aria-label={vw.label}
                aria-pressed={vw.id === view}
                onClick={() => setView(vw.id)}
                className={clsx("w-16 overflow-hidden rounded-control transition-shadow", vw.id === view ? "ring-[1.5px] ring-ink" : "ring-1 ring-line")}
              >
                <ProductImage product={p} variant={variant.id} view={vw.id} sizes="64px" className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
}
