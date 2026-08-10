import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "tenant-frontend", tenant: process.env.TENANT_API_URL || "unconfigured" });
}
