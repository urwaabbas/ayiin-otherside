import type { Metadata } from "next";
import { CartView } from "@/components/checkout/cart-view";
import { getPrefs } from "@/lib/server-prefs";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const { mode } = await getPrefs();
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">{mode === "business" ? "Purchase cart" : "Your cart"}</p>
      <h1 className="display mt-3 text-display-sm sm:text-display-lg">{mode === "business" ? "Ready to order." : "Nearly yours."}</h1>
      <CartView />
    </div>
  );
}
