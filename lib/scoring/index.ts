import { Product, Occasion, Season } from '@/types/product';
import { ScoreBreakdown, OutfitFilters } from '@/types/outfit';
import { calculateColorHarmony } from './color-harmony';
import { calculateStyleCompatibility, getDominantStyle } from './style-compatibility';

const WEIGHTS = {
  colorHarmony: 0.3,
  styleCompatibility: 0.25,
  occasionFit: 0.2,
  seasonMatch: 0.15,
  budgetAlignment: 0.1,
};

export interface ScoringResult {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export function calculateMatchScore(
  items: Product[],
  filters?: OutfitFilters
): ScoringResult {
  const scoreBreakdown: ScoreBreakdown = {
    colorHarmony: calculateColorHarmony(items.map((i) => i.colors)),
    styleCompatibility: calculateStyleCompatibility(items),
    occasionFit: calculateOccasionFit(items, filters?.occasion),
    seasonMatch: calculateSeasonMatch(items, filters?.season),
    budgetAlignment: calculateBudgetAlignment(
      items.reduce((sum, i) => sum + i.price, 0),
      filters?.maxBudget,
      filters?.minBudget
    ),
  };

  const matchScore =
    scoreBreakdown.colorHarmony * WEIGHTS.colorHarmony +
    scoreBreakdown.styleCompatibility * WEIGHTS.styleCompatibility +
    scoreBreakdown.occasionFit * WEIGHTS.occasionFit +
    scoreBreakdown.seasonMatch * WEIGHTS.seasonMatch +
    scoreBreakdown.budgetAlignment * WEIGHTS.budgetAlignment;

  return {
    matchScore: Math.round(matchScore * 100) / 100,
    scoreBreakdown,
  };
}

function calculateOccasionFit(items: Product[], targetOccasion?: Occasion): number {
  if (!targetOccasion) {
    // No specific occasion requested, check if items have common occasions
    const occasionCounts: Record<string, number> = {};

    for (const item of items) {
      for (const occasion of item.occasions) {
        occasionCounts[occasion] = (occasionCounts[occasion] || 0) + 1;
      }
    }

    // Find the most common occasion
    let maxCount = 0;
    for (const count of Object.values(occasionCounts)) {
      if (count > maxCount) maxCount = count;
    }

    // Score based on how many items share the same occasion
    return maxCount / items.length;
  }

  // Count items that match the target occasion
  const matchingItems = items.filter((item) =>
    item.occasions.includes(targetOccasion)
  );

  return matchingItems.length / items.length;
}

function calculateSeasonMatch(items: Product[], targetSeason?: Season): number {
  if (!targetSeason) {
    // No specific season requested
    // Check if items work together seasonally
    const allSeasonCount = items.filter((i) =>
      i.seasons.includes('all-season')
    ).length;

    if (allSeasonCount === items.length) {
      return 0.9; // All items are all-season
    }

    // Check for seasonal overlap
    const seasonCounts: Record<string, number> = {};
    for (const item of items) {
      for (const season of item.seasons) {
        if (season !== 'all-season') {
          seasonCounts[season] = (seasonCounts[season] || 0) + 1;
        }
      }
    }

    let maxCount = 0;
    for (const count of Object.values(seasonCounts)) {
      if (count > maxCount) maxCount = count;
    }

    const nonAllSeasonItems = items.length - allSeasonCount;
    if (nonAllSeasonItems === 0) return 0.9;

    return (maxCount + allSeasonCount) / items.length;
  }

  // Count items that match the target season
  const matchingItems = items.filter(
    (item) =>
      item.seasons.includes(targetSeason) || item.seasons.includes('all-season')
  );

  return matchingItems.length / items.length;
}

function calculateBudgetAlignment(
  totalPrice: number,
  maxBudget?: number,
  minBudget?: number
): number {
  // No budget constraints = full score
  if (!maxBudget && !minBudget) {
    return 0.85; // Default good score when no constraints
  }

  let score = 1;

  if (maxBudget) {
    if (totalPrice <= maxBudget) {
      // Under budget is good, closer to budget = better value
      const utilizationRatio = totalPrice / maxBudget;
      if (utilizationRatio >= 0.7) {
        score = 1; // Good budget utilization
      } else if (utilizationRatio >= 0.5) {
        score = 0.9;
      } else {
        score = 0.8; // Significantly under budget
      }
    } else {
      // Over budget - penalize based on how much over
      const overRatio = totalPrice / maxBudget;
      if (overRatio <= 1.1) {
        score = 0.7; // Slightly over
      } else if (overRatio <= 1.25) {
        score = 0.5; // Moderately over
      } else {
        score = 0.3; // Significantly over
      }
    }
  }

  if (minBudget && totalPrice < minBudget) {
    // Under minimum budget - penalize
    const underRatio = totalPrice / minBudget;
    score = Math.min(score, underRatio);
  }

  return score;
}

export function getSuitableOccasions(items: Product[]): Occasion[] {
  const occasionCounts: Record<Occasion, number> = {} as Record<Occasion, number>;

  for (const item of items) {
    for (const occasion of item.occasions) {
      occasionCounts[occasion] = (occasionCounts[occasion] || 0) + 1;
    }
  }

  // Return occasions that at least half of items support
  const threshold = Math.ceil(items.length / 2);
  const suitable: Occasion[] = [];

  for (const [occasion, count] of Object.entries(occasionCounts)) {
    if (count >= threshold) {
      suitable.push(occasion as Occasion);
    }
  }

  return suitable.length > 0 ? suitable : ['casual'];
}

export function getSuitableSeasons(items: Product[]): Season[] {
  const seasonCounts: Record<Season, number> = {} as Record<Season, number>;

  for (const item of items) {
    for (const season of item.seasons) {
      seasonCounts[season] = (seasonCounts[season] || 0) + 1;
    }
  }

  // If all items are all-season, return all-season
  if (seasonCounts['all-season'] === items.length) {
    return ['all-season'];
  }

  // Return seasons that at least half of items support (including all-season items)
  const allSeasonCount = seasonCounts['all-season'] || 0;
  const threshold = Math.ceil(items.length / 2);
  const suitable: Season[] = [];

  for (const [season, count] of Object.entries(seasonCounts)) {
    if (season !== 'all-season' && count + allSeasonCount >= threshold) {
      suitable.push(season as Season);
    }
  }

  return suitable.length > 0 ? suitable : ['all-season'];
}

export { calculateColorHarmony } from './color-harmony';
export { calculateStyleCompatibility, getDominantStyle } from './style-compatibility';
