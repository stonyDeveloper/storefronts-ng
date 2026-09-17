import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Account resolution mode
  if (searchParams.get("resolve") === "1") {
    const bankCode = searchParams.get("bankCode") ?? "";
    const accountNumber = searchParams.get("accountNumber") ?? "";

    if (!bankCode || !accountNumber) {
      return NextResponse.json({ error: "bankCode and accountNumber are required" }, { status: 400 });
    }

    try {
      const provider = getPaymentProvider();
      const result = await provider.resolveAccount(bankCode, accountNumber);
      return NextResponse.json({ data: result });
    } catch (e) {
      console.error("[banks resolve]", e);
      return NextResponse.json({ error: "Could not verify account" }, { status: 400 });
    }
  }

  // Bank list mode
  try {
    const provider = getPaymentProvider();
    const banks = await provider.getBanks();
    return NextResponse.json({ data: banks });
  } catch (e) {
    console.error("[banks list]", e);
    return NextResponse.json({ error: "Could not fetch banks" }, { status: 500 });
  }
}
