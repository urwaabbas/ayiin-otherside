"use client";

import type { ReactNode } from "react";

export type CardEdition = "spatial";

/**
 * Single Master Product Card System — AYIIN 2040 Spatial Language.
 * Retained for backwards compatibility; returns the master spatial system site-wide.
 */
export function CardEditionScope({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCardEdition(): CardEdition {
  return "spatial";
}
