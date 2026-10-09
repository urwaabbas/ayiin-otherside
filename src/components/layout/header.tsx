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
const INITIAL_BANDS: ScrollBands = { atTop: true, past80: false, past120: false, past280: false, down: false, expanded: true };

export function Header() {
  const pathname = usePathname();
  const { mode, setMode } = usePrefs();
  const business = mode === "business";

  // Scroll state
  // Only coarse bands are kept in state, so the header re-renders when a band changes — not on every scroll frame.
  const [scroll, setScroll] = useState<ScrollBands>(INITIAL_BANDS);
  const lastScrollY = useRef(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Overlay state: "discover" | "departments" | null
  const [activeMenu, setActiveMenu] = useState<"discover" | "departments" | null>(null);

  // Mouse users open the menus by hovering: a short intent delay on the way in so a pass across the
  // bar doesn't flash a panel, and a short grace on the way out so the pointer can cross the gap
  // between a tab and its panel. Touch and keyboard still use the click toggle.
  const hoverOpen = (e: React.PointerEvent, menu: "discover" | "departments" | null) => {
    if (e.pointerType !== "mouse" || !window.matchMedia("(min-width: 1024px)").matches) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (menu) closeSearchRef.current();
      setActiveMenu(menu);
    }, menu ? 90 : 120);
  };
  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hoverHold = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") clearTimeout(hoverTimer.current);
  };
  const hoverLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveMenu(null), 180);
  };

  const searchOpen = useUI((s) => s.searchOpen);
  const openSearch = useUI((s) => s.openSearch);
  const closeSearch = useUI((s) => s.closeSearch);
  const closeSearchRef = useRef(closeSearch);
  useEffect(() => {
    closeSearchRef.current = closeSearch;
  }, [closeSearch]);
  const menuOpen = useUI((s) => s.menuOpen);
  const localNav = useUI((s) => s.localNav);
  const setMenu = useUI((s) => s.setMenu);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const search = useSearchController(inputRef);
  const mobileSearch = useSearchController(mobileInputRef);
  const rotatingPlaceholder = useRotatingPlaceholder(!searchOpen);

  // Scroll dynamics:
  // - Down: navbar collapses and stays hidden when stopped.
  // - Up: navbar appears smoothly with the full search bar.
  // - Top: spacious relaxed navbar.
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
            expanded = true;
          } else if (diff > 5) {
            down = true;
            expanded = true;
          } else if (diff < -5) {
            down = false;
            expanded = true;
          }
          const next: ScrollBands = { atTop: y < 24, past80: y > 80, past120: y > 120, past280: y > 280, down, expanded };
          return (Object.keys(next) as (keyof ScrollBands)[]).every((k) => next[k] === prev[k]) ? prev : next;
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(hoverTimer.current);
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
  const isHome = pathname === "/";
  const overlayActive =
    activeMenu !== null ||
    (searchOpen && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  const isGlass = isHome && isTop && !overlayActive;
  const isDeep = !isTop && !activeMenu;

  // When scrolling down past the top, the navbar collapses and stays away even after scrolling stops.
  // When scrolling up, it smoothly slides back down. Active menus/search keep it visible.
  const isHidden =
    (localNav && scroll.past80 && !activeMenu && !searchOpen && !menuOpen) ||
    (!isTop && scroll.down && !activeMenu && !searchOpen && !menuOpen);

  const submitSearch = () => {
    const q = search.query.trim();
    if (q) search.navigate(`/search?q=${encodeURIComponent(q)}`, q);
    else search.navigate("/search");
  };

  return (
    <>
      {/* Spacer to prevent layout jump on non-landing pages: accounts for top strip + navbar */}
      {!isHome && <div aria-hidden className="h-[100px] lg:h-[104px]" />}

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
        onPointerEnter={hoverHold}
        onPointerLeave={hoverLeave}
        onFocusCapture={() => setScroll((p) => (p.down ? { ...p, down: false } : p))}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
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
          <ContextStrip transparent={isGlass} />
        </div>

        {/* ── 02 · PRIMARY NAVBAR ── */}
        <div
          className={clsx(
            "border-b transition-all duration-500 ease-[var(--ease-out-expo)]",
            isGlass
              ? "border-white/15 bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_0_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.18)]"
              : "border-line/80 bg-porcelain/90 backdrop-blur-xl backdrop-saturate-150",
            isCompressed && !isGlass && "shadow-[0_10px_30px_-18px_rgb(var(--rgb-ink)/0.25)]",
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
                className={clsx(
                  "grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden",
                  isGlass ? "text-white hover:bg-white/15" : "hover:bg-soft text-ink",
                )}
              >
                <Icon name="menu" size={20} />
              </button>

              {/* AYIIN Brand Logo */}
              <Link href="/" aria-label="Ayiin homepage" className="flex items-center transition-opacity duration-200 hover:opacity-80">
                <AyiinLogo
                  on={isGlass ? "dark" : "light"}
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
                  onPointerEnter={(e) => hoverOpen(e, "discover")}
                  onClick={(e) => {
                    closeSearch();
                    setActiveMenu((curr) => (curr === "discover" && (e.detail === 0 || !canHover()) ? null : "discover"));
                  }}
                  className={clsx(
                    "nav-item group flex items-center gap-1.5 px-3.5 py-2 text-support font-medium transition-colors",
                    isGlass ? "!text-white/85 hover:!text-white" : "",
                  )}
                >
                  <span>Discover</span>
                  <Icon
                    name="chevronDown"
                    size={13}
                    className={clsx(
                      "transition-[transform,color] duration-200",
                      isGlass ? "text-white/70 group-hover:text-white" : "text-mute group-hover:text-ink",
                      activeMenu === "discover" && (isGlass ? "rotate-180 text-white" : "rotate-180 text-ink"),
                    )}
                  />
                </button>

                {/* 2. Departments Menu Button (WHAT) */}
                <button
                  type="button"
                  aria-expanded={activeMenu === "departments"}
                  aria-controls="departments-menu"
                  onPointerEnter={(e) => hoverOpen(e, "departments")}
                  onClick={(e) => {
                    closeSearch();
                    setActiveMenu((curr) => (curr === "departments" && (e.detail === 0 || !canHover()) ? null : "departments"));
                  }}
                  className={clsx(
                    "nav-item group flex items-center gap-1.5 px-3.5 py-2 text-support font-medium transition-colors",
                    isGlass ? "!text-white/85 hover:!text-white" : "",
                  )}
                >
                  <span>Departments</span>
                  <Icon
                    name="chevronDown"
                    size={13}
                    className={clsx(
                      "transition-[transform,color] duration-200",
                      isGlass ? "text-white/70 group-hover:text-white" : "text-mute group-hover:text-ink",
                      activeMenu === "departments" && (isGlass ? "rotate-180 text-white" : "rotate-180 text-ink"),
                    )}
                  />
                </button>

                {/* 3. Deals Link */}
                <Link
                  href="/search?deal=1"
                  onPointerEnter={(e) => hoverOpen(e, null)}
                  className={clsx(
                    "nav-item flex items-center gap-1.5 px-3.5 py-2 text-support font-medium transition-colors",
                    isGlass ? "!text-white/85 hover:!text-white" : "",
                  )}
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
              className={clsx(
                "relative hidden h-11 min-w-0 max-w-[620px] flex-1 items-center rounded-full px-2 py-1 transition-all duration-300 lg:flex",
                isGlass
                  ? "bg-white/15 border border-white/25 text-white backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/20 hover:border-white/35 focus-within:!bg-white/25 focus-within:!border-white/50 focus-within:!shadow-[0_0_0_2px_rgba(255,255,255,0.3)]"
                  : "bg-white shadow-[var(--shadow-hair)] hover:shadow-[0_0_0_1px_var(--color-line-hover)] focus-within:!shadow-[0_0_0_2px_rgb(var(--rgb-ink)/0.25)]",
              )}
            >
              <span className={clsx("grid h-8 w-8 shrink-0 place-items-center pl-1 transition-colors duration-200", isGlass ? "text-white/75" : "text-mute")}>
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
                className={clsx(
                  "h-full min-w-0 flex-1 bg-transparent px-2.5 text-body outline-none transition-colors duration-200",
                  isGlass ? "text-white placeholder:text-white/65" : "text-ink placeholder:text-mute",
                )}
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
                className={clsx(
                  "grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden",
                  isGlass ? "text-white hover:bg-white/15" : "hover:bg-soft text-ink",
                )}
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
                <ModeSwitch compact tone={isGlass ? "dark" : "light"} className="min-w-[176px]" />
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
                <SavedButton isGlass={isGlass} />

                {/* Account / Business */}
                <Link
                  href={business ? "/business" : "/account"}
                  className={clsx(
                    "nav-item hidden md:flex h-10 items-center gap-2 px-3.5 text-support font-medium transition-colors",
                    isGlass ? "!text-white/85 hover:!text-white" : "",
                  )}
                >
                  <Icon name={business ? "building" : "user"} size={17} />
                  <span>{business ? "Business" : "Account"}</span>
                </Link>
              </div>

              {/* Bag / Cart Action Button (Always visible) */}
              <CartButton isGlass={isGlass} />
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

function SavedButton({ isGlass }: { isGlass?: boolean }) {
  const hydrated = useHydrated();
  const count = useShop((s) => s.wishlist.length);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/wishlist"
      aria-label={`Saved pieces (${shown})`}
      className={clsx(
        "nav-item relative flex h-10 items-center gap-1.5 px-3.5 text-support font-medium transition-colors",
        isGlass ? "!text-white/85 hover:!text-white" : "",
      )}
    >
      <Icon name="heart" size={17} />
      <span className="hidden sm:inline">Saved</span>
      {shown > 0 && (
        <span
          className={clsx(
            "grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[10px] font-bold",
            isGlass ? "bg-brand text-ink" : "bg-ink text-white",
          )}
        >
          {shown}
        </span>
      )}
    </Link>
  );
}

function CartButton({ isGlass }: { isGlass?: boolean }) {
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
      className={clsx(
        "group relative flex h-10 items-center gap-2 rounded-full px-4 text-support font-medium transition-all active:scale-95",
        isGlass
          ? "bg-white/15 border border-white/25 text-white backdrop-blur-md hover:bg-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          : "bg-ink text-white hover:bg-graphite",
      )}
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
