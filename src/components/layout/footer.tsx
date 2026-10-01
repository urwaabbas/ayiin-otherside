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
            <li key={p.title} className="flex gap-3 rounded-xl bg-white p-4 shadow-[var(--shadow-hair)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-deep">
                <Icon name={p.icon} size={19} />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold">{p.title}</p>
                <p className="mt-0.5 text-[13px] text-mute">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <a href="#main" className="mt-10 block bg-graphite-2 py-3.5 text-center text-[13.5px] font-medium hover:bg-graphite">
        Back to top
      </a>

      <div className="bg-ink">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Link href="/" aria-label="Ayiin home" className="inline-flex">
              <AyiinLogo on="dark" className="h-10" />
            </Link>
            <p className="mt-4 max-w-[260px] text-[13.5px] leading-relaxed text-white/70">
              {business ? "Procurement for teams: volume pricing, quotes, approvals and net terms." : "The marketplace with real prices, exact delivery dates and verified sellers."}
            </p>
            <div className="mt-5 max-w-[300px]">
              <NewsletterForm />
            </div>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[15px] font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2 text-[13.5px] text-white/70">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-6 text-[12.5px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Ayiin Inc. · Multi-vendor marketplace for people and companies.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/help#privacy" className="hover:text-white">Privacy</Link>
              <Link href="/help#terms" className="hover:text-white">Terms</Link>
              <Link href="/help#accessibility" className="hover:text-white">Accessibility</Link>
              <span className="flex gap-1.5">
                {["Visa", "Mastercard", "Amex", "PayPal"].map((m) => (
                  <span key={m} className="rounded border border-white/20 px-1.5 py-0.5 text-[10.5px] text-white/70">{m}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
