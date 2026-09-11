import { AlertCircle, ArrowLeft, Check, Package, RotateCw, ShoppingBag } from 'lucide-react';
import {
  getGetProductQueryKey,
  useGetProduct,
  useAddCartItem,
} from '@workspace/api-client-react';
import { Link, useParams } from 'wouter';
import { MarketplaceHeader } from '@/components/marketplace-header';

function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1320px] animate-pulse gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-12 lg:py-20" data-testid="state-product-loading">
      <div className="min-h-[390px] rounded-[1.5rem] bg-muted sm:min-h-[560px]" />
      <div className="flex flex-col justify-center">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="mt-5 h-14 w-4/5 rounded-full bg-muted" />
        <div className="mt-4 h-4 w-1/3 rounded-full bg-muted" />
        <div className="mt-10 h-24 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams<{ id?: string }>();
  const productId = Number(params.id);
  const validId = Number.isInteger(productId) && productId > 0;

  const productQuery = useGetProduct(validId ? productId : 0, {
    query: {
      enabled: validId,
      queryKey: getGetProductQueryKey(productId),
    },
  });
  
  const addToCart = useAddCartItem({
  request: {
    credentials: 'include',
  },
 });
  
  const product = productQuery.data;

  if (!validId) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader showBack />
        <div className="mx-auto max-w-[680px] px-5 py-24 text-center sm:px-8">
          <AlertCircle className="mx-auto text-secondary" size={30} strokeWidth={1.4} />
          <h1 className="mt-5 text-4xl tracking-[-.05em] text-primary">
            That piece isn&apos;t in the edit.
          </h1>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground"
            data-testid="link-invalid-product-back"
          >
            Browse the collection
          </Link>
        </div>
      </main>
    );
  }

  if (productQuery.isLoading) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader showBack />
        <DetailSkeleton />
      </main>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader showBack />
        <div
          className="mx-auto max-w-[680px] px-5 py-24 text-center"
          role="alert"
          data-testid="state-product-error"
        >
          <AlertCircle className="mx-auto text-destructive" size={30} strokeWidth={1.4} />

          <h1 className="mt-5 text-4xl tracking-[-.05em] text-primary">
            We couldn&apos;t find that one.
          </h1>

          <p className="mt-3 text-sm leading-6 text-primary/60">
            It may have moved on, or the collection is taking a moment to load.
          </p>

          <div className="mt-7 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => productQuery.refetch()}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-[12px] font-semibold text-primary"
              data-testid="button-retry-product"
            >
              <RotateCw size={14} />
              Try again
            </button>

            <Link
              href="/products"
              className="rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground"
              data-testid="link-error-products"
            >
              Back to collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const unavailable = product.stock === 0;

  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader showBack />

      <div className="relative z-10">
        <div className="mx-auto max-w-[1320px] px-5 pt-7 sm:px-8 lg:px-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary/60 hover:text-primary"
            data-testid="link-product-breadcrumb"
          >
            <ArrowLeft size={14} />
            All goods
          </Link>
        </div>

        <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-12 lg:py-16">
          <div
            className="group relative overflow-hidden rounded-[1.5rem] bg-[#dfc58f] shadow-[0_24px_60px_rgba(28,62,55,.11)]"
            data-testid={`image-product-detail-${product.id}`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full min-h-[390px] w-full object-cover sm:min-h-[560px]"
              />
            ) : (
              <div className="flex min-h-[390px] items-center justify-center sm:min-h-[560px]">
                <Package size={58} strokeWidth={1} className="text-primary/30" />
              </div>
            )}

            {unavailable && (
              <div className="absolute inset-x-0 bottom-0 bg-primary/90 px-5 py-4 text-center font-mono text-[10px] uppercase tracking-[.18em] text-primary-foreground">
                Currently sold out
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p
              className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/50"
              data-testid="text-detail-category"
            >
              {product.categoryName}
            </p>

            <h1
              className="mt-4 text-[clamp(2.8rem,5vw,5.5rem)] leading-[.88] tracking-[-.065em] text-primary"
              data-testid="heading-product-detail"
            >
              {product.name}
            </h1>

            <p
              className="mt-4 text-[13px] text-primary/55"
              data-testid="text-detail-seller"
            >
              Made by{' '}
              <span className="font-semibold text-primary">
                {product.sellerName}
              </span>
            </p>

            <p
              className="mt-8 max-w-[510px] text-[16px] leading-7 text-primary/70"
              data-testid="text-detail-description"
            >
              {product.description}
            </p>

            <div className="mt-9 flex items-end justify-between border-y border-border py-5">
              <span
                className="font-mono text-2xl tracking-[-.04em] text-primary"
                data-testid="text-detail-price"
              >
                ${product.price.toFixed(2)}
              </span>

              <span
                className={`font-mono text-[10px] uppercase tracking-[.14em] ${
                  unavailable ? 'text-destructive' : 'text-primary/50'
                }`}
                data-testid="status-detail-stock"
              >
                {unavailable ? 'Out of stock' : `${product.stock} available`}
              </span>
            </div>

  <button
  type="button"
  disabled={unavailable || addToCart.isPending}
  onClick={() => {
    addToCart.mutate({
      data: {
        productId: product.id,
        quantity: 1,
      },
    });
  }}
  className="mt-7 flex min-h-14 items-center justify-center gap-3 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-primary/35 disabled:hover:translate-y-0"
  data-testid="button-add-to-cart"

            >
              <ShoppingBag size={17} strokeWidth={1.8} />
    {unavailable
  ? 'Currently unavailable'
  : addToCart.isPending
    ? 'Adding...'
    : 'Add to cart'}
            </button>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-primary/55">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-secondary" />
                Independent maker
              </span>

              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-secondary" />
                Thoughtfully selected
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}