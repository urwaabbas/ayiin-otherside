"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/store";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/icon";
import { EASE } from "@/components/motion/primitives";

/* ─── Page header for each console view ─── */

export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="biz-deck flex flex-wrap items-end justify-between gap-x-8 gap-y-5 p-6 sm:p-8"
    >
      <div className="min-w-0 max-w-2xl">
        <p className="eyebrow flex items-center gap-2.5 !text-mute-dark">
          <span className="biz-live" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="display mt-3 text-heading sm:text-display-sm">{title}</h1>
        {description && <p className="mt-3 text-body leading-relaxed text-mute-dark">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

/* ─── Surfaces ─── */

export function Panel({
  title,
  meta,
  action,
  children,
  className,
  flush,
}: {
  title?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** No inner padding below the header — for edge-to-edge tables */
  flush?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={clsx("rounded-surface bg-white shadow-[var(--shadow-hair)]", className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="truncate text-body font-medium tracking-[-0.01em]">{title}</h2>}
            {meta && <p className="mt-0.5 truncate text-meta text-mute">{meta}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={flush ? "" : "p-5 sm:p-6"}>{children}</div>
    </motion.section>
  );
}

export function TextAction({ onClick, children, href }: { onClick?: () => void; children: React.ReactNode; href?: string }) {
  const cls = "inline-flex items-center gap-1 text-support font-medium text-ink-2 hover:text-ink";
  if (href)
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ─── Figures ─── */

export function Stat({
  label,
  value,
  foot,
  tone,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  foot?: React.ReactNode;
  tone?: "ink" | "alert";
  onClick?: () => void;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.25, ease: EASE }}
      className={clsx(
        "group flex flex-col rounded-surface p-5 text-left transition-shadow",
        tone === "ink" ? "panel-ink" : "bg-white shadow-[var(--shadow-hair)]",
        onClick && "hover:shadow-[var(--shadow-soft)]",
      )}
    >
      <span className={clsx("flex items-center justify-between text-support", tone === "ink" ? "text-mute-dark" : "text-mute")}>
        {label}
        {onClick && <Icon name="arrowUpRight" size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />}
      </span>
      <span className="mt-2 text-heading font-semibold tracking-[-0.03em] tabular-nums">{value}</span>
      {foot && (
        <span className={clsx("mt-1 text-meta", tone === "ink" ? "text-mute-dark" : tone === "alert" ? "text-danger" : "text-ink-2")}>{foot}</span>
      )}
    </Tag>
  );
}

/** Horizontal meter. `mark` draws a pacing tick (e.g. how far through the quarter we are). */
export function Meter({ value, max, mark, tone = "ink", className }: { value: number; max: number; mark?: number; tone?: "ink" | "brand" | "dark"; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max;
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={clsx("relative h-2 overflow-hidden rounded-full", tone === "dark" ? "bg-graphite-2" : "bg-mist", className)}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]",
          over ? "bg-danger" : tone === "brand" || tone === "dark" ? "bg-brand-gradient" : "bg-ink",
        )}
        style={{ width: `${pct}%` }}
      />
      {mark != null && (
        <span
          aria-hidden
          className={clsx("absolute inset-y-0 w-0.5", tone === "dark" ? "bg-porcelain/70" : "bg-ink/40")}
          style={{ left: `${Math.min(100, mark * 100)}%` }}
        />
      )}
    </div>
  );
}

/* ─── Labels ─── */

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "ink";

const BADGE: Record<BadgeTone, string> = {
  neutral: "bg-mist text-ink-2",
  brand: "bg-brand-soft text-brand-deep",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  ink: "bg-ink text-porcelain",
};

export function Badge({ tone = "neutral", children, dot, className }: { tone?: BadgeTone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={clsx("inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-meta font-medium", BADGE[tone], className)}>
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Avatar({ initials, size = 36, tone = "soft" }: { initials: string; size?: number; tone?: "soft" | "ink" | "brand" }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "grid shrink-0 place-items-center rounded-full font-mono font-medium",
        tone === "ink" ? "bg-ink text-porcelain" : tone === "brand" ? "bg-brand text-ink" : "bg-soft text-ink-2",
      )}
      style={{ width: size, height: size, fontSize: size < 32 ? 10 : 11 }}
    >
      {initials}
    </span>
  );
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-surface bg-mist text-ink-2">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-4 text-body font-medium">{title}</p>
      {body && <p className="mt-1 max-w-sm text-support text-mute">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── Table helpers: one consistent rhythm everywhere ─── */

export const th = "px-4 py-3 text-left text-meta font-normal text-mute first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";
export const td = "px-4 py-3.5 align-middle first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";

/* ─── Side drawer for record detail ─── */

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useHydrated();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!mounted || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade bg-ink/40 backdrop-blur-[2px]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-porcelain shadow-[var(--shadow-float)] outline-none [animation:drawer-in_420ms_var(--ease-out-expo)_both]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-5">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className="mt-1.5 text-section font-medium tracking-[-0.02em]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-mist">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-line bg-white px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ─── Segmented filter ─── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="scroll-x inline-flex max-w-full gap-1 rounded-full bg-mist p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-support transition-colors",
            value === o.value ? "bg-white font-medium text-ink shadow-[var(--shadow-hair)]" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
          {o.count != null && <span className="num text-meta text-mute">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ─── Clock that only runs on the client, for live states ─── */

function subscribeClock(onTick: () => void) {
  const t = setInterval(onTick, 1000);
  return () => clearInterval(t);
}

/** Current time to the second on the client; 0 during server render. */
export function useNow() {
  return useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / 1000) * 1000, () => 0);
}

/** Download a CSV built in the browser. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
