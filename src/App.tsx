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
