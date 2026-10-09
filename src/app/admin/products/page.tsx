"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const CATEGORY_MAP: Record<string, string[]> = {
  "Audio & Tech": ["Headphones", "Speakers", "Laptops", "Monitors", "Phones"],
  "Home & Living": ["Lighting", "Seating", "Decor", "Candles", "Plants"],
  "Kitchen & Coffee": ["Coffee", "Kettles", "Tableware", "Hospitality"],
  "Office & Studio": ["Desks", "Ergonomics", "Stationery", "Organizers"],
  "Fashion & Carry": ["Bags", "Wallets", "Jackets", "Accessories"],
  "Beauty & Wellness": ["Skincare", "Fragrance", "Care"],
  "General": ["Standard"],
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

interface Product {
  _id: string;
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  category: { name: string; slug?: string };
  subcategory?: string;
}

interface FormFieldsProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  discountPercentage: string;
  setDiscountPercentage: (v: string) => void;
  stock: string;
  setStock: (v: string) => void;
  image: string;
  setImage: (v: string) => void;
  categoryName: string;
  setCategoryName: (v: string) => void;
  subcategory: string;
  setSubcategory: (v: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
}

function FormFields({
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  discountPercentage,
  setDiscountPercentage,
  stock,
  setStock,
  image,
  setImage,
  categoryName,
  setCategoryName,
  subcategory,
  setSubcategory,
  handleImageUpload,
  uploadingImage,
}: FormFieldsProps) {
  const availableSubcategories = categoryName ? CATEGORY_MAP[categoryName] || [] : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Product Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Aurel Studio Headphones"
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed craft description and specifications"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Price ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="249.00"
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Discount Percentage (%)
        </label>
        <input
          type="number"
          min="0"
          max="75"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
          placeholder="e.g. 15"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Stock Quantity
        </label>
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="50"
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Category
        </label>
        <select
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            setSubcategory("");
          }}
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Subcategory
        </label>
        <select
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          disabled={!categoryName || availableSubcategories.length === 0}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
        >
          <option value="">Select Subcategory (optional)</option>
          {availableSubcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Image URL or Upload
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://... or upload"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition">
            {uploadingImage ? "..." : "Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = async (p = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/products?page=${p}&limit=12&category=${selectedCategory}&search=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.currentPage || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!highlightId || products.length === 0) return;
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightId, products]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
      } else {
        alert("Upload error: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const disc = discountPercentage ? Number(discountPercentage) : 0;
      const baseP = parseFloat(price);
      const discPrice = disc > 0 ? baseP * (1 - disc / 100) : null;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: baseP,
          discountPrice: discPrice,
          stock: parseInt(stock, 10),
          image: image || "/products/placeholder.jpg",
          categoryName,
          subcategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchProducts(page);
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const disc = discountPercentage ? Number(discountPercentage) : 0;
      const baseP = parseFloat(price);
      const discPrice = disc > 0 ? baseP * (1 - disc / 100) : null;

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct._id || editingProduct.id,
          title,
          description,
          price: baseP,
          discountPrice: discPrice,
          stock: parseInt(stock, 10),
          image: image || editingProduct.images[0],
          categoryName,
          subcategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        resetForm();
        fetchProducts(page);
      } else {
        alert(data.error || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setDeletingProductId(null);
        fetchProducts(page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setDiscountPercentage("");
    setStock("");
    setImage("");
    setCategoryName("");
    setSubcategory("");
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setPrice(String(p.price));
    if (p.discountPrice && p.price > 0) {
      const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
      setDiscountPercentage(String(pct));
    } else {
      setDiscountPercentage("");
    }
    setStock(String(p.stock));
    setImage(p.images?.[0] || "");
    setCategoryName(p.category?.name || "");
    setSubcategory(p.subcategory || "");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage marketplace inventory, pricing, and product listings
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-900">No products found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or click Add Product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const isHighlighted = (p._id || p.id) === highlightId;
            return (
              <div
                key={p._id || p.id}
                ref={isHighlighted ? highlightRef : null}
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition hover:shadow-md ${
                  isHighlighted
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200/80"
                }`}
              >
                <div>
                  <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/hero/canvas-1.jpg";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 shadow-xs text-gray-800">
                      Stock: {p.stock}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {p.category?.name || "General"}
                  </p>
                  <h3 className="text-xs font-bold text-gray-900 mt-0.5 line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                    {p.description || "Authentic Ayiin design piece."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-gray-900">${p.price}</span>
                    {p.discountPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">
                        ${p.discountPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingProductId(p._id || p.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchProducts(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchProducts(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="mt-4 space-y-4">
              <FormFields
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                price={price}
                setPrice={setPrice}
                discountPercentage={discountPercentage}
                setDiscountPercentage={setDiscountPercentage}
                stock={stock}
                setStock={setStock}
                image={image}
                setImage={setImage}
                categoryName={categoryName}
                setCategoryName={setCategoryName}
                subcategory={subcategory}
                setSubcategory={setSubcategory}
                handleImageUpload={handleImageUpload}
                uploadingImage={uploadingImage}
              />
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="mt-4 space-y-4">
              <FormFields
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                price={price}
                setPrice={setPrice}
                discountPercentage={discountPercentage}
                setDiscountPercentage={setDiscountPercentage}
                stock={stock}
                setStock={setStock}
                image={image}
                setImage={setImage}
                categoryName={categoryName}
                setCategoryName={setCategoryName}
                subcategory={subcategory}
                setSubcategory={setSubcategory}
                handleImageUpload={handleImageUpload}
                uploadingImage={uploadingImage}
              />
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Delete Product?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingProductId)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
