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
