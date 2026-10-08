"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon } from "@/components/ui/icon";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ContextStrip } from "@/components/layout/context-strip";
import { MegaMenu } from "@/components/layout/mega-menu";
import { DiscoverMenu } from "@/components/layout/discover-menu";
import { SearchPanel, useRotatingPlaceholder, useSearchController } from "@/components/layout/search";
import { usePrefs } from "@/components/providers";
import { ModeSwitch } from "@/components/layout/mode-switch";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { categories } from "@/lib/catalog/categories";

/**
 * AYIIN Master 2040 Navbar System
 *
 * Clean 8-item hierarchy:
 * AYIIN | Discover | Departments | Deals | Search | Saved | Account | Bag
 *
 * Intelligent Scroll Behavior:
 * - Top of page: Spacious, dynamic context strip visible, primary navigation relaxed.
 * - Scrolling down: Context strip slides away, navbar compresses.
 * - Deep scroll (>280px scrolling down): Minimizes distraction to essentials: AYIIN + Search + Bag.
 * - Scrolling up: Smoothly restores full navigation (Discover, Departments, Deals, Saved, Account).
 */
type ScrollBands = { atTop: boolean; past80: boolean; past120: boolean; past280: boolean; down: boolean; expanded: boolean };
const INITIAL_BANDS: ScrollBands = { atTop: true, past80: false, past120: false, past280: false, down: false, expanded: false };
/** Upward scroll distance (px) after which the full navbar returns — about three wheel notches. */
const FULL_NAV_TRAVEL = 300;
/** Pause (ms) after scrolling up before the minimal bar opens into the full one. */
const IDLE_EXPAND_MS = 900;

export function Header() {
  const pathname = usePathname();
  const { mode, setMode } = usePrefs();
  const business = mode === "business";

  // Scroll state
  // Only coarse bands are kept in state, so the header re-renders when a band changes — not on every scroll frame.
  const [scroll, setScroll] = useState<ScrollBands>(INITIAL_BANDS);
  const lastScrollY = useRef(0);
  const upTravel = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Overlay state: "discover" | "departments" | null
  const [activeMenu, setActiveMenu] = useState<"discover" | "departments" | null>(null);

  const searchOpen = useUI((s) => s.searchOpen);
  const openSearch = useUI((s) => s.openSearch);
  const closeSearch = useUI((s) => s.closeSearch);
  const menuOpen = useUI((s) => s.menuOpen);
  const localNav = useUI((s) => s.localNav);
  const setMenu = useUI((s) => s.setMenu);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const search = useSearchController(inputRef);
  const mobileSearch = useSearchController(mobileInputRef);
  const rotatingPlaceholder = useRotatingPlaceholder(!searchOpen);

  // Scroll dynamics: down → hidden · a little up → minimal bar · a lot up → full bar
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const diff = y - lastScrollY.current;
        lastScrollY.current = y;
        setScroll((prev) => {
          let { down, expanded } = prev;
          if (y <= 60) {
            down = false;
            expanded = false;
            upTravel.current = 0;
          } else if (diff > 5) {
            down = true;
            expanded = false;
            upTravel.current = 0;
          } else if (diff < 0) {
            if (diff < -5) down = false;
            if (!down) {
              upTravel.current += -diff;
              if (upTravel.current >= FULL_NAV_TRAVEL) expanded = true;
            }
          }
          const next: ScrollBands = { atTop: y < 24, past80: y > 80, past120: y > 120, past280: y > 280, down, expanded };
          return (Object.keys(next) as (keyof ScrollBands)[]).every((k) => next[k] === prev[k]) ? prev : next;
        });
        // Stop scrolling while the bar is back in its minimal form and, after a beat, it opens up fully.
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
          setScroll((p) => (p.past280 && !p.down && !p.expanded ? { ...p, expanded: true } : p));
        }, IDLE_EXPAND_MS);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // Close overlays on route change
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setActiveMenu(null);
  }
  useEffect(() => {
    closeSearch();
    setMenu(false);
  }, [pathname, closeSearch, setMenu]);

  // Keyboard: Ctrl/⌘+K or "/" focuses search, Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setActiveMenu(null);
        openSearch();
        const desktop = window.matchMedia("(min-width: 1024px)").matches;
        requestAnimationFrame(() => (desktop ? inputRef.current : mobileInputRef.current)?.focus());
      }
      if (e.key === "Escape") {
        setActiveMenu(null);
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, closeSearch]);

  // Click outside closes desktop overlays
  useEffect(() => {
    if (!activeMenu && !searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        if (window.matchMedia("(min-width: 1024px)").matches) closeSearch();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [activeMenu, searchOpen, closeSearch]);

  const isTop = scroll.atTop;
  const isCompressed = !scroll.atTop;
  // Deep scroll state: past 280px the navbar is reduced to AYIIN + Search + Bag, and stays that way
  // after a small scroll up. Scrolling up FULL_NAV_TRAVEL px restores every item.
  const isDeep = scroll.past280 && !scroll.expanded && !activeMenu && !searchOpen;

  // Scrolling down past the compressed state slides the whole header out of view;
  // the first small scroll up brings it back. Open menus/search/drawer keep it in place.
  const isHidden =
    // A page with its own pinned local nav (product pages) owns the top edge once you leave the top: the
    // main navbar stays away, scrolling up or down, and comes back only at the very top.
    (localNav && scroll.past80 && !activeMenu && !searchOpen && !menuOpen) ||
    (scroll.past120 && scroll.down && !activeMenu && !searchOpen && !menuOpen);

  const overlayActive =
    activeMenu !== null ||
    (searchOpen && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);

  const submitSearch = () => {
    const q = search.query.trim();
    if (q) search.navigate(`/search?q=${encodeURIComponent(q)}`, q);
    else search.navigate("/search");
  };

  return (
    <>
      {/* Spacer to prevent layout jump: accounts for top strip + navbar */}
      <div aria-hidden className="h-[100px] lg:h-[104px]" />

      {/* Scrim for desktop dropdowns & search */}
      <div
        aria-hidden
        onClick={() => {
          setActiveMenu(null);
          closeSearch();
        }}
        className={clsx(
          "fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300",
          overlayActive ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <header
        ref={headerRef}
        data-top={isTop}
        data-compressed={isCompressed}
        data-deep={isDeep}
        data-hidden={isHidden}
        onFocusCapture={() => setScroll((p) => (p.down ? { ...p, down: false } : p))}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
          isHidden && "pointer-events-none -translate-y-full",
        )}
      >
        {/* ── 01 · DYNAMIC CONTEXT STRIP (Top Micro-strip) ── */}
        <div
          className={clsx(
            "transition-all duration-300 ease-[var(--ease-out-expo)] overflow-hidden",
            isTop ? "max-h-8 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          <ContextStrip />
        </div>

        {/* ── 02 · PRIMARY NAVBAR ── */}
        <div
          className={clsx(
            "border-b border-line/80 bg-porcelain/90 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
            isCompressed && "shadow-[0_10px_30px_-18px_rgb(var(--rgb-ink)/0.25)]",
          )}
        >
          <div
            className={clsx(
              "mx-auto flex max-w-[1520px] items-center justify-between gap-3 px-4 sm:px-6 transition-all duration-300",
              isCompressed ? "h-14 lg:h-16" : "h-16 lg:h-[68px]",
            )}
          >
            {/* Left: Brand + Editorial Discovery Controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-4 lg:gap-6">
              {/* Mobile menu trigger */}
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setMenu(true)}
                suppressHydrationWarning
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft lg:hidden"
              >
                <Icon name="menu" size={20} />
              </button>

              {/* AYIIN Brand Logo */}
              <Link href="/" aria-label="Ayiin homepage" className="flex items-center transition-opacity duration-200 hover:opacity-80">
                <AyiinLogo
                  on="light"
                  priority
                  className={clsx(
                    "transition-all duration-300",
                    isCompressed ? "h-7 lg:h-8" : "h-8 lg:h-9",
                  )}
                />
              </Link>

              {/* Primary Navigation Items: Discover | Departments | Deals */}
              <nav
                aria-label="Main marketplace navigation"
                className={clsx(
                  "hidden items-center gap-1 transition-all duration-300 lg:flex",
                  isDeep
                    ? "opacity-0 pointer-events-none -translate-x-2 w-0 overflow-hidden"
                    : "opacity-100 translate-x-0",
                )}
              >
                {/* 1. Discover Menu Button (WHY/INTENT) */}
                <button
                  type="button"
                  aria-expanded={activeMenu === "discover"}
                  aria-controls="discover-menu"
                  onClick={() => {
                    closeSearch();
                    setActiveMenu((curr) => (curr === "discover" ? null : "discover"));
                  }}
                  className="nav-item group flex items-center gap-1.5 px-3.5 py-2 text-support font-medium"
                >
                  <span>Discover</span>
                  <Icon
                    name="chevronDown"
                    size={13}
                    className={clsx(
                      "transition-[transform,color] duration-200 text-mute group-hover:text-ink",
                      activeMenu === "discover" && "rotate-180 text-ink",
                    )}
                  />
                </button>

                {/* 2. Departments Menu Button (WHAT) */}
                <button
                  type="button"
                  aria-expanded={activeMenu === "departments"}
                  aria-controls="departments-menu"
                  onClick={() => {
                    closeSearch();
                    setActiveMenu((curr) => (curr === "departments" ? null : "departments"));
                  }}
                  className="nav-item group flex items-center gap-1.5 px-3.5 py-2 text-support font-medium"
                >
                  <span>Departments</span>
                  <Icon
                    name="chevronDown"
                    size={13}
                    className={clsx(
                      "transition-[transform,color] duration-200 text-mute group-hover:text-ink",
                      activeMenu === "departments" && "rotate-180 text-ink",
                    )}
                  />
                </button>

                {/* 3. Deals Link */}
                <Link
                  href="/search?deal=1"
                  className="nav-item flex items-center gap-1.5 px-3.5 py-2 text-support font-medium"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>Deals</span>
                </Link>
              </nav>
            </div>

            {/* Center: Intelligent Natural Intent Search */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="relative hidden h-11 min-w-0 max-w-[620px] flex-1 items-center rounded-full bg-white px-2 py-1 shadow-[var(--shadow-hair)] transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--color-line-hover)] focus-within:!shadow-[0_0_0_2px_rgb(var(--rgb-ink)/0.25)] lg:flex"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center text-mute pl-1">
                <Icon name="search" size={17} strokeWidth={2} />
              </span>

              <label htmlFor="master-search-input" className="sr-only">
                Search Ayiin products with natural intent
              </label>
              <input
                ref={inputRef}
                id="master-search-input"
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
                  setActiveMenu(null);
                  openSearch();
                }}
                onKeyDown={search.onKeyDown}
                placeholder={business ? "Search products, bulk SKUs or specs" : rotatingPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-body text-ink outline-none placeholder:text-mute"
              />

            </form>

            {/* Right: ModeSwitch | Saved | Account | Bag (+ Mobile Search) */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Mobile quick toggle back to Personal when in Business mode */}
              {business && (
                <button
                  type="button"
                  onClick={() => setMode("personal")}
                  aria-label="Switch back to Personal mode"
                  className="flex md:hidden h-8 items-center gap-1.5 rounded-full bg-brand px-3 text-caption font-bold text-ink shadow-[0_2px_8px_rgba(240,165,0,0.3)] transition-transform active:scale-95"
                >
                  <Icon name="chevronLeft" size={13} strokeWidth={2.5} />
                  <span>Personal</span>
                </button>
              )}

              {/* Mobile Search button */}
              <button
                type="button"
                onClick={() => {
                  openSearch();
                  requestAnimationFrame(() => mobileInputRef.current?.focus());
                }}
                aria-label="Search"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft text-ink lg:hidden"
              >
                <Icon name="search" size={19} />
              </button>

              {/* Mode switch (Desktop & Tablet) */}
              <div
                className={clsx(
                  "hidden md:flex items-center transition-all duration-300 mr-1",
                  isDeep
                    ? "opacity-0 pointer-events-none w-0 overflow-hidden -translate-x-2"
                    : "opacity-100 translate-x-0",
                )}
              >
                <ModeSwitch compact className="min-w-[176px]" />
              </div>

              {/* Secondary Navigation (Deep scroll hides Saved & Account to focus on Bag) */}
              <div
                className={clsx(
                  "flex items-center gap-1 sm:gap-2 transition-all duration-300",
                  isDeep
                    ? "opacity-0 pointer-events-none w-0 overflow-hidden -translate-x-2"
                    : "opacity-100 translate-x-0",
                )}
              >
                {/* Saved / Wishlist */}
                <SavedButton />

                {/* Account / Business */}
                <Link
                  href={business ? "/business" : "/account"}
                  className="nav-item hidden md:flex h-10 items-center gap-2 px-3.5 text-support font-medium"
                >
                  <Icon name={business ? "building" : "user"} size={17} />
                  <span>{business ? "Business" : "Account"}</span>
                </Link>
              </div>

              {/* Bag / Cart Action Button (Always visible) */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* ── 03 · DISCOVER MEGA-MENU (Why / Intent) ── */}
        <DropdownPanel open={activeMenu === "discover"} id="discover-menu">
          <DiscoverMenu onClose={() => setActiveMenu(null)} />
        </DropdownPanel>

        {/* ── 04 · DEPARTMENTS MEGA-MENU (What) ── */}
        <DropdownPanel open={activeMenu === "departments"} id="departments-menu">
          <MegaMenu onClose={() => setActiveMenu(null)} />
        </DropdownPanel>

        {/* ── 05 · INTELLIGENT SEARCH PANEL ── */}
        <DropdownPanel open={searchOpen} id="search-panel" className="hidden lg:block">
          <div className="shell py-7">
            <SearchPanel
              query={search.query}
              setQuery={search.setQuery}
              active={search.active}
              onNavigate={search.navigate}
            />
          </div>
        </DropdownPanel>
      </header>

      {/* ── Mobile Search Sheet ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Ayiin"
        className={clsx(
          "fixed inset-0 z-[60] flex flex-col bg-porcelain transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] lg:hidden",
          searchOpen ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div className="shell flex items-center gap-2 border-b border-line py-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              ref={mobileInputRef}
              type="search"
              aria-label="Search Ayiin"
              role="combobox"
              aria-expanded={searchOpen}
              aria-controls="mobile-search-options"
              aria-activedescendant={mobileSearch.activeId}
              value={mobileSearch.query}
              onChange={(e) => mobileSearch.setQuery(e.target.value)}
              onKeyDown={mobileSearch.onKeyDown}
              placeholder="headphones for flights under $300…"
              className="h-12 w-full rounded-full border border-line bg-white pl-10 pr-4 text-body outline-none focus:border-ink"
            />
          </div>
          <button
            type="button"
            onClick={closeSearch}
            className="h-12 px-3 text-support font-medium text-ink hover:text-mute"
          >
            Cancel
          </button>
        </div>
        <div className="shell flex-1 overflow-y-auto py-5">
          {searchOpen && (
            <SearchPanel
              query={mobileSearch.query}
              setQuery={mobileSearch.setQuery}
              active={mobileSearch.active}
              onNavigate={mobileSearch.navigate}
            />
          )}
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      <MobileDrawer open={menuOpen} onClose={() => setMenu(false)} />
    </>
  );
}

function DropdownPanel({
  open,
  id,
  className,
  children,
}: {
  open: boolean;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      aria-hidden={!open}
      className={clsx(
        "border-b border-line/80 bg-porcelain/95 shadow-[0_24px_48px_-16px_rgb(var(--rgb-ink)/0.18)] backdrop-blur-2xl transition-all duration-300 ease-[var(--ease-out-expo)]",
        open ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      {open ? children : null}
    </div>
  );
}

function SavedButton() {
  const hydrated = useHydrated();
  const count = useShop((s) => s.wishlist.length);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/wishlist"
      aria-label={`Saved pieces (${shown})`}
      className="nav-item relative flex h-10 items-center gap-1.5 px-3.5 text-support font-medium"
    >
      <Icon name="heart" size={17} />
      <span className="hidden sm:inline">Saved</span>
      {shown > 0 && (
        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 font-mono text-[10px] font-bold text-white">
          {shown}
        </span>
      )}
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
      aria-label={`Shopping bag (${shown} items)`}
      suppressHydrationWarning
      className="group relative flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-support font-medium text-white transition-all hover:bg-graphite active:scale-95"
    >
      <Icon name="bag" size={17} />
      <span>Bag</span>
      {shown > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 font-mono text-[11px] font-bold text-ink">
          {shown > 99 ? "99+" : shown}
        </span>
      )}
    </button>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"discover" | "departments">("discover");
  const { mode } = usePrefs();
  const business = mode === "business";

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-[60] bg-ink/30 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className={clsx(
          "fixed inset-y-0 left-0 z-[61] flex w-[86vw] max-w-[380px] flex-col bg-porcelain shadow-2xl transition-transform duration-400 ease-[var(--ease-out-expo)] lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link href="/" aria-label="Ayiin" onClick={onClose}>
            <AyiinLogo on="light" className="h-8" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft text-ink"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Shopping Mode Switcher inside Drawer */}
        <div className="border-b border-line bg-white/70 p-3">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-mono text-mute">
            <span>SHOPPING MODE</span>
            <span className="font-semibold text-ink">{business ? "Business Mode" : "Personal Mode"}</span>
          </div>
          <ModeSwitch compact className="w-full min-w-0" />
        </div>

        {/* Tab switch: Discover vs Departments */}
        <div className="grid grid-cols-2 border-b border-line p-2 gap-1 bg-soft/50">
          <button
            type="button"
            onClick={() => setTab("discover")}
            className={clsx(
              "rounded-full py-2 text-support font-medium transition-all text-center",
              tab === "discover" ? "bg-white text-ink shadow-sm" : "text-mute hover:text-ink",
            )}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => setTab("departments")}
            className={clsx(
              "rounded-full py-2 text-support font-medium transition-all text-center",
              tab === "departments" ? "bg-white text-ink shadow-sm" : "text-mute hover:text-ink",
            )}
          >
            Departments
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "discover" ? (
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                SHOP BY INTENT
              </p>
              <ul className="divide-y divide-line/60">
                {[
                  { name: "For Your Home", href: "/c/home-living" },
                  { name: "For Your Workspace", href: "/c/office" },
                  { name: "For Travel & Transit", href: "/search?q=travel" },
                  { name: "For Gifting", href: "/search?intent=gift" },
                  { name: "Under $50 Essentials", href: "/search?maxPrice=50" },
                  { name: "Best Rated (4.8★+)", href: "/search?sort=popular" },
                  { name: "Arrives Tomorrow", href: "/search?fast=1" },
                  { name: "Today's Verified Deals", href: "/search?deal=1" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-3.5 text-body text-ink hover:text-brand"
                    >
                      <span>{item.name}</span>
                      <Icon name="chevronRight" size={16} className="text-mute" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                ALL DEPARTMENTS
              </p>
              <ul className="divide-y divide-line/60">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/c/${c.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between py-3.5 text-body text-ink hover:text-brand"
                    >
                      <span className="flex items-center gap-3">
                        <CategoryIcon slug={c.slug} className="text-mute" />
                        <span>{c.name}</span>
                      </span>
                      <Icon name="chevronRight" size={16} className="text-mute" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Utility links */}
          <div className="mt-8 border-t border-line pt-4 space-y-2.5 text-support text-mute">
            <Link href="/wishlist" onClick={onClose} className="flex items-center gap-2 text-ink hover:text-brand">
              <Icon name="heart" size={16} /> Saved Items
            </Link>
            <Link href="/account" onClick={onClose} className="flex items-center gap-2 text-ink hover:text-brand">
              <Icon name="user" size={16} /> Your Account
            </Link>
            <Link href="/track" onClick={onClose} className="flex items-center gap-2 text-ink hover:text-brand">
              <Icon name="box" size={16} /> Track Shipments
            </Link>
            <Link href="/business" onClick={onClose} className="flex items-center gap-2 text-ink hover:text-brand">
              <Icon name="building" size={16} /> Ayiin Business
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
