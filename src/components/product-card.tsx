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
