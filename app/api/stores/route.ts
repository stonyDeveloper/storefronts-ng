import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { StoreSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const merchant = await requireMerchant();

    if (merchant.store) {
      return NextResponse.json({ error: "Store already exists" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = StoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      logoUrl,
      primaryColor,
      accentColor,
      category,
      heroStyle,
      codEnabled,
      deliveryFee,
    } = parsed.data;

    const existing = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "That URL is already taken" }, { status: 409 });
    }

    const store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
        name,
        slug,
        description: description ?? null,
        logoUrl: logoUrl || null,
        primaryColor,
        accentColor,
        category,
        heroStyle,
        codEnabled,
        deliveryFee,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ data: store }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[POST /api/stores]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
