"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Icon } from "@/components/ui/icon";
import { useReducedMotion } from "@/lib/use-media";

export interface HeroDepartment {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  blurb: string;
  accent: string;
  badge: string;
  stat: string;
  statLabel: string;
  heroImage: string; // Background cinematic visual (User Link 1)
  cardImage: string; // Interactive filmstrip card visual (User Link 2)
  bgPosition: string;
}

/**
 * 8 Ayiin Marketplace Departments with dual curated photographic assets from Pexels:
 * Hero image = expansive ambient background
 * Card image = tactical editorial focus inside the filmstrip
 */
export const HERO_DEPARTMENTS: HeroDepartment[] = [
  {
    slug: "audio-tech",
    name: "Audio & Tech",
    short: "Audio & Tech",
    tagline: "Precision Acoustics & Digital Reference",
    blurb: "Studio monitors, reference headphones, and lightweight hardware engineered for uninterrupted creative flow.",
    accent: "#FFA624",
    badge: "01 / 08 · ACOUSTICS",
    stat: "-38 dB ANC",
    statLabel: "Studio Reference",
    heroImage: "https://images.pexels.com/photos/11945638/pexels-photo-11945638.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/8374253/pexels-photo-8374253.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 55%",
  },
  {
    slug: "home-living",
    name: "Home & Living",
    short: "Home & Living",
    tagline: "Sculptural Form & Intentional Spaces",
    blurb: "Handcrafted stoneware, architectural seating, and warm ambient illumination curated from independent studios.",
    accent: "#D49352",
    badge: "02 / 08 · LIVING",
    stat: "Solid Oak & Ash",
    statLabel: "Artisanal Craft",
    heroImage: "https://images.pexels.com/photos/4939652/pexels-photo-4939652.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/4498879/pexels-photo-4498879.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 60%",
  },
  {
    slug: "kitchen",
    name: "Kitchen & Coffee",
    short: "Kitchen & Brew",
    tagline: "Morning Rituals & Culinary Precision",
    blurb: "Micro-lot single origins, PID-controlled gooseneck kettles, and chef-gauge ceramic tableware.",
    accent: "#E5A93C",
    badge: "03 / 08 · CULINARY",
    stat: "±0.5°C Control",
    statLabel: "Brew Precision",
    heroImage: "https://images.pexels.com/photos/19522833/pexels-photo-19522833.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/18033166/pexels-photo-18033166.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 50%",
  },
  {
    slug: "fashion",
    name: "Fashion & Carry",
    short: "Fashion & Carry",
    tagline: "Enduring Silhouettes & Tactile Leather",
    blurb: "Full-grain vegetable-tanned carry, weatherproof outerwear, and apparel backed by verified fit intelligence.",
    accent: "#C4795A",
    badge: "04 / 08 · ATELIER",
    stat: "Verified Sizing",
    statLabel: "Zero Restock Fee",
    heroImage: "https://images.pexels.com/photos/14039965/pexels-photo-14039965.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/7318919/pexels-photo-7318919.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 42%",
  },
  {
    slug: "beauty",
    name: "Beauty & Wellness",
    short: "Beauty & Ritual",
    tagline: "Active Botanicals & Total Transparency",
    blurb: "Cold-pressed bioactive formulas, concentrated serums, and restorative treatments with full ingredient disclosures.",
    accent: "#D68C7A",
    badge: "05 / 08 · WELLNESS",
    stat: "100% Disclosed",
    statLabel: "Clinical Actives",
    heroImage: "https://images.pexels.com/photos/3851790/pexels-photo-3851790.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/8534279/pexels-photo-8534279.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 45%",
  },
  {
    slug: "office",
    name: "Office & Workspace",
    short: "Workspace",
    tagline: "Ergonomic Rigor & Calm Productivity",
    blurb: "BIFMA Class-4 active seating, acoustic desktop partitions, and contract-grade furnishings for focused work.",
    accent: "#4F7466",
    badge: "06 / 08 · WORKSPACE",
    stat: "BIFMA Class 4",
    statLabel: "12-Year Warranty",
    heroImage: "https://images.pexels.com/photos/31726545/pexels-photo-31726545.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/5918384/pexels-photo-5918384.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 50%",
  },
  {
    slug: "supplies",
    name: "Packaging & Supplies",
    short: "Packaging",
    tagline: "Circular Logistics & Industrial Cartons",
    blurb: "Heavy-duty ECT-32 corrugated cartons, reinforced paper mailers, and pallet-grade warehouse fulfillment stock.",
    accent: "#A87B45",
    badge: "07 / 08 · LOGISTICS",
    stat: "ECT-32 Rated",
    statLabel: "Volume Tiering",
    heroImage: "https://images.pexels.com/photos/4440841/pexels-photo-4440841.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/4391486/pexels-photo-4391486.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 55%",
  },
  {
    slug: "safety",
    name: "Safety & Facility",
    short: "Safety & Facility",
    tagline: "Industrial Compliance & Heavy Protection",
    blurb: "ANSI and EN-certified head protection, high-visibility tactile apparel, and facility-grade sanitation standards.",
    accent: "#F5A623",
    badge: "08 / 08 · COMPLIANCE",
    stat: "ANSI Z89.1",
    statLabel: "Type 1 Class C",
    heroImage: "https://images.pexels.com/photos/8487341/pexels-photo-8487341.jpeg?auto=compress&cs=tinysrgb&w=2000",
    cardImage: "https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bgPosition: "center 48%",
  },
];

const AUTOPLAY_MS = 6000;
const HOVER_INTENT_MS = 65;
const EASE = [0.16, 1, 0.3, 1] as const;

export function DepartmentFilmstripHero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const railScrollRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const userInteracted = useRef(false);
  const inView = useRef(true);

  const select = useCallback((index: number, manual = true) => {
    if (manual) userInteracted.current = true;
    setActive(index);
  }, []);

  // Intersection observer to pause autoplay when offscreen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay progression (smoothly loops across the 8 categories)
  useEffect(() => {
    if (reduce || isPaused) return;
    const interval = setInterval(() => {
      if (isPaused || !inView.current || document.hidden) return;
      setActive((prev) => (prev + 1) % HERO_DEPARTMENTS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [reduce, isPaused]);

  // Keep focused card centered inside scrollable rail on smaller viewports
  useEffect(() => {
    const scrollContainer = railScrollRef.current;
    const targetItem = itemsRef.current[active];
    if (!scrollContainer || !targetItem) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) return;

    const containerWidth = scrollContainer.clientWidth;
    const itemOffset = targetItem.offsetLeft;
    const itemWidth = targetItem.offsetWidth;
    const scrollTarget = itemOffset - containerWidth / 2 + itemWidth / 2;

    scrollContainer.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (active + 1) % HERO_DEPARTMENTS.length;
      itemsRef.current[next]?.focus({ preventScroll: true });
      select(next, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (active - 1 + HERO_DEPARTMENTS.length) % HERO_DEPARTMENTS.length;
      itemsRef.current[prev]?.focus({ preventScroll: true });
      select(prev, true);
    }
  };

  const current = HERO_DEPARTMENTS[active];

  return (
    <section
      ref={rootRef}
      aria-label="Ayiin 8 Departments Editorial Hero"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative flex h-[clamp(650px,91svh,890px)] w-full flex-col justify-between overflow-hidden rounded-panel border border-white/15 bg-[#121110] text-white shadow-[var(--shadow-float)] sm:h-[clamp(670px,89svh,870px)]"
    >
      {/* ── 01. FULL-BLEED CINEMATIC BACKGROUND ── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        {HERO_DEPARTMENTS.map((dept, idx) => {
          const isCurrent = idx === active;
          return (
            <motion.div
              key={dept.slug}
              initial={false}
              animate={{
                opacity: isCurrent ? 1 : 0,
                scale: isCurrent ? (reduce ? 1 : 1.035) : 1.08,
              }}
              transition={{
                opacity: { duration: reduce ? 0 : 0.85, ease: EASE },
                scale: { duration: reduce ? 0 : 12, ease: "easeOut" },
              }}
              style={{ zIndex: isCurrent ? 1 : 0 }}
              className="absolute inset-0 h-full w-full will-change-[opacity,transform]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dept.heroImage}
                alt=""
                draggable={false}
                fetchPriority={idx === 0 ? "high" : "auto"}
                loading={idx === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
                style={{ objectPosition: dept.bgPosition }}
              />
            </motion.div>
          );
        })}

        {/* Cinematic Scrim & Color Grading */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/90 via-black/55 to-black/20 sm:from-black/85 sm:via-black/45 sm:to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/95 via-black/30 to-black/45" />

        {/* Ambient Chromatic Glow mapped to active department's tone */}
        <motion.div
          animate={{
            background: `radial-gradient(circle at 75% 75%, ${current.accent}24 0%, transparent 60%)`,
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-[3] mix-blend-screen opacity-70"
        />

        {/* Subtle noise/grid texture */}
        <div className="absolute inset-0 z-[4] opacity-25 grid-texture-dark" />
      </div>

      {/* ── 02. EDITORIAL MARKETPLACE HEADER LAYER ── */}
      <div className="relative z-10 px-6 pt-7 sm:px-12 sm:pt-11 lg:px-16 lg:pt-12">
        {/* Top Badges & Live Intelligence Signal */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-meta text-white/90 backdrop-blur-md shadow-sm">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: current.accent }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/95 font-semibold">
              AYIIN COMMERCE · {current.badge}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] tracking-wider text-white/70 backdrop-blur-md">
              <Icon name="shield" size={12} className="text-brand" />
              12-WEEK PRICE VERIFIED
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] tracking-wider text-white/70 backdrop-blur-md">
              <Icon name="truck" size={12} className="text-brand" />
              EXACT ARRIVAL DATES
            </span>
          </div>
        </div>

        {/* Main Display Headline */}
        <div className="mt-4 max-w-3xl">
          <h1 className="display text-[clamp(2.3rem,5.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white drop-shadow-md">
            See more. <span className="text-brand">Doubt less.</span>
          </h1>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.slug}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-2.5 font-display text-[clamp(1.1rem,2vw,1.45rem)] font-medium text-white/90 tracking-[-0.015em]"
            >
              {current.tagline}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.slug + "-blurb"}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-2.5 max-w-xl text-support text-white/75 leading-relaxed sm:text-body"
            >
              {current.blurb}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Decisive Marketplace CTAs & Department Badge */}
        <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href={`/c/${current.slug}`}
            className="group btn btn-primary h-12 px-7 text-support font-semibold shadow-[0_12px_28px_-8px_rgba(255,166,36,0.5)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore {current.name}</span>
            <Icon
              name="arrowRight"
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/search?deal=1"
            className="btn btn-secondary h-12 px-6 text-support font-semibold text-white border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
          >
            <Icon name="tag" size={15} className="text-brand" />
            <span>Today&apos;s Verified Deals</span>
          </Link>

          {/* Dynamic Spec Highlight */}
          <div className="hidden xl:inline-flex items-center gap-2 ml-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-2 backdrop-blur-md">
            <span className="font-mono text-xs font-semibold text-brand">
              {current.stat}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="font-mono text-[11px] text-white/75">
              {current.statLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── 03. HORIZONTAL EDITORIAL FILMSTRIP (8 CATEGORIES) ── */}
      <div className="relative z-10 pb-5 sm:pb-7" onKeyDown={onKeyDown}>
        {/* Strip Navigation Banner */}
        <div className="flex items-end justify-between gap-4 px-6 pb-3 sm:px-12 lg:px-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-brand">
              {String(active + 1).padStart(2, "0")} / {String(HERO_DEPARTMENTS.length).padStart(2, "0")}
            </span>
            <span className="h-3.5 w-px bg-white/25" />
            <span className="font-display text-sm font-semibold tracking-tight text-white/95">
              {current.name}
            </span>
          </div>

          {/* Strip Carousel Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous department"
              onClick={() => select((active - 1 + HERO_DEPARTMENTS.length) % HERO_DEPARTMENTS.length, true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Icon name="chevronLeft" size={15} />
            </button>
            <button
              type="button"
              aria-label="Next department"
              onClick={() => select((active + 1) % HERO_DEPARTMENTS.length, true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Icon name="chevronRight" size={15} />
            </button>
          </div>
        </div>

        {/* Filmstrip Rail */}
        <div
          ref={railScrollRef}
          className="no-scrollbar overflow-x-auto overscroll-x-contain scroll-smooth px-4 sm:px-10 lg:overflow-visible lg:px-16"
        >
          <ul
            ref={railRef}
            role="list"
            className="flex h-[clamp(190px,26svh,250px)] w-max gap-2.5 sm:gap-3 lg:w-full"
          >
            {HERO_DEPARTMENTS.map((dept, idx) => {
              const isActive = idx === active;
              return (
                <li
                  key={dept.slug}
                  data-active={isActive}
                  className={clsx(
                    "group relative min-w-0 shrink-0 transition-[flex-grow,width,transform,box-shadow] duration-700 ease-[var(--ease-out-expo)]",
                    // Mobile / Tablet widths
                    "w-[46vw] sm:w-[30vw]",
                    // Desktop flexible layout
                    "lg:w-auto lg:flex-1 lg:basis-0",
                    "rounded-2xl overflow-hidden data-[active=true]:-translate-y-1.5 data-[active=true]:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.85)]",
                  )}
                >
                  <Link
                    ref={(el) => {
                      itemsRef.current[idx] = el;
                    }}
                    href={`/c/${dept.slug}`}
                    aria-label={`Explore ${dept.name} department`}
                    aria-current={isActive ? "true" : undefined}
                    draggable={false}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      clearTimeout(hoverTimer.current);
                      hoverTimer.current = setTimeout(() => select(idx, false), HOVER_INTENT_MS);
                    }}
                    onPointerLeave={() => clearTimeout(hoverTimer.current)}
                    onClick={(e) => {
                      if (!isActive) {
                        e.preventDefault();
                        select(idx, true);
                      }
                    }}
                    className={clsx(
                      "relative block h-full w-full overflow-hidden rounded-2xl border transition-all duration-500 outline-none",
                      isActive
                        ? "border-brand/80 shadow-[inset_0_0_0_1px_rgba(255,166,36,0.4)] ring-1 ring-brand/40"
                        : "border-white/15 hover:border-white/40",
                    )}
                  >
                    {/* Card Photograph (Features the category's 2nd Pexels photo) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dept.cardImage}
                      alt={dept.name}
                      draggable={false}
                      loading="lazy"
                      className={clsx(
                        "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[var(--ease-out-expo)]",
                        isActive
                          ? "scale-105 brightness-100 saturate-105"
                          : "scale-100 brightness-[0.52] saturate-[0.75] group-hover:brightness-85 group-hover:scale-102",
                      )}
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div
                      className={clsx(
                        "absolute inset-0 transition-opacity duration-500",
                        isActive
                          ? "bg-gradient-to-t from-black/90 via-black/30 to-black/15"
                          : "bg-gradient-to-t from-black/80 via-black/45 to-black/30 group-hover:bg-black/35",
                      )}
                    />

                    {/* Index Numeral Pill */}
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] font-semibold text-white/90 backdrop-blur-md">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* REST STATE: Vertical Label on Slim Inactive Cards */}
                    <span
                      aria-hidden
                      className={clsx(
                        "absolute bottom-4 left-3 origin-bottom-left font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/90 transition-opacity duration-300 [writing-mode:vertical-rl] [transform:rotate(180deg)]",
                        isActive ? "opacity-0 pointer-events-none" : "opacity-100",
                      )}
                    >
                      {dept.short}
                    </span>

                    {/* ACTIVE STATE: Comprehensive Title, Spec, and Explore Arrow */}
                    <div
                      className={clsx(
                        "absolute inset-x-0 bottom-0 p-4 transition-all duration-500 ease-[var(--ease-out-expo)]",
                        isActive
                          ? "translate-y-0 opacity-100 delay-100"
                          : "translate-y-3 opacity-0 pointer-events-none",
                      )}
                    >
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-brand font-bold">
                            {dept.badge}
                          </p>
                          <h2 className="font-display truncate text-base font-semibold text-white tracking-tight sm:text-lg">
                            {dept.name}
                          </h2>
                          <p className="mt-0.5 truncate text-[11px] text-white/75 font-medium">
                            {dept.stat} · {dept.statLabel}
                          </p>
                        </div>

                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Icon name="arrowUpRight" size={16} />
                        </span>
                      </div>
                    </div>

                    {/* Active Accent Border at Bottom Edge */}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[3.5px] bg-brand shadow-[0_0_12px_rgba(255,166,36,0.8)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Department Switcher Pager Dots (Touch Screen Assistance) */}
        <div className="mt-3 flex items-center justify-center gap-1.5 lg:hidden">
          {HERO_DEPARTMENTS.map((dept, idx) => (
            <button
              key={dept.slug}
              type="button"
              aria-label={`Jump to ${dept.name}`}
              onClick={() => select(idx, true)}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                idx === active ? "w-6 bg-brand" : "w-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
