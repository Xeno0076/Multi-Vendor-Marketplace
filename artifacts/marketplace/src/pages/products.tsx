import { useMemo, useState } from 'react';
import { AlertCircle, RotateCw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useListCategories, useListProducts, type Category } from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';

function CategorySkeleton() {
  return <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[1.5rem] border border-destructive/25 bg-destructive/5 px-6 py-16 text-center" role="alert" data-testid="state-products-error">
      <AlertCircle className="text-destructive" size={24} strokeWidth={1.5} />
      <h2 className="mt-4 text-xl font-semibold text-primary">The collection is taking a breather.</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-primary/60">We couldn&apos;t load the goods right now. Give it another try in a moment.</p>
      <button type="button" onClick={onRetry} className="mt-5 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-retry-products">
        <RotateCw size={14} />
        Try again
      </button>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const params = useMemo(() => ({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(selectedCategory ? { categoryId: selectedCategory } : {}),
  }), [search, selectedCategory]);

  const productsQuery = useListProducts(params);
  const categoriesQuery = useListCategories();
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(undefined);
  };

  const categoryButton = (category: Category) => (
    <button
      key={category.id}
      type="button"
      onClick={() => setSelectedCategory(selectedCategory === category.id ? undefined : category.id)}
      className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${selectedCategory === category.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-primary/70 hover:border-primary/40 hover:bg-muted'}`}
      aria-pressed={selectedCategory === category.id}
      data-testid={`button-category-${category.id}`}
    >
      {category.name}
    </button>
  );

  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader />
      <div className="relative z-10">
        <section className="mx-auto max-w-[1320px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="max-w-[680px]">
            <p className="reveal-up mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">The Marketly edit</p>
            <h1 className="reveal-up reveal-delay-1 text-[clamp(3.1rem,7vw,6.4rem)] leading-[.88] tracking-[-.065em] text-primary" data-testid="heading-products">
              Good things, <span className="font-display italic text-secondary">sorted.</span>
            </h1>
            <p className="reveal-up reveal-delay-2 mt-6 max-w-[510px] text-[16px] leading-6 text-primary/65 sm:text-[18px]">
              A considered collection from independent makers. Start with a feeling, a name, or a category.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 lg:px-12" aria-label="Product collection">
          <div className="mb-8 rounded-[1.35rem] border border-border bg-card/70 p-3 shadow-[0_10px_35px_rgba(30,62,55,.04)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative flex min-h-11 flex-1 items-center rounded-full bg-muted px-4" htmlFor="product-search">
                <Search size={16} className="mr-3 shrink-0 text-primary/45" />
                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by product name..."
                  className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-primary/40"
                  data-testid="input-product-search"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="flex h-7 w-7 items-center justify-center rounded-full text-primary/50 hover:bg-background" aria-label="Clear product search" data-testid="button-clear-search">
                    <X size={14} />
                  </button>
                )}
              </label>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-[12px] font-semibold text-primary lg:hidden"
                aria-expanded={mobileFiltersOpen}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal size={15} />
                Categories
              </button>
              <div className={`${mobileFiltersOpen ? 'flex' : 'hidden'} flex-wrap gap-2 lg:flex`}>
                {categoriesQuery.isLoading ? (
                  <><CategorySkeleton /><CategorySkeleton /></>
                ) : categories.map(categoryButton)}
              </div>
            </div>
            {(search || selectedCategory) && (
              <div className="flex items-center justify-between px-2 pt-3 text-[11px] text-primary/55">
                <span data-testid="text-filter-summary">{productsQuery.isLoading ? 'Finding goods...' : `${products.length} ${products.length === 1 ? 'find' : 'finds'} in this edit`}</span>
                <button type="button" onClick={clearFilters} className="font-semibold text-primary underline-offset-4 hover:underline" data-testid="button-clear-filters">Clear filters</button>
              </div>
            )}
          </div>

          {categoriesQuery.isError && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-[12px] text-primary/70" role="status" data-testid="state-categories-error">
              <span>Categories are unavailable, but you can still search the collection.</span>
              <button type="button" onClick={() => categoriesQuery.refetch()} className="font-semibold text-primary underline" data-testid="button-retry-categories">Retry</button>
            </div>
          )}

          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {productsQuery.isLoading && Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)}
            {productsQuery.isError && <ErrorState onRetry={() => productsQuery.refetch()} />}
            {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
              <div className="col-span-full rounded-[1.5rem] border border-border bg-muted/50 px-6 py-20 text-center" data-testid="state-products-empty">
                <p className="font-display text-4xl italic text-primary">Nothing here yet.</p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-primary/60">Try a different search or clear the category filter. The right little thing may be just around the corner.</p>
                <button type="button" onClick={clearFilters} className="mt-6 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="button-reset-empty-products">See the full edit</button>
              </div>
            )}
            {!productsQuery.isLoading && !productsQuery.isError && products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      </div>
    </main>
  );
}