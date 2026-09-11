import { useEffect, useState } from 'react';
import { ArrowRight, LogOut, Mail, RotateCw, ShieldCheck, Store, UserRound } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogout } from '@workspace/api-client-react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { getAuthErrorMessage } from '@/lib/auth-utils';

export default function Account() {
  const [, setLocation] = useLocation();
  const [logoutIssue, setLogoutIssue] = useState('');
  const queryClient = useQueryClient();
  const currentUser = useGetCurrentUser({
    query: { retry: false, queryKey: getGetCurrentUserQueryKey() },
    request: { credentials: 'include' },
  });
  const logout = useLogout({ request: { credentials: 'include' } });

  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);

  const handleLogout = () => {
    setLogoutIssue('');
    logout.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
          setLocation('/');
        } else {
          setLogoutIssue('The session is still open. Please try signing out again.');
        }
      },
    });
  };

  if (currentUser.isLoading) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader />
        <div className="mx-auto max-w-[960px] animate-pulse px-5 py-16 sm:px-8 lg:px-12">
          <div className="h-4 w-24 rounded-full bg-muted" /><div className="mt-5 h-16 w-3/4 rounded-full bg-muted" /><div className="mt-12 h-48 rounded-[1.5rem] bg-muted" />
        </div>
      </main>
    );
  }

  if (currentUser.isError || !currentUser.data) {
    return (
      <main className="marketly-grain min-h-[100dvh] bg-background">
        <MarketplaceHeader />
        <div className="mx-auto max-w-[620px] px-5 py-24 text-center sm:px-8" role="alert" data-testid="state-account-error">
          <p className="font-display text-4xl italic text-primary">We couldn&apos;t open your account.</p>
          <p className="mt-3 text-sm leading-6 text-primary/60">{getAuthErrorMessage(currentUser.error, 'Your session may have ended.')}</p>
          <button type="button" onClick={() => currentUser.refetch()} className="mt-7 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-[12px] font-semibold text-primary" data-testid="button-retry-account"><RotateCw size={14} /> Try again</button>
        </div>
      </main>
    );
  }

  const user = currentUser.data;
  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <MarketplaceHeader />
      <div className="relative z-10 mx-auto max-w-[1080px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">Your Marketly / {user.role}</p>
            <h1 className="mt-4 text-[clamp(3rem,7vw,6.4rem)] leading-[.86] tracking-[-.07em] text-primary" data-testid="heading-account">Good to see you, <span className="font-display italic text-secondary">{user.name.split(' ')[0]}.</span></h1>
            <p className="mt-6 max-w-[470px] text-[16px] leading-7 text-primary/65">This is your little corner of the edit. Keep exploring, or make room for what comes next.</p>
          </div>
          <button type="button" onClick={handleLogout} disabled={logout.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-border px-4 text-[12px] font-semibold text-primary transition-colors hover:bg-muted disabled:opacity-60 sm:self-auto" data-testid="button-account-logout">
            <LogOut size={14} /> {logout.isPending ? 'Signing out' : 'Sign out'}
          </button>
        </div>

        {logout.isError && <p className="mt-6 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[13px] text-destructive" role="alert" data-testid="state-logout-error">{getAuthErrorMessage(logout.error, 'We could not sign you out. Please try again.')}</p>}
        {logoutIssue && <p className="mt-6 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[13px] text-destructive" role="alert" data-testid="state-logout-unsuccessful">{logoutIssue}</p>}

        <div className="mt-14 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="account-details-heading">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/25 text-primary"><UserRound size={18} /></span>
              <div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary/45">Account details</p><h2 id="account-details-heading" className="mt-1 text-xl tracking-[-.04em] text-primary">The essentials</h2></div>
            </div>
            <dl className="mt-8 divide-y divide-border">
              <div className="flex items-start gap-4 py-4"><dt className="flex w-24 shrink-0 items-center gap-2 text-[11px] font-semibold text-primary/50"><UserRound size={13} /> Name</dt><dd className="text-sm text-primary" data-testid="text-account-name">{user.name}</dd></div>
              <div className="flex items-start gap-4 py-4"><dt className="flex w-24 shrink-0 items-center gap-2 text-[11px] font-semibold text-primary/50"><Mail size={13} /> Email</dt><dd className="break-all text-sm text-primary" data-testid="text-account-email">{user.email}</dd></div>
              <div className="flex items-start gap-4 py-4"><dt className="flex w-24 shrink-0 items-center gap-2 text-[11px] font-semibold text-primary/50"><ShieldCheck size={13} /> Role</dt><dd className="text-sm capitalize text-primary" data-testid="text-account-role">{user.role}</dd></div>
            </dl>
          </section>

          {user.role === 'seller' ? (
            <section className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:p-8" aria-labelledby="seller-profile-heading">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary"><Store size={18} /></span><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary-foreground/55">Seller profile</p><h2 id="seller-profile-heading" className="mt-1 text-xl tracking-[-.04em]">Your place in the edit</h2></div></div>
              <div className="mt-9 border-t border-primary-foreground/15 pt-6"><h3 className="font-display text-4xl italic" data-testid="text-seller-store-name">{user.seller?.storeName || 'Your maker profile'}</h3><p className="mt-4 max-w-[470px] text-sm leading-6 text-primary-foreground/65" data-testid="text-seller-description">{user.seller?.description || 'Your maker story will live here as your profile takes shape.'}</p></div>
              <div className="mt-9 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-accent"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Independent by design</div>
            </section>
          ) : (
            <section className="flex flex-col justify-between rounded-[1.5rem] border border-border bg-[#eadfc7] p-6 sm:p-8" aria-labelledby="discover-more-heading">
              <div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary/45">Keep looking</p><h2 id="discover-more-heading" className="mt-3 max-w-[300px] text-3xl leading-[.95] tracking-[-.06em] text-primary">There&apos;s always one more good thing.</h2></div>
              <Link href="/products" className="group mt-12 inline-flex items-center gap-2 text-[12px] font-semibold text-primary" data-testid="link-account-browse">Browse the collection <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}