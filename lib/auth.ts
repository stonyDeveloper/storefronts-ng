import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { MerchantWithStore } from "@/types";

export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getMerchant(): Promise<MerchantWithStore | null> {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.merchant.findUnique({
    where: { clerkUserId: userId },
    include: { store: true },
  });
}

export async function requireMerchant(): Promise<MerchantWithStore> {
  const { userId } = await auth();
  if (!userId) throw new AuthenticationError();

  const merchant = await prisma.merchant.findUnique({
    where: { clerkUserId: userId },
    include: { store: true },
  });

  if (!merchant) throw new AuthenticationError("Merchant record not found");
  return merchant;
}

export async function requireAdmin(): Promise<MerchantWithStore> {
  const merchant = await requireMerchant();
  if (merchant.role !== "ADMIN") throw new AuthorizationError();
  return merchant;
}
