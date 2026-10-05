import type { Metadata } from "next";
import { AccountView } from "@/components/checkout/account-view";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-display-sm sm:text-display-lg">Everything in one place.</h1>
      <p className="mt-3 max-w-lg text-body text-mute">No password needed — sign in with a one-time link. Guest orders appear here automatically on this device.</p>
      <AccountView />
    </div>
  );
}
