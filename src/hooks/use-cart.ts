import { CartContext } from "@/context/cart-context";
import { useContext } from "react";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
