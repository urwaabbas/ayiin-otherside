"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface ScrollMorphCardItem {
  id?: string | number;
  src: string;
  title: string;
  category: string;
  price?: string;
  href?: string;
}

interface FlipCardProps {
  item: ScrollMorphCardItem;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

const IMG_WIDTH = 88;
const IMG_HEIGHT = 124;

function FlipCard({
  item,
  index,
  target,
}: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 45,
        damping: 16,
      }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group select-none"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face — glassmorphism card */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            backfaceVisibility: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Glass overlay — stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Shimmer edge highlight */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0) 60%)" }}
          />
          {/* Index tag */}
          <div className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[8px] text-white/90"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Back Face (3D Flip) — glass dark */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-3 text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(14,12,10,0.82)",
            backdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255,166,36,0.35)",
            boxShadow: "0 0 24px rgba(255,166,36,0.12) inset",
          }}
        >
          <p className="font-mono text-[7px] font-bold uppercase tracking-widest text-brand mb-1 truncate w-full">
            {item.category}
          </p>
          <p className="font-display text-[10px] font-semibold text-white leading-tight line-clamp-3 mb-1">
            {item.title}
          </p>
          {item.price && (
            <p className="num text-[10px] font-bold text-brand/90 mt-0.5">
              {item.price}
            </p>
          )}
          <Link
            href={item.href ?? "/search"}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[8px] font-bold text-black transition-transform hover:scale-105"
          >
            Shop <Icon name="arrowRight" size={8} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 12;
const MAX_SCROLL = 2800;

export const AYIIN_HERO_CARDS: ScrollMorphCardItem[] = [
  {
    src: "https://images.pexels.com/photos/11945638/pexels-photo-11945638.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Aurel ANC Over-Ear",
    category: "Audio & Tech",
    price: "$249",
    href: "/c/audio-tech",
  },
  {
    src: "https://images.pexels.com/photos/8374253/pexels-photo-8374253.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Aurel Buds Pro",
    category: "Audio & Tech",
    price: "$169",
    href: "/c/audio-tech",
  },
  {
    src: "https://images.pexels.com/photos/4939652/pexels-photo-4939652.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Loom Lounge Chair",
    category: "Home & Living",
    price: "$689",
    href: "/c/home-living",
  },
  {
    src: "https://images.pexels.com/photos/4498879/pexels-photo-4498879.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Stoneware Plant & Decor",
    category: "Home & Living",
    price: "$79",
    href: "/c/home-living",
  },
  {
    src: "https://images.pexels.com/photos/19522833/pexels-photo-19522833.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Ethiopia Guji Single Origin",
    category: "Kitchen & Coffee",
    price: "$36",
    href: "/c/kitchen",
  },
  {
    src: "https://images.pexels.com/photos/18033166/pexels-photo-18033166.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Pour Gooseneck Kettle",
    category: "Kitchen & Coffee",
    price: "$95",
    href: "/c/kitchen",
  },
  {
    src: "https://images.pexels.com/photos/14039965/pexels-photo-14039965.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Transit Daypack 22L",
    category: "Fashion & Carry",
    price: "$129",
    href: "/c/fashion",
  },
  {
    src: "https://images.pexels.com/photos/7318919/pexels-photo-7318919.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Solstice Atelier Tote",
    category: "Fashion & Carry",
    price: "$185",
    href: "/c/fashion",
  },
  {
    src: "https://images.pexels.com/photos/3851790/pexels-photo-3851790.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Night Recovery Facial Oil",
    category: "Beauty & Wellness",
    price: "$46",
    href: "/c/beauty",
  },
  {
    src: "https://images.pexels.com/photos/8534279/pexels-photo-8534279.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Botanical Calm Ritual",
    category: "Beauty & Wellness",
    price: "$32",
    href: "/c/beauty",
  },
  {
    src: "https://images.pexels.com/photos/31726545/pexels-photo-31726545.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Kova Vista 27 4K Monitor",
    category: "Office & Workspace",
    price: "$429",
    href: "/c/office",
  },
  {
    src: "https://images.pexels.com/photos/5918384/pexels-photo-5918384.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Ergo Task Chair Pro",
    category: "Office & Workspace",
    price: "$549",
    href: "/c/office",
  },
  {
    src: "https://images.pexels.com/photos/4440841/pexels-photo-4440841.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "ECT-32 Corrugated Cartons",
    category: "Packaging & Supplies",
    price: "$28",
    href: "/c/supplies",
  },
  {
    src: "https://images.pexels.com/photos/4391486/pexels-photo-4391486.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Reinforced Kraft Mailers",
    category: "Packaging & Supplies",
    price: "$19",
    href: "/c/supplies",
  },
  {
    src: "https://images.pexels.com/photos/8487341/pexels-photo-8487341.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Vented Safety Helmet Pro",
    category: "Safety & Facility",
    price: "$48",
    href: "/c/safety",
  },
  {
    src: "https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Reflective Technical Shell",
    category: "Safety & Facility",
    price: "$85",
    href: "/c/safety",
  },
  {
    src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    title: "Kova Book 14 Air",
    category: "Audio & Tech",
    price: "$1,249",
    href: "/p/kova-book-14-air",
  },
  {
    src: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    title: "Ember Soy Candle",
    category: "Home & Living",
    price: "$38",
    href: "/p/ember-soy-candle",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    title: "Stride Runner 2",
    category: "Fashion & Carry",
    price: "$148",
    href: "/p/stride-runner-2",
  },
  {
    src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    title: "Everyday Stoneware Mugs",
    category: "Kitchen & Coffee",
    price: "$42",
    href: "/p/everyday-stoneware-mugs",
  },
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export interface ScrollMorphHeroProps {
  items?: ScrollMorphCardItem[];
  introTitle?: string;
  introSubtitle?: string;
  arcTitle?: string;
  arcSubtitle?: string;
  className?: string;
}

export function ScrollMorphHero({
  items = AYIIN_HERO_CARDS,
  introTitle = "Intelligent Commerce.",
  introSubtitle = "SCROLL TO EXPLORE AYIIN",
  arcTitle = "Curated Across Every Category.",
  arcSubtitle = "Discover verified deals, exact delivery dates, and transparent landed costs across 8 curated departments.",
  className = "",
}: ScrollMorphHeroProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver for responsive bounds
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // Virtual Scroll Logic
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow browser page to scroll past the boundaries so user can browse the homepage
      if (
        (scrollRef.current <= 0 && e.deltaY < 0) ||
        (scrollRef.current >= MAX_SCROLL && e.deltaY > 0)
      ) {
        return;
      }

      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY * 1.5, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;

      if (
        (scrollRef.current <= 0 && deltaY < 0) ||
        (scrollRef.current >= MAX_SCROLL && deltaY > 0)
      ) {
        return;
      }

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY * 2, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 35, damping: 22 });

  // 2. Scroll Rotation (Shuffling across arc)
  const scrollRotate = useTransform(virtualScroll, [600, 2800], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 35, damping: 22 });

  // 3. Mouse Parallax
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 28, damping: 22 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 90);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // Intro Sequence: scatter -> line (500ms) -> circle (2200ms)
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 500);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Stable scatter positions keep the intro layout consistent across renders.
  const scatterPositions = useMemo(() => {
    return items.map((_, index) => {
      const xPosition = (index * 0.61803398875) % 1;
      const yPosition = (index * 0.75487766625) % 1;
      const rotation = (index * 0.56984029099) % 1;

      return {
        x: (xPosition - 0.5) * 1600,
        y: (yPosition - 0.5) * 1100,
        rotation: (rotation - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      };
    });
  }, [items]);

  // Render loop values
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubMorph = smoothMorph.on("change", setMorphValue);
    const unsubRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubMorph();
      unsubRotate();
      unsubParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // Content fade transitions
  const contentOpacity = useTransform(smoothMorph, [0.75, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.75, 1], [24, 0]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[clamp(620px,90svh,880px)] rounded-panel overflow-hidden text-white ${className}`}
      style={{
        background: "rgba(10,9,8,0.88)",
        backdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,166,36,0.06) inset",
      }}
    >
      {/* ── Liquid aurora background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large warm-amber orb — top-right drift */}
        <div
          className="absolute"
          style={{
            width: "70%", height: "70%",
            top: "-20%", right: "-15%",
            background: "radial-gradient(ellipse at center, rgba(255,166,36,0.13) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "auroraA 12s ease-in-out infinite alternate",
          }}
        />
        {/* Cool-blue/teal orb — bottom-left */}
        <div
          className="absolute"
          style={{
            width: "55%", height: "55%",
            bottom: "-10%", left: "-10%",
            background: "radial-gradient(ellipse at center, rgba(80,140,255,0.09) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "auroraB 15s ease-in-out infinite alternate",
          }}
        />
        {/* Center amber pulse */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,166,36,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Subtle noise grain for liquid texture */}
        <div className="absolute inset-0 opacity-[0.03] grid-texture-dark" />
        {/* Bottom vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      <style>{`
        @keyframes auroraA {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(-4%,6%) scale(1.08); }
          100% { transform: translate(4%,-4%) scale(0.95); }
        }
        @keyframes auroraB {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(5%,-5%) scale(1.12); }
          100% { transform: translate(-3%,8%) scale(0.92); }
        }
      `}</style>

      <div className="flex h-full w-full flex-col items-center justify-center [perspective:1000px]">
        {/* Top brand header bar */}
        <div className="absolute top-5 inset-x-0 z-30 flex items-center justify-between px-6 sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/85">
              AYIIN · CURATED CATALOGUE
            </span>
          </div>

          <div className="font-display text-sm font-semibold tracking-[0.12em] text-white">
            AYIIN <span className="text-brand">/</span> COMMERCE
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/60">
            <span>8 DEPARTMENTS</span>
            <span>·</span>
            <span>VERIFIED DEALS</span>
          </div>
        </div>

        {/* ── Intro Text — z-30 glass plate so cards NEVER cover it ── */}
        <motion.div
          className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-6 py-5 max-w-lg w-full"
          animate={
            introPhase === "circle" && morphValue < 0.5
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          transition={{ duration: 0.8 }}
        >
          {/* Frosted glass backdrop for the text */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "rgba(10,9,8,0.45)",
              backdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 0 60px rgba(255,166,36,0.05) inset",
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            {/* Top pill label */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{
                background: "rgba(255,166,36,0.12)",
                border: "1px solid rgba(255,166,36,0.28)",
                color: "rgba(255,166,36,0.95)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              AYIIN · 8 DEPARTMENTS
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(12px)" }
              }
              transition={{ duration: 1 }}
              className="font-display font-semibold tracking-[-0.03em] text-white"
              style={{
                fontSize: "clamp(2rem,5vw,3.5rem)",
                lineHeight: 1.1,
                textShadow: "0 0 40px rgba(255,166,36,0.3), 0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              {introTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.85 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: 1, delay: 0.25 }}
              className="mt-3 font-mono text-[11px] font-semibold tracking-[0.24em]"
              style={{ color: "rgba(255,166,36,0.9)" }}
            >
              {introSubtitle}
            </motion.p>
          </div>
        </motion.div>

        {/* ── Arc Active Content (Fades In at Top when Arc is Formed) ── */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-6 max-w-2xl"
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand">
            AYIIN MARKETPLACE · 8 DEPARTMENTS
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-white tracking-tight mb-2.5">
            {arcTitle}
          </h2>
          <p className="text-support md:text-body text-white/80 leading-relaxed max-w-lg">
            {arcSubtitle}
          </p>
          <div className="mt-4 flex items-center gap-3 pointer-events-auto">
            <Link
              href="/search"
              className="btn btn-primary h-10 px-5 text-support font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Shop All Categories <Icon name="arrowRight" size={14} />
            </Link>
            <Link
              href="/search?deal=1"
              className="btn btn-secondary h-10 px-5 text-support font-medium text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              Today&apos;s Verified Deals
            </Link>
          </div>
        </motion.div>

        {/* ── 20 Flip Cards Container ── */}
        <div className="relative flex items-center justify-center w-full h-full">
          {items.slice(0, TOTAL_IMAGES).map((item, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            // 1. Intro Phases (Scatter -> Line)
            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const lineSpacing = 96;
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              // 2. Circle Phase & Morph Logic
              const isMobile = containerSize.width < 768;
              const minDimension = Math.min(containerSize.width, containerSize.height);

              // A. Calculate Circle Position
              const circleRadius = Math.min(minDimension * 0.36, 360);
              const circleAngle = (i / TOTAL_IMAGES) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              // B. Calculate Bottom Arc Position (Convex arch)
              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
              const arcRadius = baseRadius * (isMobile ? 1.35 : 1.15);

              const arcApexY = containerSize.height * (isMobile ? 0.36 : 0.28);
              const arcCenterY = arcApexY + arcRadius;

              const spreadAngle = isMobile ? 115 : 150;
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (TOTAL_IMAGES - 1);

              // Bounded Rotation (Shuffle across the arc)
              const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
              const maxRotation = spreadAngle * 0.8;
              const boundedRotation = -scrollProgress * maxRotation;

              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.6 : 2.1,
              };

              // C. Interpolate (Morph)
              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return (
              <FlipCard
                key={i}
                item={item}
                index={i}
                total={TOTAL_IMAGES}
                phase={introPhase}
                target={target}
              />
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            Hover cards for 3D item specs · Scroll down to morph & shuffle
          </p>
        </div>
      </div>
    </div>
  );
}
