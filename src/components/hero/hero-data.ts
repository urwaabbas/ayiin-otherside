/**
 * Hero content. Everything the hero shows is driven from this list — add,
 * remove or reorder entries and the stage, copy and progress follow.
 *
 * ASSETS ARE TEMPORARY PROTOTYPE IMAGES. Each is an Unsplash photo (Unsplash
 * License) with the background removed locally; see ./ASSETS.md for the full
 * source record and how to regenerate them. Replace with owned product
 * photography (or GLB models — see ProductScene.tsx) before launch.
 */

export type MotionProfileName =
  | "fashion"
  | "technology"
  | "beauty"
  | "home"
  | "accessories";

export type HeroAsset = {
  /** "image" today; "model" is reserved for GLB/GLTF (see ProductScene.tsx). */
  type: "image";
  src: string;
  width: number;
  height: number;
  /** Where the temporary image came from. */
  credit: { author: string; url: string };
};

export type HeroItem = {
  id: string;
  category: string;
  description: string;
  href: string;
  asset: HeroAsset;
  alt: string;
  animationProfile: MotionProfileName;
  /** Share of the stage the product may fill (0–1), tuned per silhouette. */
  fit: { width: number; height: number };
  /** Vertical nudge as a fraction of stage height (+ is down). */
  offsetY?: number;
  /**
   * Horizontal nudge as a fraction of stage width (+ is right), for cutouts
   * whose visual weight is not in the middle of the image.
   */
  offsetX?: number;
  /** Contact-shadow width relative to the stage width. */
  shadow: number;
  /** Backdrop colour the whole hero takes on while this product is on stage. */
  bg: string;
  /** Bottom corner the copy sits in. */
  side: "left" | "right";
};

export const heroItems: HeroItem[] = [
  {
    id: "fashion",
    category: "Fashion",
    description: "Pieces that earn a place in your everyday.",
    href: "/c/fashion",
    asset: {
      type: "image",
      src: "/hero/sneaker.webp",
      width: 1600,
      height: 1237,
      credit: {
        author: "Gabre Cameron",
        url: "https://unsplash.com/photos/a-pair-of-black-and-red-shoes-on-a-white-surface-7y0ywfipHdg",
      },
    },
    alt: "Black and red high-top sneaker with a speckled white sole",
    animationProfile: "fashion",
    fit: { width: 0.9, height: 0.92 },
    shadow: 0.44,
    bg: "#6f2b27",
    side: "left",
  },
  {
    id: "technology",
    category: "Technology",
    description: "Tools that quietly do more for you.",
    href: "/c/audio-tech",
    asset: {
      type: "image",
      src: "/hero/headphones.webp",
      width: 1321,
      height: 1600,
      credit: {
        author: "Hazel Z",
        url: "https://unsplash.com/photos/a-pair-of-headphones-floating-in-the-air-W_lXhs-q-sI",
      },
    },
    alt: "Sage green over-ear headphones",
    animationProfile: "technology",
    fit: { width: 0.74, height: 0.96 },
    shadow: 0.3,
    bg: "#2f4b3c",
    side: "right",
  },
  {
    id: "beauty",
    category: "Beauty",
    description: "Small rituals, made with real care.",
    href: "/c/beauty",
    asset: {
      type: "image",
      src: "/hero/perfume.webp",
      width: 1117,
      height: 1600,
      credit: {
        author: "Akhilesh Sharma",
        url: "https://unsplash.com/photos/a-bottle-of-perfume-sitting-on-top-of-a-table-vf6DtLlwjTk",
      },
    },
    alt: "Square glass perfume bottle filled with amber fragrance",
    animationProfile: "beauty",
    fit: { width: 0.66, height: 0.88 },
    shadow: 0.26,
    bg: "#7a3d0e",
    side: "left",
  },
  {
    id: "home",
    category: "Home",
    description: "Objects that change how a room feels.",
    href: "/c/home-living",
    asset: {
      type: "image",
      src: "/hero/gaming-chair.webp",
      width: 944,
      height: 1600,
      credit: {
        author: "Hannes Köttner",
        url: "https://unsplash.com/photos/a-black-and-white-office-chair-sitting-in-a-room-Wxc0hAt0nQI",
      },
    },
    alt: "Black and white racing-style gaming chair on a five-star wheeled base",
    animationProfile: "home",
    fit: { width: 0.66, height: 0.96 },
    shadow: 0.3,
    bg: "#45476b",
    side: "right",
  },
  {
    id: "accessories",
    category: "Accessories",
    description: "The finishing details you reach for daily.",
    href: "/c/fashion",
    asset: {
      type: "image",
      src: "/hero/eyewear.webp",
      width: 1600,
      height: 557,
      credit: {
        author: "Alondra Lucia",
        url: "https://unsplash.com/photos/a-pair-of-sunglasses-on-a-white-background-tUyg4nIQHPk",
      },
    },
    alt: "Round gold-frame sunglasses with brown gradient lenses",
    animationProfile: "accessories",
    fit: { width: 0.7, height: 0.7 },
    // the lenses sit left of the image's centre; the temple arm trails right
    offsetX: 0.035,
    shadow: 0.36,
    bg: "#544a30",
    side: "left",
  },
];
