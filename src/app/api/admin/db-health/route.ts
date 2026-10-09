import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const startTime = Date.now();
  const tables = ["users", "products", "orders", "reviews", "subscribers", "notifications"];
  const tableStatus: Record<string, { exists: boolean; rows: number; error?: string }> = {};

  let allHealthy = true;

  for (const table of tables) {
    try {
      const { data, count, error } = await supabaseServer
        .from(table)
        .select("*", { count: "exact" })
        .limit(1);

      if (error) {
        allHealthy = false;
        tableStatus[table] = {
          exists: false,
          rows: 0,
          error: error.message,
        };
      } else {
        tableStatus[table] = {
          exists: true,
          rows: count ?? (data ? data.length : 0),
        };
      }
    } catch (err: any) {
      allHealthy = false;
      tableStatus[table] = {
        exists: false,
        rows: 0,
        error: err.message,
      };
    }
  }

  const latency = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    supabaseConnected: true,
    databaseHealthy: allHealthy,
    schemaReady: allHealthy,
    latencyMs: latency,
    tables: tableStatus,
    timestamp: new Date().toISOString(),
  });
}
