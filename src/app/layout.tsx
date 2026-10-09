import type { Metadata, Viewport } from "next";
import "./globals.css";
import { geist, geistMono, funnel } from "./fonts";
import { getPrefs } from "@/lib/server-prefs";
import { BRAND_COLORS } from "@/lib/brand-colors";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

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
  themeColor: BRAND_COLORS.porcelain,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = await getPrefs();
  return (
    <html lang="en" data-mode={prefs.mode} className={`${geist.variable} ${geistMono.variable} ${funnel.variable}`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var orig=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='fdprocessedid')return;return orig.apply(this,arguments);};}catch(e){}try{var clean=function(el){if(el&&el.nodeType===1&&el.hasAttribute('fdprocessedid'))el.removeAttribute('fdprocessedid');};var obs=new MutationObserver(function(mList){for(var i=0;i<mList.length;i++){var m=mList[i];if(m.type==='attributes'&&m.attributeName==='fdprocessedid'){clean(m.target);}else if(m.type==='childList'){for(var j=0;j<m.addedNodes.length;j++){var n=m.addedNodes[j];if(n.nodeType===1){clean(n);if(n.querySelectorAll){var els=n.querySelectorAll('[fdprocessedid]');for(var k=0;k<els.length;k++)els[k].removeAttribute('fdprocessedid');}}}}}});obs.observe(document.documentElement,{attributes:true,subtree:true,childList:true,attributeFilter:['fdprocessedid']});}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers initial={prefs}>
          <AppShell mode={prefs.mode}>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
