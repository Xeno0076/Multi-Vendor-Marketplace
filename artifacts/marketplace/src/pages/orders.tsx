import { useEffect } from 'react';
import { AlertCircle, ArrowRight, ClipboardList, RotateCw } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useListOrders } from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { getAuthErrorMessage } from '@/lib/auth-utils';

export default function Orders() {
  const [, setLocation] = useLocation();
  const currentUser = useGetCurrentUser({ query: { retry: false, queryKey: getGetCurrentUserQueryKey() }, request: { credentials: 'include' } });
  const ordersQuery = useListOrders({ query: { enabled: Boolean(currentUser.data), queryKey: ['/api/orders'] }, request: { credentials: 'include' } });

  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);

  if (currentUser.isLoading) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[1000px] animate-pulse px-5 py-16 sm:px-8"><div className="h-16 w-2/3 rounded-full bg-muted" /><div className="mt-12 h-56 rounded-[1.5rem] bg-muted" /></div></main>;
  if (currentUser.isError || !currentUser.data) return null;
  if (ordersQuery.isLoading) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader /><div className="mx-auto max-w-[1000px] animate-pulse px-5 py-16 sm:px-8"><div className="h-16 w-2/3 rounded-full bg-muted" /><div className="mt-12 space-y-3"><div className="h-24 rounded-[1.25rem] bg-muted" /><div className="h-24 rounded-[1.25rem] bg-muted" /></div></div></main>;

  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader />
      <div className="mx-auto max-w-[1000px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">Your Marketly archive</p>
        <h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-orders">Things you chose to <span className="font-display italic text-secondary">keep.</span></h1>
        <p className="mt-5 text-[15px] text-primary/60">A record of the good finds that made it home.</p>
        {ordersQuery.isError ? (
          <div className="mt-12 rounded-[1.5rem] border border-destructive/25 bg-destructive/5 px-6 py-16 text-center" role="alert" data-testid="state-orders-error"><AlertCircle className="mx-auto text-destructive" size={28} /><h2 className="mt-5 text-2xl tracking-[-.04em] text-primary">Your archive is resting.</h2><p className="mt-2 text-sm text-primary/60">{getAuthErrorMessage(ordersQuery.error, 'We could not load your orders.')}</p><button type="button" onClick={() => ordersQuery.refetch()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="button-retry-orders"><RotateCw size={14} /> Try again</button></div>
        ) : !ordersQuery.data?.length ? (
          <section className="mt-12 rounded-[1.5rem] border border-border bg-card px-6 py-20 text-center" data-testid="state-orders-empty"><ClipboardList className="mx-auto text-secondary" size={28} /><h2 className="mt-5 font-display text-4xl italic text-primary">No orders yet.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-primary/60">When something finds its way into your basket and then home, it will show up here.</p><Link href="/products" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="link-orders-browse">Browse the collection <ArrowRight size={14} /></Link></section>
        ) : (
          <section className="mt-12 space-y-3" aria-label="Order history">
            {ordersQuery.data.map((order) => (
              <Link href={`/orders/${order.id}`} key={order.id} className="group block rounded-[1.25rem] border border-border bg-card p-5 transition-transform hover:-translate-y-0.5 sm:p-6" data-testid={`link-order-${order.id}`}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-primary/45">Order #{order.id}</p><p className="mt-2 text-sm text-primary/65" data-testid={`text-order-date-${order.id}`}>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div className="flex items-center gap-4 sm:gap-8"><div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-primary/45">Status</p><p className="mt-2 text-sm font-semibold capitalize text-primary" data-testid={`status-order-${order.id}`}>{order.status}</p></div><div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-primary/45">Total</p><p className="mt-2 font-mono text-sm text-primary" data-testid={`text-order-total-${order.id}`}>${order.totalAmount.toFixed(2)}</p></div><ArrowRight size={17} className="text-primary/35 transition-transform group-hover:translate-x-1" /></div></div>
                <p className="mt-5 border-t border-border pt-4 text-[12px] text-primary/55" data-testid={`text-order-items-${order.id}`}>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(' · ')}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}