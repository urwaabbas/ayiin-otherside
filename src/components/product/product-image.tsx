"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { productImageSrc, type ImageView } from "@/lib/images";
import { AyiinSymbol } from "@/components/brand/logo";

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
 * Photographic studio render of a product. Shows a tinted shimmer until the image has decoded,
 * then fades it in. The frame takes the product's studio tint, so edges blend seamlessly.
 */
export function ProductImage({ product: p, variant, view = "hero", sizes = "(min-width: 1024px) 25vw, 50vw", preload, alt = "", zoom, feather, className, imgClassName, imgStyle }: Props) {
  const src = productImageSrc(p, variant, view);
  const [settled, setSettled] = useState<{ src: string; ok: boolean } | null>(null);
  const loaded = settled?.src === src && settled.ok;
  const failed = settled?.src === src && !settled.ok;
  const positioned = /(^|\s)!?(absolute|fixed)(\s|$)/.test(className ?? "");
  return (
    <span
      className={clsx("block overflow-hidden", !positioned && "relative", !loaded && !failed && "shimmer", feather && "[mask-image:radial-gradient(closest-side,#000_62%,transparent)]", className)}
      style={{ backgroundColor: p.tint }}
    >
      <Image
        src={src}
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
          <AyiinSymbol tone="ink" lens="ink" tight className="h-[14%] max-h-8 min-h-3 opacity-15" />
        </span>
      )}
    </span>
  );
}
