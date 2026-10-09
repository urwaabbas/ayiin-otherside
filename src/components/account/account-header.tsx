"use client";

import { useAccount } from "@/lib/account-store";
import { useShop, useHydrated } from "@/lib/store";
import { usePrefs } from "@/components/providers";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";

export function AccountHeader({ onEditProfile }: { onEditProfile: () => void }) {
  const hydrated = useHydrated();
  const profile = useAccount((s) => s.profile);
  const wishlist = useShop((s) => s.wishlist);
  const { mode, setMode } = usePrefs();

  const isBusiness = mode === "business";

  return (
    <div className="relative overflow-hidden rounded-panel border border-line bg-white p-6 shadow-[var(--shadow-hair)] sm:p-8">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Profile identity info */}
        <div className="flex items-start gap-4 sm:items-center sm:gap-5">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink font-display text-display-sm text-white shadow-md sm:h-20 sm:w-20">
            <span className="text-xl tracking-tight sm:text-2xl">
              {hydrated ? profile.avatarInitials : "AY"}
            </span>
            {hydrated && profile.verified && (
              <span
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-ink shadow-sm"
                title="Verified AYIIN Member"
              >
                <Icon name="check" size={13} strokeWidth={2.8} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                {hydrated ? profile.name : "Member"}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-porcelain px-2.5 py-0.5 text-meta font-medium text-ink-2">
                <Icon name="sparkle" size={12} className="text-brand-deep" />
                {hydrated ? profile.tier : "Curated Circle"}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-support text-mute">
              <span>{hydrated ? profile.email : "loading..."}</span>
              <span className="hidden sm:inline">·</span>
              <span>{hydrated ? profile.phone : ""}</span>
              <span className="hidden sm:inline">·</span>
              <span className="text-meta">Member since {hydrated ? profile.joinedDate : "2024"}</span>
            </div>
          </div>
        </div>

        {/* Quick controls: Edit Profile & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onEditProfile}
            className="btn btn-secondary text-support"
          >
            <Icon name="sliders" size={15} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setMode(isBusiness ? "personal" : "business")}
            className="btn btn-ghost text-support hover:bg-mist"
            title="Switch procurement workspace"
          >
            <Icon name="building" size={15} />
            <span>{isBusiness ? "Switch to Personal" : "Switch to Business"}</span>
          </button>
        </div>
      </div>

      {/* Real-time Metric Strip */}
      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-surface bg-porcelain p-4">
          <div className="flex items-center justify-between">
            <span className="text-meta font-medium uppercase tracking-wider text-mute">Active Shipments</span>
            <SignalDot live />
          </div>
          <p className="num mt-2 text-2xl font-semibold text-ink sm:text-3xl">2</p>
          <p className="mt-1 text-meta text-mute">1 arriving tomorrow</p>
        </div>

        <div className="rounded-surface bg-porcelain p-4">
          <div className="flex items-center justify-between">
            <span className="text-meta font-medium uppercase tracking-wider text-mute">Saved Pieces</span>
            <Icon name="heart" size={14} className="text-mute" />
          </div>
          <p className="num mt-2 text-2xl font-semibold text-ink sm:text-3xl">
            {hydrated ? wishlist.length : 0}
          </p>
          <p className="mt-1 text-meta text-mute">In your private wishlist</p>
        </div>

        <div className="rounded-surface bg-porcelain p-4">
          <div className="flex items-center justify-between">
            <span className="text-meta font-medium uppercase tracking-wider text-mute">All-Time Orders</span>
            <Icon name="receipt" size={14} className="text-mute" />
          </div>
          <p className="num mt-2 text-2xl font-semibold text-ink sm:text-3xl">3</p>
          <p className="mt-1 text-meta text-mute">100% verified fulfillment</p>
        </div>

        <div className="rounded-surface bg-porcelain p-4">
          <div className="flex items-center justify-between">
            <span className="text-meta font-medium uppercase tracking-wider text-mute">Carbon Offset</span>
            <Icon name="leaf" size={14} className="text-success" />
          </div>
          <p className="num mt-2 text-2xl font-semibold text-ink sm:text-3xl">4.8 kg</p>
          <p className="mt-1 text-meta text-mute">100% neutral parcel shipping</p>
        </div>
      </div>
    </div>
  );
}
