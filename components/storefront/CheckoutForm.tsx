"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type PaystackPop from "@paystack/inline-js";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { CheckoutSchema } from "@/lib/validations";
import { formatMoney, cn } from "@/lib/utils";
import { NG_STATES } from "@/lib/constants";
import { useStoreCartItems, useCartTotal, useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useCartValidation } from "@/hooks/useCartValidation";

// Client form only validates user-entered fields; items are injected from cart on submit
const FormSchema = CheckoutSchema.omit({ items: true });
type FormInput = z.infer<typeof FormSchema>;

interface CheckoutFormProps {
  storeSlug: string;
  storeName: string;
  currency: string;
  primaryColor: string;
  paystackEnabled: boolean;
  codEnabled: boolean;
  deliveryFee: number;
}

export function CheckoutForm({
  storeSlug,
  storeName,
  currency,
  primaryColor,
  paystackEnabled,
  codEnabled,
  deliveryFee,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useStoreCartItems(storeSlug);
  const subtotal = useCartTotal(storeSlug);
  const clearStoreCart = useCartStore((s) => s.clearStoreCart);
  const openCart = useUIStore((s) => s.openCart);
  const { hasIssues: cartHasIssues, revalidate: revalidateCart } = useCartValidation(
    storeSlug,
    items
  );
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "verifying">("form");
  const [error, setError] = useState<string | null>(null);

  // An order + Paystack transaction already created for the current cart, kept
  // around so a cancelled payment can be *resumed* on retry instead of
  // submitting again — which would create a duplicate order.
  const popupRef = useRef<PaystackPop | null>(null);
  const [session, setSession] = useState<{
    reference: string;
    accessCode: string;
    itemsSnapshot: string;
  } | null>(null);

  const total = subtotal + deliveryFee;

  function snapshotItems() {
    return JSON.stringify(
      items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedVariants: i.selectedVariants,
      }))
    );
  }

  // COD is only offered when the store allows it AND every item in the cart allows it.
  const codAvailable = codEnabled && items.every((i) => i.codEnabled !== false);
  const canCheckout = paystackEnabled || codAvailable;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentMethod: paystackEnabled ? "PAYSTACK" : "CASH_ON_DELIVERY",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const canResume =
    !!session &&
    !!popupRef.current &&
    paymentMethod === "PAYSTACK" &&
    session.itemsSnapshot === snapshotItems();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
          <ShoppingCart className="h-9 w-9 text-zinc-300" />
        </div>
        <div>
          <p className="font-semibold text-zinc-800">Your cart is empty</p>
          <p className="mt-1 text-sm text-zinc-400">Add some products before checking out.</p>
        </div>
        <Link
          href={`/store/${storeSlug}`}
          className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
          style={{ color: primaryColor }}
        >
          Browse {storeName}
        </Link>
      </div>
    );
  }

  // Paystack's resumeTransaction() does NOT reuse the handlers passed to the
  // original newTransaction() call — it needs them passed again, or onSuccess
  // never fires and the UI is stuck (that was the frozen-spinner bug). Shared
  // here so both the first attempt and every retry wire up the same handlers.
  function paystackHandlers() {
    return {
      onSuccess: async (transaction: { reference: string }) => {
        setStage("verifying");
        try {
          const verifyRes = await fetch(
            `/api/orders/verify?ref=${encodeURIComponent(transaction.reference)}`
          );
          if (verifyRes.ok) {
            clearStoreCart(storeSlug);
            router.push(`/store/${storeSlug}/checkout/success?ref=${transaction.reference}`);
          } else {
            setError(
              `Payment received but verification failed. Quote this reference to support: ${transaction.reference}`
            );
            setLoading(false);
            setStage("form");
          }
        } catch {
          setError(
            `Verification error. Your payment may have gone through — quote ref ${transaction.reference} to the store.`
          );
          setLoading(false);
          setStage("form");
        }
      },
      onCancel: () => {
        setError(
          'Payment was cancelled — click "Retry payment" below to resume. Your order is saved, nothing is duplicated.'
        );
        setLoading(false);
      },
    };
  }

  async function onSubmit(data: FormInput) {
    setError(null);

    // Resume the SAME Paystack transaction after a cancel instead of
    // resubmitting — resubmitting would call POST /api/orders again and
    // create a second, duplicate order for the same cart.
    if (canResume && popupRef.current) {
      setLoading(true);
      popupRef.current.resumeTransaction(session!.accessCode, paystackHandlers());
      return;
    }

    setLoading(true);
    const itemsSnapshot = snapshotItems();

    const payload = {
      ...data,
      storeSlug,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedVariants: i.selectedVariants,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to place order. Please try again.");
        setLoading(false);
        revalidateCart();
        return;
      }

      const { reference, accessCode } = json.data as {
        reference: string;
        accessCode?: string;
      };

      // Cash on delivery — done
      if (data.paymentMethod === "CASH_ON_DELIVERY") {
        clearStoreCart(storeSlug);
        router.push(`/store/${storeSlug}/checkout/success?ref=${reference}`);
        return;
      }

      // Paystack inline popup
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popupRef.current = popup;
      setSession({ reference, accessCode: accessCode!, itemsSnapshot });

      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        accessCode: accessCode!,
        ...paystackHandlers(),
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isVerifying = stage === "verifying";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Back link */}
          <Link
            href={`/store/${storeSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {storeName}
          </Link>

          <h1 className="font-heading text-3xl font-bold text-zinc-900">Checkout</h1>

          {/* Contact section */}
          <FormSection title="Contact information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.customerName?.message}>
                <input
                  {...register("customerName")}
                  placeholder="Ada Okafor"
                  className={inputCls(!!errors.customerName)}
                />
              </Field>
              <Field label="Phone number" error={errors.customerPhone?.message}>
                <input
                  {...register("customerPhone")}
                  type="tel"
                  placeholder="08012345678"
                  className={inputCls(!!errors.customerPhone)}
                />
              </Field>
            </div>
            <Field label="Email address" error={errors.customerEmail?.message}>
              <input
                {...register("customerEmail")}
                type="email"
                placeholder="ada@example.com"
                className={inputCls(!!errors.customerEmail)}
              />
            </Field>
          </FormSection>

          {/* Delivery section */}
          <FormSection title="Delivery address">
            <Field label="Street address" error={errors.deliveryAddress?.message}>
              <input
                {...register("deliveryAddress")}
                placeholder="12 Bode Thomas Street"
                className={inputCls(!!errors.deliveryAddress)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="City" error={errors.deliveryCity?.message}>
                <input
                  {...register("deliveryCity")}
                  placeholder="Lagos"
                  className={inputCls(!!errors.deliveryCity)}
                />
              </Field>
              <Field label="State" error={errors.deliveryState?.message}>
                <select
                  {...register("deliveryState")}
                  className={inputCls(!!errors.deliveryState)}
                >
                  <option value="">Select state</option>
                  {NG_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Order notes (optional)" error={undefined}>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Any special instructions for delivery?"
                className={cn(inputCls(false), "resize-none")}
              />
            </Field>
          </FormSection>

          {/* Payment method */}
          {canCheckout && (
            <FormSection title="Payment method">
              <div className="space-y-3">
                {paystackEnabled && (
                  <PaymentOption
                    value="PAYSTACK"
                    selected={paymentMethod === "PAYSTACK"}
                    primaryColor={primaryColor}
                    title="Pay online"
                    description="Card, bank transfer, or USSD via Paystack"
                    icon={<CreditCard className="h-5 w-5" />}
                    register={register}
                  />
                )}
                {codAvailable && (
                  <PaymentOption
                    value="CASH_ON_DELIVERY"
                    selected={paymentMethod === "CASH_ON_DELIVERY"}
                    primaryColor={primaryColor}
                    title="Cash on delivery"
                    description="Pay when your order arrives"
                    icon={<Truck className="h-5 w-5" />}
                    register={register}
                  />
                )}
              </div>
              {codEnabled && !codAvailable && (
                <p className="text-xs text-zinc-400">
                  Cash on delivery isn&apos;t available for one or more items in your cart —
                  online payment only for this order.
                </p>
              )}
            </FormSection>
          )}

          {!canCheckout && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              No payment method is available for the items in your cart right now. Please
              contact the store, or remove the affected item and try again.
            </div>
          )}

          {/* Live cart issues — catches stock that changed since these items were added */}
          {cartHasIssues && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p>Some items in your cart are no longer available in the quantity selected.</p>
                <button
                  type="button"
                  onClick={() => openCart()}
                  className="mt-1 font-semibold underline underline-offset-2"
                >
                  Review cart
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  {cartHasIssues && !canResume && (
                    <button
                      type="button"
                      onClick={() => openCart()}
                      className="mt-1.5 text-xs font-semibold underline underline-offset-2"
                    >
                      Review cart
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !canCheckout || cartHasIssues}
            whileTap={loading || !canCheckout || cartHasIssues ? {} : { scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isVerifying ? "Verifying payment…" : "Placing order…"}
              </>
            ) : canResume ? (
              <>
                <CreditCard className="h-5 w-5" />
                Retry payment
              </>
            ) : paymentMethod === "PAYSTACK" ? (
              <>
                <CreditCard className="h-5 w-5" />
                Pay {formatMoney(total, currency)}
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" />
                Place order · {formatMoney(total, currency)}
              </>
            )}
          </motion.button>
        </div>

        {/* ── Right: Order summary ── */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-28 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 space-y-4">
            <h2 className="font-heading text-lg font-bold text-zinc-900">Order summary</h2>

            {/* Items */}
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${JSON.stringify(item.selectedVariants)}`}
                  className="flex items-start gap-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-zinc-300" />
                      </div>
                    )}
                    {/* Quantity badge */}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800">{item.name}</p>
                    {Object.entries(item.selectedVariants).length > 0 && (
                      <p className="text-xs text-zinc-400">
                        {Object.entries(item.selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-zinc-900">
                    {formatMoney(item.price * item.quantity, currency)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="border-t border-zinc-200 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="font-medium text-emerald-600">Free</span>
                  ) : (
                    formatMoney(deliveryFee, currency)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
                <span className="font-semibold text-zinc-900">Total</span>
                <span className="font-heading text-lg font-bold text-zinc-900">
                  {formatMoney(total, currency)}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 text-center">
              Secure checkout · No account required
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Sub-components ──

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function PaymentOption({
  value,
  selected,
  primaryColor,
  title,
  description,
  icon,
  register,
}: {
  value: "PAYSTACK" | "CASH_ON_DELIVERY";
  selected: boolean;
  primaryColor: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  register: ReturnType<typeof useForm<FormInput>>["register"];
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all",
        selected ? "border-current" : "border-zinc-100 hover:border-zinc-200"
      )}
      style={selected ? { borderColor: primaryColor } : {}}
    >
      <input
        type="radio"
        value={value}
        {...register("paymentMethod")}
        className="sr-only"
      />
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
          selected ? "text-white" : "bg-zinc-100 text-zinc-500"
        )}
        style={selected ? { backgroundColor: primaryColor } : {}}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      <div
        className={cn(
          "ml-auto h-5 w-5 rounded-full border-2 transition-all",
          selected ? "border-current" : "border-zinc-300"
        )}
        style={selected ? { borderColor: primaryColor } : {}}
      >
        {selected && (
          <div
            className="m-[3px] h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        )}
      </div>
    </label>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all",
    "placeholder:text-zinc-300",
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-zinc-200 bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
  );
}
