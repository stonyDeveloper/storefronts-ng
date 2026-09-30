import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const store = await prisma.store.findUnique({
      where: { slug, isSuspended: false },
      select: { id: true },
    });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 24;
    const sort = searchParams.get("sort") ?? "newest";
    const search = searchParams.get("search") ?? "";

    const orderBy =
      sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

    const where = {
      storeId: store.id,
      isVisible: true,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variantAttributes: true, variantCombos: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error("[GET /api/storefront/[slug]/products]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
