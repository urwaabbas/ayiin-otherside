import Link from "next/link";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { Icon, type IconName } from "@/components/ui/icon";
import { NewsletterForm } from "@/components/layout/newsletter";
import type { Mode } from "@/lib/types";

const PROMISES: { icon: IconName; title: string; body: string }[] = [
  { icon: "truck", title: "Exact delivery dates", body: "A real date on every product, not a range." },
  { icon: "receipt", title: "Total price upfront", body: "Shipping and fees shown before your cart." },
  { icon: "returns", title: "Free 30-day returns", body: "On every Ayiin Assured item. Label included." },
  { icon: "shield", title: "Verified sellers only", body: "4-point checks. Protected payments." },
];

export function Footer({ mode }: { mode: Mode }) {
  const business = mode === "business";
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: "Shop",
      links: [
        ["Verified deals", "/search?deal=1"],
        ["Arrives tomorrow", "/search?fast=1"],
        ["Audio & Tech", "/c/audio-tech"],
        ["Home & Living", "/c/home-living"],
        ["Compare", "/compare"],
      ],
    },
    {
      title: "Ayiin Business",
      links: [
        ["Business account", "/business"],
        ["Quick order", "/business?tab=quick"],
        ["Request a quote", "/business?tab=quotes"],
        ["Approvals & teams", "/business?tab=approvals"],
        ["Invoices & terms", "/business?tab=invoices"],
      ],
    },
    {
      title: "Sell",
      links: [
        ["Sell on Ayiin", "/sell"],
        ["Seller standards", "/sell#standards"],
        ["Fees", "/sell#fees"],
      ],
    },
    {
      title: "Help",
      links: [
        ["Track an order", "/track"],
        ["Returns", "/help#returns"],
        ["Delivery", "/help#delivery"],
        ["Contact", "/help#contact"],
        ["Brand", "/brand"],
      ],
    },
  ];

  return (
    <footer className="mt-10 pb-[84px] text-white lg:pb-0">
      {/* Promises strip, on the page */}
      <section aria-label="The Ayiin promise" className="mx-auto max-w-[1520px] px-3 text-ink sm:px-4">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <li key={p.title} className="flex gap-3 rounded-control bg-white p-4 shadow-[var(--shadow-hair)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-deep">
                <Icon name={p.icon} size={19} />
              </span>
              <div>
                <p className="text-support font-semibold">{p.title}</p>
                <p className="mt-0.5 text-support text-mute">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <a href="#main" className="mt-10 block bg-graphite py-3 text-center text-support font-medium text-white/90 hover:text-brand">
        Back to top
      </a>

      <div className="relative isolate overflow-hidden bg-ink">
        {/* Soft amber light behind the glass */}
        <span aria-hidden className="pointer-events-none absolute -left-40 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(255_166_36/0.35),transparent)] blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -right-32 bottom-40 -z-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgb(253_210_7/0.22),transparent)] blur-2xl" />

        <div className="mx-auto max-w-[1520px] px-4 pt-10 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
            {/* Brand + newsletter — glass panel */}
            <div className="rounded-surface bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-xl">
              <Link href="/" aria-label="Ayiin home" className="inline-flex">
                <AyiinLogo on="dark" className="h-10" />
              </Link>
              <p className="mt-4 max-w-[320px] text-support leading-relaxed text-white/75">
                {business ? "Procurement for teams: volume pricing, quotes, approvals and net terms." : "The marketplace with real prices, exact delivery dates and verified sellers."}
              </p>
              <div className="mt-5 max-w-[340px]">
                <NewsletterForm />
              </div>
            </div>
            {/* Link columns — glass panel */}
            <div className="grid grid-cols-2 gap-6 rounded-surface bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-xl sm:grid-cols-4">
              {cols.map((col) => (
                <nav key={col.title} aria-label={col.title}>
                  <p className="text-support font-semibold">{col.title}</p>
                  <ul className="mt-3 space-y-2 text-support text-white/70">
                    {col.links.map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="hover:text-brand">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          {/* ── Big Logo Glassmorphic Showcase ── */}
          <div className="relative mx-auto mt-14 max-w-[620px]">
            <Link
              href="/"
              aria-label="Ayiin home"
              className="group relative flex items-center justify-center overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.04] p-8 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_24px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-500 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.35),0_30px_70px_-20px_rgba(255,166,36,0.22)] sm:p-10"
            >
              {/* Subtle glass specular highlight / light sweep */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              />

              {/* Ambient brand amber aura behind the logo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,166,36,0.25),transparent_70%)] opacity-80 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
              />

              {/* Ultra-fine frosted grid texture accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
              />

              {/* The big Ayiin Logo */}
              <div className="relative z-10 w-full max-w-[380px] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]">
                <AyiinLogo
                  on="dark"
                  className="!h-auto !w-full opacity-95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                />
              </div>
            </Link>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 py-6 text-meta text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Ayiin Inc. · Multi-vendor marketplace for people and companies.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/help#privacy" className="hover:text-white">Privacy</Link>
              <Link href="/help#terms" className="hover:text-white">Terms</Link>
              <Link href="/help#accessibility" className="hover:text-white">Accessibility</Link>
              <span className="flex gap-1.5">
                {["Visa", "Mastercard", "Amex", "PayPal"].map((m) => (
                  <span key={m} className="rounded-compact bg-white/[0.06] px-1.5 py-0.5 text-meta text-white/75 ring-1 ring-white/15 backdrop-blur">{m}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
