"use client";

import Link from "next/link";
import { useShop, useHydrated, useUI } from "@/lib/store";
import { productById, products } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";

export function SavedManager() {
  const hydrated = useHydrated();
  const { fmt } = usePrefs();
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);

  const savedProducts = hydrated
    ? wishlist.map((id) => productById(id)).filter(Boolean)
    : [];

  const handleMoveToBag = (productId: string, variantId: string, name: string) => {
    addToCart(productId, variantId, 1);
    toggleWishlist(productId);
    notify("Moved to bag", `${name} was moved from your saved pieces to your bag.`, {
      label: "View Bag",
      href: "/checkout",
    });
  };

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-surface bg-mist" />
        ))}
      </div>
    );
  }

  if (savedProducts.length === 0) {
    const curatedPicks = products.slice(0, 3);
    return (
      <div className="space-y-8">
        <div className="rounded-surface border border-dashed border-line-strong bg-white p-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-mute">
            <Icon name="heart" size={20} />
          </span>
          <h3 className="mt-4 font-display text-2xl font-medium text-ink">
            Your Wishlist is Empty
          </h3>
          <p className="mt-1.5 text-support text-mute max-w-md mx-auto">
            Save pieces as you explore the marketplace to track inventory, receive price drop alerts, and curate your wardrobe.
          </p>
          <Link href="/search" className="btn btn-primary mt-6">
            Explore the Marketplace
          </Link>
        </div>

        {/* Suggested Curated Picks */}
        <div>
          <h4 className="text-support font-semibold uppercase tracking-wider text-mute mb-4">
            Curated For You · Trending This Week
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            {curatedPicks.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-surface border border-line bg-white p-4 shadow-[var(--shadow-hair)]"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-media bg-porcelain">
                    <ProductImage
                      product={product}
                      variant={product.variants[0]?.id}
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-meta text-mute uppercase tracking-wider">
                    {product.brand}
                  </p>
                  <p className="font-medium text-ink text-body leading-snug">
                    {product.name}
                  </p>
                  <p className="num mt-1 text-support font-medium text-ink">
                    {fmt(product.price)}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="btn btn-secondary flex-1 text-support"
                  >
                    <Icon name="heart" size={15} />
                    <span>Save Piece</span>
                  </button>
                  <Link
                    href={`/product/${product.slug}`}
                    className="btn btn-ghost text-support px-3"
                  >
                    <Icon name="eye" size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-support text-mute">
          {savedProducts.length} {savedProducts.length === 1 ? "piece" : "pieces"} saved in your private vault
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedProducts.map((product) => {
          if (!product) return null;
          const defaultVariant = product.variants[0]?.id;
          const inStock = product.stock > 0;

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between rounded-surface border border-line bg-white p-5 shadow-[var(--shadow-hair)] transition-all hover:shadow-[var(--shadow-soft)]"
            >
              <div>
                {/* Image and Wishlist Remove Button */}
                <div className="relative aspect-square w-full overflow-hidden rounded-media bg-porcelain">
                  <ProductImage
                    product={product}
                    variant={defaultVariant}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-danger shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                    title="Remove from saved"
                  >
                    <Icon name="heart" size={15} />
                  </button>
                </div>

                {/* Details */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-meta uppercase tracking-wider text-mute">
                      {product.brand}
                    </span>
                    <span
                      className={`text-meta font-medium ${
                        product.stock < 20 ? "text-danger" : "text-success"
                      }`}
                    >
                      {product.stock < 20 ? `Only ${product.stock} left` : "In Stock"}
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-1 block font-medium text-ink hover:underline text-body"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="num font-semibold text-ink">
                      {fmt(product.price)}
                    </span>
                    {product.compareAt && (
                      <span className="num text-meta text-mute line-through">
                        {fmt(product.compareAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => handleMoveToBag(product.id, defaultVariant, product.name)}
                  className="btn btn-primary flex-1 text-support"
                >
                  <Icon name="bag" size={15} />
                  <span>Move to Bag</span>
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  className="btn btn-secondary text-support px-3"
                  title="View full product page"
                >
                  <Icon name="arrowUpRight" size={15} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
