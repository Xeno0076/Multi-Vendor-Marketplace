import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { getGetCurrentUserQueryKey, useLogin, type LoginRequest } from '@workspace/api-client-react';
import { AuthShell } from '@/components/auth-shell';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage } from '@/lib/auth-utils';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin({ request: { credentials: 'include' } });
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginRequest) => {
    login.mutate({ data: values }, {
      onSuccess: (user) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
        setLocation('/account');
      },
    });
  };

  return (
    <AuthShell
      eyebrow="A familiar place for good finds"
      title={<>Welcome <span className="font-display italic text-secondary">back.</span></>}
      description="Sign in to keep track of the makers and objects you want to come back to."
      footer={<>New to the edit? <Link href="/register" className="font-semibold text-primary underline decoration-secondary underline-offset-4" data-testid="link-register">Make an account</Link></>}
    >
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary/45">Your Marketly account</p>
        <h2 className="mt-3 text-3xl tracking-[-.055em] text-primary">Pick up where you left off.</h2>
      </div>

      {login.isError && (
        <div className="mb-5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[13px] leading-5 text-destructive" role="alert" data-testid="state-login-error">
          {getAuthErrorMessage(login.error, 'We could not sign you in. Check your details and try again.')}
        </div>
      )}
      {login.isSuccess && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-[13px] text-primary" role="status" data-testid="state-login-success">
          <Check size={15} className="text-secondary" /> Signed in. Taking you to your account.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-semibold text-primary">Email address</FormLabel>
              <FormControl><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" className="mt-2 h-12 rounded-xl border-border bg-background px-4 text-sm" data-testid="input-login-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-[12px] font-semibold text-primary">Password</FormLabel>
                <span className="font-mono text-[9px] uppercase tracking-[.13em] text-primary/40">Keep it close</span>
              </div>
              <FormControl><Input {...field} type="password" autoComplete="current-password" placeholder="Your password" className="mt-2 h-12 rounded-xl border-border bg-background px-4 text-sm" data-testid="input-login-password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <button type="submit" disabled={login.isPending} className="group flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" data-testid="button-login-submit">
            {login.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Checking your details</> : <>Sign in <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>}
          </button>
        </form>
      </Form>
    </AuthShell>
  );
}