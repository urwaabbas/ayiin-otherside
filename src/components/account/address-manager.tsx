"use client";

import { useState } from "react";
import { useAccount, type SavedAddress } from "@/lib/account-store";
import { useHydrated, useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";
import { AddressModal } from "./address-modal";

export function AddressManager() {
  const hydrated = useHydrated();
  const addresses = useAccount((s) => s.addresses);
  const addAddress = useAccount((s) => s.addAddress);
  const updateAddress = useAccount((s) => s.updateAddress);
  const deleteAddress = useAccount((s) => s.deleteAddress);
  const setDefaultAddress = useAccount((s) => s.setDefaultAddress);
  const notify = useUI((s) => s.notify);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<SavedAddress, "id">, editId?: string) => {
    if (editId) {
      updateAddress(editId, data);
      notify("Address updated", `${data.label} has been saved.`);
    } else {
      addAddress(data);
      notify("Address added", `${data.label} added to your address book.`);
    }
  };

  const handleDelete = (id: string, label: string) => {
    deleteAddress(id);
    notify("Address removed", `${label} has been deleted.`);
  };

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-surface bg-mist" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-support text-mute">
            Manage your verified shipping locations. Orders default to your primary destination.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary self-start sm:self-auto text-support"
        >
          <Icon name="plus" size={15} />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`relative flex flex-col justify-between rounded-surface border bg-white p-5 shadow-[var(--shadow-hair)] transition-all ${
              addr.isDefault ? "border-ink ring-1 ring-ink" : "border-line"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink text-body">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-meta font-medium text-brand-deep">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-support text-mute">
                <p className="font-medium text-ink">{addr.name}</p>
                <p>{addr.street} {addr.apt && `· ${addr.apt}`}</p>
                <p>{addr.city}, {addr.state} {addr.zip}</p>
                <p>{addr.country}</p>
                <p className="pt-1 text-meta">{addr.phone}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
              <div>
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-meta font-medium text-mute hover:text-ink"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-meta font-medium text-success">
                    ✓ Primary Destination
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(addr)}
                  className="btn btn-ghost px-2.5 py-1 text-meta"
                >
                  <Icon name="sliders" size={14} />
                  <span>Edit</span>
                </button>

                {addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id, addr.label)}
                    className="btn btn-ghost px-2 py-1 text-meta text-danger hover:bg-danger-soft"
                    title="Delete address"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddressModal
        isOpen={modalOpen}
        address={editingAddress}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
