"use client";

import { useState, useEffect } from "react";
import { type SavedAddress } from "@/lib/account-store";
import { Icon } from "@/components/ui/icon";

export function AddressModal({
  address,
  isOpen,
  onClose,
  onSave,
}: {
  address: SavedAddress | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SavedAddress, "id">, editId?: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <AddressModalContent
      key={address?.id ?? "new"}
      address={address}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AddressModalContent({
  address,
  onClose,
  onSave,
}: {
  address: SavedAddress | null;
  onClose: () => void;
  onSave: (data: Omit<SavedAddress, "id">, editId?: string) => void;
}) {
  const [formData, setFormData] = useState(() => ({
    label: address?.label ?? "Home / Loft",
    name: address?.name ?? "",
    street: address?.street ?? "",
    apt: address?.apt ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    zip: address?.zip ?? "",
    country: address?.country ?? "United States",
    phone: address?.phone ?? "",
    isDefault: address?.isDefault ?? false,
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, address?.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-panel bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="address-modal-title" className="font-display text-xl font-medium text-ink">
            {address ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-mist hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="addr-label">
              Address Label (e.g. Studio, Home, Office)
            </label>
            <input
              id="addr-label"
              required
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="field text-support"
              placeholder="e.g. Primary Loft"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="addr-name">
                Recipient Full Name
              </label>
              <input
                id="addr-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field text-support"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="addr-phone">
                Phone Number (for Courier SMS)
              </label>
              <input
                id="addr-phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="field text-support"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="addr-street">
              Street Address
            </label>
            <input
              id="addr-street"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="field text-support"
              placeholder="123 Market Street"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="addr-apt">
              Apt / Suite / Unit (Optional)
            </label>
            <input
              id="addr-apt"
              value={formData.apt}
              onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
              className="field text-support"
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="field-label" htmlFor="addr-city">
                City
              </label>
              <input
                id="addr-city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="field text-support"
                placeholder="San Francisco"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="addr-state">
                State
              </label>
              <input
                id="addr-state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="field text-support"
                placeholder="CA"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="addr-zip">
                ZIP Code
              </label>
              <input
                id="addr-zip"
                required
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="field text-support"
                placeholder="94105"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-support text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-line-strong text-ink focus:ring-brand"
              />
              <span>Set as default shipping address</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-support"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-support"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
