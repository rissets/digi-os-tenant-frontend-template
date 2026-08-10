import { NextRequest, NextResponse } from "next/server";
import { submitPublicForm } from "@/src/lib/api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const payload = await request.json();
    const result = await submitPublicForm(key, payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Form submission failed" }, { status: 400 });
  }
}
