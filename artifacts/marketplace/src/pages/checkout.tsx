import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, LoaderCircle, Package, RotateCw, ShoppingBag } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  getGetCartQueryKey,
  getGetCurrentUserQueryKey,
  getListOrdersQueryKey,
  useClearCart,
  useCreateOrder,
  useGetCart,
  useGetCurrentUser,
  type Order,
} from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { getAuthErrorMessage } from '@/lib/auth-utils';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const currentUser = useGetCurrentUser({ query: { retry: false, queryKey: getGetCurrentUserQueryKey() }, request: { credentials: 'include' } });
  const cartQuery = useGetCart({ query: { enabled: Boolean(currentUser.data), queryKey: getGetCartQueryKey() }, request: { credentials: 'include' } });
  const createOrder = useCreateOrder({ request: { credentials: 'include' } });
  const clearCart = useClearCart({ request: { credentials: 'include' } });

  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);

  const placeOrder = () => {
    createOrder.mutate({ data: {} }, {
      onSuccess: (order) => {
        clearCart.mutate(undefined, {
          onSettled: () => {
            queryClient.setQueryData(getGetCartQueryKey(), { id: cartQuery.data?.id ?? 0, items: [], itemCount: 0, total: 0 });
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
            setPlacedOrder(order);
          },
        });
      },
    });
  };

  if (currentUser.isLoading) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[920px] animate-pulse px-5 py-16 sm:px-8"><div className="h-16 w-2/3 rounded-full bg-muted" /><div className="mt-12 h-80 rounded-[1.5rem] bg-muted" /></div></main>;
  if (currentUser.isError || !currentUser.data) return null;
  if (cartQuery.isLoading) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[920px] animate-pulse px-5 py-16 sm:px-8"><div className="h-16 w-2/3 rounded-full bg-muted" /><div className="mt-12 h-80 rounded-[1.5rem] bg-muted" /></div></main>;

  if (cartQuery.isError) {
    return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[620px] px-5 py-24 text-center" role="alert" data-testid="state-checkout-error"><AlertCircle className="mx-auto text-destructive" size={30} /><h1 className="mt-5 text-4xl tracking-[-.05em] text-primary">Checkout needs a reset.</h1><p className="mt-3 text-sm text-primary/60">{getAuthErrorMessage(cartQuery.error, 'We could not load your order summary.')}</p><button type="button" onClick={() => cartQuery.refetch()} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="button-retry-checkout"><RotateCw size={14} /> Try again</button></div></main>;
  }

  if (placedOrder) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader />
        <section className="mx-auto max-w-[680px] px-5 py-20 text-center sm:px-8 sm:py-28">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/25 text-primary"><Check size={28} /></span>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[.2em] text-primary/50">Order {placedOrder.id} is in motion</p>
          <h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-order-success">A good choice, <span className="font-display italic text-secondary">made.</span></h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-7 text-primary/65">Your order has been saved. No payment was taken — this demo keeps the good part: finding something worth keeping.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/orders" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="link-success-orders">See your orders <ArrowRight size={14} /></Link><Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-[12px] font-semibold text-primary" data-testid="link-success-browse">Keep browsing</Link></div>
        </section>
      </main>
    );
  }

  const cart = cartQuery.data;
  const empty = !cart?.items.length;
  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader showBack backLabel="Back to basket" />
      <div className="mx-auto max-w-[1000px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">The final look</p>
        <h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-checkout">Review your <span className="font-display italic text-secondary">order.</span></h1>
        <p className="mt-5 max-w-md text-[15px] leading-6 text-primary/60">A quiet, payment-free checkout. Look it over, then place the order when it feels right.</p>
        {empty ? (
          <section className="mt-12 rounded-[1.5rem] border border-border bg-card px-6 py-16 text-center" data-testid="state-checkout-empty"><ShoppingBag className="mx-auto text-secondary" size={28} /><h2 className="mt-5 font-display text-3xl italic text-primary">Your basket is empty.</h2><Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="link-checkout-empty-browse">Find something good <ArrowRight size={14} /></Link></section>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
            <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7" aria-labelledby="summary-heading">
              <div className="flex items-center justify-between border-b border-border pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary/45">Order summary</p><h2 id="summary-heading" className="mt-2 text-2xl tracking-[-.05em] text-primary">Your selected pieces</h2></div><Package size={21} className="text-secondary" /></div>
              <div className="divide-y divide-border">{cart?.items.map((item) => <div key={item.id} className="flex items-center gap-4 py-5" data-testid={`checkout-item-${item.id}`}><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#dfc58f]">{item.productImage ? <img src={item.productImage} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="mx-auto mt-5 text-primary/30" size={18} />}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-primary">{item.productName}</h3><p className="mt-1 text-[11px] text-primary/50">{item.sellerName} · Qty {item.quantity}</p></div><span className="font-mono text-sm text-primary">${item.subtotal.toFixed(2)}</span></div>)}</div>
            </section>
            <aside className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:p-7 lg:sticky lg:top-6"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary-foreground/55">Demo checkout</p><div className="mt-8 flex items-end justify-between border-b border-primary-foreground/15 pb-5"><span className="text-sm text-primary-foreground/65">Total</span><span className="font-mono text-2xl" data-testid="text-checkout-total">${(cart?.total ?? 0).toFixed(2)}</span></div><p className="mt-5 text-[12px] leading-5 text-primary-foreground/60">No card details, shipping address, or real payment required.</p><button type="button" onClick={placeOrder} disabled={createOrder.isPending || clearCart.isPending} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-[13px] font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-place-order">{createOrder.isPending || clearCart.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Saving your order</> : <>Place order <ArrowRight size={15} /></>}</button>{createOrder.isError && <p className="mt-4 text-[12px] leading-5 text-red-100" role="alert" data-testid="state-place-order-error">{getAuthErrorMessage(createOrder.error, 'We could not place that order. Please try again.')}</p>}</aside>
          </div>
        )}
        <Link href="/cart" className="mt-8 inline-flex items-center gap-2 text-[12px] font-semibold text-primary/60 hover:text-primary" data-testid="link-checkout-back-cart"><ArrowLeft size={14} /> Edit basket</Link>
      </div>
    </main>
  );
}