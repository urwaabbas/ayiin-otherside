"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

/** Shop by occasion or need: one tap, no explanation. */
const INTENTS: { title: string; href: string; icon: IconName }[] = [
  { title: "For your home", href: "/c/home-living", icon: "home" },
  { title: "For your workspace", href: "/c/office", icon: "building" },
  { title: "For travel", href: "/search?q=travel", icon: "box" },
  { title: "Gifts", href: "/search?intent=gift", icon: "heart" },
  { title: "Under $50", href: "/search?maxPrice=50", icon: "tag" },
  { title: "Best rated", href: "/search?sort=popular", icon: "star" },
  { title: "Arrives tomorrow", href: "/search?fast=1", icon: "truck" },
  { title: "Trending", href: "/search?sort=popular", icon: "trend" },
];

export function DiscoverMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="shell py-5">
      <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {INTENTS.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              onClick={onClose}
              className="group flex items-center gap-3 border-b border-line py-3 text-body text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              <Icon name={item.icon} size={18} className="text-mute transition-colors group-hover:text-brand-deep" />
              <span className="flex-1">{item.title}</span>
              <Icon name="arrowRight" size={14} className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
