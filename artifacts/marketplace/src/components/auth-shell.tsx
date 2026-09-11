import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="marketly-grain min-h-[100dvh] bg-background">
      <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" data-testid="link-auth-logo">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[11px] bg-primary text-primary-foreground">
            <span className="absolute h-5 w-5 rotate-45 rounded-full border border-accent" />
            <span className="relative font-serif text-xl leading-none">m</span>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em]">marketly</span>
        </Link>
        <Link href="/products" className="flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold text-primary/65 transition-colors hover:bg-muted hover:text-primary" data-testid="link-auth-browse">
          <Compass size={15} strokeWidth={1.7} />
          Browse goods
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-24 lg:px-12 lg:pt-20">
        <div className="max-w-[520px] reveal-up">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-primary/50 transition-colors hover:text-primary" data-testid="link-auth-back">
            <ArrowLeft size={13} />
            Back to Marketly
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">{eyebrow}</p>
          <h1 className="mt-5 text-[clamp(3.2rem,7vw,6.5rem)] leading-[.86] tracking-[-.07em] text-primary">{title}</h1>
          <p className="mt-7 max-w-[390px] text-[16px] leading-7 text-primary/65">{description}</p>
          <div className="mt-12 hidden border-l-2 border-secondary/70 pl-5 lg:block">
            <p className="font-display text-3xl italic leading-none text-primary">Good things are worth a little tending.</p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[.16em] text-primary/45">The Marketly way</p>
          </div>
        </div>

        <div className="w-full max-w-[560px] justify-self-end reveal-up reveal-delay-1">
          <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_22px_60px_rgba(28,62,55,.08)] sm:p-10">
            {children}
          </div>
          <div className="pt-5 text-center text-[12px] text-primary/55">{footer}</div>
        </div>
      </section>
    </main>
  );
}