import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/signal";
import { Icon, type IconName } from "@/components/ui/icon";
import { SellForm } from "@/components/checkout/sell-form";

export const metadata: Metadata = { title: "Sell on Ayiin" };

const WHY: { icon: IconName; title: string; body: string }[] = [
  { icon: "users", title: "Two audiences, one listing", body: "Every product reaches consumers and 12,000+ companies. Set volume tiers once; Ayiin handles quotes, POs and invoicing." },
  { icon: "trend", title: "Trust that converts", body: "Your on-time rate and response time are public — and buyers reward them. Top sellers see 2.3× higher conversion." },
  { icon: "sparkle", title: "Studio-quality listings", body: "Consistent product presentation, structured specs and honest price history, generated from your catalog feed." },
  { icon: "wallet", title: "Paid in 2 days", body: "Ayiin covers net-terms risk on business orders. You're paid 2 days after delivery, every time." },
];

export default function SellPage() {
  return (
    <div className="shell pt-6 lg:pt-10">
      <Eyebrow index="Sell">For brands, makers and suppliers</Eyebrow>
      <h1 className="display mt-6 max-w-5xl text-display-md sm:text-display-xl">Sell to people and companies at once.</h1>
      <p className="mt-6 max-w-2xl text-emphasis leading-relaxed text-ink-2">Ayiin is where discovery-driven shoppers and procurement teams buy from the same verified sellers. Earn your place with performance, not ad spend.</p>

      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {WHY.map((w) => (
          <div key={w.title} className="rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]">
            <span className="grid h-11 w-11 place-items-center rounded-surface bg-mist">
              <Icon name={w.icon} size={20} />
            </span>
            <p className="mt-5 text-body font-medium tracking-[-0.02em]">{w.title}</p>
            <p className="mt-1.5 text-support leading-relaxed text-mute">{w.body}</p>
          </div>
        ))}
      </div>

      <section id="fees" className="mt-24 scroll-mt-28 grid gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow index="01">Fees</Eyebrow>
          <h2 className="display mt-4 text-display-sm sm:text-display-md">Simple, and shown up front.</h2>
          <p className="mt-4 max-w-md text-body text-mute">No listing fees, no monthly minimum, no pay-to-rank. You only pay when you sell.</p>
        </div>
        <dl className="divide-y divide-line self-start rounded-surface bg-white shadow-[var(--shadow-hair)]">
          {[
            ["Consumer orders", "8% referral fee"],
            ["Business orders", "6% — Ayiin carries net-terms risk"],
            ["Payment processing", "Included"],
            ["Payouts", "2 days after delivery"],
            ["Listing & storefront", "Free"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-6 py-4 text-body">
              <dt className="text-ink-2">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="standards" className="mt-24 scroll-mt-28 grid gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow index="02">Standards</Eyebrow>
          <h2 className="display mt-4 text-display-sm sm:text-display-md">The bar is public.</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["≥ 97%", "on-time delivery"],
            ["< 4h", "median buyer response"],
            ["< 4%", "not-as-described returns"],
            ["Live", "inventory sync — no phantom stock"],
          ].map(([n, l]) => (
            <li key={l} className="rounded-surface bg-white p-5 shadow-[var(--shadow-hair)]">
              <p className="display text-display-sm">{n}</p>
              <p className="text-support text-mute">{l}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Eyebrow index="03">Apply</Eyebrow>
          <h2 className="display mt-4 text-display-sm sm:text-display-md">Start selling in a week.</h2>
          <p className="mt-4 max-w-md text-body text-mute">Verification covers identity, inventory, fulfilment and service. Most sellers are live within 7 days.</p>
        </div>
        <SellForm />
      </section>
    </div>
  );
}
