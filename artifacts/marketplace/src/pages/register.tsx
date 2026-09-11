import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, LoaderCircle, Store, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { getGetCurrentUserQueryKey, useRegister, type RegisterRequest } from '@workspace/api-client-react';
import { AuthShell } from '@/components/auth-shell';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage } from '@/lib/auth-utils';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name.').max(100, 'Keep your name under 100 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(128, 'Keep your password under 128 characters.'),
  role: z.enum(['customer', 'seller']),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const register = useRegister({ request: { credentials: 'include' } });
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'customer' },
  });

  const onSubmit = (values: RegisterRequest) => {
    register.mutate({ data: values }, {
      onSuccess: (user) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
        setLocation('/account');
      },
    });
  };

  return (
    <AuthShell
      eyebrow="A softer corner of the internet"
      title={<>Come find your <span className="font-display italic text-secondary">people.</span></>}
      description="Create a Marketly account for thoughtful shopping, or bring your own small-batch work to the edit."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-primary underline decoration-secondary underline-offset-4" data-testid="link-login">Sign in</Link></>}
    >
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary/45">Start your account</p>
        <h2 className="mt-3 text-3xl tracking-[-.055em] text-primary">A small beginning.</h2>
      </div>

      {register.isError && (
        <div className="mb-5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[13px] leading-5 text-destructive" role="alert" data-testid="state-register-error">
          {getAuthErrorMessage(register.error, 'We could not create that account. Check your details and try again.')}
        </div>
      )}
      {register.isSuccess && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-[13px] text-primary" role="status" data-testid="state-register-success">
          <Check size={15} className="text-secondary" /> Your account is ready. Opening your account.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-semibold text-primary">Full name</FormLabel>
              <FormControl><Input {...field} autoComplete="name" placeholder="Your name" className="mt-2 h-12 rounded-xl border-border bg-background px-4 text-sm" data-testid="input-register-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-semibold text-primary">Email address</FormLabel>
              <FormControl><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" className="mt-2 h-12 rounded-xl border-border bg-background px-4 text-sm" data-testid="input-register-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-semibold text-primary">Password</FormLabel>
              <FormControl><Input {...field} type="password" autoComplete="new-password" placeholder="At least 8 characters" className="mt-2 h-12 rounded-xl border-border bg-background px-4 text-sm" data-testid="input-register-password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-semibold text-primary">I&apos;m here as a...</FormLabel>
              <FormControl>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {([
                    { value: 'customer', title: 'Curious shopper', detail: 'Find good things to keep.', icon: UserRound },
                    { value: 'seller', title: 'Independent maker', detail: 'Share what I make.', icon: Store },
                  ] as const).map(({ value, title, detail, icon: Icon }) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-3 transition-colors ${field.value === value ? 'border-primary bg-primary/[.06]' : 'border-border bg-background hover:border-primary/40'}`} data-testid={`option-register-role-${value}`}>
                      <input {...field} type="radio" value={value} checked={field.value === value} className="sr-only" />
                      <span className="flex items-start gap-3">
                        <Icon size={17} className={field.value === value ? 'text-secondary' : 'text-primary/45'} strokeWidth={1.7} />
                        <span><span className="block text-[12px] font-semibold text-primary">{title}</span><span className="mt-1 block text-[11px] leading-4 text-primary/55">{detail}</span></span>
                      </span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <button type="submit" disabled={register.isPending} className="group flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" data-testid="button-register-submit">
            {register.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Making your place</> : <>Create account <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>}
          </button>
        </form>
      </Form>
    </AuthShell>
  );
}