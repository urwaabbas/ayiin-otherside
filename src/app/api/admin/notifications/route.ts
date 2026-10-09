import { NextResponse } from "next/server";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/server/admin-store";

export async function GET() {
  try {
    const data = await getNotifications();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const updatedCount = await markNotificationsRead();
    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
