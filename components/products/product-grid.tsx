'use client';

import { Product } from '@/types/product';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  selectedId?: string;
}

export function ProductGrid({ products, onSelect, selectedId }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={product.id === selectedId}
          onSelect={() => onSelect?.(product)}
        />
      ))}
    </div>
  );
}
