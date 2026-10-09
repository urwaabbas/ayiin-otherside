"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toast } from "@/components/layout/toast";
import { CompareTray } from "@/components/layout/compare-tray";
import { PageMotion } from "@/components/motion/page-motion";
import type { Mode } from "@/lib/types";

export function AppShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: Mode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // In the admin section, isolate completely: NO storefront navbar, footer, cart drawer, or customer menus
  if (isAdmin) {
    return (
      <>
        {children}
        <Toast />
      </>
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer mode={mode} />
      <CartDrawer />
      <MobileNav />
      <CompareTray />
      <Toast />
      <PageMotion />
    </>
  );
}
