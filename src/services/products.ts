import type { TProduct } from "@/types";

const BASE = "https://fakestoreapi.com";

export async function fetchProducts(): Promise<TProduct[]> {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
