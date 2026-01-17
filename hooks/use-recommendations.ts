'use client';

import useSWR from 'swr';
import { OutfitRequest, OutfitResponse } from '@/types/outfit';

const fetcher = async (url: string, request: OutfitRequest) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch recommendations');
  }

  return res.json();
};

export function useRecommendations(request: OutfitRequest | null) {
  const { data, error, isLoading, mutate } = useSWR<OutfitResponse>(
    request ? ['/api/recommendations', request] : null,
    ([url, req]) => fetcher(url, req as OutfitRequest),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    outfits: data?.outfits || [],
    baseProduct: data?.baseProduct,
    processingTime: data?.processingTimeMs,
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
