import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/products";
import type { TProduct } from "@/types";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";

export default function ProductList() {
  const { add } = useCart();
  const [products, setProducts] = useState<TProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchProducts()
      .then((data) => {
        if (isMounted) setProducts(data);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load")
      );
    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
        Error: {error}
      </div>
    );
  }

  if (!products) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-square rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={(prod) => add(prod, 1)} />
      ))}
    </div>
  );
}
