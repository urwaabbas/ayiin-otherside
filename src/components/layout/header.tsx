"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon } from "@/components/ui/icon";
import { ModeSwitch } from "@/components/layout/mode-switch";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchPanel, useSearchController } from "@/components/layout/search";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { categories } from "@/lib/catalog/categories";
import { CURRENCIES, type Currency } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────
   Header
   · At rest: spacious three-tier header (utility strip, main row, category rail)
   · On scroll: collapses to a single 64px row on a blurred porcelain glass
   The header is fixed; a spacer holds its resting height so nothing below jumps.
   ───────────────────────────────────────────────────────────── */

export function Header() {
  const pathname = usePathname();
  const { mode } = usePrefs();
  const business = mode === "business";
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scope, setScope] = useState("");
  const searchOpen = useUI((s) => s.searchOpen);
  const openSearch = useUI((s) => s.openSearch);
  const closeSearch = useUI((s) => s.closeSearch);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const search = useSearchController(inputRef);
  const mobileSearch = useSearchController(mobileInputRef);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 28));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close overlays on navigation (local state adjusts during render; shared UI store in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(false);
  }
  useEffect(() => {
    closeSearch();
    setMenu(false);
  }, [pathname, closeSearch, setMenu]);

  // Global shortcuts: ⌘K / Ctrl+K / "/" to search, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setMegaOpen(false);
        openSearch();
        const desktop = window.matchMedia("(min-width: 1024px)").matches;
        requestAnimationFrame(() => (desktop ? inputRef.current : mobileInputRef.current)?.focus());
      }
      if (e.key === "Escape") {
        setMegaOpen(false);
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, closeSearch]);

  // Click outside closes desktop panels
  useEffect(() => {
    if (!megaOpen && !searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
        if (window.matchMedia("(min-width: 1024px)").matches) closeSearch();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [megaOpen, searchOpen, closeSearch]);

  const compact = scrolled;
  const overlay = megaOpen || (searchOpen && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);

  const submitSearch = () => {
    const q = search.query.trim();
    if (q) search.navigate(`/search?q=${encodeURIComponent(q)}`, q);
    else if (scope) search.navigate(`/c/${scope}`);
    else search.navigate("/search");
  };

  return (
    <>
      <div aria-hidden className="h-[108px] lg:h-[104px]" />
      {/* Scrim for desktop overlays */}
      <div
        aria-hidden
        onClick={() => {
          setMegaOpen(false);
          closeSearch();
        }}
        className={clsx(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300",
          overlay ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <header ref={headerRef} data-scrolled={compact} className="fixed inset-x-0 top-0 z-50 bg-ink text-white">
        {/* ── Main bar: logo · deliver to · search · account · orders · cart ── */}
        <div className="mx-auto flex h-14 max-w-[1520px] items-center gap-2 px-3 sm:px-4 lg:h-16 lg:gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="hdr-hit grid h-10 w-10 place-items-center lg:hidden">
            <Icon name="menu" size={22} />
          </button>

          <Link href="/" aria-label="Ayiin home" className="hdr-hit flex shrink-0 items-center px-1.5 py-1">
            <AyiinLogo on="dark" priority className="h-7 lg:h-9" />
          </Link>

          <button type="button" className="hdr-hit hidden shrink-0 items-center gap-1 px-2 py-1 text-left leading-tight xl:flex" title="Delivery dates are calculated for this address">
            <Icon name="pin" size={18} className="mt-2.5 self-start text-white/80" />
            <span>
              <span className="block text-[12px] text-white/70">Deliver to</span>
              <span className="block text-[14px] font-semibold">San Francisco 94107</span>
            </span>
          </button>

          {/* Desktop search */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="relative hidden h-11 min-w-0 flex-1 overflow-hidden rounded-lg bg-white focus-within:ring-[3px] focus-within:ring-brand lg:flex"
          >
            <label htmlFor="site-search-scope" className="sr-only">
              Search in
            </label>
            <select
              id="site-search-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="h-full max-w-[150px] shrink-0 cursor-pointer border-r border-line bg-mist pl-3 pr-2 text-[12.5px] text-ink-2 outline-none hover:bg-soft"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <label htmlFor="site-search" className="sr-only">
              Search Ayiin
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              role="combobox"
              aria-expanded={searchOpen}
              aria-controls="search-panel"
              aria-autocomplete="list"
              aria-activedescendant={search.activeId}
              autoComplete="off"
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onFocus={() => {
                setMegaOpen(false);
                openSearch();
              }}
              onKeyDown={search.onKeyDown}
              placeholder={business ? "Search products, SKUs or describe a purchase" : "Search Ayiin"}
              className="h-full min-w-0 flex-1 bg-white px-3 text-[15px] text-ink outline-none placeholder:text-mute"
            />
            <button type="submit" aria-label="Search" className="grid h-full w-12 shrink-0 place-items-center bg-brand text-ink transition-colors hover:bg-brand-hover">
              <Icon name="search" size={21} strokeWidth={2} />
            </button>
          </form>

          <div className="flex-1 lg:hidden" />

          <ModeSwitch compact tone="dark" className="hidden md:grid" />

          <nav aria-label="Account" className="flex items-center gap-0.5 lg:gap-1">
            <div className="hidden px-1 text-[12.5px] text-white xl:block">
              <LocaleMenu dark />
            </div>
            <Link href={business ? "/business" : "/account"} className="hdr-hit hidden px-2 py-1 leading-tight sm:block">
              <span className="block text-[12px] text-white/70">{business ? "Northwind Studio" : "Hello, sign in"}</span>
              <span className="flex items-center gap-0.5 text-[14px] font-semibold">
                {business ? "Business account" : "Account & Lists"} <Icon name="chevronDown" size={13} />
              </span>
            </Link>
            <Link href="/track" className="hdr-hit hidden px-2 py-1 leading-tight lg:block">
              <span className="block text-[12px] text-white/70">Returns</span>
              <span className="block text-[14px] font-semibold">&amp; Orders</span>
            </Link>
            <CartButton />
          </nav>
        </div>

        {/* Mobile search row */}
        <div className="px-3 pb-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => {
              openSearch();
              requestAnimationFrame(() => mobileInputRef.current?.focus());
            }}
            className="flex h-11 w-full items-center overflow-hidden rounded-lg bg-white text-left text-[15px] text-mute"
          >
            <span className="flex-1 truncate px-3">{business ? "Search products or SKUs" : "Search Ayiin"}</span>
            <span className="grid h-full w-12 place-items-center bg-brand text-ink">
              <Icon name="search" size={20} strokeWidth={2} />
            </span>
          </button>
        </div>

        {/* ── Department bar ── */}
        <div className="hidden bg-graphite-2 lg:block">
          <nav aria-label="Departments" className="no-scrollbar mx-auto flex h-10 max-w-[1520px] items-center gap-0.5 overflow-x-auto px-3 text-[13.5px] sm:px-4">
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => {
                closeSearch();
                setMegaOpen((o) => !o);
              }}
              className="hdr-hit flex shrink-0 items-center gap-1.5 px-2 py-1 font-semibold"
            >
              <Icon name="menu" size={18} /> All
            </button>
            {business ? (
              <>
                <DeptLink href="/business?tab=quick">Quick order</DeptLink>
                <DeptLink href="/business?tab=quotes">Request a quote</DeptLink>
                <DeptLink href="/business?tab=lists">Reorder</DeptLink>
                {categories.filter((c) => c.business).map((c) => (
                  <DeptLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</DeptLink>
                ))}
              </>
            ) : (
              <>
                <DeptLink href="/search?deal=1">Today&apos;s Deals</DeptLink>
                <DeptLink href="/search?sort=popular">Best Sellers</DeptLink>
                {categories.map((c) => (
                  <DeptLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</DeptLink>
                ))}
              </>
            )}
            <span className="flex-1" />
            {!business && <DeptLink href="/business">Ayiin Business</DeptLink>}
            <DeptLink href="/sell">Sell</DeptLink>
            <DeptLink href="/help">Customer Service</DeptLink>
          </nav>
        </div>

        {/* ── Desktop mega menu ─────────────────────────────── */}
        <Panel open={megaOpen} id="mega-menu">
          <MegaMenu onClose={() => setMegaOpen(false)} />
        </Panel>

        {/* ── Desktop search panel ──────────────────────────── */}
        <Panel open={searchOpen} id="search-panel" className="hidden lg:block">
          <div className="shell py-7">
            <SearchPanel query={search.query} setQuery={search.setQuery} active={search.active} onNavigate={search.navigate} />
          </div>
        </Panel>
      </header>

      {/* ── Mobile search sheet ─────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={clsx(
          "fixed inset-0 z-[60] flex flex-col bg-porcelain transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] lg:hidden",
          searchOpen ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div className="shell flex items-center gap-2 border-b border-line py-3">
          <div className="relative flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
            <input
              ref={mobileInputRef}
              type="search"
              aria-label="Search Ayiin"
              role="combobox"
              aria-expanded={searchOpen}
              aria-controls="search-options"
              aria-activedescendant={mobileSearch.activeId}
              value={mobileSearch.query}
              onChange={(e) => mobileSearch.setQuery(e.target.value)}
              onKeyDown={mobileSearch.onKeyDown}
              placeholder="Describe what you need…"
              className="h-12 w-full rounded-full border border-ink bg-white pl-10 pr-4 text-[16px] outline-none"
            />
          </div>
          <button type="button" onClick={closeSearch} className="h-12 px-2 text-[14.5px] font-medium">
            Cancel
          </button>
        </div>
        <div className="shell flex-1 overflow-y-auto py-5">
          {searchOpen && (
            <SearchPanel query={mobileSearch.query} setQuery={mobileSearch.setQuery} active={mobileSearch.active} onNavigate={mobileSearch.navigate} />
          )}
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenu(false)} />
    </>
  );
}

function Panel({ open, children, id, className }: { open: boolean; children: React.ReactNode; id: string; className?: string }) {
  return (
    <div
      id={id}
      className={clsx(
        "absolute inset-x-0 top-full origin-top bg-porcelain text-ink shadow-[0_40px_80px_-40px_rgb(var(--rgb-ink)/0.45)] transition-[opacity,transform,visibility] duration-400 ease-[var(--ease-out-expo)]",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        className,
      )}
      inert={!open}
    >
      <div className="max-h-[calc(100vh-120px)] overflow-y-auto thin-scroll">{children}</div>
    </div>
  );
}

function DeptLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href.split("?")[0] && !href.includes("?");
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={clsx("hdr-hit shrink-0 whitespace-nowrap px-2 py-1", active && "!border-white/70")}>
      {children}
    </Link>
  );
}

function CartButton() {
  const hydrated = useHydrated();
  const count = useShop((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const openCart = useUI((s) => s.openCart);
  const shown = hydrated ? count : 0;
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart, ${shown} ${shown === 1 ? "item" : "items"}`}
      className="hdr-hit relative flex items-end gap-1 px-2 py-1"
    >
      <span className="relative">
        <Icon name="bag" size={28} />
        <span className="num absolute -top-1 left-1/2 -translate-x-1/2 text-[13px] font-bold text-brand">{shown > 99 ? "99+" : shown}</span>
      </span>
      <span className="hidden pb-0.5 text-[14px] font-semibold sm:block">Cart</span>
    </button>
  );
}

function LocaleMenu({ dark }: { dark?: boolean }) {
  const { currency, setCurrency } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)} className="hdr-hit flex items-center gap-1.5 px-2 py-2 text-[13px] font-semibold">
        <Icon name="globe" size={14} />
        EN · <span className="num">{currency}</span>
        <Icon name="chevronDown" size={12} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Currency"
          className={clsx(
            "absolute right-0 top-8 z-10 w-56 rounded-2xl p-1.5 shadow-[var(--shadow-float)]",
            dark ? "bg-graphite text-porcelain" : "bg-white text-ink",
          )}
        >
          <p className={clsx("px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em]", dark ? "text-mute-dark" : "text-mute")}>Language</p>
          <p className="flex items-center justify-between rounded-xl px-3 py-2 text-[13px]">
            English (US) <Icon name="check" size={14} />
          </p>
          <p className={clsx("px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em]", dark ? "text-mute-dark" : "text-mute")}>Currency</p>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              role="option"
              aria-selected={currency === c.code}
              onClick={() => {
                setCurrency(c.code as Currency);
                setOpen(false);
              }}
              className={clsx("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px]", dark ? "hover:bg-graphite-2" : "hover:bg-mist")}
            >
              <span>
                <span className="num mr-2 inline-block w-4">{c.symbol}</span>
                {c.label}
              </span>
              {currency === c.code && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mode, currency, setCurrency } = usePrefs();
  const business = mode === "business";
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={clsx("fixed inset-0 z-[60] bg-ink/30 transition-opacity duration-500 lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={clsx(
          "fixed inset-y-0 left-0 z-[61] flex w-[88vw] max-w-[400px] flex-col bg-porcelain transition-transform duration-500 ease-[var(--ease-out-expo)] lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[60px] items-center justify-between border-b border-line px-5">
          <Link href="/" aria-label="Ayiin home" onClick={onClose} className="flex items-center">
            <AyiinLogo on="light" className="h-8" />
          </Link>
          <button type="button" aria-label="Close menu" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft">
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ModeSwitch className="w-full" />
          <p className="eyebrow mb-2 mt-7">Categories</p>
          <ul className="divide-y divide-line border-y border-line">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} onClick={onClose} className="flex items-center justify-between py-3.5 text-[16px]">
                  <span className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.accent }} />
                    {c.name}
                  </span>
                  <Icon name="chevronRight" size={18} className="text-mute" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mb-2 mt-7">{business ? "Procurement" : "Shortcuts"}</p>
          <div className="grid grid-cols-2 gap-2">
            {(business
              ? ([
                  ["/business?tab=quick", "bolt", "Quick order"],
                  ["/business?tab=quotes", "file", "Quotes"],
                  ["/business?tab=lists", "repeat", "Reorder"],
                  ["/business?tab=approvals", "approve", "Approvals"],
                ] as const)
              : ([
                  ["/search?deal=1", "tag", "Verified deals"],
                  ["/search?fast=1", "bolt", "Arrives tomorrow"],
                  ["/wishlist", "heart", "Saved"],
                  ["/compare", "compare", "Compare"],
                ] as const)
            ).map(([href, icon, label]) => (
              <Link key={href} href={href} onClick={onClose} className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] shadow-[var(--shadow-hair)]">
                <Icon name={icon} size={18} /> {label}
              </Link>
            ))}
          </div>
          <ul className="mt-7 space-y-3 text-[15px] text-ink-2">
            <li><Link href="/track" onClick={onClose}>Track order</Link></li>
            <li><Link href="/help" onClick={onClose}>Help & returns</Link></li>
            <li><Link href="/sell" onClick={onClose}>Sell on Ayiin</Link></li>
            <li><Link href="/brand" onClick={onClose}>Brand</Link></li>
          </ul>
          <div className="mt-7 flex gap-2">
            {CURRENCIES.map((c) => (
              <button key={c.code} type="button" aria-pressed={currency === c.code} onClick={() => setCurrency(c.code)} className="chip">
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
