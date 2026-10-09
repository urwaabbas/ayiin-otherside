"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  OrdersStatusDonutChart,
  ProductsCategoryBarChart,
} from "@/components/admin/AdminCharts";

interface Order {
  _id: string;
  id: string;
  user: { name: string; email: string };
  items: { title: string; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  id: string;
  title: string;
  stock: number;
  price: number;
  images: string[];
  category: { name: string };
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { name: string; value: number }[];
  productsByCategory: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/users"),
        fetch("/api/admin/products"),
      ]);

      const [statsData, ordersData, usersData, productsData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        usersRes.json(),
        productsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setRecentOrders(ordersData.orders.slice(0, 5));
      if (usersData.success) setRecentUsers(usersData.users.slice(0, 5));

      if (productsData.success) {
        const low = productsData.products
          .filter((p: Product) => p.stock <= 5)
          .slice(0, 5);
        setLowStockProducts(low);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const statusStyle: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-indigo-100 text-indigo-700",
    cancelled: "bg-red-100 text-red-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-xs tracking-wider uppercase">Loading Ayiin Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* Welcome & Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview</h1>
            <p className="text-xs text-gray-500 mt-1">
              Live marketplace activity and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold px-3 py-1.5 bg-gray-900 hover:bg-black rounded-xl text-white transition flex items-center gap-1.5 shadow-xs"
            >
              View Storefront &rarr;
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                $
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              ${(stats?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">From completed & paid orders</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {stats?.totalOrders || 0}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Customer checkouts recorded</p>
          </div>

          {/* Total Products */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catalog Products</p>
              <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {stats?.totalProducts || 0}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">Active in Ayiin marketplace</p>
          </div>

          {/* Total Users */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Users</p>
              <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Customers & staff accounts</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status Donut Chart */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Orders by Status
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Data
              </span>
            </div>
            <OrdersStatusDonutChart data={stats?.ordersByStatus || []} />
          </div>

          {/* Products by Category Bar Chart */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Products by Category
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Inventory
              </span>
            </div>
            <ProductsCategoryBarChart data={stats?.productsByCategory || []} />
          </div>
        </div>

        {/* Recent Orders & Low Stock Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View all orders &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No orders recorded yet. Place an order on the storefront to test!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 font-semibold text-gray-900">
                          #{order.id || order._id}
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-gray-800">{order.user?.name || "Customer"}</p>
                          <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="py-3 text-gray-600">
                          {order.items?.length || 1} item{order.items?.length === 1 ? "" : "s"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              statusStyle[order.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-gray-900">
                          ${order.total?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Low Stock Alerts
                </h2>
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Manage &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    All inventory levels healthy
                  </div>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {p.category?.name || "Product"}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg">
                        {p.stock} left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href="/admin/products"
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Add / Restock Products
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
