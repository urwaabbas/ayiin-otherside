"use client";

import { useAccount } from "@/lib/account-store";
import { useHydrated, useUI } from "@/lib/store";

export function PreferencesManager() {
  const hydrated = useHydrated();
  const preferences = useAccount((s) => s.preferences);
  const updatePreferences = useAccount((s) => s.updatePreferences);
  const sessions = useAccount((s) => s.sessions);
  const revokeSession = useAccount((s) => s.revokeSession);
  const notify = useUI((s) => s.notify);

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
    notify("Preferences saved", "Your account settings have been updated.");
  };

  const handleRevoke = (id: string, device: string) => {
    revokeSession(id);
    notify("Session revoked", `Disconnected ${device}.`);
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-surface bg-mist" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notifications and Dispatch Channels */}
      <div className="rounded-surface border border-line bg-white p-6 shadow-[var(--shadow-hair)] sm:p-7">
        <h3 className="font-display text-xl font-medium text-ink">
          Notification & Dispatch Channels
        </h3>
        <p className="mt-1 text-support text-mute">
          Choose how you receive delivery milestone updates and private collection announcements.
        </p>

        <div className="mt-6 divide-y divide-line">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-body font-medium text-ink">Live SMS Dispatch Updates</p>
              <p className="text-support text-mute">
                Real-time carrier text messages when parcels depart studio hubs and arrive at your door.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("orderSMS")}
              role="switch"
              aria-checked={preferences.orderSMS}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                preferences.orderSMS ? "bg-ink" : "bg-soft"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  preferences.orderSMS ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-body font-medium text-ink">Email Invoices & PDF Receipts</p>
              <p className="text-support text-mute">
                Send formal proof of purchase and customs clearance documentation to your primary email.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("orderEmail")}
              role="switch"
              aria-checked={preferences.orderEmail}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                preferences.orderEmail ? "bg-ink" : "bg-soft"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  preferences.orderEmail ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-body font-medium text-ink">Price Drop & Low Stock Alerts</p>
              <p className="text-support text-mute">
                Immediate alerts when pieces in your saved wishlist enter rare archive sales or dip below 5 units.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("priceDropAlerts")}
              role="switch"
              aria-checked={preferences.priceDropAlerts}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                preferences.priceDropAlerts ? "bg-ink" : "bg-soft"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  preferences.priceDropAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-body font-medium text-ink">AYIIN Curated Editorial Digest</p>
              <p className="text-support text-mute">
                Weekly designer interviews, lookbooks, and private studio collection releases.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("curatedEditorial")}
              role="switch"
              aria-checked={preferences.curatedEditorial}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                preferences.curatedEditorial ? "bg-ink" : "bg-soft"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  preferences.curatedEditorial ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Sizing Standard */}
      <div className="rounded-surface border border-line bg-white p-6 shadow-[var(--shadow-hair)] sm:p-7">
        <h3 className="font-display text-xl font-medium text-ink">
          Regional Sizing Standard
        </h3>
        <p className="mt-1 text-support text-mute">
          Controls how apparel, footwear, and accessory dimensions are converted across brand pages.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["US", "EU", "UK", "JP"] as const).map((standard) => (
            <button
              key={standard}
              type="button"
              onClick={() => {
                updatePreferences({ sizingStandard: standard });
                notify("Sizing standard set", `Product sizing adjusted to ${standard}.`);
              }}
              className={`btn ${
                preferences.sizingStandard === standard ? "btn-primary" : "btn-secondary"
              } text-support`}
            >
              {standard} Standard
            </button>
          ))}
        </div>
      </div>

      {/* Security & Active Sessions */}
      <div className="rounded-surface border border-line bg-white p-6 shadow-[var(--shadow-hair)] sm:p-7">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="font-display text-xl font-medium text-ink">
              Security & Active Devices
            </h3>
            <p className="text-support text-mute">
              AYIIN uses passwordless Passkeys and cryptographically signed one-time magic links.
            </p>
          </div>

          <span className="rounded-full bg-success-soft px-3 py-1 text-meta font-medium text-success">
            Passkey Active
          </span>
        </div>

        <div className="mt-4 divide-y divide-line">
          {sessions.map((sess) => (
            <div key={sess.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink text-body">{sess.device}</span>
                  {sess.current && (
                    <span className="rounded-full bg-mist px-2 py-0.5 text-meta text-ink font-medium">
                      This Device
                    </span>
                  )}
                </div>
                <p className="text-meta text-mute mt-0.5">
                  {sess.location} · IP: {sess.ip} · {sess.lastActive}
                </p>
              </div>

              {!sess.current && (
                <button
                  type="button"
                  onClick={() => handleRevoke(sess.id, sess.device)}
                  className="btn btn-secondary text-meta"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
