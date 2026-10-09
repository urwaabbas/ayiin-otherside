"use client";

import { useEffect, useState } from "react";

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setSending(true);
      setStatusMessage(null);
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || `Broadcast sent to ${data.sentCount} subscribers.`,
        });
        setSubject("");
        setMessage("");
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to send newsletter broadcast.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Error communicating with the server.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Newsletter & Campaigns</h1>
          <p className="text-xs text-gray-500 mt-1">
            Audience mailing list and product announcements
          </p>
        </div>
        <button
          onClick={fetchSubscribers}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition flex items-center gap-1.5 shadow-xs w-fit"
        >
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Broadcast Composer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-1">Send Broadcast Campaign</h2>
          <p className="text-xs text-gray-500 mb-4">
            Deliver product updates directly to {subscribers.length} verified Ayiin subscribers.
          </p>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs mb-4 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New Studio Arrivals & Autumn Collection"
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Newsletter Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement, featured products, or promotional news here..."
                rows={6}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={sending || subscribers.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dispatching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Newsletter Broadcast
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subscribers Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Subscribers ({subscribers.length})
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No subscribers yet. Sign up from the Ayiin footer to test!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-gray-50">
                {subscribers.map((s) => (
                  <div key={s._id} className="pt-2 first:pt-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {s.email}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Joined {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400">
              Users who submit their email in the footer form on any storefront page are instantly added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
