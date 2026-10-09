import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/server/admin-store";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, user, items, total, status, mode, po } = body;

    if (!items || !items.length || total === undefined) {
      return NextResponse.json(
        { success: false, error: "Order items and total are required" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      id,
      user: user || { name: "Customer", email: "customer@example.com" },
      items,
      total: Number(total),
      status: status || "paid",
      mode: mode || "personal",
      po,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
