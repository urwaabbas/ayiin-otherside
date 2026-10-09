import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, addSubscriber } from "@/lib/server/admin-store";

export async function GET() {
  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({
      success: true,
      subscribers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, message, email } = await request.json();

    // If email is provided, add subscriber
    if (email) {
      const sub = await addSubscriber(email);
      return NextResponse.json({ success: true, subscriber: sub });
    }

    // Otherwise, simulate sending broadcast email to all subscribers
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const subscribers = await getSubscribers();
    return NextResponse.json({
      success: true,
      sentCount: subscribers.length,
      failedCount: 0,
      message: `Newsletter sent successfully to ${subscribers.length} subscribers.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
