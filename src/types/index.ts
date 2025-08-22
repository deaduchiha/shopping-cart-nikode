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
