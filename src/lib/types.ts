export type Mode = "personal" | "business";

export type ArtKind =
  | "headphones"
  | "earbuds"
  | "speaker"
  | "laptop"
  | "keyboard"
  | "monitor"
  | "phone"
  | "lamp"
  | "chair"
  | "taskchair"
  | "vase"
  | "candle"
  | "plant"
  | "kettle"
  | "mug"
  | "coffeebag"
  | "sneaker"
  | "backpack"
  | "watch"
  | "sunglasses"
  | "bottle"
  | "serum"
  | "paper"
  | "scanner"
  | "carton"
  | "gloves"
  | "helmet"
  | "spray";

export type Variant = {
  id: string;
  name: string;
  /** Primary body colour of the product render */
  color: string;
  /** Optional secondary/trim colour */
  accent?: string;
};

export type PriceTier = { min: number; price: number };

export type Review = {
  author: string;
  role?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  business?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  sellerId: string;
  category: string;
  subcategory: string;
  kind: ArtKind;
  /** Studio backdrop tint for renders */
  tint: string;
  variants: Variant[];
  price: number;
  compareAt?: number;
  /** 12 weeks of price history (oldest → newest) for honest deal labels */
  history: number[];
  rating: number;
  reviewCount: number;
  soldLastWeek: number;
  stock: number;
  /** Business days until delivery from ordering now */
  delivery: { min: number; max: number; express?: number };
  shipping: number; // 0 = free
  returns: { days: number; free: boolean };
  summary: string;
  highlights: string[];
  specs: Record<string, string>;
  /** "Ayiin Brief" — synthesised from verified reviews */
  brief: { pros: string[]; cons: string[]; bestFor: string };
  tags: ("new" | "bestseller" | "deal" | "eco" | "assured" | "bulk" | "fast")[];
  useCases: string[];
  keywords: string[];
  b2b: {
    sku: string;
    unit: string;
    caseQty: number;
    moq: number;
    tiers: PriceTier[];
    leadDays: number;
    rfq: boolean;
    taxExemptEligible: boolean;
    contractPrice?: number;
  };
  reviews: Review[];
};

export type Seller = {
  id: string;
  name: string;
  initials: string;
  tagline: string;
  location: string;
  since: number;
  rating: number;
  reviews: number;
  onTime: number; // %
  responseHours: number;
  returnRate: number; // %
  orders: number;
  verified: boolean;
  business: boolean;
  netTerms?: string;
  certifications: string[];
  color: string;
};

export type Category = {
  slug: string;
  name: string;
  short: string;
  blurb: string;
  kind: ArtKind;
  tint: string;
  accent: string;
  business: boolean;
  subcategories: string[];
  guide: { title: string; points: string[] };
};
