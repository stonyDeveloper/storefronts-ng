import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError, AuthorizationError } from "@/lib/auth";
import { ProductSchema } from "@/lib/validations";

async function getOwnedProduct(storeId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variantAttributes: true, variantCombos: true },
  });
  if (!product) return null;
  if (product.storeId !== storeId) throw new AuthorizationError();
  return product;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const product = await getOwnedProduct(merchant.store.id, id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ data: product });
  } catch (e) {
    if (e instanceof AuthenticationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[GET /api/products/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await getOwnedProduct(merchant.store.id, id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const body = await req.json();
    const parsed = ProductSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { variantAttributes, variantCombos, ...productData } = parsed.data;

    // Once a product has variants, stock lives entirely on the combos —
    // never persist a base number that checkout/storefront logic ignores.
    if (variantCombos !== undefined && variantCombos.length > 0) {
      productData.stock = 0;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(variantAttributes !== undefined && {
          variantAttributes: {
            deleteMany: {},
            create: variantAttributes.map((a, i) => ({ name: a.name, values: a.values, position: i })),
          },
        }),
        ...(variantCombos !== undefined && {
          variantCombos: {
            deleteMany: {},
            create: variantCombos.map((c) => ({
              options: c.options,
              price: c.price ?? null,
              stock: c.stock,
              image: c.image ?? null,
            })),
          },
        }),
      },
      include: { variantAttributes: true, variantCombos: true },
    });

    return NextResponse.json({ data: product });
  } catch (e) {
    if (e instanceof AuthenticationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[PATCH /api/products/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await getOwnedProduct(merchant.store.id, id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthenticationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[DELETE /api/products/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
