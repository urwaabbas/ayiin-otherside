"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon } from "@/components/ui/icon";
import { ModeSwitch } from "@/components/layout/mode-switch";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchPanel, useRotatingPlaceholder, useSearchController } from "@/components/layout/search";
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
  const placeholder = useRotatingPlaceholder(!searchOpen);

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

  return (
    <>
      <div aria-hidden className={clsx("h-[116px] lg:h-[164px]", business ? "bg-midnight" : "bg-graphite")} />
      {/* Scrim for desktop overlays */}
      <div
        aria-hidden
        onClick={() => {
          setMegaOpen(false);
          closeSearch();
        }}
        className={clsx(
          "fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-500",
          overlay ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <header
        ref={headerRef}
        data-scrolled={compact}
        className={clsx(
          // Midnight navy in both modes — the logo's amber A sits on its complement.
          "surface-night fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          compact || megaOpen || searchOpen
            ? "bg-graphite/90 shadow-[0_1px_0_rgb(255_255_255/0.06),0_14px_40px_-24px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-graphite",
        )}
      >
        {/* ── Utility strip ─────────────────────────────────── */}
        <Collapse open={!compact} className="hidden lg:grid">
          <div className="bg-midnight text-ink-2 transition-colors duration-500">
            <div className="shell flex h-9 items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2.5">
                <span className={clsx("signal-dot", business && "!shadow-none")} data-live="true" />
                {business ? (
                  <span className="text-porcelain/90">
                    <span className="font-medium text-porcelain">Northwind Studio</span>
                    <span className="mx-2 text-mute-dark">·</span>Net 30 terms
                    <span className="mx-2 text-mute-dark">·</span>
                    <span className="num">$48,200</span> credit available
                    <span className="mx-2 text-mute-dark">·</span>
                    <Link href="/business?tab=approvals" className="link-underline text-brand">
                      3 approvals waiting
                    </Link>
                  </span>
                ) : (
                  <span>
                    Buying for a company?{" "}
                    <Link href="/business" className="link-underline font-medium text-ink">
                      Ayiin Business — volume pricing, quotes & net-30 terms
                    </Link>
                  </span>
                )}
              </div>
              <nav aria-label="Utility" className="flex items-center gap-6">
                {!business && (
                  <Link href="/business" className="link-underline">
                    B2B purchasing
                  </Link>
                )}
                <Link href="/help" className="link-underline">
                  Help
                </Link>
                <Link href="/track" className="link-underline">
                  Track order
                </Link>
                <Link href="/sell" className="link-underline">
                  Sell on Ayiin
                </Link>
                <LocaleMenu dark />
              </nav>
            </div>
          </div>
        </Collapse>

        {/* ── Main row ──────────────────────────────────────── */}
        <div className="shell">
          <div
            className={clsx(
              "flex items-center gap-3 transition-[height] duration-500 ease-[var(--ease-out-expo)] lg:gap-5",
              compact ? "h-[60px] lg:h-16" : "h-[60px] lg:h-[84px]",
            )}
          >
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenu(true)}
              className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-soft lg:hidden"
            >
              <Icon name="menu" size={22} />
            </button>

            <Link href="/" aria-label="Ayiin home" className="flex shrink-0 items-center">
              <AyiinLogo
                on="dark"
                priority
                className={clsx("transition-[height] duration-500 ease-[var(--ease-out-expo)]", compact ? "h-8 lg:h-9" : "h-8 lg:h-10")}
              />
            </Link>

            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => {
                closeSearch();
                setMegaOpen((o) => !o);
              }}
              className={clsx(
                "ml-3 hidden h-11 items-center gap-2 rounded-full pl-4 pr-3 text-[14px] font-medium transition-colors lg:flex",
                megaOpen ? "bg-ink text-white" : "hover:bg-soft",
              )}
            >
              <Icon name="grid" size={17} />
              Categories
              <Icon name="chevronDown" size={15} className={clsx("transition-transform duration-300", megaOpen && "rotate-180")} />
            </button>

            {/* Desktop search */}
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="relative hidden min-w-0 flex-1 lg:block"
            >
              <label htmlFor="site-search" className="sr-only">
                Search Ayiin
              </label>
              <Icon name="search" size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" />
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
                placeholder={business ? "Search products, SKUs or describe a purchase…" : placeholder}
                className={clsx(
                  "w-full rounded-full border bg-white pl-11 pr-24 text-[15px] text-ink outline-none transition-all duration-500 ease-[var(--ease-out-expo)] placeholder:text-mute/90",
                  compact ? "h-11" : "h-[52px]",
                  searchOpen ? "border-ink shadow-[0_0_0_4px_rgb(var(--rgb-brand)/0.28)]" : "border-line-strong hover:border-line-hover",
                )}
              />
              <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {search.query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      search.setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full text-mute hover:bg-soft hover:text-ink"
                  >
                    <Icon name="close" size={15} />
                  </button>
                )}
                <kbd className="pointer-events-none rounded-md border border-line bg-soft px-1.5 py-0.5 font-mono text-[11px] text-mute">⌘K</kbd>
              </span>
            </form>

            <div className="flex-1 lg:hidden" />

            <ModeSwitch compact={compact} className="hidden md:grid" />
            <ModeSwitch compact className={clsx("md:hidden", compact && "hidden")} />

            <nav aria-label="Account" className="flex items-center gap-0.5 lg:gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={() => {
                  openSearch();
                  requestAnimationFrame(() => mobileInputRef.current?.focus());
                }}
                className={clsx("h-11 w-11 place-items-center rounded-full hover:bg-soft lg:hidden", compact ? "grid" : "hidden md:grid")}
              >
                <Icon name="search" size={21} />
              </button>
              <HeaderIconLink href={business ? "/business" : "/account"} label={business ? "Business account" : "Account"} icon={business ? "building" : "user"} className="hidden sm:grid" />
              <WishlistLink />
              <CartButton />
            </nav>
          </div>
        </div>

        {/* Mobile: search row + mode switch (collapses on scroll) */}
        <Collapse open={!compact} className="lg:hidden">
          <div className="shell flex items-center gap-2 pb-3">
            <button
              type="button"
              onClick={() => {
                openSearch();
                requestAnimationFrame(() => mobileInputRef.current?.focus());
              }}
              className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line-strong bg-white px-4 text-left text-[14.5px] text-mute"
            >
              <Icon name="search" size={18} className="shrink-0 text-ink-2" />
              <span className="truncate">{business ? "Search or describe a purchase" : "Search or describe what you need"}</span>
            </button>
          </div>
        </Collapse>

        {/* ── Category rail ─────────────────────────────────── */}
        <Collapse open={!compact} className="hidden lg:grid">
          <div className="shell flex h-11 items-center justify-between border-t border-line text-[13.5px]">
            <nav aria-label="Featured" className="-ml-3 flex items-center">
              {business ? (
                <>
                  <RailLink href="/business?tab=quick" icon="bolt">Quick order</RailLink>
                  <RailLink href="/business?tab=quotes" icon="file">Request a quote</RailLink>
                  <RailLink href="/business?tab=lists" icon="repeat">Reorder</RailLink>
                  <span className="mx-2 h-4 w-px bg-line-strong" />
                  {categories.filter((c) => c.business).map((c) => (
                    <RailLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</RailLink>
                  ))}
                </>
              ) : (
                <>
                  <RailLink href="/search?deal=1" icon="tag">Verified deals</RailLink>
                  <RailLink href="/search?fast=1" icon="bolt">Arrives tomorrow</RailLink>
                  <span className="mx-2 h-4 w-px bg-line-strong" />
                  {categories.map((c) => (
                    <RailLink key={c.slug} href={`/c/${c.slug}`}>{c.short}</RailLink>
                  ))}
                </>
              )}
            </nav>
            <button type="button" className="flex items-center gap-1.5 text-ink-2 hover:text-ink" title="Delivery dates are calculated for this address">
              <Icon name="pin" size={15} />
              Deliver to <span className="font-medium text-ink">San Francisco 94107</span>
            </button>
          </div>
        </Collapse>

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

function Collapse({ open, children, className }: { open: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx("grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0", className)}
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Panel({ open, children, id, className }: { open: boolean; children: React.ReactNode; id: string; className?: string }) {
  return (
    <div
      id={id}
      className={clsx(
        "surface-day absolute inset-x-0 top-full origin-top border-t border-line bg-porcelain shadow-[0_40px_80px_-40px_rgb(var(--rgb-ink)/0.45)] transition-[opacity,transform,visibility] duration-400 ease-[var(--ease-out-expo)]",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        className,
      )}
      inert={!open}
    >
      <div className="max-h-[calc(100vh-120px)] overflow-y-auto thin-scroll">{children}</div>
    </div>
  );
}

function RailLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: "tag" | "bolt" | "file" | "repeat" }) {
  const pathname = usePathname();
  const active = pathname === href.split("?")[0] && !href.includes("?");
  return (
    <Link
      href={href}
      className={clsx(
        "flex h-8 items-center gap-1.5 rounded-full px-3 transition-colors",
        active ? "bg-ink text-white" : "text-ink-2 hover:bg-soft hover:text-ink",
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </Link>
  );
}

function HeaderIconLink({ href, label, icon, className }: { href: string; label: string; icon: "user" | "building"; className?: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={clsx("h-11 w-11 place-items-center rounded-full transition-colors hover:bg-soft", className)}>
      <Icon name={icon} size={21} />
    </Link>
  );
}

function WishlistLink() {
  const hydrated = useHydrated();
  const count = useShop((s) => s.wishlist.length);
  return (
    <Link href="/wishlist" aria-label={`Saved items${hydrated && count ? `, ${count}` : ""}`} title="Saved" className="relative hidden h-11 w-11 place-items-center rounded-full transition-colors hover:bg-soft sm:grid">
      <Icon name="heart" size={21} />
      {hydrated && count > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ink ring-2 ring-porcelain" />}
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
      aria-label={`Bag, ${shown} ${shown === 1 ? "item" : "items"}`}
      className="relative flex h-11 items-center gap-2 rounded-full pl-2.5 pr-2.5 transition-colors hover:bg-soft"
    >
      <Icon name="bag" size={21} />
      <span
        className={clsx(
          "num grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[12px] font-medium transition-all duration-300",
          shown > 0 ? "bg-brand text-ink" : "bg-soft text-mute",
        )}
      >
        {shown > 99 ? "99+" : shown}
      </span>
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
      <button type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5">
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
