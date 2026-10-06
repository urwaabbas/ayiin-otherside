"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Mode } from "@/lib/types";

interface PromiseItem {
  number: string;
  category: string;
  title: string;
  body: string;
  icon: IconName;
}

const PROMISES: PromiseItem[] = [
  {
    number: "01",
    category: "DELIVERY",
    title: "Exact Delivery Dates",
    body: "A verified delivery commitment on every listing, never an estimated window.",
    icon: "truck",
  },
  {
    number: "02",
    category: "TRANSPARENCY",
    title: "Upfront Landed Pricing",
    body: "Freight, duty, and local handling calculated before your cart.",
    icon: "receipt",
  },
  {
    number: "03",
    category: "CONFIDENCE",
    title: "30-Day Managed Returns",
    body: "Available on all Ayiin Assured inventory with prepaid collection.",
    icon: "returns",
  },
  {
    number: "04",
    category: "VETTING",
    title: "Verified Merchant Escrow",
    body: "Strict four-point origin validation with protected milestone release.",
    icon: "shield",
  },
];

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export function Footer({ mode }: { mode: Mode }) {
  const business = mode === "business";

  const sections: FooterSection[] = [
    {
      title: "Shop",
      links: [
        { label: "Verified Deals", href: "/search?deal=1" },
        { label: "Arrives Tomorrow", href: "/search?fast=1" },
        { label: "Audio & Acoustics", href: "/c/audio-tech" },
        { label: "Living & Interiors", href: "/c/home-living" },
        { label: "Ergonomic Seating", href: "/c/ergonomic-seating" },
        { label: "Catalogue Compare", href: "/compare" },
      ],
    },
    {
      title: "Ayiin Business",
      links: [
        { label: "Corporate Account", href: "/business" },
        { label: "Quick Volume Order", href: "/business?tab=quick" },
        { label: "Enterprise Quotes", href: "/business?tab=quotes" },
        { label: "Approval Workflows", href: "/business?tab=approvals" },
        { label: "Invoices & Net 30", href: "/business?tab=invoices" },
      ],
    },
    {
      title: "Vendors & Trade",
      links: [
        { label: "Sell on Ayiin", href: "/sell" },
        { label: "Seller Quality Code", href: "/sell#standards" },
        { label: "Designer Trade Tier", href: "/business" },
        { label: "Transparent Fee Matrix", href: "/sell#fees" },
        { label: "Brand Verification", href: "/brand" },
      ],
    },
    {
      title: "Client Care",
      links: [
        { label: "Track Shipment", href: "/track" },
        { label: "Returns & Exchanges", href: "/help#returns" },
        { label: "White-Glove Delivery", href: "/help#delivery" },
        { label: "Concierge Support", href: "/help#contact" },
        { label: "Security & Escrow", href: "/help" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-[#2a2622] bg-[#141210] text-white selection:bg-brand selection:text-ink lg:mt-28">
      {/* ── 1. Editorial Promises Strip (Layaan Minimalist Atelier Style) ── */}
      <section aria-label="Ayiin Standards" className="border-b border-[#2a2622]">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 divide-y divide-[#2a2622] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {PROMISES.map((p, idx) => (
              <li
                key={p.number}
                className={`py-8 sm:py-10 ${
                  idx % 2 === 0 ? "sm:pr-8" : "sm:pl-8"
                } lg:px-8 lg:first:pl-0 lg:last:pr-0`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-brand">
                    {p.number} / {p.category}
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-brand/90">
                    <Icon name={p.icon} size={14} />
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-medium tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 2. Main Editorial Navigation & Brand Column ── */}
      <div className="mx-auto max-w-[1520px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Brand & Newsletter Invitation (Col 1-5) */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <Link href="/" aria-label="Ayiin home" className="inline-block transition-opacity hover:opacity-90">
                <AyiinLogo on="dark" className="!h-8 !w-auto" />
              </Link>

              <p className="mt-5 max-w-sm font-sans text-[13.5px] leading-relaxed text-white/65">
                {business
                  ? "Procurement infrastructure for high-growth teams — volume pricing, net terms, and centralized approval controls."
                  : "A curated commerce marketplace for modern workspaces and refined interiors — verified vendors, upfront pricing, exact delivery dates."}
              </p>

              {/* Newsletter / The Ayiin Dispatch Form */}
              <div className="mt-9">
                <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-brand/90 uppercase">
                  Stay Informed
                </p>
                <p className="mt-1 text-[13px] text-white/50">
                  Receive private inventory drops, trade allowances, and design briefs.
                </p>

                <FooterNewsletterForm />
              </div>
            </div>

            {/* Live Operational Status Signal */}
            <div className="mt-10 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[11px] tracking-wide text-white/50">
                Marketplace Operational · 99.98% On-Time Fulfillment
              </span>
            </div>
          </div>

          {/* Navigation Columns (Col 6-12) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
            {sections.map((sec) => (
              <nav key={sec.title} aria-label={sec.title}>
                <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                  {sec.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {sec.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center text-[13px] text-white/65 transition-colors duration-200 hover:text-white"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Giant Interactive Watermark Display (Signature Layaan Feature) ── */}
      <InteractiveBrandWatermark />

      {/* ── 4. Baseline Bar / Copyright / Payment / Back to Top ── */}
      <div className="border-t border-[#2a2622]">
        <div className="mx-auto flex max-w-[1520px] flex-col gap-4 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Ayiin Inc. All rights reserved.</p>

          {/* Discreet Legal & Security Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
            <Link href="/help#privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/help#terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/help#accessibility" className="transition-colors hover:text-white">
              Accessibility
            </Link>
            <Link href="/brand" className="transition-colors hover:text-white">
              Brand Assets
            </Link>
          </div>

          {/* Payment Badges & Back to Top */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/60">
              {["VISA", "MC", "AMEX", "PAYPAL", "WIRE"].map((badge) => (
                <span
                  key={badge}
                  className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 tracking-wider"
                >
                  {badge}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/50 transition-colors hover:text-brand"
            >
              <span>Top</span>
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * High-end Minimalist Newsletter Form matching Layaan's refined hairline design
 */
function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (/\S+@\S+\.\S+/.test(email)) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-4 py-2 text-xs text-emerald-300">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-ink">
          <Icon name="check" size={10} strokeWidth={2.5} />
        </span>
        <span>Subscribed. Welcome to the private dispatch.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex max-w-sm items-center rounded-full border border-white/15 bg-white/[0.03] p-1 shadow-sm transition-all focus-within:border-brand/70 focus-within:bg-white/[0.05]"
    >
      <label htmlFor="footer-newsletter-input" className="sr-only">
        Work email address
      </label>
      <input
        id="footer-newsletter-input"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email..."
        className="h-9 min-w-0 flex-1 bg-transparent px-3 text-xs text-white placeholder:text-white/35 focus:outline-none"
      />
      <button
        type="submit"
        className="group inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink transition-all hover:bg-brand-hover hover:shadow-[0_0_15px_rgba(255,166,36,0.4)]"
      >
        <span>Join</span>
        <Icon name="arrowRight" size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

/**
 * Signature Layaan Interactive Watermark
 * Features an outlined text base layer with a pointer-tracking golden spotlight mask layer
 */
function InteractiveBrandWatermark() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  const letters = ["A", "Y", "I", "I", "N"];
  const typographyClass =
    "block select-none font-display text-[clamp(4.5rem,1.5rem+15vw,17rem)] font-extrabold leading-[0.8] tracking-[-0.03em] text-center";

  return (
    <div
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto max-w-[1520px] cursor-default select-none overflow-hidden px-4 pt-12 pb-6 sm:px-6 lg:px-8"
    >
      {/* Ambient background glow aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,166,36,0.1),transparent_70%)] blur-3xl" />

      {/* 1. Base Layer: Gold Outlined Stroke Typography */}
      <span
        className={`${typographyClass}`}
        style={{
          WebkitTextStroke: "1px rgba(255, 166, 36, 0.24)",
          color: "transparent",
        }}
      >
        {letters.map((char, index) => (
          <span
            key={index}
            className="inline-block transition-transform duration-500 hover:scale-[1.02]"
          >
            {char}
          </span>
        ))}
      </span>

      {/* 2. Interactive Spotlight Fill Layer (Masked by Pointer Coordinates) */}
      <span
        className={`${typographyClass} pointer-events-none absolute inset-x-0 top-12 bg-gradient-to-b from-[#FFF5E6] via-[#FFA624] to-[#A5520C] bg-clip-text text-transparent transition-opacity duration-300 ${
          mousePos.active ? "opacity-100" : "opacity-0"
        }`}
        style={{
          maskImage: `radial-gradient(circle clamp(120px, 15vw, 260px) at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle clamp(120px, 15vw, 260px) at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
        }}
      >
        {letters.map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}
