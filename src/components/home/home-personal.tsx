"use client";

import type { Product } from "@/lib/types";
import { products, productBySlug } from "@/lib/catalog/products";
import { PRODUCT_PHOTOS } from "@/lib/catalog/photos";
import { photoFullUrl } from "@/lib/images";
import { priceInsight, savingsPct } from "@/lib/commerce";
import { hasView } from "@/lib/images";
import { COMPARE_SLUGS, BRIDGE_SLUG } from "@/lib/home-plan";
import { getHeroCampaigns } from "@/lib/campaigns";

// Hero & Discovery Modules
import { CampaignHero } from "@/components/home/campaign-hero";
import { DiscoveryTiles } from "@/components/home/discovery-tiles";
import { ShopByIntent } from "@/components/home/shop-by-intent";

// Commerce Grid Composition Modules
import { FeaturePlusFour } from "@/components/home/feature-plus-four";
import { ThreeCardFeature } from "@/components/home/three-card-feature";
import { EditorialPlusProducts } from "@/components/home/editorial-plus-products";
import { ProductRail } from "@/components/home/product-rail";

// Category Story Modules
import { CategoryStory } from "@/components/home/category-story";

// Merchandising & Curation Modules
import { CompleteTheSetup } from "@/components/home/complete-the-setup";
import { AyiinEdit } from "@/components/home/ayiin-edit";
import { CompactPromoBanner } from "@/components/home/compact-promo-banner";
import { Lookbook } from "@/components/home/lookbook";
import { CompareTeaser } from "@/components/home/compare-teaser";
import { BusinessBridge } from "@/components/home/business-bridge";
import { RecentlyViewed } from "@/components/product/recently-viewed";

const SHOPPER_CATEGORIES = new Set([
  "audio-tech",
  "home-living",
  "kitchen",
  "fashion",
  "beauty",
  "office",
]);

const shopper = products.filter((p) => SHOPPER_CATEGORIES.has(p.category));
const inCategory = (slug: string) => products.filter((p) => p.category === slug);

export function HomePersonal() {
  const heroSlides = getHeroCampaigns();

  // Curated Pinned Items for Signature Compositions
  const trendingHero = productBySlug("loom-lounge-chair") ?? shopper[0];
  const trendingSupporting = [
    productBySlug("arc-table-lamp"),
    productBySlug("stoneware-bud-vases"),
    productBySlug("pour-gooseneck-kettle"),
    productBySlug("transit-daypack-22"),
  ].filter((p): p is Product => p != null);

  const flagships = [
    {
      product: productBySlug("kova-book-14-air")!,
      highlightSpec: "Milled aluminum · 18h battery · 1.24 kg",
      badge: "Flagship Ultrabook",
    },
    {
      product: productBySlug("ergo-task-chair-pro")!,
      highlightSpec: "BIFMA Class 4 · Active lumbar · 12-yr warranty",
      badge: "Ergonomic Icon",
    },
    {
      product: productBySlug("aurel-anc-over-ear")!,
      highlightSpec: "40mm custom drivers · -38 dB ANC · 40h runtime",
      badge: "Acoustic Reference",
    },
  ].filter((f) => f.product != null);

  const everydayUpgradeProducts = [
    productBySlug("everyday-stoneware-mugs"),
    productBySlug("ember-soy-candle"),
    productBySlug("night-recovery-oil"),
  ].filter((p): p is Product => p != null);

  const homeProducts = inCategory("home-living");
  const audioProducts = inCategory("audio-tech");
  const kitchenProducts = inCategory("kitchen");

  // Deals feed
  const deals = shopper
    .filter((p) => priceInsight(p).verifiedDeal)
    .sort((a, b) => savingsPct(b) - savingsPct(a));

  // Buyer Intelligence items
  const compareItems = COMPARE_SLUGS
    .map(productBySlug)
    .filter((p): p is Product => p != null);

  const bridgeProduct = productBySlug(BRIDGE_SLUG);

  const lookbookSlugs = [
    "night-recovery-oil",
    "pour-gooseneck-kettle",
    "trail-bottle-750",
    "kova-book-14-air",
  ];
  const lookbookItems = lookbookSlugs
    .map(productBySlug)
    .filter((p): p is Product => p != null)
    .filter((p) => hasView(p, "scene"));

  return (
    <div className="pb-24">
      {/* ── 01 · PRIMARY MARKETPLACE CAMPAIGN HERO ── */}
      <CampaignHero slides={heroSlides} />

      <div className="shell mt-10 space-y-12 sm:mt-14 sm:space-y-16 lg:space-y-20">
        {/* ── 02 · DISCOVERY: SHOP THE WAY YOU THINK (Asymmetric Bento Grid) ── */}
        <DiscoveryTiles />

        {/* ── 03 · COMMERCE COMPOSITION: FEATURE + 4 (Trending Across Ayiin) ── */}
        <FeaturePlusFour
          title="Trending now across Ayiin"
          subtitle="Pieces attracting the most buyer inquiries, saved to wishlists, and dispatched today."
          eyebrow="HIGH DEMAND"
          featured={trendingHero}
          supporting={trendingSupporting}
        />

        {/* ── 04 · CATEGORY STORY 01: HOME & LIVING (Warm Architectural Aesthetic) ── */}
        <CategoryStory
          kicker="HOME & LIVING"
          title="Make space for better."
          subtitle="Considered furniture and tactile objects for the rooms you return to."
          description="From solid oak lounge chairs with removable boucle slipcovers to hand-thrown stoneware bud vases and warm ambient travertine table lamps. Every piece is selected for quiet endurance."
          heroImage={photoFullUrl(PRODUCT_PHOTOS["loom-lounge-chair"]["oat"]["hero"]!, 1400)}
          theme="warm"
          subcategories={[
            { name: "Lounge Chairs", href: "/c/home-living", count: "14" },
            { name: "Ceramics & Vases", href: "/c/home-living", count: "28" },
            { name: "Lighting", href: "/c/home-living", count: "19" },
            { name: "Botanicals & Pots", href: "/c/home-living", count: "12" },
          ]}
          cta={{
            label: "Explore Home & Living",
            href: "/c/home-living",
          }}
          products={homeProducts}
        />

        {/* ── 05 · INTENT DISCOVERY: SHOP FOR THE MOMENT (Interactive Intent Engine) ── */}
        <ShopByIntent />

        {/* ── 06 · COMMERCE COMPOSITION: 3-CARD FEATURE (Flagship Design Icons) ── */}
        <ThreeCardFeature
          title="Design icons & flagships"
          subtitle="High-performing architectural tools and seating engineered with verifiable warranties and zero compromise."
          items={flagships}
        />

        {/* ── 07 · EDITORIAL INTERRUPTION: THE EVERYDAY UPGRADE ── */}
        <EditorialPlusProducts
          kicker="DAILY EDIT"
          title="The Everyday Upgrade"
          subtitle="Small changes. Better days."
          description="Tactile improvements that turn routine morning coffee, desk posture, and evening wind-downs into intentional moments."
          ctaLabel="Explore the edit"
          ctaHref="/search?sort=popular"
          image={photoFullUrl(PRODUCT_PHOTOS["pour-gooseneck-kettle"]["matte-black"]["scene"]!, 1200)}
          products={everydayUpgradeProducts}
        />

        {/* ── 08 · CATEGORY STORY 02: AUDIO & TECH (Cinematic Dark Precision) ── */}
        <CategoryStory
          kicker="AUDIO & TECH"
          title="Hear the difference."
          subtitle="Precision acoustic engineering, multipoint wireless, and silence on demand."
          description="Class-leading -38 dB adaptive active noise cancellation, custom 40mm tuned titanium drivers, and milled aluminium portables designed to travel without compromise."
          heroImage={photoFullUrl(PRODUCT_PHOTOS["aurel-anc-over-ear"]["graphite"]["hero"]!, 1400)}
          theme="dark"
          reverse
          subcategories={[
            { name: "Over-Ear Headphones", href: "/c/audio-tech", count: "9" },
            { name: "Wireless Earbuds", href: "/c/audio-tech", count: "16" },
            { name: "Desktop Audio", href: "/c/audio-tech", count: "8" },
            { name: "High-Res Players", href: "/c/audio-tech", count: "6" },
          ]}
          cta={{
            label: "Explore Audio & Tech",
            href: "/c/audio-tech",
          }}
          products={audioProducts}
        />

        {/* ── 09 · MERCHANDISING MODULE: COMPLETE THE SETUP ── */}
        <CompleteTheSetup />

        {/* ── 10 · EDITORIAL CURATION: THE AYIIN EDIT ── */}
        <AyiinEdit />

        {/* ── 11 · COMPACT PROMOTIONAL BANNER: VERIFIED PRICE LOWS ── */}
        <CompactPromoBanner
          kicker="PRICE TRANSPARENCY"
          headline="Verified 12-week price lows across Ayiin."
          subtext="No fake original prices. Every promotion is audited against actual 12-week sales history with guaranteed stock."
          ctaLabel="Shop All Verified Deals"
          ctaHref="/search?deal=1"
        />

        {/* ── 12 · COMMERCE FEED: TODAY'S VERIFIED DEALS SHELF ── */}
        <ProductRail
          title="Today's verified deals"
          href="/search?deal=1"
          products={deals}
        />

        {/* ── 13 · CATEGORY STORY 03: KITCHEN & COFFEE (Sensory Rituals) ── */}
        <CategoryStory
          kicker="KITCHEN & BREW"
          title="Start with something good."
          subtitle="Electric kettles with ±1° precision, washed Ethiopian beans, and satin stoneware."
          description="Upgrade your morning extraction. Balanced thermal mass, dripless gooseneck spouts, and freshly roasted single-origin coffees packaged in valve bags within 48 hours of roast."
          heroImage={photoFullUrl(PRODUCT_PHOTOS["pour-gooseneck-kettle"]["matte-black"]["scene"]!, 1400)}
          theme="warm"
          subcategories={[
            { name: "Gooseneck Kettles", href: "/c/kitchen", count: "7" },
            { name: "Stoneware Mugs", href: "/c/kitchen", count: "14" },
            { name: "Single-Origin Coffee", href: "/c/kitchen", count: "18" },
            { name: "Brew Scales & Tools", href: "/c/kitchen", count: "11" },
          ]}
          cta={{
            label: "Shop Kitchen & Coffee",
            href: "/c/kitchen",
          }}
          products={kitchenProducts}
        />

        {/* ── 14 · B2B COMMERCE: AYIIN BUSINESS BRIDGE ── */}
        {bridgeProduct && <BusinessBridge product={bridgeProduct} />}

        {/* ── 15 · LIFESTYLE CONTEXT: LOOKBOOK ("Shop the Scene") ── */}
        {lookbookItems.length >= 3 && (
          <div className="rounded-[28px] border border-line bg-white p-5 shadow-[var(--shadow-hair)] sm:p-7 lg:p-8">
            <Lookbook index="05" items={lookbookItems} />
          </div>
        )}

        {/* ── 16 · BUYER INTELLIGENCE: COMPARE SPECS ── */}
        {compareItems.length >= 3 && (
          <div className="rounded-[28px] border border-line bg-porcelain/60 p-5 shadow-[var(--shadow-hair)] sm:p-8 lg:p-10">
            <CompareTeaser items={compareItems} />
          </div>
        )}

        {/* ── 17 · RECENTLY VIEWED ── */}
        <RecentlyViewed />
      </div>
    </div>
  );
}
