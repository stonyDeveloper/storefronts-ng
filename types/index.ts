import type { Prisma } from "@prisma/client";

export type MerchantWithStore = Prisma.MerchantGetPayload<{
  include: { store: true };
}>;

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variantAttributes: true; variantCombos: true };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    store: true;
  };
}>;

export type StoreWithProducts = Prisma.StoreGetPayload<{
  include: { products: { include: { variantAttributes: true; variantCombos: true } } };
}>;

export type ApiSuccess<T> = { data: T };
export type ApiError = { error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
