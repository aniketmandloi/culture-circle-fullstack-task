import { Product, ProductCategory } from '@/types/product';
import { Outfit, OutfitRequest, OutfitResponse, OutfitFilters } from '@/types/outfit';
import {
  getPrecomputedData,
  getCachedOutfits,
  setCachedOutfits,
  generateCacheKey,
  PrecomputedData,
} from '@/lib/cache';
import {
  calculateMatchScore,
  getDominantStyle,
  getSuitableOccasions,
  getSuitableSeasons,
} from '@/lib/scoring';

interface CandidatePools {
  tops: Product[];
  bottoms: Product[];
  footwear: Product[];
  accessories: Product[];
}

export async function generateOutfits(request: OutfitRequest): Promise<OutfitResponse> {
  const startTime = performance.now();

  // Get cached precomputed data
  const data = await getPrecomputedData();

  // Check outfit cache
  const cacheKey = generateCacheKey(request.baseProductId, request.filters || {});
  const cached = getCachedOutfits(cacheKey);
  if (cached) {
    return {
      baseProduct: data.productById.get(request.baseProductId)!,
      outfits: cached.slice(0, request.count || 3),
      generatedAt: new Date().toISOString(),
      processingTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // Get base product
  const baseProduct = data.productById.get(request.baseProductId);
  if (!baseProduct) {
    throw new Error(`Product not found: ${request.baseProductId}`);
  }

  // Get candidate pools
  const candidates = getCandidatePools(data, baseProduct, request.filters);

  // Generate and score outfits
  const outfits = generateAndScoreOutfits(
    baseProduct,
    candidates,
    request.filters,
    50 // Generate up to 50, return top N
  );

  // Cache results
  setCachedOutfits(cacheKey, outfits);

  const processingTime = Math.round(performance.now() - startTime);

  return {
    baseProduct,
    outfits: outfits.slice(0, request.count || 3),
    generatedAt: new Date().toISOString(),
    processingTimeMs: processingTime,
  };
}

function getCandidatePools(
  data: PrecomputedData,
  baseProduct: Product,
  filters?: OutfitFilters
): CandidatePools {
  const neededCategories = getNeededCategories(baseProduct.category);
  const pools: CandidatePools = {
    tops: [],
    bottoms: [],
    footwear: [],
    accessories: [],
  };

  for (const category of neededCategories) {
    let candidates = data.productsByCategory.get(category) || [];

    // Apply filters
    candidates = applyFilters(candidates, filters, baseProduct);

    // Prioritize style-compatible items
    candidates.sort((a, b) => {
      const aStyleScore = getQuickStyleScore(baseProduct.style, a.style);
      const bStyleScore = getQuickStyleScore(baseProduct.style, b.style);
      return bStyleScore - aStyleScore;
    });

    // Take top 30 per category for efficiency
    const poolKey = category === 'top' ? 'tops' :
                    category === 'bottom' ? 'bottoms' :
                    category === 'footwear' ? 'footwear' : 'accessories';

    pools[poolKey] = candidates.slice(0, 30);
  }

  // If base product is a top, don't include it again in tops pool
  if (baseProduct.category === 'top') {
    pools.tops = [baseProduct];
  }

  return pools;
}

function getNeededCategories(_baseCategory: ProductCategory): ProductCategory[] {
  // Always need all categories for a complete outfit
  // But the base product fills one slot
  const all: ProductCategory[] = ['top', 'bottom', 'footwear', 'accessory'];
  return all;
}

function applyFilters(
  products: Product[],
  filters?: OutfitFilters,
  baseProduct?: Product
): Product[] {
  if (!filters) return products;

  let filtered = [...products];

  // Exclude specific products
  if (filters.excludeProductIds?.length) {
    filtered = filtered.filter((p) => !filters.excludeProductIds!.includes(p.id));
  }

  // Exclude the base product itself
  if (baseProduct) {
    filtered = filtered.filter((p) => p.id !== baseProduct.id);
  }

  // Max budget filter (per item rough estimate)
  if (filters.maxBudget) {
    const maxPerItem = filters.maxBudget / 4; // Rough division among 4 items
    filtered = filtered.filter((p) => p.price <= maxPerItem * 1.5); // Allow some flexibility
  }

  // Occasion filter
  if (filters.occasion) {
    filtered = filtered.filter((p) => p.occasions.includes(filters.occasion!));
  }

  // Season filter
  if (filters.season) {
    filtered = filtered.filter(
      (p) => p.seasons.includes(filters.season!) || p.seasons.includes('all-season')
    );
  }

  // Style filter
  if (filters.preferredStyle) {
    // Sort by style match rather than hard filter
    filtered.sort((a, b) => {
      const aMatch = a.style === filters.preferredStyle ? 1 : 0;
      const bMatch = b.style === filters.preferredStyle ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  return filtered;
}

function generateAndScoreOutfits(
  baseProduct: Product,
  candidates: CandidatePools,
  filters?: OutfitFilters,
  maxOutfits: number = 50
): Outfit[] {
  const outfits: Outfit[] = [];
  const seenCombinations = new Set<string>();

  // Determine which category the base product fills
  const baseCategory = baseProduct.category;

  // Get pools for other categories
  const tops = baseCategory === 'top' ? [baseProduct] : candidates.tops;
  const bottoms = baseCategory === 'bottom' ? [baseProduct] : candidates.bottoms;
  const footwear = baseCategory === 'footwear' ? [baseProduct] : candidates.footwear;
  const accessories = baseCategory === 'accessory' ? [baseProduct] : candidates.accessories;

  // Ensure we have items in essential categories (bottoms are optional)
  if (tops.length === 0 || footwear.length === 0) {
    console.warn('Insufficient products in essential categories (tops or footwear)');
    return [];
  }

  const hasBottoms = bottoms.length > 0;

  // Generate combinations using smart sampling
  const maxTops = Math.min(tops.length, 5);
  const maxBottoms = hasBottoms ? Math.min(bottoms.length, 8) : 1;
  const maxFootwear = Math.min(footwear.length, 6);
  const maxAccessories = Math.min(accessories.length, 4);

  for (let ti = 0; ti < maxTops && outfits.length < maxOutfits; ti++) {
    for (let bi = 0; bi < maxBottoms && outfits.length < maxOutfits; bi++) {
      for (let fi = 0; fi < maxFootwear && outfits.length < maxOutfits; fi++) {
        for (let ai = 0; ai < maxAccessories && outfits.length < maxOutfits; ai++) {
          const top = tops[ti];
          const bottom = hasBottoms ? bottoms[bi] : undefined;
          const foot = footwear[fi];
          const acc = accessories[ai] ? [accessories[ai]] : [];

          // Skip if we don't have the accessory and need one
          if (acc.length === 0 && accessories.length > 0) {
            acc.push(accessories[0]);
          }

          // Create combination key for deduplication
          const combKey = `${top.id}-${bottom?.id || 'no-bottom'}-${foot.id}-${acc.map(a => a.id).join(',')}`;
          if (seenCombinations.has(combKey)) continue;
          seenCombinations.add(combKey);

          // Calculate outfit score
          const items = bottom ? [top, bottom, foot, ...acc] : [top, foot, ...acc];
          const { matchScore, scoreBreakdown } = calculateMatchScore(items, filters);

          // Only include outfits with reasonable scores
          if (matchScore < 0.4) continue;

          const outfit: Outfit = {
            id: `outfit_${outfits.length + 1}`,
            top,
            bottom,
            footwear: foot,
            accessories: acc,
            matchScore,
            scoreBreakdown,
            totalPrice: items.reduce((sum, i) => sum + i.price, 0),
            dominantStyle: getDominantStyle(items),
            suitableOccasions: getSuitableOccasions(items),
            suitableSeasons: getSuitableSeasons(items),
          };

          outfits.push(outfit);
        }
      }
    }
  }

  // Sort by match score descending
  outfits.sort((a, b) => b.matchScore - a.matchScore);

  // Ensure diversity - don't return outfits that are too similar
  const diverseOutfits = ensureDiversity(outfits);

  return diverseOutfits;
}

function ensureDiversity(outfits: Outfit[]): Outfit[] {
  if (outfits.length <= 3) return outfits;

  const selected: Outfit[] = [];
  const usedBottoms = new Set<string>();
  const usedFootwear = new Set<string>();

  for (const outfit of outfits) {
    // Skip if too similar to already selected outfits
    const bottomId = outfit.bottom?.id || 'no-bottom';
    const footwearId = outfit.footwear.id;

    // Allow some repetition but not too much
    const bottomCount = Array.from(usedBottoms).filter(id => id === bottomId).length;
    const footwearCount = Array.from(usedFootwear).filter(id => id === footwearId).length;

    if (bottomCount >= 2 && footwearCount >= 2) {
      continue; // Skip this outfit, too similar
    }

    selected.push(outfit);
    usedBottoms.add(bottomId);
    usedFootwear.add(footwearId);

    if (selected.length >= 10) break; // Return top 10 diverse outfits
  }

  return selected;
}

function getQuickStyleScore(style1: string, style2: string): number {
  if (style1 === style2) return 1;

  const compatiblePairs: Record<string, string[]> = {
    streetwear: ['casual', 'athletic', 'vintage'],
    casual: ['streetwear', 'minimal', 'vintage'],
    athletic: ['streetwear', 'casual'],
    luxury: ['formal', 'minimal'],
    minimal: ['casual', 'luxury', 'formal'],
    formal: ['luxury', 'minimal'],
    vintage: ['casual', 'streetwear'],
  };

  if (compatiblePairs[style1]?.includes(style2)) {
    return 0.75;
  }

  return 0.5;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const data = await getPrecomputedData();
  return data.productById.get(id);
}

export async function getAllProducts(): Promise<Product[]> {
  const data = await getPrecomputedData();
  return Array.from(data.productById.values());
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const data = await getPrecomputedData();
  return data.productsByCategory.get(category) || [];
}
