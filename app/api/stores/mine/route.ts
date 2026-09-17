import { NextResponse } from "next/server";
import { requireMerchant, AuthenticationError } from "@/lib/auth";

export async function GET() {
  try {
    const merchant = await requireMerchant();

    if (!merchant.store) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: merchant.store });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/stores/mine]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
