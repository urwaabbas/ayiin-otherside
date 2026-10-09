import { NextRequest, NextResponse } from "next/server";
import { getReviews, deleteReview } from "@/lib/server/admin-store";

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteReview(reviewId);
    return NextResponse.json({
      success: true,
      message: "Review deleted",
      deleted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
