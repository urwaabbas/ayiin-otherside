import Link from "next/link";
import { AyiinWordmark, AyiinSymbol } from "@/components/brand/logo";
import { Icon, type IconName } from "@/components/ui/icon";
import { NewsletterForm } from "@/components/layout/newsletter";
import type { Mode } from "@/lib/types";

const PROMISES: { icon: IconName; title: string; body: string }[] = [
  { icon: "truck", title: "Exact delivery dates", body: "A real date on every product, not a range." },
  { icon: "receipt", title: "Total price upfront", body: "Shipping and fees shown before your bag." },
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
    <footer className="mt-24 pb-[84px] lg:pb-0">
      <section aria-label="The Ayiin promise" className="shell">
        <ul className="grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <li key={p.title} className="flex gap-4 bg-porcelain p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)]">
                <Icon name={p.icon} size={19} />
              </span>
              <div>
                <p className="text-[15px] font-medium">{p.title}</p>
                <p className="mt-0.5 text-[13.5px] text-mute">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="panel-ink relative mt-16 overflow-hidden lg:mx-3 lg:mb-3 lg:rounded-[36px]">
        <div aria-hidden className="grid-texture-dark pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="shell relative pt-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
            <div>
              <AyiinSymbol tone="porcelain" lens="lime" tight className="h-10" />
              <p className="display mt-6 max-w-sm text-[34px] leading-[1.02] text-porcelain">
                {business ? "Procurement, without the process." : "See more. Doubt less."}
              </p>
              <p className="mt-4 max-w-sm text-[14.5px] text-mute-dark">
                The Ayiin Brief — one short email a week with what&apos;s genuinely worth buying, and why.
              </p>
              <NewsletterForm />
            </div>
            <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {cols.map((c) => (
                <div key={c.title}>
                  <p className="eyebrow !text-mute-dark">{c.title}</p>
                  <ul className="mt-4 space-y-2.5 text-[14px]">
                    {c.links.map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="link-underline text-porcelain/85 hover:text-porcelain">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <AyiinWordmark tone="porcelain" tittle="lime" className="mt-20 w-full opacity-[0.97]" title="Ayiin" />

          <div className="flex flex-col gap-4 border-t border-graphite-line py-6 text-[12.5px] text-mute-dark sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Ayiin Inc. · Multi-vendor marketplace for people and companies.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/help#privacy" className="hover:text-porcelain">Privacy</Link>
              <Link href="/help#terms" className="hover:text-porcelain">Terms</Link>
              <Link href="/help#accessibility" className="hover:text-porcelain">Accessibility</Link>
              <span className="flex gap-1.5">
                {["Visa", "Mastercard", "Amex", "PayPal", "Invoice"].map((m) => (
                  <span key={m} className="rounded-md border border-graphite-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                    {m}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
