"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";

export function Toast() {
  const toast = useUI((s) => s.toast);
  const dismiss = useUI((s) => s.dismissToast);
  const openCart = useUI((s) => s.openCart);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 4200);
    return () => clearTimeout(t);
  }, [toast, dismiss]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[80] flex justify-center px-4 lg:bottom-8">
      {toast && (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto flex w-full max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink py-3 pl-3 pr-2 text-porcelain shadow-[var(--shadow-float)]",
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-ink">
            <Icon name="check" size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">{toast.title}</p>
            {toast.body && <p className="truncate text-[12.5px] text-mute-dark">{toast.body}</p>}
          </div>
          {toast.action ? (
            <Link href={toast.action.href} onClick={dismiss} className="rounded-xl px-3 py-2 text-[13px] font-medium text-brand hover:bg-graphite">
              {toast.action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                dismiss();
                openCart();
              }}
              className="rounded-xl px-3 py-2 text-[13px] font-medium text-brand hover:bg-graphite"
            >
              View bag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
