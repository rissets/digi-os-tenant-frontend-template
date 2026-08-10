import { NextRequest, NextResponse } from "next/server";
import { submitContactForm } from "@/src/lib/api";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await submitContactForm(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Contact submission failed" }, { status: 400 });
  }
}
