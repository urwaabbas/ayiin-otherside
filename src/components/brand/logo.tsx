import { clsx } from "clsx";
import { BRAND_COLORS as C } from "@/lib/brand-colors";
 

/**
 * AYIIN — "The Aperture"
 *
 * A round-shouldered gateway whose opening forms a negative-space "A".
 * The opening is a vesica: the intersection of two arcs — buyer and seller —
 * converging on a single point. A lens bridges the two walls: the eye that
 * discovers, and the connection that closes the deal.
 */

export const SYMBOL_PATH =
  "M6 60V32A26 26 0 0 1 58 32V60Z M20 60A86.67 86.67 0 0 1 32 16A86.67 86.67 0 0 1 44 60Z";
export const LENS_PATH = "M21.9 42Q32 35.5 42.1 42Q32 48.5 21.9 42Z";

type Tone = "ink" | "porcelain" | "current";
type LensTone = "brand" | "match" | "ink" | "porcelain";

const toneColor: Record<Tone, string> = {
  ink: C.ink,
  porcelain: C.porcelain,
  current: "currentColor",
};

const lensColor = (lens: LensTone, tone: Tone) =>
  lens === "brand"
    ? C.brand
    : lens === "ink"
      ? C.ink
      : lens === "porcelain"
        ? C.porcelain
        : toneColor[tone];

export function AyiinSymbol({
  className,
  tone = "current",
  lens = "match",
  tight = false,
  title,
}: {
  className?: string;
  tone?: Tone;
  lens?: LensTone;
  tight?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox={tight ? "6 6 52 54" : "0 0 64 64"}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path fill={toneColor[tone]} fillRule="evenodd" d={SYMBOL_PATH} />
      <path fill={lensColor(lens, tone)} d={LENS_PATH} />
    </svg>
  );
}

/* Wordmark glyphs, drawn on a 100-unit x-height grid (baseline y = 100). */
function WordmarkGlyphs({ color, tittle }: { color: string; tittle: string }) {
  return (
    <g>
      {/* a — geometric single-storey */}
      <circle cx="50" cy="50" r="40.5" fill="none" stroke={color} strokeWidth="19" />
      <rect x="81" y="0" width="19" height="100" fill={color} />
      {/* y — two converging paths */}
      <path d="M109.77 0H130.23L170.23 100H149.77Z" fill={color} />
      <path d="M189.77 0H210.23L150.23 150H129.77Z" fill={color} />
      {/* ii — two stems, one shared lens: the connection */}
      <rect x="226.5" y="0" width="19" height="100" fill={color} />
      <rect x="264.5" y="0" width="19" height="100" fill={color} />
      <path d="M226.5 -28Q255 -46 283.5 -28Q255 -10 226.5 -28Z" fill={tittle} />
      {/* n */}
      <rect x="300.5" y="0" width="19" height="100" fill={color} />
      <path d="M310 50A40.5 40.5 0 0 1 391 50V100" fill="none" stroke={color} strokeWidth="19" />
    </g>
  );
}

export function AyiinWordmark({
  className,
  tone = "current",
  tittle = "match",
  title = "Ayiin",
}: {
  className?: string;
  tone?: Tone;
  tittle?: LensTone;
  title?: string;
}) {
  return (
    <svg viewBox="0 -40 401 190" className={className} role="img" aria-label={title}>
      <WordmarkGlyphs color={toneColor[tone]} tittle={lensColor(tittle, tone)} />
    </svg>
  );
}

/** Horizontal lockup: symbol + wordmark, symbol sits on the baseline. */
export function AyiinLockup({
  className,
  tone = "current",
  lens = "match",
  title = "Ayiin",
}: {
  className?: string;
  tone?: Tone;
  lens?: LensTone;
  title?: string;
}) {
  const c = toneColor[tone];
  const l = lensColor(lens, tone);
  // Symbol (52×54 tight box) scaled to 146 units tall so its base sits on the baseline.
  const s = 146 / 54;
  return (
    <svg viewBox="0 -46 588 196" className={className} role="img" aria-label={title}>
      <g transform={`translate(0 -46) scale(${s}) translate(-6 -6)`}>
        <path fill={c} fillRule="evenodd" d={SYMBOL_PATH} />
        <path fill={l} d={LENS_PATH} />
      </g>
      <g transform="translate(187 0)">
        <WordmarkGlyphs color={c} tittle={c} />
      </g>
    </svg>
  );
}

/** Compact app icon — the symbol inside a continuous-curvature tile. */
export function AyiinAppIcon({
  className,
  variant = "ink",
  title,
}: {
  className?: string;
  variant?: "ink" | "brand" | "porcelain";
  title?: string;
}) {
  const bg = { ink: C.ink, brand: C.brand, porcelain: C.porcelain }[variant];
  const fg = variant === "ink" ? C.porcelain : C.ink;
  const lens = variant === "ink" ? C.brand : C.ink;
  return (
    <svg
      viewBox="0 0 64 64"
      className={clsx(className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fill={bg}
        d="M32 0C51.2 0 57.6 0 60.8 3.2S64 12.8 64 32s0 25.6-3.2 28.8S51.2 64 32 64 6.4 64 3.2 60.8 0 51.2 0 32 0 6.4 3.2 3.2 12.8 0 32 0Z"
      />
      <g transform="translate(32 33.5) scale(0.62) translate(-32 -33)">
        <path fill={fg} fillRule="evenodd" d={SYMBOL_PATH} />
        <path fill={lens} d={LENS_PATH} />
      </g>
    </svg>
  );
}
