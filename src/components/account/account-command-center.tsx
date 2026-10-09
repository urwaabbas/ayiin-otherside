"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useHydrated, useShop } from "@/lib/store";
import { useAccount } from "@/lib/account-store";
import { Icon, type IconName } from "@/components/ui/icon";

import { AccountHeader } from "./account-header";
import { OrdersManager } from "./orders-manager";
import { SavedManager } from "./saved-manager";
import { AddressManager } from "./address-manager";
import { PaymentManager } from "./payment-manager";
import { PreferencesManager } from "./preferences-manager";
import { ProfileEditModal } from "./profile-edit-modal";

type TabId = "orders" | "saved" | "addresses" | "billing" | "settings";

type TabConfig = {
  id: TabId;
  label: string;
  icon: IconName;
  badge?: number | string;
};

export function AccountCommandCenter() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ["orders", "saved", "addresses", "billing", "settings"].includes(tabParam)
      ? tabParam
      : "orders"
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const wishlist = useShop((s) => s.wishlist);
  const addresses = useAccount((s) => s.addresses);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  const tabs: TabConfig[] = [
    { id: "orders", label: "Orders & Deliveries", icon: "truck", badge: "2 Active" },
    { id: "saved", label: "Saved & Curated", icon: "heart", badge: hydrated ? wishlist.length : 0 },
    { id: "addresses", label: "Address Book", icon: "pin", badge: hydrated ? addresses.length : 2 },
    { id: "billing", label: "Payment & Invoices", icon: "card" },
    { id: "settings", label: "Security & Preferences", icon: "sliders" },
  ];

  return (
    <div className="space-y-8">
      {/* Customer Command Center Header */}
      <AccountHeader onEditProfile={() => setProfileModalOpen(true)} />

      {/* Segmented Pill Navigation Bar */}
      <div className="no-scrollbar flex overflow-x-auto border-b border-line pb-px">
        <nav
          role="tablist"
          aria-label="Account sections"
          className="flex min-w-full gap-2 sm:min-w-0"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={isSelected}
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  "relative flex shrink-0 items-center gap-2.5 rounded-t-control px-4 py-3 text-support font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  isSelected
                    ? "border-b-2 border-ink text-ink"
                    : "text-mute hover:border-b-2 hover:border-line-hover hover:text-ink"
                )}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  className={clsx(isSelected ? "text-ink" : "text-mute")}
                />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.2 font-mono text-meta",
                      isSelected
                        ? "bg-ink text-white"
                        : "bg-mist text-ink-2"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="outline-none"
        >
          {activeTab === "orders" && <OrdersManager />}
          {activeTab === "saved" && <SavedManager />}
          {activeTab === "addresses" && <AddressManager />}
          {activeTab === "billing" && <PaymentManager />}
          {activeTab === "settings" && <PreferencesManager />}
        </motion.div>
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}
