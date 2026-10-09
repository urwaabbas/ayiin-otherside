import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/server/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const results = searchAll(query);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
