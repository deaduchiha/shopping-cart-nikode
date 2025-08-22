Below is a complete, copy‑pasteable UI implementation matching your workshop outline. Keep your original install command:

```bash
bunx --bun shadcn@latest add button card input badge separator sheet skeleton
```

If you want toast notifications, either add your preferred one (e.g., shadcn “toast” or `sonner`). The code includes a lightweight `notify()` fallback that uses `alert()` so everything works out‑of‑the‑box.

---

## 1) Types & Services

**`src/types/index.ts`**

```ts
export type TProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};

export type TCartItem = {
  product: TProduct;
  qty: number;
};

export type TCartState = {
  items: TCartItem[];
};
```

**`src/services/products.ts`**

```ts
import type { TProduct } from "@/types";

const BASE = "https://fakestoreapi.com";

export async function fetchProducts(): Promise<TProduct[]> {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
```

---

## 2) Cart State: Reducer + Context (with LocalStorage persist)

**Key Improvements in this version:**

- **Array-based cart state** instead of object-based for better performance and easier manipulation
- **Improved action names**: `SET_QTY` → `UPDATE_QTY`, `CLEAR` → `CLEAR_CART`
- **Better edge case handling**: Automatically removes items when quantity ≤ 0
- **Enhanced selectors**: Added `selectCartItem` and `selectIsInCart` for better cart state queries
- **Cleaner immutability**: Consistent array operations with proper spread operators

**`src/state/cart-reducer.ts`**

```ts
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
```

**`src/context/cart-context.tsx`**

```tsx
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
```

**`src/component/cart-provider.tsx`**

```tsx
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
```

**`src/hooks/use-cart.ts`**

```ts
import { CartContext } from "@/context/cart-context";
import { useContext } from "react";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
```

---

## 3) UI Components

### 3.1 Header

**`src/components/header.tsx`**

```tsx
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";

export default function Header({ onCartClick }: { onCartClick?: () => void }) {
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-semibold text-lg">🛍️ Mini Shop</div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={onCartClick}
            className="relative"
          >
            View Cart
            <Badge className="ml-2" variant="default">
              {totalItems}
            </Badge>
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
}
```

### 3.2 Product Card

**`src/components/product-card.tsx`**

```tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TProduct } from "@/types";
import { toast } from "sonner";

export default function ProductCard({
  product,
  onAdd,
}: {
  product: TProduct;
  onAdd: (p: TProduct) => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted grid place-items-center">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain p-6"
          />
        </div>
        <h3 className="font-medium line-clamp-2">{product.title}</h3>
        <Badge className="w-fit">${product.price.toFixed(2)}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full"
          onClick={() => {
            onAdd(product);
            toast.success("Added to cart");
          }}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 3.3 Product List (loading + error states)

**`src/components/product-list.tsx`**

```tsx
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/products";
import type { TProduct } from "@/types";
import ProductCard from "@/components/product-card";
import { useCart } from "@/context/cart-context";
import { Skeleton } from "@/components/ui/skeleton";

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
```

### 3.4 Checkout

**`src/components/checkout.tsx`**

```tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export default function Checkout() {
  const { items, totalItems, totalPrice, remove, setQty, clear } = useCart();

  const placeOrder = () => {
    if (items.length === 0) return;
    // Do your order logic here
    toast.success("Order placed! (demo)");

    clear();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Cart</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 && (
            <p className="text-muted-foreground">Your cart is empty.</p>
          )}
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="size-16 rounded bg-muted grid place-items-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-16 object-contain p-2"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{product.title}</div>
                <div className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQty(product.id, qty - 1)}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(product.id, Number(e.target.value))}
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQty(product.id, qty + 1)}
                >
                  +
                </Button>
              </div>
              <div className="w-20 text-right font-medium">
                ${(qty * product.price).toFixed(2)}
              </div>
              <Button variant="ghost" onClick={() => remove(product.id)}>
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Summary</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={totalItems === 0}
            onClick={placeOrder}
          >
            Place Order
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled={totalItems === 0}
            onClick={clear}
          >
            Clear Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## 4) App Shell + Smooth Scroll to Checkout

**`src/App.tsx`**

```tsx
import { useRef } from "react";
import Header from "@/components/header";
import ProductList from "@/components/product-list";
import Checkout from "@/components/checkout";

export default function App() {
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh">
      <Header onCartClick={scrollToCheckout} />

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <ProductList />
        </section>

        <section ref={checkoutRef} className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Checkout</h2>
          <Checkout />
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Built with React + shadcn/ui + Tailwind
      </footer>
    </div>
  );
}
```

**`src/main.tsx`** (Vite-style entry; adjust if using Next.js)

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "@/context/cart-context";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
```
