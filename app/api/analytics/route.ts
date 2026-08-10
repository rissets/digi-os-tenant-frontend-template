import { NextRequest, NextResponse } from "next/server";
import { sendAnalyticsEvent } from "@/src/lib/api";

export async function POST(request: NextRequest) {
  try {
    const result = await sendAnalyticsEvent(await request.json());
    return NextResponse.json(result, { status: 202 });
  } catch {
    return NextResponse.json({ accepted: false }, { status: 202 });
  }
}
