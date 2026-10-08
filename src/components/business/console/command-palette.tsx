"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { productById } from "@/lib/catalog/products";
import { sellers } from "@/lib/catalog/sellers";
import { useWorkspace } from "@/lib/b2b/workspace";
import { useHydrated } from "@/lib/store";
import { Icon, type IconName } from "@/components/ui/icon";
import { EASE } from "@/components/motion/primitives";

type Item = { id: string; group: string; icon: IconName; title: string; hint?: string; tab: string; extra?: string };

/** Every view of the console, so any of them is one keystroke away. */
const VIEWS: Item[] = [
  { id: "v-overview", group: "Go to", icon: "grid", title: "Overview", tab: "overview" },
  { id: "v-quick", group: "Go to", icon: "bolt", title: "Quick order", hint: "Paste SKUs or a spreadsheet", tab: "quick" },
  { id: "v-lists", group: "Go to", icon: "repeat", title: "Lists & reorders", tab: "lists" },
  { id: "v-quotes", group: "Go to", icon: "file", title: "Quotes", hint: "Request and compare", tab: "quotes" },
  { id: "v-orders", group: "Go to", icon: "box", title: "Orders", tab: "orders" },
  { id: "v-invoices", group: "Go to", icon: "receipt", title: "Invoices", tab: "invoices" },
  { id: "v-spend", group: "Go to", icon: "trend", title: "Spend", tab: "spend" },
  { id: "v-approvals", group: "Go to", icon: "approve", title: "Approvals", tab: "approvals" },
  { id: "v-budgets", group: "Go to", icon: "wallet", title: "Budgets", tab: "budgets" },
  { id: "v-team", group: "Go to", icon: "users", title: "Team", tab: "team" },
  { id: "v-addresses", group: "Go to", icon: "pin", title: "Locations", tab: "addresses" },
];

/**
 * Jump-to bar for the console. Opens from the button or the "J" key, searches the console's views
 * and the company's own records — purchase orders, invoices, quote requests, requests, people —
 * and takes you straight to the record.
 */
export function CommandPalette({ open, onClose, go }: { open: boolean; onClose: () => void; go: (tab: string, extra?: string) => void }) {
  const mounted = useHydrated();
  const ws = useWorkspace();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const records = useMemo<Item[]>(() => {
    const seller = (id: string) => sellers.find((s) => s.id === id)?.name ?? id;
    return [
      ...ws.pos.map((p) => ({
        id: p.id,
        group: "Orders",
        icon: "box" as IconName,
        title: p.id,
        hint: `${productById(p.lines[0]?.productId ?? "")?.name ?? "Order"}${p.lines.length > 1 ? ` +${p.lines.length - 1}` : ""} · ${p.sellerIds.map(seller).join(", ")}`,
        tab: "orders",
        extra: `&po=${p.id}`,
      })),
      ...ws.invoices.map((i) => ({ id: i.id, group: "Invoices", icon: "receipt" as IconName, title: i.id, hint: `${seller(i.sellerId)} · ${i.status}`, tab: "invoices" })),
      ...ws.rfqs.map((r) => ({
        id: r.id,
        group: "Quotes",
        icon: "file" as IconName,
        title: r.id,
        hint: `${r.qty.toLocaleString("en-US")} × ${productById(r.productId)?.name ?? "item"} · ${r.status}`,
        tab: "quotes",
        extra: `&rfq=${r.id}`,
      })),
      ...ws.requisitions.map((r) => ({ id: r.id, group: "Requests", icon: "approve" as IconName, title: r.id, hint: `${r.title} · ${r.status}`, tab: "approvals" })),
      ...ws.members.map((m) => ({ id: m.id, group: "People", icon: "users" as IconName, title: m.name, hint: `${m.role} · ${m.title}`, tab: "team" })),
    ];
  }, [ws.pos, ws.invoices, ws.rfqs, ws.requisitions, ws.members]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return VIEWS;
    return [...VIEWS, ...records].filter((i) => `${i.title} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(term)).slice(0, 24);
  }, [q, records]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => input.current?.focus(), 30);
    return () => {
      document.body.style.overflow = overflow;
      window.clearTimeout(t);
    };
  }, [open]);

  const pick = (item: Item | undefined) => {
    if (!item) return;
    go(item.tab, item.extra);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (cursor + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % Math.max(1, shown.length);
      setCursor(next);
      list.current?.querySelector<HTMLElement>(`[data-i="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(shown[cursor]);
    }
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Jump to"
            onKeyDown={onKey}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="biz-deck relative w-full max-w-[640px] !overflow-visible"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Icon name="search" size={18} className="text-mute-dark" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                placeholder="Jump to a view, PO, invoice, quote or person…"
                aria-label="Jump to"
                className="h-14 flex-1 bg-transparent text-body text-porcelain outline-none placeholder:text-mute-dark"
              />
              <kbd className="num rounded-compact bg-white/10 px-1.5 py-0.5 text-meta text-mute-dark">esc</kbd>
            </div>
            <ul ref={list} role="listbox" className="thin-scroll max-h-[52vh] overflow-y-auto p-2">
              {shown.length === 0 && <li className="px-4 py-10 text-center text-support text-mute-dark">Nothing matches “{q}”.</li>}
              {shown.map((item, i) => {
                const header = i === 0 || shown[i - 1].group !== item.group;
                return (
                  <li key={item.id} role="presentation">
                    {header && <p className="eyebrow px-3 pb-1 pt-3 !text-mute-dark">{item.group}</p>}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === cursor}
                      data-i={i}
                      onMouseMove={() => setCursor(i)}
                      onClick={() => pick(item)}
                      className={clsx("flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left transition-colors", i === cursor ? "bg-white/10 text-porcelain" : "text-porcelain/80")}
                    >
                      <span className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-control", i === cursor ? "bg-brand text-ink" : "bg-white/[0.07] text-mute-dark")}>
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={clsx("block truncate text-support font-medium", item.group !== "Go to" && "num")}>{item.title}</span>
                        {item.hint && <span className="block truncate text-meta text-mute-dark">{item.hint}</span>}
                      </span>
                      {i === cursor && <Icon name="arrowRight" size={15} className="shrink-0 text-brand" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-white/10 px-5 py-2.5 text-meta text-mute-dark">
              <span>
                <kbd className="num">↑↓</kbd> move
              </span>
              <span>
                <kbd className="num">↵</kbd> open
              </span>
              <span className="ml-auto">
                Press <kbd className="num rounded-compact bg-white/10 px-1">J</kbd> anywhere
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
