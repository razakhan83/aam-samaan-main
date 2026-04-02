'use client';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCartActions } from '@/context/CartContext';

function mapOrderItemToCartItem(item) {
  const productId = item?.productId || item?._id || item?.name;

  return {
    id: productId,
    _id: productId,
    slug: productId,
    name: item?.name || 'Product',
    price: Number(item?.price || 0),
    Images: item?.image ? [{ url: item.image }] : [],
    quantity: Math.max(1, Number(item?.quantity || 1)),
  };
}

export default function ReorderButton({ items = [], className = '', size = 'sm', openCart = true }) {
  const { addManyToCart } = useCartActions();

  function handleReorder() {
    addManyToCart(items.map(mapOrderItemToCartItem), {
      openCart,
      message: 'Order added back to your cart',
    });
  }

  return (
    <Button type="button" variant="outline" size={size} className={className} onClick={handleReorder}>
      <RotateCcw data-icon="inline-start" />
      Reorder
    </Button>
  );
}
