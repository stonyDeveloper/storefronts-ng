import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { StoreSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();

    if (!merchant.store || merchant.store.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = StoreSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Slug uniqueness guard — only check when slug is actually changing
    if (data.slug && data.slug !== merchant.store.slug) {
      const existing = await prisma.store.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: "That URL is already taken" }, { status: 409 });
      }
    }

    const store = await prisma.store.update({ where: { id }, data });

    return NextResponse.json({ data: store });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[PATCH /api/stores/[id]]", e);
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

    if (!merchant.store || merchant.store.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.store.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[DELETE /api/stores/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
