"use client";

import Image, { type ImageLoader } from "next/image";
import { clsx } from "clsx";
import { useCallback, useState } from "react";
import type { Product } from "@/lib/types";
import { photoUrl, productImageSrc, productPhoto, type ImageView } from "@/lib/images";
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
  className?: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
};

/**
 * A product image. Curated photography is served straight from the Unsplash CDN (their API terms
 * ask for hotlinking), cropped square around the photo's focal point at each srcset width; products
 * without photography use their studio render. Shows a tinted shimmer until the image has decoded,
 * then fades it in. The frame takes the image's dominant colour, so edges blend while it loads.
 */
export function ProductImage({ product: p, variant, view = "hero", sizes = "(min-width: 1024px) 25vw, 50vw", preload, alt = "", zoom, feather, className, imgClassName, imgStyle }: Props) {
  const photo = productPhoto(p, variant, view) ?? productPhoto(p, variant, "hero");
  const src = photo ? photo.src : productImageSrc(p, variant, view);
  const loader: ImageLoader | undefined = photo ? ({ width, quality }) => photoUrl(photo, width, quality ?? 75) : undefined;
  const [settled, setSettled] = useState<{ src: string; ok: boolean } | null>(null);
  const loaded = settled?.src === src && settled.ok;
  const failed = settled?.src === src && !settled.ok;
  // A fast CDN can finish loading before hydration, so the load event is missed; catch that on mount.
  const settleIfLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) setSettled({ src, ok: true });
    },
    [src],
  );
  const positioned = /(^|\s)!?(absolute|fixed)(\s|$)/.test(className ?? "");
  return (
    <span
      className={clsx("block overflow-hidden", !positioned && "relative", !loaded && !failed && "shimmer", feather && "[mask-image:radial-gradient(closest-side,#000_62%,transparent)]", className)}
      style={{ backgroundColor: photo?.color ?? p.tint }}
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
        style={zoom ? { transform: `scale(${zoom})`, ...imgStyle } : imgStyle}
        className={clsx(
          "object-cover transition-[opacity,filter] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
          imgClassName,
        )}
      />
      {failed && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <AyiinMark className="h-[14%] max-h-8 min-h-3 opacity-25 grayscale" />
        </span>
      )}
    </span>
  );
}
