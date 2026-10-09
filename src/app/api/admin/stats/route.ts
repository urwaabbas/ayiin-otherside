import { NextResponse } from "next/server";
import { getStats } from "@/lib/server/admin-store";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
