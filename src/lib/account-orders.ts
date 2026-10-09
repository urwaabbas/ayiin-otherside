import { products, productById, productBySlug } from "@/lib/catalog/products";
import { sellers } from "@/lib/catalog/sellers";
import type { Order } from "@/lib/store";
import type { Seller, Product } from "@/lib/types";

export type DeliveryMilestone = {
  label: string;
  location?: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
};

export type SellerParcel = {
  parcelId: string;
  seller: Seller;
  carrier: "FedEx Priority" | "UPS Worldwide" | "DHL Express" | "USPS Priority";
  trackingNumber: string;
  status: "processing" | "in_transit" | "out_for_delivery" | "delivered";
  statusLabel: string;
  progressPercent: number;
  originLocation: string;
  destinationLocation: string;
  estimatedDelivery: string;
  milestones: DeliveryMilestone[];
  items: {
    product: Product;
    variantId: string;
    qty: number;
    price: number;
  }[];
};

export type EnrichedOrder = {
  id: string;
  createdAt: string;
  total: number;
  mode: "personal" | "business";
  overallStatus: "processing" | "in_transit" | "delivered" | "cancelled" | "returned";
  overallStatusLabel: string;
  parcels: SellerParcel[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: {
    brand: string;
    last4: string;
  };
  totalItems: number;
};

const safeProduct = (slug: string, fallbackIdx: number = 0): Product => {
  return productBySlug(slug) ?? products[fallbackIdx] ?? products[0];
};

/** High-craft authentic seed orders when the customer first opens their account */
export const SEED_ACCOUNT_ORDERS: EnrichedOrder[] = [
  {
    id: "AY-849201",
    createdAt: "2026-10-06T14:22:00.000Z",
    total: 938,
    mode: "personal",
    overallStatus: "in_transit",
    overallStatusLabel: "In Transit · 2 Shipments",
    totalItems: 2,
    shippingAddress: {
      name: "Haider Urwa",
      street: "482 Brannan Street, Ste 4B",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
    },
    paymentMethod: {
      brand: "Mastercard",
      last4: "8842",
    },
    parcels: [
      {
        parcelId: "PKG-849201-1",
        seller: sellers.find((s) => s.id === "northform") ?? sellers[0],
        carrier: "FedEx Priority",
        trackingNumber: "FDX-9948271038",
        status: "in_transit",
        statusLabel: "Arriving Tomorrow by 2:00 PM",
        progressPercent: 65,
        originLocation: "Portland, OR Studio",
        destinationLocation: "San Francisco, CA",
        estimatedDelivery: "Oct 10, 2026",
        milestones: [
          { label: "Order verified & authorized", location: "AYIIN Marketplace", timestamp: "Oct 6, 2:22 PM", completed: true },
          { label: "Hand-crafted & packed at studio", location: "Portland, OR", timestamp: "Oct 7, 10:15 AM", completed: true },
          { label: "Departed FedEx Regional Hub", location: "Sacramento, CA", timestamp: "Oct 8, 11:40 PM", completed: true, current: true },
          { label: "Out for courier delivery", location: "San Francisco, CA", timestamp: "Oct 10, Est. 8:00 AM", completed: false },
          { label: "Delivered to reception", location: "482 Brannan St", timestamp: "Oct 10, Est. 2:00 PM", completed: false },
        ],
        items: [
          {
            product: safeProduct("aurel-anc-over-ear", 0),
            variantId: "graphite",
            qty: 1,
            price: 249,
          },
        ],
      },
      {
        parcelId: "PKG-849201-2",
        seller: sellers.find((s) => s.id === "atelier-mesa") ?? sellers[2],
        carrier: "UPS Worldwide",
        trackingNumber: "1Z992A01948201",
        status: "in_transit",
        statusLabel: "In Transit · Customs Cleared",
        progressPercent: 40,
        originLocation: "Mexico City Studio",
        destinationLocation: "San Francisco, CA",
        estimatedDelivery: "Oct 12, 2026",
        milestones: [
          { label: "Order accepted by maker", location: "Atelier Mesa", timestamp: "Oct 6, 3:00 PM", completed: true },
          { label: "FSC Wood verified & boxed", location: "Mexico City, MX", timestamp: "Oct 7, 4:20 PM", completed: true },
          { label: "Customs clearance completed", location: "San Diego Port, CA", timestamp: "Oct 9, 8:10 AM", completed: true, current: true },
          { label: "Transit to West Coast hub", location: "Oakland, CA", timestamp: "Oct 11, Expected", completed: false },
          { label: "Delivered", location: "San Francisco, CA", timestamp: "Oct 12, Expected", completed: false },
        ],
        items: [
          {
            product: safeProduct("loom-lounge-chair", 4),
            variantId: "oat",
            qty: 1,
            price: 689,
          },
        ],
      },
    ],
  },
  {
    id: "AY-791024",
    createdAt: "2026-09-18T10:14:00.000Z",
    total: 308,
    mode: "personal",
    overallStatus: "delivered",
    overallStatusLabel: "Delivered on Sep 21",
    totalItems: 2,
    shippingAddress: {
      name: "Haider Urwa",
      street: "482 Brannan Street, Ste 4B",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
    },
    paymentMethod: {
      brand: "Apple Pay",
      last4: "9102",
    },
    parcels: [
      {
        parcelId: "PKG-791024-1",
        seller: sellers.find((s) => s.id === "northform") ?? sellers[0],
        carrier: "DHL Express",
        trackingNumber: "DHL-481902830",
        status: "delivered",
        statusLabel: "Delivered · Signed by H. Urwa",
        progressPercent: 100,
        originLocation: "Portland, OR",
        destinationLocation: "San Francisco, CA",
        estimatedDelivery: "Sep 21, 2026",
        milestones: [
          { label: "Order verified", location: "AYIIN Marketplace", timestamp: "Sep 18, 10:14 AM", completed: true },
          { label: "Picked & Packed", location: "Portland, OR", timestamp: "Sep 18, 2:30 PM", completed: true },
          { label: "In Transit", location: "SFO Air Gateway", timestamp: "Sep 20, 6:00 AM", completed: true },
          { label: "Out for delivery", location: "San Francisco", timestamp: "Sep 21, 9:15 AM", completed: true },
          { label: "Delivered & Signed", location: "Front Desk", timestamp: "Sep 21, 1:44 PM", completed: true, current: true },
        ],
        items: [
          {
            product: safeProduct("halo-speaker-mini", 2),
            variantId: "chalk",
            qty: 1,
            price: 119,
          },
          {
            product: safeProduct("arc-table-lamp", 3),
            variantId: "travertine",
            qty: 1,
            price: 189,
          },
        ],
      },
    ],
  },
];

/**
 * Enriches user placed orders into multi-brand marketplace structures,
 * seamlessly merging user live orders with seed examples if user is new.
 */
export function enrichOrders(userOrders: Order[]): EnrichedOrder[] {
  const enrichedUserOrders: EnrichedOrder[] = userOrders
    .filter((o) => o.mode === "personal")
    .map((o) => {
      // Group items by seller
      const sellerGroups = new Map<string, typeof o.items>();
      for (const item of o.items) {
        const prod = productById(item.productId);
        const sId = prod?.sellerId ?? "northform";
        if (!sellerGroups.has(sId)) {
          sellerGroups.set(sId, []);
        }
        sellerGroups.get(sId)!.push(item);
      }

      const parcels: SellerParcel[] = Array.from(sellerGroups.entries()).map(([sellerId, items], idx) => {
        const seller = sellers.find((s) => s.id === sellerId) ?? sellers[0];
        const parcelItems = items
          .map((i) => {
            const p = productById(i.productId);
            return p
              ? {
                  product: p,
                  variantId: i.variantId,
                  qty: i.qty,
                  price: i.price,
                }
              : null;
          })
          .filter((x): x is NonNullable<typeof x> => Boolean(x && x.product));

        return {
          parcelId: `PKG-${o.id}-${idx + 1}`,
          seller,
          carrier: "FedEx Priority",
          trackingNumber: `FDX-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          status: o.status === "awaiting-approval" ? "processing" : "in_transit",
          statusLabel: o.status === "awaiting-approval" ? "Processing with Artisan" : "Dispatched · In Transit",
          progressPercent: 45,
          originLocation: `${seller.location}`,
          destinationLocation: "San Francisco, CA",
          estimatedDelivery: "In 2-3 business days",
          milestones: [
            { label: "Order verified & confirmed", location: "AYIIN", timestamp: new Date(o.createdAt).toLocaleDateString(), completed: true },
            { label: "Dispatched from brand studio", location: seller.location, timestamp: "Today", completed: true, current: true },
            { label: "In transit to delivery hub", location: "En route", timestamp: "Pending", completed: false },
            { label: "Out for courier delivery", location: "Local Depot", timestamp: "Pending", completed: false },
          ],
          items: parcelItems,
        };
      });

      return {
        id: o.id,
        createdAt: o.createdAt,
        total: o.total,
        mode: o.mode,
        overallStatus: o.status === "awaiting-approval" ? "processing" : "in_transit",
        overallStatusLabel: o.status === "awaiting-approval" ? "Awaiting Brand Approval" : "In Transit",
        parcels,
        shippingAddress: {
          name: "Haider Urwa",
          street: "482 Brannan Street",
          city: "San Francisco",
          state: "CA",
          zip: "94107",
        },
        paymentMethod: {
          brand: "Mastercard",
          last4: "8842",
        },
        totalItems: o.items.reduce((acc, i) => acc + i.qty, 0),
      };
    });

  // If user placed orders, show them first, then seed orders for full rich experience
  return [...enrichedUserOrders, ...SEED_ACCOUNT_ORDERS];
}
