import type { Metadata } from "next";
import { WishlistView } from "@/components/checkout/wishlist-view";

export const metadata: Metadata = { title: "Saved" };

export default function WishlistPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Saved</p>
      <h1 className="display mt-3 text-[48px] sm:text-[80px]">Worth coming back to.</h1>
      <WishlistView />
    </div>
  );
}
