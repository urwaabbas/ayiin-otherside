"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon, type IconName } from "@/components/ui/icon";
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
      <div aria-hidden className="h-[124px] lg:h-[150px]" />
      {/* Scrim for desktop overlays */}
      <div
        aria-hidden
        onClick={() => {
          setMegaOpen(false);
          closeSearch();
        }}
        className={clsx(
          "fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300",
          overlay ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <header ref={headerRef} data-scrolled={compact} className="fixed inset-x-0 top-0 z-50">
        {/* ── 1 · Charcoal strip ── */}
        <div className="hidden bg-ink text-white lg:block">
          <div className="mx-auto flex h-8 max-w-[1520px] items-center justify-between px-6 text-[12.5px] text-white/80">
            <span className="flex items-center gap-1.5">
              <Icon name="pin" size={13} className="text-brand" /> Deliver to <span className="font-semibold text-white">San Francisco 94107</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {business ? "Northwind Studio · Net 30 · $48,200 credit available" : "Real prices · exact delivery dates · verified sellers"}
            </span>
            <nav aria-label="Utility" className="flex items-center gap-5">
              {!business && <Link href="/business" className="hover:text-white">Ayiin Business</Link>}
              <Link href="/sell" className="hover:text-white">Sell on Ayiin</Link>
              <Link href="/help" className="hover:text-white">Help</Link>
              <LocaleMenu />
            </nav>
          </div>
        </div>

        {/* ── 2 · Glass main bar ── */}
        <div
          className={clsx(
            "border-b border-line/80 bg-porcelain/80 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300",
            compact && "shadow-[0_10px_30px_-18px_rgb(var(--rgb-ink)/0.35)]",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-3 px-3 sm:px-4 lg:h-[72px] lg:gap-6 lg:px-6">
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft lg:hidden">
                <Icon name="menu" size={22} />
              </button>
              <Link href="/" aria-label="Ayiin home" className="flex items-center">
                <AyiinLogo on="light" priority className="h-8 lg:h-10" />
              </Link>
            </div>

            {/* Search pill */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="relative hidden h-12 min-w-0 max-w-[760px] flex-1 items-center rounded-full bg-white p-1 shadow-[var(--shadow-hair)] transition-shadow focus-within:shadow-[0_0_0_3px_rgb(var(--rgb-brand)/0.45)] lg:flex"
            >
              <label htmlFor="site-search-scope" className="sr-only">
                Search in
              </label>
              <select
                id="site-search-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="h-full max-w-[160px] shrink-0 cursor-pointer rounded-full bg-mist pl-4 pr-2 text-[13px] font-medium text-ink-2 outline-none hover:bg-soft"
              >
                <option value="">All departments</option>
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
                placeholder={business ? "Search products, SKUs or describe a purchase" : "What are you looking for?"}
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-ink outline-none placeholder:text-mute"
              />
              <button type="submit" aria-label="Search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-ink transition-transform hover:scale-105">
                <Icon name="search" size={19} strokeWidth={2.1} />
              </button>
            </form>

            <nav aria-label="Account" className="flex shrink-0 items-center gap-1 sm:gap-2">
              <ModeSwitch compact className="hidden xl:grid" />
              <NavIcon href={business ? "/business" : "/account"} icon={business ? "building" : "user"} label={business ? "Business" : "Account"} />
              <NavIcon href="/track" icon="box" label="Orders" className="hidden md:flex" />
              <SavedIcon />
              <CartButton />
            </nav>
          </div>

          {/* Mobile search pill */}
          <div className="px-3 pb-3 lg:hidden">
            <button
              type="button"
              onClick={() => {
                openSearch();
                requestAnimationFrame(() => mobileInputRef.current?.focus());
              }}
              className="flex h-11 w-full items-center rounded-full bg-white p-1 pl-4 text-left text-[15px] text-mute shadow-[var(--shadow-hair)]"
            >
              <span className="flex-1 truncate">{business ? "Search products or SKUs" : "What are you looking for?"}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-ink">
                <Icon name="search" size={18} strokeWidth={2.1} />
              </span>
            </button>
          </div>
        </div>

        {/* ── 3 · Departments, justified across the width ── */}
        <div className="hidden border-b border-line/80 bg-white/85 backdrop-blur-xl lg:block">
          <nav aria-label="Departments" className="mx-auto flex h-[46px] max-w-[1520px] items-stretch justify-between px-6 text-[13.5px] font-medium text-ink-2">
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => {
                closeSearch();
                setMegaOpen((o) => !o);
              }}
              className={clsx("dept-link flex items-center gap-1.5 font-semibold text-ink", megaOpen && "is-active")}
            >
              <Icon name="grid" size={16} /> All departments
            </button>
            {business ? (
              <>
                <DeptLink href="/business?tab=quick">Quick order</DeptLink>
                <DeptLink href="/business?tab=quotes">Quotes</DeptLink>
                <DeptLink href="/business?tab=lists">Reorder</DeptLink>
                {categories.filter((c) => c.business).map((c) => (
                  <DeptLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</DeptLink>
                ))}
              </>
            ) : (
              <>
                <DeptLink href="/search?deal=1" accent>
                  Today&apos;s deals
                </DeptLink>
                <DeptLink href="/search?sort=popular">Best sellers</DeptLink>
                {categories.map((c) => (
                  <DeptLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</DeptLink>
                ))}
              </>
            )}
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

function DeptLink({ href, children, accent }: { href: string; children: React.ReactNode; accent?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href.split("?")[0] && !href.includes("?");
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={clsx("dept-link flex items-center whitespace-nowrap", active && "is-active", accent && "text-brand-deep")}>
      {children}
    </Link>
  );
}

function NavIcon({ href, icon, label, className }: { href: string; icon: IconName; label: string; className?: string }) {
  return (
    <Link href={href} className={clsx("group flex flex-col items-center gap-0.5 px-1.5 text-[11px] font-medium text-ink-2 hover:text-ink", className)}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)] transition-colors group-hover:bg-brand-soft">
        <Icon name={icon} size={19} />
      </span>
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
}

function SavedIcon() {
  const hydrated = useHydrated();
  const count = useShop((s) => s.wishlist.length);
  return (
    <Link href="/wishlist" aria-label={`Saved${hydrated && count ? `, ${count}` : ""}`} className="group relative hidden flex-col items-center gap-0.5 px-1.5 text-[11px] font-medium text-ink-2 hover:text-ink sm:flex">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)] transition-colors group-hover:bg-brand-soft">
        <Icon name="heart" size={19} />
      </span>
      <span className="hidden lg:block">Saved</span>
      {hydrated && count > 0 && <span className="num absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-white">{count}</span>}
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
      className="group relative flex flex-col items-center gap-0.5 px-1.5 text-[11px] font-medium text-ink-2 hover:text-ink"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-graphite">
        <Icon name="bag" size={19} />
      </span>
      <span className="hidden lg:block">Cart</span>
      <span className="num absolute -right-0.5 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-ink ring-2 ring-porcelain">{shown > 99 ? "99+" : shown}</span>
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
      <button type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 hover:text-white">
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
