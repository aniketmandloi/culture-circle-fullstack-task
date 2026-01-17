import Image from 'next/image';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';

interface OutfitItemProps {
  product: Product;
  label?: string;
}

export function OutfitItem({ product, label }: OutfitItemProps) {
  return (
    <div className="group">
      <div className="aspect-square relative overflow-hidden rounded-base bg-secondary-background border-2 border-border">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="150px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
        {label && (
          <Badge
            variant="default"
            className="absolute top-1 left-1 text-xs"
          >
            {label}
          </Badge>
        )}
      </div>
      <p className="text-xs mt-1.5 line-clamp-2 leading-tight font-heading">
        {product.title}
      </p>
      <p className="text-xs text-muted-foreground capitalize">{product.brand}</p>
      <p className="text-xs font-heading mt-0.5">
        ₹{product.price.toLocaleString('en-IN')}
      </p>
    </div>
  );
}
