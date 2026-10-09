"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Order {
  _id: string;
  id: string;
  user: { name: string; email: string };
  items: { title: string; quantity: number; price?: number }[];
  total: number;
  status: "pending" | "paid" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const STATUS_OPTIONS: Order["status"][] = [
  "pending",
  "paid",
  "processing",
  "completed",
  "cancelled",
];

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!highlightId || orders.length === 0) return;
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightId, orders]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId || o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      (order.user?.name || "").toLowerCase().includes(q) ||
      (order.user?.email || "").toLowerCase().includes(q) ||
      order.items?.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track and fulfill live customer orders placed on Ayiin
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition flex items-center gap-1.5 shadow-xs w-fit"
        >
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Orders
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["all", "pending", "paid", "processing", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition shrink-0 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer name..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-sm font-bold text-gray-900">No orders match criteria</p>
          <p className="text-xs text-gray-500 mt-1">
            New orders placed at checkout on Ayiin will appear right here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isHighlighted = (order._id || order.id) === highlightId;
            return (
              <div
                key={order._id || order.id}
                ref={isHighlighted ? highlightRef : null}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:border-gray-300 ${
                  isHighlighted ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      #{order.id || order._id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order._id || order.id,
                          e.target.value as Order["status"]
                        )
                      }
                      disabled={updatingOrderId === (order._id || order.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 capitalize cursor-pointer transition ${
                        statusStyle[order.status] || "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-white text-gray-900 font-medium">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Customer Info */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {order.user?.name || "Customer"}
                    </p>
                    <p className="text-[11px] text-gray-500">{order.user?.email}</p>
                  </div>

                  {/* Items List */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Ordered Items ({order.items?.length || 0})
                    </p>
                    <div className="space-y-0.5">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-700 flex items-center justify-between">
                          <span className="truncate max-w-[220px]">
                            {item.quantity}x {item.title}
                          </span>
                          {item.price && (
                            <span className="text-gray-400 text-[11px] font-mono">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </p>
                    <p className="text-xl font-black text-gray-900 mt-0.5">
                      ${order.total?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
