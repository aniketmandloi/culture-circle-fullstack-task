'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';
import { Check } from 'lucide-react';

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
        'cursor-pointer transition-all duration-200 overflow-hidden group relative',
        'hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
        isSelected && 'translate-x-boxShadowX translate-y-boxShadowY shadow-none ring-2 ring-main'
      )}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-main text-main-foreground rounded-full p-1 border-2 border-border shadow-shadow">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}

      {/* Image container - square */}
      <div className="aspect-square relative overflow-hidden bg-secondary-background">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Style tag overlay */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="default" className="text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-shadow">
            {product.style}
          </Badge>
        </div>
      </div>

      {/* Content */}
      {showDetails && (
        <div className="p-3 border-t-2 border-border space-y-1.5">
          {/* Brand */}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="text-sm font-heading leading-tight line-clamp-2 min-h-9">
            {product.title}
          </h3>

          {/* Price & Colors row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-heading">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

            {/* Color dots */}
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-full border-2 border-border"
                  style={{ backgroundColor: getColorValue(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Helper function to convert color names to hex values
function getColorValue(colorName: string): string {
  const colors: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    brown: '#92400e',
    gray: '#6b7280',
    grey: '#6b7280',
    navy: '#1e3a5f',
    beige: '#d4c4a8',
    cream: '#fffdd0',
    maroon: '#800000',
    olive: '#808000',
    teal: '#14b8a6',
    coral: '#ff7f50',
    gold: '#ffd700',
    silver: '#c0c0c0',
    tan: '#d2b48c',
    khaki: '#c3b091',
    burgundy: '#800020',
    charcoal: '#36454f',
    ivory: '#fffff0',
    lavender: '#e6e6fa',
    mint: '#98fb98',
    peach: '#ffcba4',
    rust: '#b7410e',
    salmon: '#fa8072',
    turquoise: '#40e0d0',
    violet: '#8b5cf6',
    wine: '#722f37',
    mustard: '#ffdb58',
    denim: '#1560bd',
    indigo: '#4b0082',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    multicolor: 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)',
  };

  return colors[colorName.toLowerCase()] || '#9ca3af';
}
