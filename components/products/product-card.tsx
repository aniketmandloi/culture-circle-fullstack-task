'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: () => void;
  showDetails?: boolean;
}

export function ProductCard({
  product,
  isSelected,
  onSelect,
  showDetails = true,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg overflow-hidden',
        isSelected && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={onSelect}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      {showDetails && (
        <CardContent className="p-3">
          <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {product.brand}
          </p>
          <p className="text-sm font-semibold mt-2">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.colors.slice(0, 2).map((color) => (
              <Badge key={color} variant="outline" className="text-xs capitalize">
                {color}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs capitalize">
              {product.style}
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
