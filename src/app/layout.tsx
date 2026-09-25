import type { Metadata, Viewport } from "next";
import "./globals.css";
import { geist, geistMono, funnel } from "./fonts";
import { getPrefs } from "@/lib/server-prefs";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toast } from "@/components/layout/toast";
import { CompareTray } from "@/components/layout/compare-tray";

export const metadata: Metadata = {
  metadataBase: new URL("https://ayiin.com"),
  title: {
    default: "Ayiin — The smarter way to shop and buy for business",
    template: "%s · Ayiin",
  },
  description:
    "Ayiin is a multi-vendor marketplace for people and companies. Exact delivery dates, total prices upfront, verified sellers — plus volume pricing, quotes, approvals and net terms for business.",
  applicationName: "Ayiin",
  openGraph: {
    type: "website",
    siteName: "Ayiin",
    title: "Ayiin — See more. Doubt less.",
    description: "The internet's smarter way to shop — and to buy for business.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = await getPrefs();
  return (
    <html lang="en" data-mode={prefs.mode} className={`${geist.variable} ${geistMono.variable} ${funnel.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers initial={prefs}>
          <Header />
          <main id="main">{children}</main>
          <Footer mode={prefs.mode} />
          <CartDrawer />
          <MobileNav />
          <CompareTray />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
