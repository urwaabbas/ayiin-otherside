import { productBySlug } from "@/lib/catalog/products";
import { productPhoto, photoFullUrl } from "@/lib/images";

export type CampaignType = "hero" | "split" | "full-bleed" | "setup" | "editorial";

export type CampaignConfig = {
  id: string;
  type: CampaignType;
  kicker: string;
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  image: string;
  position?: string;
  category?: string;
  badge?: string;
  productSlug?: string;
  accent?: string;
};

/** Helper to extract high-resolution image URL from a product view */
function getProductPhotoUrl(
  slug: string,
  view: "hero" | "scene" | "angle" | "detail" = "scene",
  fallbackSlug?: string,
): string {
  const p = productBySlug(slug) ?? (fallbackSlug ? productBySlug(fallbackSlug) : null);
  if (!p) return "";
  const photo = productPhoto(p, undefined, view) ?? productPhoto(p, undefined, "hero");
  return photo ? photoFullUrl(photo, 2000) : "";
}

/**
 * 02 · Department Campaign Banners throughout the journey
 */
export function getDepartmentCampaigns(): Record<string, CampaignConfig> {
  return {
    homeLiving: {
      id: "home-living-campaign",
      type: "split",
      kicker: "Home & Living",
      title: "Your home, considered.",
      description:
        "Beautiful and useful pieces for the spaces you live in. From solid oak frames with washable covers to hand-thrown stoneware bud vases and warm ambient travertine lamps.",
      cta: {
        label: "Shop Home & Living",
        href: "/c/home-living",
      },
      secondaryCta: {
        label: "Explore Bud Vases",
        href: "/p/stoneware-bud-vases",
      },
      image: getProductPhotoUrl("loom-lounge-chair", "hero", "arc-table-lamp"),
      position: "50% 50%",
      category: "home-living",
      badge: "Curated Department",
    },
    audioTech: {
      id: "audio-tech-campaign",
      type: "full-bleed",
      kicker: "Audio & Tech",
      title: "Hear more. Carry less.",
      description:
        "Precision sound and mobile engineering designed to move with you. High-fidelity codecs, multipoint pairing, and all-day battery life without unnecessary weight.",
      cta: {
        label: "Explore Audio & Tech",
        href: "/c/audio-tech",
      },
      secondaryCta: {
        label: "Compare Audio",
        href: "/compare",
      },
      image: getProductPhotoUrl("aurel-anc-over-ear", "hero"),
      position: "50% 60%",
      category: "audio-tech",
      badge: "Acoustic Engineering",
    },
    kitchenCoffee: {
      id: "kitchen-coffee-campaign",
      type: "split",
      kicker: "Kitchen & Coffee",
      title: "Start with something good.",
      description:
        "Dial in your pour-over with ±1° temperature hold and freshly roasted single-origin Ethiopian beans. Hand-crafted ceramics and tableware built for everyday resilience.",
      cta: {
        label: "Shop Kitchen & Coffee",
        href: "/c/kitchen",
      },
      secondaryCta: {
        label: "View Gooseneck Kettle",
        href: "/p/pour-gooseneck-kettle",
      },
      image: getProductPhotoUrl("pour-gooseneck-kettle", "scene"),
      position: "50% 45%",
      category: "kitchen",
      badge: "Crafted for Daily Use",
    },
    fashionCarry: {
      id: "fashion-carry-campaign",
      type: "split",
      kicker: "Fashion & Carry",
      title: "The details matter.",
      description:
        "Weatherproof 500D commuter packs, hand-polished polarized acetate eyewear, and responsive supercritical foam trainers designed for distance.",
      cta: {
        label: "Shop Fashion & Carry",
        href: "/c/fashion",
      },
      secondaryCta: {
        label: "Explore Transit Pack",
        href: "/p/transit-daypack-22",
      },
      image: getProductPhotoUrl("transit-daypack-22", "hero", "stride-runner-2"),
      position: "50% 50%",
      category: "fashion",
      badge: "Everyday Carry",
    },
    beautyWellness: {
      id: "beauty-wellness-campaign",
      type: "split",
      kicker: "Beauty & Wellness",
      title: "Your everyday ritual.",
      description:
        "Clean, derm-tested actives: 10% niacinamide + zinc pore serums and fast-absorbing squalane bakuchiol night oils in recyclable frosted glass.",
      cta: {
        label: "Explore Beauty & Wellness",
        href: "/c/beauty",
      },
      image: getProductPhotoUrl("night-recovery-oil", "hero", "clarity-niacinamide-serum"),
      position: "50% 50%",
      category: "beauty",
      badge: "Formulated Clean",
    },
    deals: {
      id: "deals-campaign",
      type: "full-bleed",
      kicker: "Verified Price Drops",
      title: "Worth a look.",
      description:
        "Selected offers from across AYIIN backed by 12 weeks of verified price history. Real discounts from verified sellers with guaranteed on-time delivery.",
      cta: {
        label: "Shop Today's Deals",
        href: "/search?deal=1",
      },
      secondaryCta: {
        label: "Arrives Tomorrow",
        href: "/search?fast=1",
      },
      image: getProductPhotoUrl("halo-speaker-mini", "hero", "pour-gooseneck-kettle"),
      position: "50% 45%",
      badge: "12-Week Low Guarantee",
    },
    business: {
      id: "business-campaign",
      type: "split",
      kicker: "Ayiin for Business",
      title: "Buy for your business.",
      description:
        "Bulk purchasing, contract tier pricing, multi-supplier quote comparisons, and net-30 terms across 12,000+ companies. Switch modes anytime.",
      cta: {
        label: "Explore Ayiin Business",
        href: "/business",
      },
      secondaryCta: {
        label: "Quick Order",
        href: "/business?tab=quick",
      },
      image: getProductPhotoUrl("ergo-task-chair-pro", "scene", "kova-book-14-air"),
      position: "50% 40%",
      badge: "B2B Procurement Hub",
    },
  };
}

/**
 * 03 · Complete the Setup Configuration (Section 16)
 * Anchor piece + 4 complementary items that create a natural cross-sell.
 */
export type SetupConfig = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  anchorSlug: string;
  complementarySlugs: string[];
};

export const WORKSPACE_SETUP: SetupConfig = {
  id: "workspace-setup",
  kicker: "Complete the Setup",
  title: "The Ergonomic Workstation",
  subtitle:
    "An integrated setup designed for sustained physical comfort and visual calm during long work sessions.",
  anchorSlug: "ergo-task-chair-pro",
  complementarySlugs: [
    "arc-table-lamp",
    "kova-keys-low-profile",
    "aurel-anc-over-ear",
    "everyday-stoneware-mugs",
  ],
};
