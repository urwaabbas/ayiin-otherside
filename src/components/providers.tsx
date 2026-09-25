"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import type { Mode } from "@/lib/types";
import { money, type Currency } from "@/lib/format";
import { CURRENCY_COOKIE, MODE_COOKIE, type Prefs } from "@/lib/prefs";
import { useShop } from "@/lib/store";

type PrefsCtx = Prefs & {
  setMode: (m: Mode) => void;
  setCurrency: (c: Currency) => void;
  switching: boolean;
  fmt: (usd: number, opts?: { cents?: boolean }) => string;
};

const Ctx = createContext<PrefsCtx | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function Providers({ initial, children }: { initial: Prefs; children: React.ReactNode }) {
  const router = useRouter();
  const [mode, setModeState] = useState<Mode>(initial.mode);
  const [currency, setCurrencyState] = useState<Currency>(initial.currency);
  const [switching, startTransition] = useTransition();

  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const setMode = useCallback(
    (m: Mode) => {
      if (m === mode) return;
      writeCookie(MODE_COOKIE, m);
      const apply = () => {
        flushSync(() => setModeState(m));
      };
      const doc = document as ViewTransitionDoc;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (doc.startViewTransition && !reduce) doc.startViewTransition(apply);
      else apply();
      startTransition(() => router.refresh());
    },
    [mode, router],
  );

  const setCurrency = useCallback(
    (c: Currency) => {
      writeCookie(CURRENCY_COOKIE, c);
      setCurrencyState(c);
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo<PrefsCtx>(
    () => ({ mode, currency, setMode, setCurrency, switching, fmt: (usd, opts) => money(usd, currency, opts) }),
    [mode, currency, setMode, setCurrency, switching],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs must be used inside <Providers>");
  return v;
}

export const useMode = () => usePrefs().mode;
