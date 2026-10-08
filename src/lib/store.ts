"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import { productById, productBySlug } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import type { Mode } from "@/lib/types";

/* ─── Hydration guard ─── */
const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/* ─── Shop store (persisted) ─── */

export type CartLine = {
  key: string;
  productId: string;
  variantId: string;
  qty: number;
  /** Line was added in business mode (applies tier pricing) */
  business?: boolean;
};

export type ProcurementList = {
  id: string;
  name: string;
  schedule: "none" | "weekly" | "biweekly" | "monthly";
  items: { productId: string; variantId: string; qty: number }[];
  updatedAt: string;
};

export type Quote = {
  id: string;
  createdAt: string;
  status: "sent" | "responded" | "accepted";
  items: { productId: string; qty: number; target?: number }[];
  note: string;
  deliverBy?: string;
  sellers: number;
};

export type Order = {
  id: string;
  createdAt: string;
  total: number;
  items: { productId: string; variantId: string; qty: number; price: number }[];
  mode: Mode;
  status: "confirmed" | "awaiting-approval";
  po?: string;
  email?: string;
};

type ShopState = {
  cart: CartLine[];
  saved: CartLine[];
  wishlist: string[];
  compare: string[];
  recent: string[];
  searches: string[];
  interests: string[];
  lists: ProcurementList[];
  quotes: Quote[];
  orders: Order[];
  addToCart: (productId: string, variantId: string, qty?: number, business?: boolean) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  pushRecent: (productId: string) => void;
  pushSearch: (q: string) => void;
  clearSearches: () => void;
  toggleInterest: (id: string) => void;
  addToList: (listId: string, productId: string, variantId: string, qty: number) => void;
  createList: (name: string) => string;
  setListSchedule: (listId: string, schedule: ProcurementList["schedule"]) => void;
  setListQty: (listId: string, productId: string, qty: number) => void;
  removeFromList: (listId: string, productId: string) => void;
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "status">) => string;
  placeOrder: (o: Omit<Order, "id" | "createdAt">) => string;
};

const idOf = (slug: string) => productBySlug(slug)!.id;
const lineKey = (productId: string, variantId: string) => `${productId}:${variantId}`;
const nowIso = () => new Date().toISOString();

const SEED_LISTS: ProcurementList[] = [
  {
    id: "list-office",
    name: "Office restock — HQ",
    schedule: "monthly",
    updatedAt: "2026-09-12T10:00:00.000Z",
    items: [
      { productId: idOf("premium-copy-paper-a4"), variantId: "white", qty: 12 },
      { productId: idOf("everyday-stoneware-mugs"), variantId: "bone", qty: 6 },
      { productId: idOf("eco-surface-cleaner"), variantId: "citrus", qty: 8 },
      { productId: idOf("guji-single-origin-1kg"), variantId: "whole", qty: 6 },
    ],
  },
  {
    id: "list-warehouse",
    name: "Warehouse — Reno fulfilment",
    schedule: "weekly",
    updatedAt: "2026-09-18T15:30:00.000Z",
    items: [
      { productId: idOf("double-wall-cartons-12x10x8"), variantId: "kraft", qty: 40 },
      { productId: idOf("kraft-mailer-boxes"), variantId: "kraft", qty: 20 },
      { productId: idOf("nitrile-gloves-4mil"), variantId: "blue", qty: 30 },
    ],
  },
  {
    id: "list-onboarding",
    name: "New-hire kit",
    schedule: "none",
    updatedAt: "2026-09-02T09:10:00.000Z",
    items: [
      { productId: idOf("kova-book-14-air"), variantId: "silver", qty: 1 },
      { productId: idOf("kova-keys-low-profile"), variantId: "graphite", qty: 1 },
      { productId: idOf("transit-daypack-22"), variantId: "ink", qty: 1 },
      { productId: idOf("trail-bottle-750"), variantId: "chalk", qty: 1 },
    ],
  },
];

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      saved: [],
      wishlist: [],
      compare: [],
      recent: [],
      searches: [],
      interests: ["audio", "coffee", "travel"],
      lists: SEED_LISTS,
      quotes: [],
      orders: [],
      addToCart: (productId, variantId, qty = 1, business) =>
        set((s) => {
          const key = lineKey(productId, variantId);
          const existing = s.cart.find((l) => l.key === key);
          if (existing) {
            return { cart: s.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + qty, business: business ?? l.business } : l)) };
          }
          return { cart: [...s.cart, { key, productId, variantId, qty, business }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({ cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)) })),
      removeLine: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),
      saveForLater: (key) =>
        set((s) => {
          const line = s.cart.find((l) => l.key === key);
          if (!line) return s;
          return { cart: s.cart.filter((l) => l.key !== key), saved: [line, ...s.saved.filter((l) => l.key !== key)] };
        }),
      moveToCart: (key) =>
        set((s) => {
          const line = s.saved.find((l) => l.key === key);
          if (!line) return s;
          return { saved: s.saved.filter((l) => l.key !== key), cart: [...s.cart, line] };
        }),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (id) =>
        set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [id, ...s.wishlist] })),
      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((x) => x !== id) };
          if (s.compare.length >= 4) return { compare: [...s.compare.slice(1), id] };
          return { compare: [...s.compare, id] };
        }),
      clearCompare: () => set({ compare: [] }),
      pushRecent: (id) => set((s) => ({ recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) })),
      pushSearch: (q) => {
        const t = q.trim();
        if (!t) return;
        set((s) => ({ searches: [t, ...s.searches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6) }));
      },
      clearSearches: () => set({ searches: [] }),
      toggleInterest: (id) => set((s) => ({ interests: s.interests.includes(id) ? s.interests.filter((x) => x !== id) : [...s.interests, id] })),
      addToList: (listId, productId, variantId, qty) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id !== listId
              ? l
              : {
                  ...l,
                  updatedAt: nowIso(),
                  items: l.items.some((i) => i.productId === productId)
                    ? l.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
                    : [...l.items, { productId, variantId, qty }],
                },
          ),
        })),
      createList: (name) => {
        const id = `list-${Date.now().toString(36)}`;
        set((s) => ({ lists: [{ id, name, schedule: "none", items: [], updatedAt: nowIso() }, ...s.lists] }));
        return id;
      },
      setListSchedule: (listId, schedule) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, schedule, updatedAt: nowIso() } : l)) })),
      setListQty: (listId, productId, qty) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, items: l.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)) } : l,
          ),
        })),
      removeFromList: (listId, productId) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => i.productId !== productId) } : l)),
        })),
      addQuote: (q) => {
        const id = `RFQ-${(Date.now() % 100000).toString().padStart(5, "0")}`;
        set((s) => ({ quotes: [{ ...q, id, createdAt: nowIso(), status: "sent" }, ...s.quotes] }));
        return id;
      },
      placeOrder: (o) => {
        const id = `AY-${Math.floor(100000 + (Date.now() % 900000))}`;
        set((s) => ({ orders: [{ ...o, id, createdAt: nowIso() }, ...s.orders], cart: [] }));
        return id;
      },
    }),
    {
      name: "ayiin-shop",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/* ─── Derived cart maths ─── */

export function lineUnitPrice(line: CartLine) {
  const p = productById(line.productId);
  if (!p) return 0;
  return line.business ? unitPrice(p, line.qty, { contract: true }) : p.price;
}

export function cartSummary(lines: CartLine[]) {
  let subtotal = 0;
  let listTotal = 0;
  let shipping = 0;
  let count = 0;
  for (const l of lines) {
    const p = productById(l.productId);
    if (!p) continue;
    subtotal += lineUnitPrice(l) * l.qty;
    listTotal += p.price * l.qty;
    shipping = Math.max(shipping, p.shipping);
    count += l.qty;
  }
  const volumeSavings = Math.max(0, listTotal - subtotal);
  return { subtotal, shipping, count, volumeSavings, listTotal };
}

/* ─── UI store (ephemeral) ─── */

type UIState = {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  /** A page with its own pinned local nav (product pages) is showing: the main navbar steps aside while scrolled. */
  localNav: boolean;
  toast: { id: number; title: string; body?: string; action?: { label: string; href: string } | false } | null;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setMenu: (open: boolean) => void;
  setLocalNav: (on: boolean) => void;
  /** `action: false` shows no button; omitted, the toast offers "View cart". */
  notify: (title: string, body?: string, action?: { label: string; href: string } | false) => void;
  dismissToast: () => void;
};

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  localNav: false,
  toast: null,
  openCart: () => set({ cartOpen: true, searchOpen: false, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  setMenu: (open) => set({ menuOpen: open }),
  setLocalNav: (on) => set({ localNav: on }),
  notify: (title, body, action) => set({ toast: { id: Date.now(), title, body, action } }),
  dismissToast: () => set({ toast: null }),
}));
