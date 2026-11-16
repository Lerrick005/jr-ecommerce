import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus: "ok" | "error" = "ok";
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = "error";
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    data: {
      status: dbStatus === "ok" ? "ok" : "degraded",
      db: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    error: dbError ? { code: "DB_UNREACHABLE", message: dbError } : null,
    meta: { version: "1" }
  });
}