import { Product, Style, Occasion, Season } from './product';

export interface ScoreBreakdown {
  colorHarmony: number;
  styleCompatibility: number;
  occasionFit: number;
  seasonMatch: number;
  budgetAlignment: number;
}

export interface Outfit {
  id: string;
  top: Product;
  bottom: Product;
  footwear: Product;
  accessories: Product[];
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  totalPrice: number;
  dominantStyle: Style;
  suitableOccasions: Occasion[];
  suitableSeasons: Season[];
}

export interface OutfitFilters {
  occasion?: Occasion;
  season?: Season;
  maxBudget?: number;
  minBudget?: number;
  preferredStyle?: Style;
  excludeProductIds?: string[];
}

export interface OutfitRequest {
  baseProductId: string;
  filters?: OutfitFilters;
  count?: number;
}

export interface OutfitResponse {
  baseProduct: Product;
  outfits: Outfit[];
  generatedAt: string;
  processingTimeMs: number;
}
