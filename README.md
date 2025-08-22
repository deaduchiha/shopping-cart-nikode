# Phase 0 — Shopping cart App with shadcn/ui + Tailwind

This README is your hands-on workshop package. It includes working code (TypeScript + React), inline comments, and short explanations for each block. Copy files as-is, then advance session by session.

```bash
bunx --bun shadcn@latest add button card input badge separator sheet skeleton
```

---

## Phase 1 — Types & API Services

### 1.1 Data Types

`src/types/index.ts`

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
  items: Record<number, TCartItem>; // key = product.id
};
```

### 1.2 FakeStore Product Service

`src/services/products.ts`

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

## Phase 2 — Cart with `useReducer` + Context + Persist

### 2.1 Reducer

`src/state/cartReducer.ts`
(Your reducer and selectors stay the same as you wrote — add/remove/set qty/clear, totalItems, totalPrice, etc.)

### 2.2 Context + LocalStorage Persist

`src/context/CartContext.tsx`
(Your implementation is already in English-ready form.)

---

## Phase 3 — Shell UI: Header + App Skeleton

### 3.1 Header with Item Count from Context

`src/components/Header.tsx`
(Shows shop name, cart button, and badge with item count.)

### 3.2 App Skeleton + Checkout Scroll Ref

`src/App.tsx`
(Contains Header, Products section, and Checkout section with `useRef` for smooth scrolling.)

---

## Phase 4 — Product List + Product Card + Add to Cart

### 4.1 ProductCard

Displays image, title, price badge, description, and “Add to cart” button with toast.

### 4.2 ProductList with Loading & Error States

- Uses `fetchProducts()`
- Shows skeleton loaders until products arrive
- Handles error gracefully

---

## Phase 5 — Checkout: Quantity Control, Remove, Totals, Scroll

`src/components/Checkout.tsx`

- Shows cart items with +/– buttons, input field, and remove button
- Displays totals in a summary card
- “Place Order” and “Clear Cart” buttons

---

## Phase 6 — Folder Structure + Final Notes

### Suggested Folder Structure

```
src/
  components/
    Header.tsx
    ProductCard.tsx
    ProductList.tsx
    Checkout.tsx
    ui/
      button.tsx
      card.tsx
      input.tsx
      badge.tsx
      separator.tsx
      sheet.tsx
      skeleton.tsx
  context/
    CartContext.tsx
  state/
    cartReducer.ts
  services/
    products.ts
    cart.ts
  types/
    index.ts
  lib/
    utils.ts
  App.tsx
  main.tsx
index.html
index.css
tailwind.config.js
components.json
```

- **Separation of concerns**: Types, services, state, and UI kept separate
- **Persist & Sync**: `CartContext` handles localStorage and optional API sync
- **DX**: shadcn/ui for UI consistency, Sonner for toasts

---

# Running the Project

```bash
bun dev
```

---

# README (Concise & Practical)

# Organa — FakeStore Shop (React + Vite + Tailwind + shadcn/ui)

A minimal e-commerce demo using https://fakestoreapi.com/products

## Stack

- React + Vite + TypeScript
- TailwindCSS (+ tailwindcss-animate)
- shadcn/ui (Radix-based)
- Sonner (toasts)
- State: `useReducer` + `useContext`
- Persistence: `localStorage` (+ optional API sync)

## Features

- Product list from FakeStore API
- Cart management (add/remove/set qty/clear)
- Cart count in Header via Context
- Smooth scroll to Checkout via `useRef`
- Persist cart between refreshes

## Getting Started

```bash
bun install
bun dev
```

## Project Structure

- `components/`: UI components (Header, ProductList, ProductCard, Checkout)
- `components/ui`: shadcn/ui building blocks
- `context/CartContext.tsx`: cart provider + persistence + (optional) sync
- `state/cartReducer.ts`: reducer + selectors
- `services/`: API calls
- `types/`: shared TS types
- `lib/utils.ts`: `cn` helper
