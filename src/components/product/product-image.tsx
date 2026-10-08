"use client";

import Image, { type ImageLoader } from "next/image";
import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { photoFullUrl, photoUrl, productImageSrc, productPhoto, type ImageView } from "@/lib/images";
import { AyiinMark } from "@/components/brand/ayiin-logo";

type Props = {
  product: Pick<Product, "slug" | "variants" | "tint" | "name">;
  variant?: string;
  view?: ImageView;
  /** Rendered width hint for the responsive srcset, e.g. "56px" or "(min-width: 1024px) 25vw, 50vw" */
  sizes?: string;
  preload?: boolean;
  /** Describe the image when it is not decorative. Defaults to decorative (empty alt). */
  alt?: string;
  /** Zoom in on the product (for tiny pills and avatars) */
  zoom?: number;
  /** Fade the frame's edges so the render floats on a matching surface */
  feather?: boolean;
  /** Frame height ÷ width. Photography is cropped to it at the CDN (1.25 = 4:5 portrait); default square. */
  ratio?: number;
  /** Show the whole original and frame it with CSS around the photo's focal point, instead of asking the CDN for a crop. One stable image for any box shape. */
  focal?: boolean;
  /** No backdrop colour or shimmer — for layers stacked over a frame that already has them */
  bare?: boolean;
  /** Called once the image has decoded */
  onLoaded?: () => void;
  /** Called if the image cannot be loaded */
  onFailed?: () => void;
  className?: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
};

/**
 * Editorial Product Image Component.
 * Curated high-resolution photography is served from Unsplash CDN,
 * cropped around the photo's focal point at each srcset width.
 * Transitions smoothly without muddy blurs, keeping fashion fabric and details crisp.
 */
export function ProductImage({
  product: p,
  variant,
  view = "hero",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  preload,
  alt = "",
  zoom,
  feather,
  ratio = 1,
  focal,
  bare,
  onLoaded,
  onFailed,
  className,
  imgClassName,
  imgStyle,
}: Props) {
  const photo = productPhoto(p, variant, view) ?? productPhoto(p, variant, "hero");
  const src = photo ? photo.src : productImageSrc(p, variant, view);
  const loader: ImageLoader | undefined = photo
    ? ({ width, quality }) => (focal ? photoFullUrl(photo, Math.min(1800, Math.round(width * 1.6)), quality ?? 82) : photoUrl(photo, width, quality ?? 82, ratio))
    : undefined;

  const [settled, setSettled] = useState<{ src: string; ok: boolean } | null>(null);
  const loaded = settled?.src === src && settled.ok;
  const failed = settled?.src === src && !settled.ok;

  const settleIfLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) setSettled({ src, ok: true });
    },
    [src],
  );

  useEffect(() => {
    if (loaded) onLoaded?.();
  }, [loaded, onLoaded]);

  useEffect(() => {
    if (failed) onFailed?.();
  }, [failed, onFailed]);

  const positioned = /(^|\s)!?(absolute|fixed)(\s|$)/.test(className ?? "");

  return (
    <span
      className={clsx(
        "block overflow-hidden",
        !positioned && "relative",
        !bare && !loaded && !failed && "shimmer",
        feather && "[mask-image:radial-gradient(closest-side,#000_62%,transparent)]",
        className,
      )}
      style={bare ? undefined : { backgroundColor: photo?.color ?? p.tint }}
    >
      <Image
        ref={settleIfLoaded}
        src={src}
        loader={loader}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        draggable={false}
        onLoad={() => setSettled({ src, ok: true })}
        onError={() => setSettled({ src, ok: false })}
        style={{
          ...(focal && photo ? { objectPosition: `${(photo.fp?.[0] ?? 0.5) * 100}% ${(photo.fp?.[1] ?? 0.5) * 100}%` } : null),
          ...(zoom ? { transform: `scale(${zoom})` } : null),
          ...imgStyle,
        }}
        className={clsx(
          "object-cover transition-opacity duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
      {failed && !bare && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <AyiinMark className="h-[14%] max-h-8 min-h-3 opacity-25 grayscale" />
        </span>
      )}
    </span>
  );
}
