import { useEffect } from 'react';
import { AlertCircle, ArrowRight, Minus, Plus, RotateCw, ShoppingBag, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  getGetCartQueryKey,
  getGetCurrentUserQueryKey,
  useGetCart,
  useGetCurrentUser,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { getAuthErrorMessage } from '@/lib/auth-utils';

function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4" data-testid="state-cart-loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-[1.25rem] border border-border bg-card p-4 sm:p-5">
          <div className="h-28 w-24 shrink-0 rounded-xl bg-muted sm:h-32 sm:w-28" />
          <div className="flex-1 space-y-3 pt-1"><div className="h-3 w-2/5 rounded-full bg-muted" /><div className="h-6 w-3/5 rounded-full bg-muted" /><div className="h-4 w-1/4 rounded-full bg-muted" /></div>
        </div>
      ))}
    </div>
  );
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const currentUser = useGetCurrentUser({
    query: { retry: false, queryKey: getGetCurrentUserQueryKey() },
    request: { credentials: 'include' },
  });
  const cartQuery = useGetCart({
    query: { enabled: Boolean(currentUser.data), queryKey: getGetCartQueryKey() },
    request: { credentials: 'include' },
  });
  const updateItem = useUpdateCartItem({ request: { credentials: 'include' } });
  const removeItem = useRemoveCartItem({ request: { credentials: 'include' } });

  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);

  const syncCart = (cart: NonNullable<typeof cartQuery.data>) => {
    queryClient.setQueryData(getGetCartQueryKey(), cart);
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const busy = updateItem.isPending || removeItem.isPending;

  if (currentUser.isLoading) {
    return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 lg:px-12"><CartSkeleton /></div></main>;
  }

  if (currentUser.isError || !currentUser.data) return null;

  if (cartQuery.isLoading) {
    return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 lg:px-12"><CartSkeleton /></div></main>;
  }

  if (cartQuery.isError) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader />
        <div className="mx-auto max-w-[620px] px-5 py-24 text-center sm:px-8" role="alert" data-testid="state-cart-error">
          <AlertCircle className="mx-auto text-destructive" size={30} strokeWidth={1.4} />
          <h1 className="mt-5 text-4xl tracking-[-.05em] text-primary">Your basket is taking a moment.</h1>
          <p className="mt-3 text-sm leading-6 text-primary/60">{getAuthErrorMessage(cartQuery.error, 'We could not load your cart right now.')}</p>
          <button type="button" onClick={() => cartQuery.refetch()} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="button-retry-cart"><RotateCw size={14} /> Try again</button>
        </div>
      </main>
    );
  }

  const cart = cartQuery.data;
  const hasItems = Boolean(cart?.items.length);

  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader showBack backLabel="Continue shopping" />
      <div className="relative z-10 mx-auto max-w-[1080px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">Your saved finds</p>
            <h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-cart">Your <span className="font-display italic text-secondary">basket.</span></h1>
            <p className="mt-5 text-[15px] text-primary/60" data-testid="text-cart-count">{cart?.itemCount ?? 0} {cart?.itemCount === 1 ? 'piece' : 'pieces'} waiting for you.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-3 text-[12px] font-semibold text-primary transition-colors hover:bg-muted sm:self-auto" data-testid="link-cart-continue-top">Continue shopping <ArrowRight size={14} /></Link>
        </div>

        {!hasItems ? (
          <section className="mt-14 rounded-[1.5rem] border border-border bg-card px-6 py-20 text-center sm:px-10" data-testid="state-cart-empty">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 text-primary"><ShoppingBag size={24} strokeWidth={1.5} /></span>
            <h2 className="mt-6 font-display text-4xl italic text-primary">Nothing in here yet.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-primary/60">The best baskets start with a little wandering. Find something made to keep.</p>
            <Link href="/products" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="link-cart-empty-browse">Browse the collection <ArrowRight size={14} /></Link>
          </section>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
            <section className="space-y-4" aria-label="Cart items">
              {cart?.items.map((item) => {
                const atLimit = item.quantity >= item.stock;
                return (
                  <article key={item.id} className="relative flex gap-4 rounded-[1.25rem] border border-border bg-card p-4 sm:gap-5 sm:p-5" data-testid={`cart-item-${item.id}`}>
                    <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#dfc58f] sm:h-32 sm:w-28">
                      {item.productImage ? <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" data-testid={`img-cart-item-${item.id}`} /> : <div className="flex h-full items-center justify-center"><ShoppingBag size={24} className="text-primary/30" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary/45">{item.sellerName}</p>
                      <h2 className="mt-2 truncate text-lg font-semibold tracking-[-.04em] text-primary" data-testid={`text-cart-item-name-${item.id}`}>{item.productName}</h2>
                      <p className="mt-1 font-mono text-sm text-primary/70" data-testid={`text-cart-item-price-${item.id}`}>${item.unitPrice.toFixed(2)} each</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-border bg-background" aria-label={`Quantity for ${item.productName}`}>
                          <button type="button" disabled={busy || item.quantity <= 1} onClick={() => updateItem.mutate({ id: item.id, data: { quantity: item.quantity - 1 } }, { onSuccess: syncCart })} className="flex h-8 w-8 items-center justify-center rounded-full text-primary/65 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Decrease quantity of ${item.productName}`} data-testid={`button-cart-decrease-${item.id}`}><Minus size={13} /></button>
                          <span className="w-8 text-center font-mono text-xs text-primary" data-testid={`text-cart-quantity-${item.id}`}>{item.quantity}</span>
                          <button type="button" disabled={busy || atLimit} onClick={() => updateItem.mutate({ id: item.id, data: { quantity: item.quantity + 1 } }, { onSuccess: syncCart })} className="flex h-8 w-8 items-center justify-center rounded-full text-primary/65 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Increase quantity of ${item.productName}`} data-testid={`button-cart-increase-${item.id}`}><Plus size={13} /></button>
                        </div>
                        <span className="font-mono text-sm text-primary" data-testid={`text-cart-subtotal-${item.id}`}>${item.subtotal.toFixed(2)}</span>
                      </div>
                      {atLimit && <p className="mt-2 text-[10px] text-primary/50">Only {item.stock} available</p>}
                    </div>
                    <button type="button" disabled={busy} onClick={() => removeItem.mutate({ id: item.id }, { onSuccess: syncCart })} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-primary/40 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-35 sm:right-4 sm:top-4" aria-label={`Remove ${item.productName}`} title="Remove item" data-testid={`button-cart-remove-${item.id}`}><Trash2 size={15} /></button>
                  </article>
                );
              })}
              {updateItem.isError && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[12px] text-destructive" role="alert" data-testid="state-cart-update-error">{getAuthErrorMessage(updateItem.error, 'That quantity is not available. Please choose another amount.')}</p>}
              {removeItem.isError && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[12px] text-destructive" role="alert" data-testid="state-cart-remove-error">{getAuthErrorMessage(removeItem.error, 'We could not remove that item. Please try again.')}</p>}
            </section>
            <aside className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:p-7 lg:sticky lg:top-6">
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary-foreground/55">A good little total</p>
              <div className="mt-8 flex items-end justify-between border-b border-primary-foreground/15 pb-5"><span className="text-sm text-primary-foreground/65">Subtotal</span><span className="font-mono text-2xl" data-testid="text-cart-total">${(cart?.total ?? 0).toFixed(2)}</span></div>
              <p className="mt-5 text-[12px] leading-5 text-primary-foreground/60">Shipping and payment stay out of the way for this demo checkout.</p>
              <Link href="/checkout" className="mt-7 flex min-h-13 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[13px] font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5" data-testid="link-cart-checkout">Review order <ArrowRight size={15} /></Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}