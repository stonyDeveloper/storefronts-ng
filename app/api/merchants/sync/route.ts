import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: "No email on account" }, { status: 400 });

    const merchant = await prisma.merchant.upsert({
      where: { clerkUserId: userId },
      update: { email },
      create: {
        clerkUserId: userId,
        email,
        phone: user.phoneNumbers[0]?.phoneNumber ?? null,
      },
      include: { store: true },
    });

    return NextResponse.json({ data: merchant });
  } catch (e) {
    console.error("[merchants/sync]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
