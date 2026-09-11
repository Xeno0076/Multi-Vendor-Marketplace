import { ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { AuthHeaderActions } from '@/components/auth-header-actions';

type MarketplaceHeaderProps = {
  backLabel?: string;
  showBack?: boolean;
};

export function MarketplaceHeader({ backLabel = 'Back to collection', showBack = false }: MarketplaceHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              href="/products"
              className="flex h-9 items-center gap-2 rounded-full border border-border px-3 text-[11px] font-semibold text-primary transition-colors hover:bg-muted"
              data-testid="link-back-products"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-marketly-logo">
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[11px] bg-primary text-primary-foreground">
              <span className="absolute h-5 w-5 rotate-45 rounded-full border border-accent" />
              <span className="relative font-serif text-xl leading-none">m</span>
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.04em]">marketly</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Link
            href="/products"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold text-primary/70 transition-colors hover:bg-muted hover:text-primary sm:flex"
            data-testid="link-header-browse"
          >
            <Search size={15} strokeWidth={1.8} />
            Browse goods
          </Link>
          <AuthHeaderActions />
          <button
            type="button"
            disabled
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-muted/70 text-primary/45"
            aria-label="Cart coming soon"
            title="Cart coming soon"
            data-testid="button-cart-disabled"
          >
            <ShoppingBag size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}