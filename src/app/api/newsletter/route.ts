import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/server/admin-store";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const subscriber = await addSubscriber(email);
    return NextResponse.json({ success: true, subscriber });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
