"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon, type IconName } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";

function Item({
  icon,
  label,
  active,
  onClick,
  href,
  badge,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  badge?: number;
}) {
  const inner = (
    <>
      <span className="relative">
        <Icon name={icon} size={22} strokeWidth={active ? 1.9 : 1.6} />
        {badge ? (
          <span className="num absolute -right-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-ink ring-2 ring-porcelain">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={clsx("text-[10.5px] tracking-[-0.01em]", active ? "font-medium text-ink" : "text-mute")}>{label}</span>
      <span aria-hidden className={clsx("absolute top-0 h-[2px] w-6 rounded-full bg-ink transition-opacity", active ? "opacity-100" : "opacity-0")} />
    </>
  );
  const cls = "relative flex flex-1 flex-col items-center justify-center gap-1 pt-1";
  return href ? (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/** Thumb-zone navigation for phones: five destinations, always one tap away. */
export function MobileNav() {
  const pathname = usePathname();
  const { mode } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const count = useShop((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const openSearch = useUI((s) => s.openSearch);
  const openCart = useUI((s) => s.openCart);
  const setMenu = useUI((s) => s.setMenu);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-porcelain/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <div className="flex h-[62px]">
        <Item icon="home" label="Home" href="/" active={pathname === "/"} />
        <Item icon="grid" label="Browse" onClick={() => setMenu(true)} active={pathname.startsWith("/c/")} />
        <Item icon="search" label="Search" onClick={openSearch} active={pathname.startsWith("/search")} />
        {business ? (
          <Item icon="building" label="Business" href="/business" active={pathname.startsWith("/business")} />
        ) : (
          <Item icon="heart" label="Saved" href="/wishlist" active={pathname.startsWith("/wishlist")} />
        )}
        <Item icon="bag" label="Cart" onClick={openCart} badge={hydrated && count ? count : undefined} />
      </div>
    </nav>
  );
}
