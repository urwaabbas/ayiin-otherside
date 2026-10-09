"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  tier: string;
  joinedDate: string;
  verified: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type SavedPaymentMethod = {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "applepay";
  last4: string;
  exp: string;
  holder: string;
  isDefault: boolean;
};

export type AccountPreferences = {
  orderSMS: boolean;
  orderEmail: boolean;
  priceDropAlerts: boolean;
  curatedEditorial: boolean;
  sizingStandard: "US" | "EU" | "UK" | "JP";
  twoFactorAuth: boolean;
};

export type AccountSession = {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
};

type AccountState = {
  profile: CustomerProfile;
  addresses: SavedAddress[];
  payments: SavedPaymentMethod[];
  preferences: AccountPreferences;
  sessions: AccountSession[];

  // Actions
  updateProfile: (updates: Partial<CustomerProfile>) => void;
  addAddress: (addr: Omit<SavedAddress, "id">) => string;
  updateAddress: (id: string, updates: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  addPayment: (payment: Omit<SavedPaymentMethod, "id">) => string;
  deletePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;

  updatePreferences: (updates: Partial<AccountPreferences>) => void;
  revokeSession: (id: string) => void;
};

const DEFAULT_PROFILE: CustomerProfile = {
  name: "Haider Urwa",
  email: "haider@ayiin.studio",
  phone: "+1 (415) 890-2341",
  avatarInitials: "HU",
  tier: "Curated Circle · Tier 02",
  joinedDate: "October 2024",
  verified: true,
};

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-primary",
    label: "Design Studio & Loft",
    name: "Haider Urwa",
    street: "482 Brannan Street",
    apt: "Suite 4B",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "United States",
    phone: "+1 (415) 890-2341",
    isDefault: true,
  },
  {
    id: "addr-residence",
    label: "Residential Residence",
    name: "Haider Urwa",
    street: "1280 Green Street",
    city: "San Francisco",
    state: "CA",
    zip: "94109",
    country: "United States",
    phone: "+1 (415) 890-2341",
    isDefault: false,
  },
];

const DEFAULT_PAYMENTS: SavedPaymentMethod[] = [
  {
    id: "pay-1",
    brand: "mastercard",
    last4: "8842",
    exp: "08/28",
    holder: "HAIDER URWA",
    isDefault: true,
  },
  {
    id: "pay-2",
    brand: "visa",
    last4: "4242",
    exp: "11/27",
    holder: "HAIDER URWA",
    isDefault: false,
  },
  {
    id: "pay-3",
    brand: "applepay",
    last4: "9102",
    exp: "Device Linked",
    holder: "Apple Pay · AYIIN Express",
    isDefault: false,
  },
];

const DEFAULT_PREFERENCES: AccountPreferences = {
  orderSMS: true,
  orderEmail: true,
  priceDropAlerts: true,
  curatedEditorial: false,
  sizingStandard: "US",
  twoFactorAuth: true,
};

const DEFAULT_SESSIONS: AccountSession[] = [
  {
    id: "sess-1",
    device: "MacBook Pro 16″ (macOS Sonoma · Chrome)",
    location: "San Francisco, CA, USA",
    ip: "136.24.89.210",
    lastActive: "Active right now",
    current: true,
  },
  {
    id: "sess-2",
    device: "iPhone 16 Pro (iOS 18 · AYIIN App)",
    location: "San Francisco, CA, USA",
    ip: "172.56.41.98",
    lastActive: "2 hours ago",
    current: false,
  },
];

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      addresses: DEFAULT_ADDRESSES,
      payments: DEFAULT_PAYMENTS,
      preferences: DEFAULT_PREFERENCES,
      sessions: DEFAULT_SESSIONS,

      updateProfile: (updates) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...updates,
            avatarInitials: updates.name
              ? updates.name
                  .split(" ")
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : s.profile.avatarInitials,
          },
        })),

      addAddress: (addr) => {
        const id = `addr-${Date.now().toString(36)}`;
        set((s) => {
          const isDefault = addr.isDefault || s.addresses.length === 0;
          const updatedAddresses = isDefault
            ? s.addresses.map((a) => ({ ...a, isDefault: false }))
            : s.addresses;
          return { addresses: [{ ...addr, id, isDefault }, ...updatedAddresses] };
        });
        return id;
      },

      updateAddress: (id, updates) =>
        set((s) => ({
          addresses: s.addresses.map((a) => {
            if (a.id !== id) {
              return updates.isDefault ? { ...a, isDefault: false } : a;
            }
            return { ...a, ...updates };
          }),
        })),

      deleteAddress: (id) =>
        set((s) => {
          const filtered = s.addresses.filter((a) => a.id !== id);
          if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
            filtered[0].isDefault = true;
          }
          return { addresses: filtered };
        }),

      setDefaultAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      addPayment: (payment) => {
        const id = `pay-${Date.now().toString(36)}`;
        set((s) => {
          const isDefault = payment.isDefault || s.payments.length === 0;
          const updated = isDefault
            ? s.payments.map((p) => ({ ...p, isDefault: false }))
            : s.payments;
          return { payments: [{ ...payment, id, isDefault }, ...updated] };
        });
        return id;
      },

      deletePayment: (id) =>
        set((s) => {
          const filtered = s.payments.filter((p) => p.id !== id);
          if (filtered.length > 0 && !filtered.some((p) => p.isDefault)) {
            filtered[0].isDefault = true;
          }
          return { payments: filtered };
        }),

      setDefaultPayment: (id) =>
        set((s) => ({
          payments: s.payments.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        })),

      updatePreferences: (updates) =>
        set((s) => ({ preferences: { ...s.preferences, ...updates } })),

      revokeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) })),
    }),
    {
      name: "ayiin-account-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
