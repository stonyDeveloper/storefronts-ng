import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { ProductSchema } from "@/lib/validations";

export async function GET() {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ data: [] });

    const products = await prisma.product.findMany({
      where: { storeId: merchant.store.id },
      include: { variantAttributes: true, variantCombos: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: products });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/products]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) {
      return NextResponse.json({ error: "Complete store setup first" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { variantAttributes, variantCombos, ...productData } = parsed.data;

    // Once a product has variants, stock lives entirely on the combos —
    // never persist a base number that checkout/storefront logic ignores.
    if (variantCombos.length > 0) productData.stock = 0;

    const product = await prisma.product.create({
      data: {
        ...productData,
        storeId: merchant.store.id,
        variantAttributes: {
          create: variantAttributes.map((a, i) => ({ name: a.name, values: a.values, position: i })),
        },
        variantCombos: {
          create: variantCombos.map((c) => ({
            options: c.options,
            price: c.price ?? null,
            stock: c.stock,
            image: c.image ?? null,
          })),
        },
      },
      include: { variantAttributes: true, variantCombos: true },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[POST /api/products]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
