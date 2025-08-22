import type { TCartState, TProduct } from "@/types";

export type CartAction =
  | { type: "ADD_ITEM"; product: TProduct; qty?: number }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QTY"; productId: number; qty: number }
  | { type: "CLEAR_CART" };

export const initialCartState: TCartState = { items: [] };

export function cartReducer(state: TCartState, action: CartAction): TCartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, qty = 1 } = action;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex];
        const newQty = existingItem.qty + qty;

        if (newQty <= 0) {
          // Remove item if quantity becomes 0 or negative
          return {
            items: state.items.filter(
              (_, index) => index !== existingItemIndex
            ),
          };
        }

        // Update existing item
        const newItems = [...state.items];
        newItems[existingItemIndex] = { ...existingItem, qty: newQty };
        return { items: newItems };
      } else {
        // Add new item
        if (qty <= 0) return state; // Don't add items with 0 or negative quantity

        return {
          items: [...state.items, { product, qty }],
        };
      }
    }

    case "REMOVE_ITEM": {
      const { productId } = action;
      return {
        items: state.items.filter((item) => item.product.id !== productId),
      };
    }

    case "UPDATE_QTY": {
      const { productId, qty } = action;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === productId
      );

      if (existingItemIndex === -1) return state;

      if (qty <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          items: state.items.filter((_, index) => index !== existingItemIndex),
        };
      }

      // Update quantity
      const newItems = [...state.items];
      newItems[existingItemIndex] = { ...newItems[existingItemIndex], qty };
      return { items: newItems };
    }

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
}

// Selectors
export const selectCartItems = (state: TCartState) => state.items;

export const selectCartItemCount = (state: TCartState) =>
  state.items.reduce((total, item) => total + item.qty, 0);

export const selectCartTotal = (state: TCartState) =>
  state.items.reduce((total, item) => total + item.qty * item.product.price, 0);

export const selectCartItem = (state: TCartState, productId: number) =>
  state.items.find((item) => item.product.id === productId);

export const selectIsInCart = (state: TCartState, productId: number) =>
  state.items.some((item) => item.product.id === productId);
