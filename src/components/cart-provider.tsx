import {
  CartContext,
  loadFromLS,
  saveToLS,
  type CartContextValue,
} from "@/context/cart-context";
import {
  cartReducer,
  initialCartState,
  selectCartItemCount,
  selectCartItems,
  selectCartTotal,
} from "@/state/cart-reducer";
import { useEffect, useReducer } from "react";

export const CartProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    () => loadFromLS() ?? initialCartState
  );

  useEffect(() => {
    saveToLS(state);
  }, [state]);

  // Create the context value object
  const items = selectCartItems(state);
  const value: CartContextValue = {
    state,
    items,
    totalItems: selectCartItemCount(state),
    totalPrice: selectCartTotal(state),
    dispatch,
    add: (product, qty = 1) => dispatch({ type: "ADD_ITEM", product, qty }),
    remove: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
    setQty: (productId, qty) =>
      dispatch({ type: "UPDATE_QTY", productId, qty }),
    clear: () => dispatch({ type: "CLEAR_CART" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
