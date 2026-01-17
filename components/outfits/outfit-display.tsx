'use client';

import { Outfit } from '@/types/outfit';
import { OutfitCard } from './outfit-card';
import { Skeleton } from '@/components/ui/skeleton';

interface OutfitDisplayProps {
  outfits: Outfit[];
  isLoading?: boolean;
  processingTime?: number;
}

export function OutfitDisplay({
  outfits,
  isLoading,
  processingTime,
}: OutfitDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <OutfitSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-secondary-background rounded-base border-2 border-border">
        <p className="text-lg font-heading">No outfit recommendations available</p>
        <p className="text-sm mt-2">
          Try selecting a different product or adjusting filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {processingTime !== undefined && (
        <p className="text-xs text-muted-foreground text-right">
          Generated in <span className="font-heading text-main">{processingTime}ms</span>
        </p>
      )}
      {outfits.map((outfit, index) => (
        <OutfitCard key={outfit.id} outfit={outfit} index={index} />
      ))}
    </div>
  );
}

function OutfitSkeleton() {
  return (
    <div className="border-2 border-border rounded-base p-6 space-y-4 bg-secondary-background shadow-shadow">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t-2 border-border">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
