import fs from "fs";
import path from "path";
import { products as catalogProducts } from "@/lib/catalog/products";
import { SEED_ACCOUNT_ORDERS } from "@/lib/account-orders";
import { supabaseServer } from "@/lib/supabase/server";

export interface AdminProduct {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  category: {
    _id?: string;
    name: string;
    slug?: string;
  };
  subcategory?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface AdminOrder {
  _id: string;
  id: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    title: string;
    quantity: number;
    price?: number;
    productId?: string;
    variantId?: string;
  }[];
  total: number;
  status: "pending" | "paid" | "processing" | "completed" | "cancelled";
  mode?: "personal" | "business";
  po?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: string[];
  };
  author: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface AdminSubscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: "low_stock" | "new_order" | "system";
  productId?: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

interface StoreData {
  products: AdminProduct[];
  orders: AdminOrder[];
  users: AdminUser[];
  reviews: AdminReview[];
  subscribers: AdminSubscriber[];
  notifications: AdminNotification[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let memoryStore: StoreData | null = null;

function getInitialData(): StoreData {
  const products: AdminProduct[] = catalogProducts.map((p, idx) => {
    const catName = p.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const imgs = p.variants
      .map((v) => v.accent)
      .filter((accent): accent is string => Boolean(accent));

    return {
      _id: p.id,
      id: p.id,
      title: p.name,
      slug: p.slug,
      description: p.summary,
      price: p.price,
      discountPrice: p.compareAt || null,
      stock: p.stock ?? 25,
      images: imgs.length > 0 ? imgs : [`/products/${p.slug}.jpg`],
      category: {
        _id: `cat-${p.category}`,
        name: catName,
        slug: p.category,
      },
      subcategory: p.subcategory || p.kind,
      brand: p.brand,
      rating: p.rating,
      reviewCount: p.reviewCount,
      createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
    };
  });

  const orders: AdminOrder[] = SEED_ACCOUNT_ORDERS.map((o) => {
    const items = o.parcels.flatMap((p) =>
      p.items.map((i) => ({
        title: i.product.name,
        quantity: i.qty,
        price: i.price,
      }))
    );

    return {
      _id: o.id,
      id: o.id,
      user: {
        name: o.shippingAddress?.name || "Haider Urwa",
        email: "haider@ayiin.com",
      },
      items,
      total: o.total,
      status:
        o.overallStatus === "delivered"
          ? ("completed" as const)
          : o.overallStatus === "in_transit"
          ? ("processing" as const)
          : ("paid" as const),
      mode: o.mode || "personal",
      createdAt: o.createdAt,
    };
  });

  const users: AdminUser[] = [
    {
      _id: "u-admin",
      name: "Admin Haider",
      email: "admin@ayiin.com",
      role: "admin",
      isVerified: true,
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    {
      _id: "u-2",
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      role: "user",
      isVerified: true,
      createdAt: "2026-08-15T14:20:00.000Z",
    },
    {
      _id: "u-3",
      name: "Marcus Chen",
      email: "m.chen@studioline.design",
      role: "user",
      isVerified: true,
      createdAt: "2026-09-02T09:12:00.000Z",
    },
    {
      _id: "u-4",
      name: "Amina Al-Mansoor",
      email: "amina@harbor.ae",
      role: "user",
      isVerified: true,
      createdAt: "2026-09-18T16:45:00.000Z",
    },
    {
      _id: "u-5",
      name: "Elena Rostova",
      email: "elena@nordicform.com",
      role: "user",
      isVerified: false,
      createdAt: "2026-10-01T11:30:00.000Z",
    },
  ];

  const reviews: AdminReview[] = [];
  catalogProducts.forEach((p) => {
    if (p.reviews && p.reviews.length > 0) {
      p.reviews.forEach((r, rIdx) => {
        reviews.push({
          _id: `rev-${p.id}-${rIdx}`,
          product: {
            _id: p.id,
            title: p.name,
            images: [`/products/${p.slug}.jpg`],
          },
          author: r.author,
          rating: r.rating,
          title: r.title,
          comment: r.body,
          createdAt: r.date
            ? new Date(r.date).toISOString()
            : new Date().toISOString(),
        });
      });
    }
  });

  const subscribers: AdminSubscriber[] = [
    {
      _id: "sub-1",
      email: "design@studiomay.com",
      createdAt: "2026-09-10T11:00:00.000Z",
    },
    {
      _id: "sub-2",
      email: "procurement@atelier-mesa.de",
      createdAt: "2026-09-15T14:30:00.000Z",
    },
    {
      _id: "sub-3",
      email: "buyer@northform.co",
      createdAt: "2026-09-22T08:15:00.000Z",
    },
    {
      _id: "sub-4",
      email: "alexa@harboroffice.org",
      createdAt: "2026-10-01T17:45:00.000Z",
    },
  ];

  const notifications: AdminNotification[] = [
    {
      _id: "notif-1",
      title: "Low Stock Alert",
      message: "Atelier Mesa Pour-Over Carafe has only 4 units remaining!",
      type: "low_stock",
      productId: "ay-1056",
      isRead: false,
      createdAt: "2026-10-08T12:00:00.000Z",
    },
    {
      _id: "notif-2",
      title: "Low Stock Alert",
      message: "Lumina Matte Task Lamp has only 3 units remaining!",
      type: "low_stock",
      productId: "ay-1021",
      isRead: false,
      createdAt: "2026-10-08T15:30:00.000Z",
    },
  ];

  return {
    products,
    orders,
    users,
    reviews,
    subscribers,
    notifications,
  };
}

function loadStore(): StoreData {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      memoryStore = JSON.parse(content);
      return memoryStore!;
    }
  } catch (err) {
    console.error("Error reading store.json, re-initializing:", err);
  }

  const initial = getInitialData();
  saveStore(initial);
  memoryStore = initial;
  return memoryStore;
}

function saveStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    memoryStore = data;
  } catch (err) {
    console.error("Error writing store.json:", err);
  }
}

// ──────────────────────────────────────────────
// API METHODS (SUPABASE-BACKED WITH FALLBACK)
// ──────────────────────────────────────────────

export async function getStats() {
  try {
    const { data: dbOrders, error: ordErr } = await supabaseServer.from("orders").select("total, status");
    const { data: dbProducts, error: prodErr } = await supabaseServer.from("products").select("category_name");
    const { count: usersCount, error: userErr } = await supabaseServer.from("users").select("*", { count: "exact", head: true });

    if (!ordErr && !prodErr && dbOrders && dbProducts) {
      const totalOrders = dbOrders.length;
      const totalProducts = dbProducts.length;
      const totalUsers = userErr ? loadStore().users.length : (usersCount ?? loadStore().users.length);

      const totalRevenue = dbOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const statusCounts: Record<string, number> = {
        pending: 0,
        paid: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
      };

      dbOrders.forEach((o) => {
        const s = o.status || "paid";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts)
        .filter(([, val]) => val > 0)
        .map(([status, value]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value,
        }));

      const catCounts: Record<string, number> = {};
      dbProducts.forEach((p) => {
        const cat = p.category_name || "General";
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      const productsByCategory = Object.entries(catCounts).map(([name, count]) => ({
        name,
        count,
      }));

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersByStatus,
        productsByCategory,
      };
    }
  } catch (e) {
    // Supabase query error, fallback to local store
  }

  // Fallback to local store
  const store = loadStore();
  const totalUsers = store.users.length;
  const totalProducts = store.products.length;
  const totalOrders = store.orders.length;

  const totalRevenue = store.orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const statusCounts: Record<string, number> = {
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };

  store.orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const ordersByStatus = Object.entries(statusCounts)
    .filter(([, val]) => val > 0)
    .map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
    }));

  const catCounts: Record<string, number> = {};
  store.products.forEach((p) => {
    const cat = p.category?.name || "General";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  const productsByCategory = Object.entries(catCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    ordersByStatus,
    productsByCategory,
  };
}

export async function getProducts(options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 12;
  const search = options?.search?.toLowerCase().trim();
  const category = options?.category?.toLowerCase().trim();

  try {
    let query = supabaseServer.from("products").select("*", { count: "exact" });

    if (category && category !== "all") {
      query = query.or(`category_slug.eq.${category},category_name.ilike.%${category}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category_name.ilike.%${search}%`);
    }

    const skip = (page - 1) * limit;
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1);

    if (!error && data) {
      const formatted: AdminProduct[] = data.map((d: any) => ({
        _id: d.id,
        id: d.id,
        title: d.title,
        slug: d.slug,
        description: d.description || "",
        price: Number(d.price),
        discountPrice: d.discount_price ? Number(d.discount_price) : null,
        stock: d.stock || 0,
        images: d.images || [],
        category: {
          name: d.category_name,
          slug: d.category_slug,
        },
        subcategory: d.subcategory || "",
        brand: d.brand,
        rating: Number(d.rating),
        reviewCount: d.review_count,
        createdAt: d.created_at,
      }));

      const totalProducts = count ?? formatted.length;
      return {
        products: formatted,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        totalProducts,
      };
    }
  } catch (e) {
    // Fallback below
  }

  // Local fallback
  const store = loadStore();
  let filtered = [...store.products];

  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.category?.slug?.toLowerCase() === category ||
        p.category?.name?.toLowerCase() === category
    );
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.category?.name?.toLowerCase().includes(search)
    );
  }

  const totalProducts = filtered.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const skip = (page - 1) * limit;

  return {
    products: filtered.slice(skip, skip + limit),
    totalPages,
    currentPage: page,
    totalProducts,
  };
}

export async function createProduct(data: {
  title: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  stock?: number;
  images?: string[];
  image?: string;
  categoryName?: string;
  category?: string;
  subcategory?: string;
}) {
  const store = loadStore();
  const id = `ay-${Date.now()}`;
  const catName = data.categoryName || data.category || "General";
  const catSlug = catName.toLowerCase().replace(/\s+/g, "-");

  let imgs: string[] = [];
  if (Array.isArray(data.images) && data.images.length > 0) {
    imgs = data.images;
  } else if (data.image) {
    imgs = [data.image];
  } else {
    imgs = ["/products/placeholder.jpg"];
  }

  const newProduct: AdminProduct = {
    _id: id,
    id,
    title: data.title,
    slug: `${(data.title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item"}-${Date.now().toString().slice(-6)}`,
    description: data.description || "",
    price: Number(data.price),
    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    stock: Number(data.stock) || 0,
    images: imgs,
    category: {
      _id: `cat-${catSlug}`,
      name: catName,
      slug: catSlug,
    },
    subcategory: data.subcategory || "",
    createdAt: new Date().toISOString(),
  };

  store.products.unshift(newProduct);
  saveStore(store);

  // Sync to Supabase
  try {
    const { error: insertErr } = await supabaseServer.from("products").insert({
      id: newProduct.id,
      slug: newProduct.slug,
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      discount_price: newProduct.discountPrice,
      stock: newProduct.stock,
      images: newProduct.images,
      category_name: newProduct.category.name,
      category_slug: newProduct.category.slug,
      subcategory: newProduct.subcategory,
      created_at: newProduct.createdAt,
    });
    if (insertErr) {
      console.error("Supabase createProduct insert error:", insertErr.message);
    }
  } catch (e: any) {
    console.error("Supabase insert exception:", e?.message);
  }

  return newProduct;
}

export async function updateProduct(
  id: string,
  data: Partial<AdminProduct> & {
    productId?: string;
    categoryName?: string;
    image?: string;
  }
) {
  const store = loadStore();
  const index = store.products.findIndex((p) => p._id === id || p.id === id);
  if (index === -1) return null;

  const current = store.products[index];
  const catName = data.categoryName || data.category?.name || current.category?.name;
  const catSlug = catName.toLowerCase().replace(/\s+/g, "-");

  let imgs = current.images;
  if (Array.isArray(data.images) && data.images.length > 0) {
    imgs = data.images;
  } else if (data.image) {
    imgs = [data.image];
  }

  const updated: AdminProduct = {
    ...current,
    title: data.title !== undefined ? data.title : current.title,
    description: data.description !== undefined ? data.description : current.description,
    price: data.price !== undefined ? Number(data.price) : current.price,
    discountPrice:
      data.discountPrice !== undefined
        ? data.discountPrice
          ? Number(data.discountPrice)
          : null
        : current.discountPrice,
    stock: data.stock !== undefined ? Number(data.stock) : current.stock,
    images: imgs,
    category: {
      _id: `cat-${catSlug}`,
      name: catName,
      slug: catSlug,
    },
    subcategory: data.subcategory !== undefined ? data.subcategory : current.subcategory,
  };

  store.products[index] = updated;
  saveStore(store);

  // Sync to Supabase
  try {
    const { error: updateErr } = await supabaseServer
      .from("products")
      .update({
        title: updated.title,
        description: updated.description,
        price: updated.price,
        discount_price: updated.discountPrice,
        stock: updated.stock,
        images: updated.images,
        category_name: updated.category.name,
        category_slug: updated.category.slug,
        subcategory: updated.subcategory,
      })
      .eq("id", id);
    if (updateErr) {
      console.error("Supabase updateProduct error:", updateErr.message);
    }
  } catch (e: any) {
    console.error("Supabase update exception:", e?.message);
  }

  return updated;
}

export async function deleteProduct(id: string) {
  const store = loadStore();
  const before = store.products.length;
  store.products = store.products.filter((p) => p._id !== id && p.id !== id);
  saveStore(store);

  try {
    const { error: delErr } = await supabaseServer.from("products").delete().eq("id", id);
    if (delErr) {
      console.error("Supabase deleteProduct error:", delErr.message);
    }
  } catch (e: any) {
    console.error("Supabase delete exception:", e?.message);
  }

  return store.products.length < before;
}

export async function getOrders() {
  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((d: any) => ({
        _id: d.id,
        id: d.id,
        user: {
          name: d.user_name,
          email: d.user_email,
        },
        items: d.items || [],
        total: Number(d.total),
        status: d.status,
        mode: d.mode,
        po: d.po,
        createdAt: d.created_at,
      }));
    }
  } catch (e) {
    // Fallback
  }

  const store = loadStore();
  return [...store.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createOrder(data: {
  id?: string;
  user: { name: string; email: string };
  items: {
    title: string;
    quantity: number;
    price?: number;
    productId?: string;
    variantId?: string;
  }[];
  total: number;
  status?: "pending" | "paid" | "processing" | "completed" | "cancelled";
  mode?: "personal" | "business";
  po?: string;
}) {
  const store = loadStore();
  const id = data.id || `ord-${Date.now().toString(36).toUpperCase()}`;

  const order: AdminOrder = {
    _id: id,
    id,
    user: {
      name: data.user.name || "Customer",
      email: data.user.email || "customer@example.com",
    },
    items: data.items,
    total: Math.round(data.total * 100) / 100,
    status: data.status || "paid",
    mode: data.mode || "personal",
    po: data.po,
    createdAt: new Date().toISOString(),
  };

  store.orders.unshift(order);

  const notification: AdminNotification = {
    _id: `notif-${Date.now()}`,
    title: "New Order Placed",
    message: `Order #${id} for $${order.total.toFixed(2)} placed by ${order.user.name}`,
    type: "new_order",
    orderId: id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  store.notifications.unshift(notification);
  saveStore(store);

  // Sync to Supabase
  try {
    await supabaseServer.from("orders").insert({
      id: order.id,
      user_name: order.user.name,
      user_email: order.user.email,
      items: order.items,
      total: order.total,
      status: order.status,
      mode: order.mode,
      po: order.po,
      created_at: order.createdAt,
    });

    await supabaseServer.from("notifications").insert({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      order_id: id,
      is_read: false,
      created_at: notification.createdAt,
    });
  } catch (e) {
    // Non-blocking
  }

  return order;
}

export async function updateOrderStatus(orderId: string, status: AdminOrder["status"]) {
  const store = loadStore();
  const order = store.orders.find((o) => o._id === orderId || o.id === orderId);
  if (!order) return null;

  order.status = status;
  saveStore(store);

  try {
    await supabaseServer.from("orders").update({ status }).eq("id", orderId);
  } catch (e) {
    // Non-blocking
  }

  return order;
}

export async function getUsers(options?: { page?: number; limit?: number }) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  try {
    const skip = (page - 1) * limit;
    const { data, count, error } = await supabaseServer
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1);

    if (!error && data) {
      const users: AdminUser[] = data.map((d: any) => ({
        _id: d.id,
        name: d.name,
        email: d.email,
        role: d.role,
        isVerified: d.is_verified,
        createdAt: d.created_at,
      }));

      const totalUsers = count ?? users.length;
      return {
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        totalUsers,
      };
    }
  } catch (e) {
    // Fallback
  }

  const store = loadStore();
  const skip = (page - 1) * limit;
  return {
    users: store.users.slice(skip, skip + limit),
    totalPages: Math.ceil(store.users.length / limit),
    currentPage: page,
    totalUsers: store.users.length,
  };
}

export async function updateUser(
  userId: string,
  data: Partial<AdminUser> & { isVerified?: boolean; role?: "admin" | "user" }
) {
  const store = loadStore();
  const user = store.users.find((u) => u._id === userId);
  if (!user) return null;

  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.role !== undefined) user.role = data.role;
  if (data.isVerified !== undefined) user.isVerified = data.isVerified;

  saveStore(store);

  try {
    await supabaseServer
      .from("users")
      .update({
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.isVerified,
      })
      .eq("id", userId);
  } catch (e) {
    // Non-blocking
  }

  return user;
}

export async function deleteUser(userId: string) {
  const store = loadStore();
  const before = store.users.length;
  store.users = store.users.filter((u) => u._id !== userId);
  saveStore(store);

  try {
    await supabaseServer.from("users").delete().eq("id", userId);
  } catch (e) {
    // Non-blocking
  }

  return store.users.length < before;
}

export async function getReviews() {
  try {
    const { data, error } = await supabaseServer
      .from("reviews")
      .select("*, products(title, images)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((d: any) => ({
        _id: d.id,
        product: {
          _id: d.product_id,
          title: d.products?.title || "Product",
          images: d.products?.images || [],
        },
        author: d.author,
        rating: d.rating,
        title: d.title || "",
        comment: d.comment,
        createdAt: d.created_at,
      }));
    }
  } catch (e) {
    // Fallback
  }

  const store = loadStore();
  return [...store.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteReview(reviewId: string) {
  const store = loadStore();
  const before = store.reviews.length;
  store.reviews = store.reviews.filter((r) => r._id !== reviewId);
  saveStore(store);

  try {
    await supabaseServer.from("reviews").delete().eq("id", reviewId);
  } catch (e) {
    // Non-blocking
  }

  return store.reviews.length < before;
}

export async function getSubscribers() {
  try {
    const { data, error } = await supabaseServer
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((d: any) => ({
        _id: d.id,
        email: d.email,
        createdAt: d.created_at,
      }));
    }
  } catch (e) {
    // Fallback
  }

  const store = loadStore();
  return [...store.subscribers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addSubscriber(email: string) {
  const store = loadStore();
  const cleanEmail = email.toLowerCase().trim();
  const exists = store.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
  if (exists) return exists;

  const newSub: AdminSubscriber = {
    _id: `sub-${Date.now()}`,
    email: cleanEmail,
    createdAt: new Date().toISOString(),
  };

  store.subscribers.unshift(newSub);
  saveStore(store);

  try {
    await supabaseServer.from("subscribers").insert({
      id: newSub._id,
      email: cleanEmail,
      created_at: newSub.createdAt,
    });
  } catch (e) {
    // Non-blocking
  }

  return newSub;
}

export async function getNotifications() {
  try {
    const { data, error } = await supabaseServer
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const unreadCount = data.filter((n: any) => !n.is_read).length;
      return {
        notifications: data.map((d: any) => ({
          _id: d.id,
          title: d.title,
          message: d.message,
          type: d.type,
          productId: d.product_id,
          orderId: d.order_id,
          isRead: d.is_read,
          createdAt: d.created_at,
        })),
        unreadCount,
      };
    }
  } catch (e) {
    // Fallback
  }

  const store = loadStore();
  const unreadCount = store.notifications.filter((n) => !n.isRead).length;
  return {
    notifications: store.notifications.slice(0, 20),
    unreadCount,
  };
}

export async function markNotificationsRead() {
  const store = loadStore();
  let updatedCount = 0;
  store.notifications.forEach((n) => {
    if (!n.isRead) {
      n.isRead = true;
      updatedCount++;
    }
  });
  saveStore(store);

  try {
    await supabaseServer.from("notifications").update({ is_read: true }).eq("is_read", false);
  } catch (e) {
    // Non-blocking
  }

  return updatedCount;
}

export async function searchAll(query: string) {
  const store = loadStore();
  const q = query.toLowerCase().trim();
  if (q.length < 2) {
    return { orders: [], users: [], products: [] };
  }

  const orders = store.orders
    .filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.user.name.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const users = store.users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const products = store.products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    )
    .slice(0, 5);

  return { orders, users, products };
}
