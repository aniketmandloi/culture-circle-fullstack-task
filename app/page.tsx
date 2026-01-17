'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/use-products';
import { useRecommendations } from '@/hooks/use-recommendations';
import { ProductGrid } from '@/components/products/product-grid';
import { OutfitDisplay } from '@/components/outfits/outfit-display';
import { OutfitFiltersForm } from '@/components/filters/outfit-filters';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product, ProductCategory } from '@/types/product';
import { OutfitFilters, OutfitRequest } from '@/types/outfit';
import { Shirt, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
    'top'
  );
  const [outfitFilters, setOutfitFilters] = useState<OutfitFilters>({});

  const { products, isLoading: productsLoading } = useProducts(
    categoryFilter === 'all' ? undefined : categoryFilter
  );

  // Filter to show only tops by default for selection
  const selectableProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  // Build recommendation request
  const recommendationRequest: OutfitRequest | null = selectedProduct
    ? {
        baseProductId: selectedProduct.id,
        filters: outfitFilters,
        count: 5,
      }
    : null;

  const {
    outfits,
    processingTime,
    isLoading: outfitsLoading,
    error: outfitsError,
  } = useRecommendations(recommendationRequest);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shirt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Outfit Recommender</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered outfit suggestions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Product Selection Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Select a Product</h2>
                  <p className="text-muted-foreground">
                    Choose a base product to build your outfit around
                  </p>
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) =>
                    setCategoryFilter(v as ProductCategory | 'all')
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Tops</SelectItem>
                    <SelectItem value="bottom">Bottoms</SelectItem>
                    <SelectItem value="footwear">Footwear</SelectItem>
                    <SelectItem value="accessory">Accessories</SelectItem>
                    <SelectItem value="all">All Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid
                  products={selectableProducts.slice(0, 12)}
                  selectedId={selectedProduct?.id}
                  onSelect={setSelectedProduct}
                />
              )}

              {selectableProducts.length > 12 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing 12 of {selectableProducts.length} products
                </p>
              )}
            </section>

            {/* Selected Product & Recommendations */}
            {selectedProduct && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">Outfit Recommendations</h2>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-sm">
                    Based on: {selectedProduct.title.slice(0, 30)}...
                  </Badge>
                </div>

                {/* Selected Product Preview */}
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Selected Base Product</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 shrink-0">
                      <ProductCard
                        product={selectedProduct}
                        showDetails={false}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedProduct.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedProduct.brand} • {selectedProduct.style}
                      </p>
                      <p className="text-lg font-bold mt-1">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {selectedProduct.colors.map((color) => (
                          <Badge
                            key={color}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                {/* Outfit Recommendations */}
                {outfitsError ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading recommendations</p>
                    <p className="text-sm">{outfitsError.message}</p>
                  </div>
                ) : (
                  <OutfitDisplay
                    outfits={outfits}
                    isLoading={outfitsLoading}
                    processingTime={processingTime}
                  />
                )}
              </section>
            )}

            {!selectedProduct && (
              <div className="text-center py-16 bg-white rounded-lg border">
                <Shirt className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mt-4">
                  Select a Product to Get Started
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Choose a product from above to generate AI-powered outfit
                  recommendations that match your style.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <OutfitFiltersForm
              onFiltersChange={setOutfitFilters}
              maxPrice={100000}
              initialFilters={outfitFilters}
            />

            {/* Stats */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products Available</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                {selectedProduct && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outfits Generated</span>
                      <span className="font-medium">{outfits.length}</span>
                    </div>
                    {processingTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium text-green-600">
                          {processingTime}ms
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">How it Works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Select a base product (top, bottom, etc.)</li>
                <li>2. Adjust filters for occasion, season, budget</li>
                <li>3. Get AI-matched complete outfits</li>
                <li>4. View score breakdown for each outfit</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AI-Powered Outfit Recommendation System</p>
          <p className="mt-1">
            Built with Next.js 14, TypeScript, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
