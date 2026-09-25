import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { AyiinSymbol } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="display mt-3 text-[44px] sm:text-[64px]">One page. No surprises.</h1>
        </div>
        <Link href="/cart" className="hidden text-[14px] text-ink-2 hover:text-ink sm:block">← Back to bag</Link>
      </div>
      <CheckoutView />
      <p className="mt-10 flex items-center justify-center gap-2 text-[12.5px] text-mute">
        <AyiinSymbol tone="ink" lens="ink" tight className="h-3.5" /> Payments protected by Ayiin Assured · PCI DSS Level 1
      </p>
    </div>
  );
}
