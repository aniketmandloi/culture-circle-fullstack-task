import { Outfit } from '@/types/outfit';
import { loadProducts } from '@/lib/data-loader';
import { precomputeData, PrecomputedData } from './precompute';

// Module-level cache (persists across requests in same server instance)
let cachedData: PrecomputedData | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getPrecomputedData(): Promise<PrecomputedData> {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return cachedData;
  }

  // Load and precompute
  const products = loadProducts();
  cachedData = precomputeData(products);
  cacheTimestamp = now;

  return cachedData;
}

// Request-level cache for outfit results
interface CachedOutfit {
  outfits: Outfit[];
  timestamp: number;
}

const outfitCache = new Map<string, CachedOutfit>();
const OUTFIT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

export function getCachedOutfits(cacheKey: string): Outfit[] | null {
  const cached = outfitCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < OUTFIT_CACHE_TTL) {
    return cached.outfits;
  }
  return null;
}

export function setCachedOutfits(cacheKey: string, outfits: Outfit[]): void {
  // LRU-style eviction when cache is full
  if (outfitCache.size >= MAX_CACHE_SIZE) {
    const entries = Array.from(outfitCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20% of entries
    const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < toRemove; i++) {
      outfitCache.delete(entries[i][0]);
    }
  }

  outfitCache.set(cacheKey, { outfits, timestamp: Date.now() });
}

export function generateCacheKey(baseProductId: string, filters: object): string {
  return `${baseProductId}-${JSON.stringify(filters)}`;
}

export function clearCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
  outfitCache.clear();
}

export type { PrecomputedData } from './precompute';
