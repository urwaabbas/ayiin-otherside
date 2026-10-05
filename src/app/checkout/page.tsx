import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { AyiinMark } from "@/components/brand/ayiin-logo";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="display mt-3 text-display-sm sm:text-display-md">One page. No surprises.</h1>
        </div>
        <Link href="/cart" className="hidden text-support text-ink-2 hover:text-ink sm:block">← Back to bag</Link>
      </div>
      <CheckoutView />
      <p className="mt-10 flex items-center justify-center gap-2 text-meta text-mute">
        <AyiinMark className="h-3.5" /> Payments protected by Ayiin Assured · PCI DSS Level 1
      </p>
    </div>
  );
}
