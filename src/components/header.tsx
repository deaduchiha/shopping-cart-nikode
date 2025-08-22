import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

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
