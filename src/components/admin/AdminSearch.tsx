"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResults {
  orders: any[];
  users: any[];
  products: any[];
}

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data);
          setOpen(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const hasAnyResults =
    results &&
    (results.orders.length > 0 ||
      results.users.length > 0 ||
      results.products.length > 0);

  return (
    <div className="relative w-72 sm:w-96" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, products, users..."
          className="w-full h-10 pl-10 pr-4 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-900 placeholder:text-gray-400"
        />
        <svg
          className="w-4 h-4 text-gray-400 absolute left-3.5 top-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {open && results && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {!hasAnyResults ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {results.orders.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Orders
                  </p>
                  {results.orders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders?highlight=${o.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <span className="font-semibold text-gray-900">#{o.id}</span>
                        <span className="text-gray-500 ml-2">{o.user?.name}</span>
                      </div>
                      <span className="font-semibold text-blue-600">${o.total}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Products
                  </p>
                  {results.products.map((p) => (
                    <Link
                      key={p._id || p.id}
                      href={`/admin/products?highlight=${p._id || p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-900 truncate max-w-[220px]">
                        {p.title}
                      </span>
                      <span className="text-gray-500 font-semibold">${p.price}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Users
                  </p>
                  {results.users.map((u) => (
                    <Link
                      key={u._id}
                      href="/admin/users"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-900">{u.name}</span>
                      <span className="text-gray-400">{u.email}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
