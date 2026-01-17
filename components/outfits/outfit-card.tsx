'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Outfit } from '@/types/outfit';
import { OutfitItem } from './outfit-item';
import { ScoreBadge } from './score-badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OutfitCardProps {
  outfit: Outfit;
  index: number;
}

export function OutfitCard({ outfit, index }: OutfitCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const allItems = [
    { product: outfit.top, label: 'Top' },
    { product: outfit.bottom, label: 'Bottom' },
    { product: outfit.footwear, label: 'Footwear' },
    ...outfit.accessories.map((acc, i) => ({
      product: acc,
      label: `Accessory${outfit.accessories.length > 1 ? ` ${i + 1}` : ''}`,
    })),
  ];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-muted-foreground">
              #{index + 1}
            </span>
            <h3 className="font-semibold text-lg">Complete Look</h3>
          </div>
          <ScoreBadge score={outfit.matchScore} />
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {outfit.suitableOccasions.slice(0, 3).map((occasion) => (
            <Badge key={occasion} variant="outline" className="text-xs capitalize">
              {occasion}
            </Badge>
          ))}
          {outfit.suitableSeasons
            .filter((s) => s !== 'all-season')
            .slice(0, 2)
            .map((season) => (
              <Badge key={season} variant="secondary" className="text-xs capitalize">
                {season}
              </Badge>
            ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {allItems.map(({ product, label }) => (
            <OutfitItem key={product.id} product={product} label={label} />
          ))}
        </div>

        {/* Total Price */}
        <div className="mt-6 flex justify-between items-center border-t pt-4">
          <span className="text-sm text-muted-foreground">Total Outfit Price</span>
          <span className="font-bold text-xl">
            ₹{outfit.totalPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Score Breakdown Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? (
            <>
              Hide Score Breakdown <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show Score Breakdown <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Score Breakdown */}
        {showBreakdown && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Match Score Breakdown</h4>
            <ScoreRow
              label="Color Harmony"
              score={outfit.scoreBreakdown.colorHarmony}
              weight="30%"
            />
            <ScoreRow
              label="Style Match"
              score={outfit.scoreBreakdown.styleCompatibility}
              weight="25%"
            />
            <ScoreRow
              label="Occasion Fit"
              score={outfit.scoreBreakdown.occasionFit}
              weight="20%"
            />
            <ScoreRow
              label="Season Match"
              score={outfit.scoreBreakdown.seasonMatch}
              weight="15%"
            />
            <ScoreRow
              label="Budget Fit"
              score={outfit.scoreBreakdown.budgetAlignment}
              weight="10%"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreRow({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  const percentage = Math.round(score * 100);
  const colorClass =
    percentage >= 80
      ? '[&>div]:bg-green-500'
      : percentage >= 60
        ? '[&>div]:bg-yellow-500'
        : '[&>div]:bg-orange-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <Progress value={percentage} className={`flex-1 h-2 ${colorClass}`} />
      <span className="text-xs font-medium w-12 text-right">{percentage}%</span>
      <span className="text-xs text-muted-foreground w-10">({weight})</span>
    </div>
  );
}
