import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug, isSuspended: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
        currency: true,
        codEnabled: true,
        paystackEnabled: true,
        deliveryFee: true,
        category: true,
      },
    });

    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    return NextResponse.json({ data: store });
  } catch (e) {
    console.error("[GET /api/storefront/[slug]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
