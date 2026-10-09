"use client";

import { useState } from "react";
import { useAccount, type SavedPaymentMethod } from "@/lib/account-store";
import { useHydrated, useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";

type PaymentCardBrand = Exclude<SavedPaymentMethod["brand"], "applepay">;

export function PaymentManager() {
  const hydrated = useHydrated();
  const payments = useAccount((s) => s.payments);
  const addPayment = useAccount((s) => s.addPayment);
  const deletePayment = useAccount((s) => s.deletePayment);
  const setDefaultPayment = useAccount((s) => s.setDefaultPayment);
  const notify = useUI((s) => s.notify);

  const [addModal, setAddModal] = useState(false);
  const [formData, setFormData] = useState({
    brand: "visa" as PaymentCardBrand,
    last4: "",
    exp: "",
    holder: "",
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.last4.length !== 4) return;
    addPayment({
      brand: formData.brand,
      last4: formData.last4,
      exp: formData.exp || "12/28",
      holder: formData.holder.toUpperCase() || "HAIDER URWA",
      isDefault: false,
    });
    setAddModal(false);
    notify("Payment method linked", `Card ending in ${formData.last4} saved securely.`);
  };

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-surface bg-mist" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Section */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-support font-semibold uppercase tracking-wider text-mute">
              Saved Payment Instruments
            </h3>
            <p className="text-support text-mute">
              Encrypted and tokenized via AYIIN Vault. Never stored in plaintext.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="btn btn-secondary self-start sm:self-auto text-support"
          >
            <Icon name="card" size={15} />
            <span>Add New Card</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-surface border p-5 shadow-[var(--shadow-hair)] transition-all ${
                p.isDefault
                  ? "border-ink bg-gradient-to-br from-ink to-graphite text-white"
                  : "border-line bg-white text-ink"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-meta uppercase tracking-wider font-semibold">
                    {p.brand === "applepay" ? "Apple Pay" : p.brand.toUpperCase()}
                  </span>
                  {p.isDefault && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-meta font-medium text-ink">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <p className="font-mono text-lg tracking-widest">
                    •••• •••• •••• {p.last4}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Cardholder</p>
                  <p className="text-support font-medium truncate max-w-[150px]">{p.holder}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Expires</p>
                  <p className="font-mono text-meta font-medium">{p.exp}</p>
                </div>
              </div>

              {/* Actions footer */}
              <div className={`mt-4 flex items-center justify-between border-t pt-3 ${p.isDefault ? "border-graphite-line" : "border-line"}`}>
                {!p.isDefault ? (
                  <button
                    type="button"
                    onClick={() => setDefaultPayment(p.id)}
                    className="text-meta font-medium hover:underline opacity-80"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-meta font-medium text-brand">✓ Primary Method</span>
                )}

                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deletePayment(p.id)}
                    className="text-meta text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Invoices & VAT Receipts Table */}
      <div className="rounded-surface border border-line bg-white p-6 shadow-[var(--shadow-hair)]">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="font-medium text-ink text-body">Tax Invoices & Digital Receipts</h3>
            <p className="text-support text-mute">
              Download formal PDF invoices with breakdown for tax accounting and personal archives.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-line">
          {[
            { id: "INV-AY-849201", date: "Oct 6, 2026", total: "$938.00", items: "2 items (Northform + Atelier Mesa)" },
            { id: "INV-AY-791024", date: "Sep 18, 2026", total: "$308.00", items: "2 items (Northform Audio)" },
          ].map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
              <div>
                <span className="font-mono font-medium text-ink text-support">{inv.id}</span>
                <p className="text-meta text-mute">{inv.date} · {inv.items}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="num font-semibold text-ink text-support">{inv.total}</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-ghost px-2.5 py-1 text-meta"
                >
                  <Icon name="receipt" size={14} />
                  <span>PDF Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      {addModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={() => setAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-panel bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h4 className="font-display text-xl font-medium text-ink">Add Payment Card</h4>
              <button
                type="button"
                onClick={() => setAddModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-mist hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="card-brand">Card Network</label>
                <select
                  id="card-brand"
                  value={formData.brand}
                  onChange={(e) => {
                    const brand = e.target.value;
                    if (brand === "visa" || brand === "mastercard" || brand === "amex") {
                      setFormData({ ...formData, brand });
                    }
                  }}
                  className="field text-support"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="card-holder">Name on Card</label>
                <input
                  id="card-holder"
                  required
                  placeholder="HAIDER URWA"
                  value={formData.holder}
                  onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
                  className="field text-support uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label" htmlFor="card-last4">Last 4 Digits</label>
                  <input
                    id="card-last4"
                    required
                    maxLength={4}
                    placeholder="4242"
                    value={formData.last4}
                    onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, "") })}
                    className="field font-mono text-support"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="card-exp">Expiry (MM/YY)</label>
                  <input
                    id="card-exp"
                    required
                    placeholder="12/28"
                    value={formData.exp}
                    onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                    className="field font-mono text-support"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="btn btn-secondary text-support"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-support"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
