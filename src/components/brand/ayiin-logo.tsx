import Image from "next/image";
import { clsx } from "clsx";

/**
 * AyiinLogo — the supplied logo artwork.
 * `on="light"` has dark lettering for light surfaces (navbar);
 * `on="dark"` has white lettering for ink surfaces (footer).
 * Size it by height only; width follows the 2.29:1 artwork.
 */
export const LOGO_SRC = {
  light: "/brand/ayiin-logo-on-light.svg",
  dark: "/brand/ayiin-logo-on-dark.svg",
} as const;

export function AyiinLogo({
  on = "light",
  className,
  priority,
}: {
  on?: keyof typeof LOGO_SRC;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC[on]}
      alt="Ayiin"
      width={229}
      height={100}
      unoptimized
      priority={priority}
      className={clsx("block w-auto object-contain", className)}
    />
  );
}

/** The logo's "A" on its own — for square or tiny spaces (badges, placeholders). Size it by height; ratio 0.71:1. */
export function AyiinMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/ayiin-mark.svg"
      alt=""
      aria-hidden
      width={45}
      height={63}
      unoptimized
      className={clsx("block w-auto object-contain", className)}
    />
  );
}
