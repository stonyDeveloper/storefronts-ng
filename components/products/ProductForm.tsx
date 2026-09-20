"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Trash2, X, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageUploader } from "./ImageUploader";
import { VariantBuilder, type VariantBuilderValue } from "./VariantBuilder";
import { formatMoney } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ProductWithVariants } from "@/types";

// Form uses Naira values — we convert to kobo on submit.
// No .default() here: defaults live in useForm() to avoid Zod input/output type mismatch.
const formSchema = z.object({
  name: z.string().min(1, "Product name is required").max(120),
  description: z.string().max(2000).optional(),
  priceNaira: z.coerce
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0.01, "Price must be greater than 0"),
  comparePriceNaira: z.coerce.number().min(0).optional().nullable(),
  images: z.array(z.string()).min(1, "Add at least one image"),
  sku: z.string().max(100).optional(),
  stock: z.coerce.number().int().min(0),
  trackStock: z.boolean(),
  isVisible: z.boolean(),
  codEnabled: z.boolean(),
  category: z.string().max(60).optional(),
  tags: z.array(z.string()),
  variantAttributes: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
  variantCombos: z.array(
    z.object({
      options: z.record(z.string()),
      price: z.number().nullable(),
      stock: z.number(),
      image: z.string().nullable(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  product?: ProductWithVariants;
  currency?: string;
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-700">{label}</p>
        {hint && <p className="text-xs text-zinc-400 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-zinc-900" : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function ProductForm({ product, currency = "NGN" }: Props) {
  const router = useRouter();
  const isEditing = !!product;
  const [serverError, setServerError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          priceNaira: product.price / 100,
          comparePriceNaira: product.comparePrice ? product.comparePrice / 100 : null,
          images: product.images,
          sku: product.sku ?? "",
          stock: Math.max(0, product.stock),
          trackStock: product.trackStock,
          isVisible: product.isVisible,
          codEnabled: product.codEnabled,
          category: product.category ?? "",
          tags: product.tags,
          variantAttributes: product.variantAttributes
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((a) => ({ name: a.name, values: a.values })),
          variantCombos: product.variantCombos.map((c) => ({
            options: c.options as Record<string, string>,
            price: c.price,
            stock: c.stock,
            image: c.image,
          })),
        }
      : {
          name: "",
          description: "",
          priceNaira: undefined,
          comparePriceNaira: null,
          images: [],
          sku: "",
          stock: 0,
          trackStock: true,
          isVisible: true,
          codEnabled: true,
          category: "",
          tags: [],
          variantAttributes: [],
          variantCombos: [],
        },
  });

  const images = watch("images");
  const trackStock = watch("trackStock");
  const tags = watch("tags");
  const priceNaira = watch("priceNaira");
  const stock = watch("stock");
  const isVisible = watch("isVisible");
  const variantAttributes = watch("variantAttributes");
  const variantCombos = watch("variantCombos");

  // Nudge merchants who publish a product with zero sellable stock — it'll be
  // visible in the store but buyers won't be able to order it until restocked.
  const hasVariants = variantCombos.length > 0;
  const outOfStockWarning =
    trackStock &&
    isVisible &&
    (hasVariants
      ? variantCombos.every((c) => c.stock === 0)
      : Number(stock) === 0);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setValue("tags", [...tags, tag]);
    setTagInput("");
  }

  function removeTag(i: number) {
    setValue("tags", tags.filter((_, idx) => idx !== i));
  }

  async function onSubmit(values: FormValues) {
    setServerError("");
    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: Math.round(values.priceNaira * 100),
      comparePrice:
        values.comparePriceNaira && values.comparePriceNaira > 0
          ? Math.round(values.comparePriceNaira * 100)
          : null,
      images: values.images,
      sku: values.sku || undefined,
      stock: values.stock,
      trackStock: values.trackStock,
      isVisible: values.isVisible,
      codEnabled: values.codEnabled,
      category: values.category || undefined,
      tags: values.tags,
      variantAttributes: values.variantAttributes.filter((a) => a.name && a.values.length > 0),
      variantCombos: values.variantCombos,
    };

    const url = isEditing ? `/api/products/${product.id}` : "/api/products";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setServerError(data.error ?? "Something went wrong. Please try again.");
      toast.error(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success(isEditing ? "Product updated" : "Product created");
    router.push("/products");
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/products/${product!.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success(`"${product!.name}" deleted`);
      router.push("/products");
      router.refresh();
    } else {
      toast.error("Could not delete product");
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow placeholder:text-zinc-400";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-zinc-900">
              {isEditing ? product.name : "New product"}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEditing ? "Edit product details" : "Fill in the details below"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting || isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || deleting}
            className="flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Save changes" : "Save product"}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {outOfStockWarning && (
        <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            {hasVariants
              ? "Every variant is at 0 quantity. This product will be visible but buyers won't be able to add it to cart until you add stock below."
              : "Quantity is 0. This product will be visible but buyers won't be able to add it to cart until you add stock below."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Main column */}
        <div className="space-y-4">
          <Section title="Details">
            <Field label="Product name" required error={errors.name?.message}>
              <input {...register("name")} placeholder="e.g. Floral Ankara Dress" className={inputCls} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Describe your product — materials, sizing, care instructions..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </Section>

          <Section title="Images">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  images={field.value}
                  onChange={field.onChange}
                  error={errors.images?.message}
                />
              )}
            />
          </Section>

          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price" required error={errors.priceNaira?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">
                    ₦
                  </span>
                  <input
                    {...register("priceNaira")}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputCls} pl-6`}
                  />
                </div>
              </Field>
              <Field label="Compare-at price" error={errors.comparePriceNaira?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">
                    ₦
                  </span>
                  <input
                    {...register("comparePriceNaira")}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputCls} pl-6`}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Shows as strikethrough when higher than price
                </p>
              </Field>
            </div>
          </Section>

          <Section title="Inventory">
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU" error={errors.sku?.message}>
                <input
                  {...register("sku")}
                  placeholder="e.g. ANK-DRESS-001"
                  className={inputCls}
                />
              </Field>
              {trackStock && !hasVariants && (
                <Field label="Quantity" error={errors.stock?.message}>
                  <input
                    {...register("stock")}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
            {trackStock && hasVariants && (
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2.5">
                <span className="text-xs text-zinc-500">Stock is tracked per variant below</span>
                <span className="text-xs font-semibold text-zinc-700">
                  {variantCombos.reduce((sum, c) => sum + (Number(c.stock) || 0), 0)} total
                </span>
              </div>
            )}
            <Controller
              name="trackStock"
              control={control}
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Track stock"
                  hint="Prevent orders when stock reaches zero"
                />
              )}
            />
          </Section>

          <Section title="Variants">
            <p className="text-xs text-zinc-400 -mt-2">
              Optional — add variants like size or color, with their own price and stock if you
              need them. Leave this empty to sell as a single product.
            </p>
            <VariantBuilder
              value={{ attributes: variantAttributes, combos: variantCombos } as VariantBuilderValue}
              onChange={(next) => {
                setValue("variantAttributes", next.attributes);
                setValue("variantCombos", next.combos);
              }}
              images={images}
              basePriceNaira={Number(priceNaira) || 0}
            />
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Status">
            <Controller
              name="isVisible"
              control={control}
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Visible in store"
                  hint="Buyers can find and purchase this product"
                />
              )}
            />
            <Controller
              name="codEnabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Allow cash on delivery"
                  hint="Turn off to require online payment for this product. Applies only if COD is enabled in Settings."
                />
              )}
            />
          </Section>

          <Section title="Organization">
            <Field label="Category" error={errors.category?.message}>
              <input
                {...register("category")}
                placeholder="e.g. Dresses, Footwear..."
                className={inputCls}
              />
            </Field>

            <Field label="Tags">
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-lg"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Type and press Enter"
                    className={inputCls}
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="p-2.5 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Field>
          </Section>

          {isEditing && product.comparePrice && product.comparePrice > product.price && (
            <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
              <p className="text-xs text-zinc-500 font-medium">Showing sale price</p>
              <p className="text-lg font-bold text-zinc-900 mt-1">
                {formatMoney(product.price, currency)}
              </p>
              <p className="text-xs text-zinc-400 line-through">
                {formatMoney(product.comparePrice, currency)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile save button */}
      <div className="mt-6 lg:hidden">
        <button
          type="submit"
          disabled={isSubmitting || deleting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? "Save changes" : "Save product"}
        </button>
      </div>

      {isEditing && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`Delete "${product.name}"?`}
          description="This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        />
      )}
    </form>
  );
}
