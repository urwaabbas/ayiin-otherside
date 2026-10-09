"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@/lib/account-store";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";

export function ProfileEditModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return <ProfileEditModalContent onClose={onClose} />;
}

function ProfileEditModalContent({ onClose }: { onClose: () => void }) {
  const profile = useAccount((s) => s.profile);
  const updateProfile = useAccount((s) => s.updateProfile);
  const notify = useUI((s) => s.notify);

  const [formData, setFormData] = useState(() => ({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
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
    updateProfile(formData);
    notify("Profile updated", "Your account identity has been saved.");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-panel bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="profile-modal-title" className="font-display text-xl font-medium text-ink">
            Edit Member Profile
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
            <label className="field-label" htmlFor="prof-name">
              Full Legal / Preferred Name
            </label>
            <input
              id="prof-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field text-support"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="prof-email">
              Verified Account Email
            </label>
            <input
              id="prof-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="field text-support"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="prof-phone">
              Mobile Contact
            </label>
            <input
              id="prof-phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="field text-support"
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
