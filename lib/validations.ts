import { z } from "zod";
import { StoreCategory, PaymentMethod, FulfillmentStatus } from "@prisma/client";

// "auto" = seeded generative pick; the rest pin a specific hero family
export const HERO_STYLES = ["auto", "blobs", "aurora", "geometric"] as const;
export type HeroStyle = (typeof HERO_STYLES)[number];

export const StoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(80),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  logoUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .nullish()
    .transform((v) => v || null),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default("#18181B"),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default("#F4F4F5"),
  category: z.nativeEnum(StoreCategory).default("GENERAL"),
  heroStyle: z.enum(HERO_STYLES).default("auto"),
  codEnabled: z.boolean().default(true),
  deliveryFee: z.coerce.number().int().min(0).default(0),
});

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(120),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().int().min(1, "Price must be greater than 0"),
  comparePrice: z.coerce.number().int().min(0).optional().nullable(),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  sku: z.string().max(100).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  codEnabled: z.boolean().default(true),
  category: z.string().max(60).optional(),
  tags: z.array(z.string()).default([]),
  variantAttributes: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required").max(40),
        values: z.array(z.string().min(1)).min(1, "Add at least one value"),
      })
    )
    .max(3, "Up to 3 option types")
    .default([]),
  variantCombos: z
    .array(
      z.object({
        options: z.record(z.string()),
        price: z.coerce.number().int().min(0).optional().nullable(),
        stock: z.coerce.number().int().min(0).default(0),
        image: z.string().url().optional().nullable(),
      })
    )
    .default([]),
});

export const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email address required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryState: z.string().min(1, "State is required"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Invalid product ID"),
        quantity: z.number().int().min(1),
        selectedVariants: z.record(z.string()).optional(),
      })
    )
    .min(1, "Cart is empty"),
});

export const BankAccountSchema = z.object({
  bankCode: z.string().min(1, "Bank is required"),
  bankAccountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
});

export const SlugCheckSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
});

export const UpdateOrderSchema = z.object({
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus).optional(),
  notes: z.string().max(500).optional(),
});

export type StoreInput = z.infer<typeof StoreSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type BankAccountInput = z.infer<typeof BankAccountSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
