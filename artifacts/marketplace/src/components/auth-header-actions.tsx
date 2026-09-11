import { LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogout } from '@workspace/api-client-react';

export function AuthHeaderActions() {
  const [, setLocation] = useLocation();
  const [logoutIssue, setLogoutIssue] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useGetCurrentUser({
    query: { retry: false, queryKey: getGetCurrentUserQueryKey() },
    request: { credentials: 'include' },
  });
  const logout = useLogout({ request: { credentials: 'include' } });

  if (currentUser.isLoading) {
    return <span className="hidden h-9 w-20 animate-pulse rounded-full bg-muted sm:block" data-testid="state-auth-header-loading" />;
  }

  if (currentUser.data) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/account" className="flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-[12px] font-semibold text-primary transition-colors hover:bg-secondary/30" data-testid="link-header-account">
          <UserRound size={14} />
          <span className="hidden max-w-24 truncate sm:inline">{currentUser.data.name}</span>
        </Link>
        <button type="button" onClick={() => { setLogoutIssue(false); logout.mutate(undefined, { onSuccess: (result) => { if (result.success) { queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() }); setLocation('/'); } else setLogoutIssue(true); } }); }} disabled={logout.isPending} className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-muted hover:text-primary disabled:opacity-50" aria-label={logoutIssue ? 'Sign out was unsuccessful' : 'Sign out'} title={logoutIssue ? 'Sign out was unsuccessful' : 'Sign out'} data-testid="button-header-logout">
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="flex rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-primary transition-colors hover:bg-muted" data-testid="link-header-login">
      Sign in
    </Link>
  );
}