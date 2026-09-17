import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();

    if (!merchant.store || merchant.store.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { bankCode, bankAccountNumber } = await req.json();

    if (!bankCode || !bankAccountNumber) {
      return NextResponse.json({ error: "bankCode and bankAccountNumber required" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const result = await provider.createSubaccount({
      businessName: merchant.store.name,
      bankCode,
      accountNumber: bankAccountNumber,
      percentageCharge: merchant.store.platformFeePercent,
    });

    const store = await prisma.store.update({
      where: { id },
      data: {
        paystackSubaccountCode: result.subaccountCode,
        bankCode,
        bankAccountNumber: result.accountNumber,
        bankAccountName: result.accountName,
        paystackEnabled: true,
      },
    });

    return NextResponse.json({ data: store });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[POST /api/stores/[id]/subaccount]", e);
    return NextResponse.json({ error: "Could not create subaccount" }, { status: 500 });
  }
}
