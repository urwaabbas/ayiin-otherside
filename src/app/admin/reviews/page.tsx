"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Review {
  _id: string;
  product: { _id: string; title: string; images?: string[] };
  author: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

function AdminReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this customer review?")) return;
    try {
      setDeletingId(reviewId);
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedRating === "all") return true;
    return r.rating === parseInt(selectedRating, 10);
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-gray-500 mt-1">
            Moderate and monitor buyer feedback on Ayiin products
          </p>
        </div>
      </div>

      {/* Filter by Stars */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs overflow-x-auto">
        <span className="text-xs font-semibold text-gray-500 mr-2">Filter:</span>
        {["all", "5", "4", "3", "2", "1"].map((stars) => (
          <button
            key={stars}
            onClick={() => setSelectedRating(stars)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedRating === stars
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {stars === "all" ? "All Stars" : `★ ${stars} Stars`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-900">No reviews found</p>
          <p className="text-xs text-gray-500 mt-1">
            Customer reviews submitted on product pages will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs font-bold text-gray-900">{r.title}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{r.author}</p>
                  <p className="text-[10px] text-blue-600 font-medium truncate max-w-[180px]">
                    {r.product?.title || "Product"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={deletingId === r._id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                  title="Delete review"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminReviewsContent />
    </Suspense>
  );
}
