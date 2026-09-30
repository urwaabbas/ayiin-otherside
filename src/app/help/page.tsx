import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Help" };

const SECTIONS: { id: string; icon: IconName; title: string; faqs: [string, string][] }[] = [
  {
    id: "delivery",
    icon: "truck",
    title: "Delivery",
    faqs: [
      ["How are delivery dates calculated?", "From the seller's live stock location, their measured handling time and the carrier's route to your ZIP. 94% of orders arrive on the first date shown; if one is late we refund the delivery fee automatically."],
      ["Is there ever a hidden fee?", "No. The total on the product page is the total at checkout, minus tax for your address. Delivery costs are shown before anything goes in your bag."],
      ["Can I change the address after ordering?", "Yes, until the order is packed — from the tracking page, no call needed."],
    ],
  },
  {
    id: "returns",
    icon: "returns",
    title: "Returns",
    faqs: [
      ["What's the return window?", "At least 30 days from delivery on Ayiin Assured items (60 for footwear and bags). The exact date is shown on every product page."],
      ["Is return shipping free?", "On Ayiin Assured items, yes — we email a prepaid label or QR code. Refunds land within 2 days of drop-off."],
      ["Can I return opened skincare?", "Yes. If it doesn't suit you, return it within 30 days even if opened."],
    ],
  },
  {
    id: "payments",
    icon: "card",
    title: "Payments & protection",
    faqs: [
      ["When am I charged?", "When your order ships. Payment is held by Ayiin, not the seller, until delivery is confirmed."],
      ["What if an item isn't as described?", "Ayiin Assured refunds you in full. You never have to negotiate with the seller."],
    ],
  },
  {
    id: "business",
    icon: "building",
    title: "Ayiin Business",
    faqs: [
      ["How do net terms work?", "Approved companies pay by invoice on Net 30 (Net 60 after 90 days of history). Limits are set during a 2-minute application."],
      ["Can we be tax exempt?", "Upload your exemption certificate once; tax is removed at checkout and the certificate is attached to every invoice."],
      ["Do you support punch-out?", "Yes — Coupa, SAP Ariba and cXML punch-out, plus NetSuite and QuickBooks sync."],
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Help</p>
      <h1 className="display mt-3 text-[48px] sm:text-[80px]">Straight answers.</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="group rounded-[24px] bg-white p-5 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mist transition-colors group-hover:bg-brand">
              <Icon name={s.icon} size={18} />
            </span>
            <p className="mt-4 text-[15px] font-medium">{s.title}</p>
            <p className="text-[13px] text-mute">{s.faqs.length} answers</p>
          </a>
        ))}
      </div>
      <div className="mt-16 space-y-16">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28 grid gap-6 lg:grid-cols-[300px_1fr]">
            <h2 className="display text-[36px]">{s.title}</h2>
            <div className="divide-y divide-line rounded-[24px] bg-white shadow-[var(--shadow-hair)]">
              {s.faqs.map(([q, a]) => (
                <details key={q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium">
                    {q}
                    <Icon name="plus" size={18} className="shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <section id="contact" className="scroll-mt-28 grid gap-6 rounded-[32px] bg-ink p-8 text-porcelain sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="display text-[44px]">Talk to a person.</h2>
            <p className="mt-3 max-w-md text-[15px] text-mute-dark">Median reply time: 4 minutes, 7am–11pm ET. Business accounts get a named account manager.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <a href="tel:+18005550199" className="btn btn-brand">Call 1-800-555-0199</a>
            <a href="mailto:help@ayiin.com" className="btn btn-on-dark">help@ayiin.com</a>
          </div>
        </section>
        <section id="accessibility" className="scroll-mt-28 grid gap-6 lg:grid-cols-[300px_1fr]">
          <h2 className="display text-[36px]">Accessibility</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-2">
            Ayiin targets WCAG 2.2 AA: every flow works by keyboard, all text meets contrast minimums, motion respects reduced-motion settings, and charts include table alternatives. Found a barrier? Write to accessibility@ayiin.com — we respond within one business day.
          </p>
        </section>
        <section id="privacy" className="scroll-mt-28 grid gap-6 lg:grid-cols-[300px_1fr]">
          <h2 className="display text-[36px]">Privacy & terms</h2>
          <p id="terms" className="max-w-2xl text-[15px] leading-relaxed text-ink-2">
            We use your data to deliver orders and personalise recommendations you can see and edit. We never sell it, and recommendations always explain why they appear.
          </p>
        </section>
      </div>
    </div>
  );
}
