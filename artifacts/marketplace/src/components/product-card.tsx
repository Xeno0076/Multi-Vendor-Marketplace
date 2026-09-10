import { ArrowUpRight, Package } from 'lucide-react';
import { Link } from 'wouter';
import type { MarketplaceProduct } from '@workspace/api-client-react';

function ProductImage({ product, large = false }: { product: MarketplaceProduct; large?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[#e2c995] ${large ? 'h-full min-h-[360px] sm:min-h-[520px]' : 'aspect-[1.05]'}`}>
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          data-testid={`img-product-${product.id}`}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#d9c294]" data-testid={`img-product-placeholder-${product.id}`}>
          <Package size={42} strokeWidth={1} className="text-primary/35" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-70" />
      {product.stock === 0 && (
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.15em] text-primary-foreground">
          Sold out
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  const isUnavailable = product.stock === 0;

  return (
    <article className="group" data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`} className="block" data-testid={`link-product-${product.id}`}>
        <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-[0_10px_30px_rgba(30,62,55,.05)] transition-transform duration-300 group-hover:-translate-y-1">
          <ProductImage product={product} />
        </div>
        <div className="flex items-start justify-between gap-4 px-1 pt-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary/50" data-testid={`text-category-${product.id}`}>
              {product.categoryName}
            </p>
            <h2 className="mt-1.5 truncate text-[17px] font-semibold tracking-[-.035em] text-primary" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h2>
            <p className="mt-1 text-[12px] text-primary/55" data-testid={`text-seller-${product.id}`}>
              by {product.sellerName}
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-all group-hover:-rotate-45 group-hover:bg-accent" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
        </div>
        <div className="flex items-center justify-between px-1 pt-3 text-primary">
          <span className="font-mono text-[12px] tracking-[-.02em]" data-testid={`text-price-${product.id}`}>
            ${product.price.toFixed(2)}
          </span>
          <span className={`font-mono text-[9px] uppercase tracking-[.12em] ${isUnavailable ? 'text-destructive' : 'text-primary/45'}`} data-testid={`status-stock-${product.id}`}>
            {isUnavailable ? 'Unavailable' : `${product.stock} available`}
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading product">
      <div className="aspect-[1.05] rounded-[1.25rem] bg-muted" />
      <div className="mt-4 h-2.5 w-20 rounded-full bg-muted" />
      <div className="mt-2 h-5 w-3/4 rounded-full bg-muted" />
      <div className="mt-2 h-3 w-1/3 rounded-full bg-muted" />
    </div>
  );
}