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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Shirt, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
    'top'
  );
  const [outfitFilters, setOutfitFilters] = useState<OutfitFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { products, isLoading: productsLoading } = useProducts(
    categoryFilter === 'all' ? undefined : categoryFilter
  );

  // Filter to show only tops by default for selection
  const selectableProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(selectableProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return selectableProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [selectableProducts, currentPage, itemsPerPage]);

  // Reset page when category or items per page changes
  const handleCategoryChange = (value: ProductCategory | 'all') => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary-background border-b-2 border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-main border-2 border-border rounded-base shadow-shadow">
                <Shirt className="h-6 w-6 text-main-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-heading">Outfit Recommender</h1>
                <p className="text-xs text-muted-foreground">
                  AI-powered outfit suggestions
                </p>
              </div>
            </div>
            <ThemeToggle />
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
                  <h2 className="text-2xl font-heading">Select a Product</h2>
                  <p className="text-muted-foreground">
                    Choose a base product to build your outfit around
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => handleCategoryChange(v as ProductCategory | 'all')}
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
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} / page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  products={paginatedProducts}
                  selectedId={selectedProduct?.id}
                  onSelect={setSelectedProduct}
                />
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, selectableProducts.length)} of {selectableProducts.length} products
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {/* First page */}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          isActive={currentPage === 1}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {/* Ellipsis after first page */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Pages around current */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page !== 1 && page !== totalPages && Math.abs(page - currentPage) <= 1)
                        .map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {/* Ellipsis before last page */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last page */}
                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </section>

            {/* Selected Product & Recommendations */}
            {selectedProduct && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-heading">Outfit Recommendations</h2>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="neutral" className="text-sm">
                    Based on: {selectedProduct.title.slice(0, 30)}...
                  </Badge>
                </div>

                {/* Selected Product Preview */}
                <div className="bg-secondary-background rounded-base p-4 border-2 border-border shadow-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-main" />
                    <span className="text-sm font-heading">Selected Base Product</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 shrink-0">
                      <ProductCard
                        product={selectedProduct}
                        showDetails={false}
                      />
                    </div>
                    <div>
                      <h3 className="font-heading">{selectedProduct.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedProduct.brand} • {selectedProduct.style}
                      </p>
                      <p className="text-lg font-heading mt-1">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {selectedProduct.colors.map((color) => (
                          <Badge
                            key={color}
                            variant="neutral"
                            className="text-xs capitalize"
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="neutral"
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
                  <div className="text-center py-12 bg-secondary-background border-2 border-border rounded-base">
                    <p className="text-red-600 font-heading">Error loading recommendations</p>
                    <p className="text-sm text-muted-foreground">{outfitsError.message}</p>
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
              <div className="text-center py-16 bg-secondary-background rounded-base border-2 border-border shadow-shadow">
                <Shirt className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-heading mt-4">
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
            <div className="bg-secondary-background rounded-base p-4 border-2 border-border shadow-shadow">
              <h3 className="font-heading mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products Available</span>
                  <span className="font-heading">{products.length}</span>
                </div>
                {selectedProduct && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outfits Generated</span>
                      <span className="font-heading">{outfits.length}</span>
                    </div>
                    {processingTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-heading text-main">
                          {processingTime}ms
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-main/20 rounded-base p-4 border-2 border-border">
              <h3 className="font-heading mb-2">How it Works</h3>
              <ul className="text-sm space-y-1">
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
      <footer className="bg-secondary-background border-t-2 border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-heading">AI-Powered Outfit Recommendation System</p>
          <p className="mt-1">
            Built with Next.js 14, TypeScript, and Neobrutalism UI
          </p>
        </div>
      </footer>
    </div>
  );
}
