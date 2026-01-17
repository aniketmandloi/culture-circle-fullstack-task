'use client';

import useSWR from 'swr';
import { Product, ProductCategory } from '@/types/product';

interface ProductsResponse {
  products: Product[];
  total: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

export function useProducts(category?: ProductCategory) {
  const url = category ? `/api/products?category=${category}` : '/api/products';

  const { data, error, isLoading } = useSWR<ProductsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    products: data?.products || [],
    total: data?.total || 0,
    isLoading,
    error: error as Error | undefined,
  };
}
