import React, { createContext } from "react";
import type { TCartState, TProduct } from "@/types";
import { selectCartItems, type CartAction } from "@/state/cart-reducer";

const LS_KEY = "cart-state-v1";

export function loadFromLS(): TCartState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as TCartState) : null;
  } catch {
    return null;
  }
}

export function saveToLS(state: TCartState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to save cart to localStorage");
  }
}

export type CartContextValue = {
  state: TCartState;
  items: ReturnType<typeof selectCartItems>;
  totalItems: number;
  totalPrice: number;
  dispatch: React.Dispatch<CartAction>;
  add: (product: TProduct, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
