"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const INTENTS = [
  {
    title: "For Your Home",
    eyebrow: "LIVING & SPACES",
    blurb: "Considered furniture, tactile stoneware & ambient lighting for spaces you return to.",
    href: "/c/home-living",
    icon: "sparkle",
    badge: "Curated",
  },
  {
    title: "For Your Workspace",
    eyebrow: "ERGONOMICS & FOCUS",
    blurb: "BIFMA seating, low-profile mechanical typing & acoustic isolation for deep work.",
    href: "/c/office",
    icon: "building",
    badge: "High focus",
  },
  {
    title: "For Travel",
    eyebrow: "TRANSIT & CARRY",
    blurb: "Weatherproof daypacks, compact ANC headphones & thermal hydration.",
    href: "/search?q=travel",
    icon: "box",
    badge: "Lightweight",
  },
  {
    title: "For Gifting",
    eyebrow: "UNCOMPROMISING",
    blurb: "Hand-cast bud vases, automatic timepieces & bespoke soy candles under $100.",
    href: "/search?intent=gift",
    icon: "heart",
    badge: "Gift-ready",
  },
  {
    title: "Under $50",
    eyebrow: "DAILY ESSENTIALS",
    blurb: "Washed Guji single-origin roast, stoneware mugs, organic cleaner & natural notebooks.",
    href: "/search?maxPrice=50",
    icon: "tag",
    badge: "Value lows",
  },
  {
    title: "Best Rated",
    eyebrow: "4.8★ & ABOVE",
    blurb: "Objects with verifiable customer satisfaction and long-term durability scores.",
    href: "/search?sort=popular",
    icon: "shield",
    badge: "Verified",
  },
  {
    title: "Arrives Tomorrow",
    eyebrow: "NEXT-DAY DISPATCH",
    blurb: "Stock pre-positioned in regional hubs for guaranteed arrival by tomorrow evening.",
    href: "/search?fast=1",
    icon: "pin",
    badge: "In stock",
  },
  {
    title: "Trending Now",
    eyebrow: "MOST SAVED",
    blurb: "The pieces attracting the most wishlist saves and repeat inquiries this week.",
    href: "/search?sort=popular",
    icon: "expand",
    badge: "Popular",
  },
];

export function DiscoverMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="shell py-8">
      {/* Header kicker */}
      <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
            WHY YOU SHOP · INTENT & ACTIVITY
          </p>
          <h2 className="display mt-1 text-heading">
            Discover by what you want to achieve
          </h2>
        </div>
        <p className="hidden text-support text-mute md:block">
          Looking for specific categories? Switch to <strong className="font-medium text-ink">Departments</strong>.
        </p>
      </div>

      {/* Bento intent grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INTENTS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            onClick={onClose}
            className="group relative flex flex-col justify-between rounded-surface border border-line/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_8px_24px_-10px_rgb(var(--rgb-ink)/0.12)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                  {item.eyebrow}
                </span>
                <span className="rounded-full bg-soft px-2 py-0.5 font-mono text-[9px] font-medium text-ink-2">
                  {item.badge}
                </span>
              </div>
              <h3 className="mt-2.5 text-[1.0625rem] font-semibold text-ink group-hover:text-brand transition-colors">
                {item.title}
              </h3>
              <p className="mt-1.5 text-support leading-relaxed text-mute">
                {item.blurb}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3 text-meta font-medium text-ink-2 group-hover:text-ink">
              <span>Explore collection</span>
              <Icon
                name="arrowRight"
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
