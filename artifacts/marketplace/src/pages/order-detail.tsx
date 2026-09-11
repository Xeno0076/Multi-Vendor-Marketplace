import { useEffect } from 'react';
import { AlertCircle, ArrowLeft, Check, Package, RotateCw } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetCurrentUserQueryKey, getGetOrderQueryKey, useGetCurrentUser, useGetOrder } from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { getAuthErrorMessage } from '@/lib/auth-utils';

export default function OrderDetail() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const orderId = Number(params.id);
  const validId = Number.isInteger(orderId) && orderId > 0;
  const currentUser = useGetCurrentUser({ query: { retry: false, queryKey: getGetCurrentUserQueryKey() }, request: { credentials: 'include' } });
  const orderQuery = useGetOrder(validId ? orderId : 0, { query: { enabled: Boolean(currentUser.data) && validId, queryKey: getGetOrderQueryKey(validId ? orderId : 0) }, request: { credentials: 'include' } });

  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);

  if (currentUser.isLoading || (currentUser.data && orderQuery.isLoading)) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader showBack backLabel="Order history" /><div className="mx-auto max-w-[900px] animate-pulse px-5 py-16 sm:px-8"><div className="h-5 w-24 rounded-full bg-muted" /><div className="mt-5 h-16 w-3/4 rounded-full bg-muted" /><div className="mt-12 h-72 rounded-[1.5rem] bg-muted" /></div></main>;
  if (currentUser.isError || !currentUser.data) return null;
  if (!validId || orderQuery.isError || !orderQuery.data) return <main className="marketly-grain min-h-[100dvh] bg-background"><MarketplaceHeader showBack backLabel="Order history" /><div className="mx-auto max-w-[620px] px-5 py-24 text-center" role="alert" data-testid="state-order-detail-error"><AlertCircle className="mx-auto text-destructive" size={28} /><h1 className="mt-5 text-3xl tracking-[-.05em] text-primary">That order is out of reach.</h1><p className="mt-3 text-sm text-primary/60">{getAuthErrorMessage(orderQuery.error, 'We could not find this order.')}</p><div className="mt-7 flex justify-center gap-2"><button type="button" onClick={() => orderQuery.refetch()} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-[12px] font-semibold text-primary" data-testid="button-retry-order-detail"><RotateCw size={14} /> Try again</button><Link href="/orders" className="rounded-full bg-primary px-5 py-3 text-[12px] font-semibold text-primary-foreground" data-testid="link-order-detail-back">Order history</Link></div></div></main>;

  const order = orderQuery.data;
  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader showBack backLabel="Order history" />
      <div className="mx-auto max-w-[900px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <Link href="/orders" className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary/60 hover:text-primary" data-testid="link-order-detail-breadcrumb"><ArrowLeft size={14} /> All orders</Link>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/50">Order #{order.id}</p><h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-order-detail">A find worth <span className="font-display italic text-secondary">keeping.</span></h1></div><div className="rounded-full bg-secondary/20 px-4 py-2 text-[12px] font-semibold capitalize text-primary" data-testid="status-order-detail"><Check size={14} className="mr-1 inline" /> {order.status}</div></div>
        <p className="mt-6 text-sm text-primary/60" data-testid="text-order-detail-date">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <section className="mt-10 rounded-[1.5rem] border border-border bg-card p-5 sm:p-7" aria-labelledby="detail-items-heading"><div className="flex items-center gap-3 border-b border-border pb-5"><Package size={20} className="text-secondary" /><h2 id="detail-items-heading" className="text-xl tracking-[-.04em] text-primary">What&apos;s in the order</h2></div><div className="divide-y divide-border">{order.items.map((item) => <div key={item.id} className="flex items-center gap-4 py-5" data-testid={`order-detail-item-${item.id}`}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-mono text-xs text-primary">{item.quantity}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-primary">{item.productName}</h3><p className="mt-1 text-[11px] text-primary/50">{item.sellerName} · ${item.price.toFixed(2)} each</p></div><span className="font-mono text-sm text-primary">${item.subtotal.toFixed(2)}</span></div>)}</div><div className="mt-2 flex items-center justify-between border-t border-border pt-5"><span className="text-sm font-semibold text-primary">Order total</span><span className="font-mono text-xl text-primary" data-testid="text-order-detail-total">${order.totalAmount.toFixed(2)}</span></div></section>
      </div>
    </main>
  );
}