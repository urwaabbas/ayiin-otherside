"use client";

import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { focalPosition, picAttrs, type PdpPhoto } from "@/lib/pdp";
import { Icon } from "@/components/ui/icon";

/** The first photograph is big (2 × 2); the rest fill a 3-column grid with no gaps (6 or 9 photographs). */

/**
 * Every photograph of the product in one grid; any of them opens full screen, with arrow keys, swipe and
 * the photographer's credit.
 */
export function GalleryGrid({ photos, name }: { photos: PdpPhoto[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const shown = photos.slice(0, photos.length >= 9 ? 9 : 6);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open != null && !el.open) el.showModal();
    if (open == null && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open != null ? photos[open] : null;
  const big = current ? picAttrs(current, [900, 1400, 2000]) : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:auto-rows-[260px]">
        {shown.map((ph, i) => {
          const { src, srcSet } = picAttrs(ph, [480, 800, 1200]);
          return (
            <button
              key={ph.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}, ${name}`}
              className={clsx(
                "group relative overflow-hidden rounded-[22px] bg-mist md:aspect-auto",
                i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2" : "aspect-[4/5]",
                // on two columns an odd count of small photos would leave a hole
                i === shown.length - 1 && (shown.length - 1) % 2 === 1 && "max-md:hidden",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                srcSet={srcSet}
                sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: focalPosition(ph) }}
              />
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        onClose={close}
        onClick={(e) => e.target === dialog.current && close()}
        aria-label={`${name} photographs`}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/92"
      >
        {current && big && (
          <div
            className="relative flex h-full w-full items-center justify-center p-4 sm:p-10"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current == null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touch.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={big.src} srcSet={big.srcSet} sizes="100vw" alt={`${name}, photo ${open! + 1} of ${photos.length}`} className="max-h-full max-w-full rounded-[18px] object-contain" />
            <div className="absolute bottom-4 left-0 right-0 text-center text-meta text-white/70">
              {open! + 1} / {photos.length} · Photo{" "}
              <a href={current.profile} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">@{current.by}</a> on Unsplash
            </div>
            <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25">
              <Icon name="close" size={20} />
            </button>
            {photos.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25">
                  <Icon name="chevronLeft" size={22} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25">
                  <Icon name="chevronRight" size={22} />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
