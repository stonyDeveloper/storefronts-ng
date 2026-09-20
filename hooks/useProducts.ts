import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductWithVariants } from "@/types";

export function useProducts() {
  return useQuery<ProductWithVariants[]>({
    queryKey: ["products"],
    queryFn: () =>
      fetch("/api/products")
        .then((r) => r.json())
        .then((d) => d.data ?? []),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/products/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
