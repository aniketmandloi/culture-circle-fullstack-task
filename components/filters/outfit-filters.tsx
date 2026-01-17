'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OutfitFilters } from '@/types/outfit';
import { Occasion, Season, Style } from '@/types/product';
import { RotateCcw } from 'lucide-react';

interface OutfitFiltersFormProps {
  onFiltersChange: (filters: OutfitFilters) => void;
  maxPrice?: number;
  initialFilters?: OutfitFilters;
}

export function OutfitFiltersForm({
  onFiltersChange,
  maxPrice = 100000,
  initialFilters = {},
}: OutfitFiltersFormProps) {
  const [filters, setFilters] = useState<OutfitFilters>(initialFilters);

  const updateFilter = <K extends keyof OutfitFilters>(
    key: K,
    value: OutfitFilters[K] | undefined | string
  ) => {
    const newFilters = { ...filters };
    if (value === undefined || value === 'all') {
      delete newFilters[key];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newFilters[key] = value as any;
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="neutral" size="sm" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Occasion */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Occasion</Label>
          <Select
            value={filters.occasion || 'all'}
            onValueChange={(v) =>
              updateFilter('occasion', v === 'all' ? undefined : (v as Occasion))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any occasion</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="party">Party</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="date">Date Night</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Season */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Season</Label>
          <Select
            value={filters.season || 'all'}
            onValueChange={(v) =>
              updateFilter('season', v === 'all' ? undefined : (v as Season))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any season</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preferred Style</Label>
          <Select
            value={filters.preferredStyle || 'all'}
            onValueChange={(v) =>
              updateFilter('preferredStyle', v === 'all' ? undefined : (v as Style))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any style</SelectItem>
              <SelectItem value="streetwear">Streetwear</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="athletic">Athletic</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Max Budget</Label>
            <span className="text-sm font-semibold">
              ₹{(filters.maxBudget || maxPrice).toLocaleString('en-IN')}
            </span>
          </div>
          <Slider
            value={[filters.maxBudget || maxPrice]}
            max={maxPrice}
            min={5000}
            step={5000}
            onValueChange={([value]) => updateFilter('maxBudget', value)}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹5,000</span>
            <span>₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
