import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL || "https://myrjytywjrlitkepfdni.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to seed Supabase.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Connecting to Supabase PostgreSQL at:", supabaseUrl);

  const storePath = path.join(process.cwd(), "src", "data", "store.json");
  if (!fs.existsSync(storePath)) {
    console.error("store.json not found at:", storePath);
    return;
  }

  const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));

  // 1. Seed Users
  console.log(`Seeding ${store.users.length} users...`);
  const userRows = store.users.map((u) => ({
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role || "user",
    is_verified: !!u.isVerified,
    created_at: u.createdAt || new Date().toISOString(),
  }));
  const { error: userErr } = await supabase.from("users").upsert(userRows, { onConflict: "id" });
  if (userErr) console.warn("Users seed note:", userErr.message);
  else console.log("✓ Users seeded successfully!");

  // 2. Seed Products
  console.log(`Seeding ${store.products.length} products...`);
  const productsRows = store.products.map((p) => ({
    id: p.id || p._id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    discount_price: p.discountPrice ? Number(p.discountPrice) : null,
    stock: Number(p.stock) || 0,
    images: Array.isArray(p.images) ? p.images : [],
    category_name: p.category?.name || "General",
    category_slug: p.category?.slug || "general",
    subcategory: p.subcategory || null,
    brand: p.brand || null,
    rating: Number(p.rating) || 5.0,
    review_count: Number(p.reviewCount) || 0,
    created_at: p.createdAt || new Date().toISOString(),
  }));
  const { error: prodErr } = await supabase.from("products").upsert(productsRows, { onConflict: "id" });
  if (prodErr) console.warn("Products seed note:", prodErr.message);
  else console.log("✓ Products seeded successfully!");

  // 3. Seed Orders
  console.log(`Seeding ${store.orders.length} orders...`);
  const ordersRows = store.orders.map((o) => ({
    id: o.id || o._id,
    user_name: o.user?.name || "Customer",
    user_email: o.user?.email || "customer@ayiin.com",
    items: o.items || [],
    total: Number(o.total) || 0,
    status: o.status || "paid",
    mode: o.mode || "personal",
    po: o.po || null,
    created_at: o.createdAt || new Date().toISOString(),
  }));
  const { error: ordErr } = await supabase.from("orders").upsert(ordersRows, { onConflict: "id" });
  if (ordErr) console.warn("Orders seed note:", ordErr.message);
  else console.log("✓ Orders seeded successfully!");

  // 4. Seed Reviews
  console.log(`Seeding ${store.reviews.length} reviews...`);
  const reviewRows = store.reviews.map((r) => ({
    id: r._id || r.id,
    product_id: r.product?._id || r.product?.id || null,
    author: r.author || "Verified Buyer",
    rating: Number(r.rating) || 5,
    title: r.title || "",
    comment: r.comment || "",
    created_at: r.createdAt || new Date().toISOString(),
  }));
  const { error: revErr } = await supabase.from("reviews").upsert(reviewRows, { onConflict: "id" });
  if (revErr) console.warn("Reviews seed note:", revErr.message);
  else console.log("✓ Reviews seeded successfully!");

  // 5. Seed Subscribers
  console.log(`Seeding ${store.subscribers.length} subscribers...`);
  const subRows = store.subscribers.map((s) => ({
    id: s._id || s.id,
    email: s.email,
    created_at: s.createdAt || new Date().toISOString(),
  }));
  const { error: subErr } = await supabase.from("subscribers").upsert(subRows, { onConflict: "id" });
  if (subErr) console.warn("Subscribers seed note:", subErr.message);
  else console.log("✓ Subscribers seeded successfully!");

  // 6. Seed Notifications
  console.log(`Seeding ${store.notifications.length} notifications...`);
  const notifRows = store.notifications.map((n) => ({
    id: n._id || n.id,
    title: n.title,
    message: n.message,
    type: n.type || "system",
    product_id: n.productId || null,
    order_id: n.orderId || null,
    is_read: !!n.isRead,
    created_at: n.createdAt || new Date().toISOString(),
  }));
  const { error: notifErr } = await supabase.from("notifications").upsert(notifRows, { onConflict: "id" });
  if (notifErr) console.warn("Notifications seed note:", notifErr.message);
  else console.log("✓ Notifications seeded successfully!");

  console.log("Database synchronization completed!");
}

seed();
