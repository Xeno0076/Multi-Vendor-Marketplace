import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHealthCheck } from '@workspace/api-client-react';
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import Orders from "./pages/orders";
import OrderDetail from "./pages/order-detail";
import { ArrowRight, ChevronDown, Menu, MoveUpRight, Search, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthHeaderActions } from '@/components/auth-header-actions';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import ProductDetail from '@/pages/product-detail';
import Products from '@/pages/products';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Account from '@/pages/account';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const collections = [
  {
    id: '01',
    name: 'Objects with a story',
    detail: 'Ceramics, paper goods, and little things made slowly.',
    className: 'art-clay',
    tag: 'The hand-made edit',
  },
  {
    id: '02',
    name: 'For the daily ritual',
    detail: 'Useful pleasures for mornings, desks, and everywhere between.',
    className: 'art-ribbon',
    tag: 'Small joys',
  },
  {
    id: '03',
    name: 'A room, reimagined',
    detail: 'Pieces with enough personality to change the whole feeling.',
    className: 'art-sun',
    tag: 'Home, but better',
  },
];

const sellers = [
  { name: 'Common Thread Studio', place: 'Portland, OR', mark: 'CT', className: 'seller-sage' },
  { name: 'Mina Okafor Ceramics', place: 'Chicago, IL', mark: 'MO', className: 'seller-coral' },
  { name: 'Paper Moon Press', place: 'Austin, TX', mark: 'PM', className: 'seller-gold' },
];

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[11px] bg-primary text-primary-foreground">
        <span className="absolute h-5 w-5 rounded-full border border-accent rotate-45" />
        <span className="relative font-serif text-xl leading-none">m</span>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.04em]">marketly</span>
    </a>
  );
}

function HealthNote() {
  const { data, isLoading, isError } = useHealthCheck();
  const isOnline = !isError && !isLoading && data?.status;

  return (
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-primary/70" data-testid="status-platform">
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#d89b49]' : isLoading ? 'bg-secondary' : 'bg-destructive'}`} />
      <span>{isLoading ? 'checking platform' : isOnline ? 'platform online' : 'platform resting'}</span>
    </div>
  );
}

function ProductArt({ className }: { className: string }) {
  return (
    <div className={`relative min-h-[250px] overflow-hidden rounded-[1.35rem] ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(22,45,47,.16),transparent)]" />
      <div className="absolute left-[14%] top-[13%] h-2 w-14 rounded-full bg-foreground/10" />
      <div className="absolute right-[14%] top-[12%] font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">marketly / edit</div>
      {className === 'art-clay' && (
        <>
          <div className="absolute bottom-[15%] left-[23%] h-[46%] w-[31%] rounded-[48%_48%_30%_30%] bg-[#d9a778] shadow-[inset_-18px_-9px_0_rgba(117,70,45,.12)] rotate-[-8deg]" />
          <div className="absolute bottom-[36%] left-[28%] h-[8%] w-[21%] rounded-[50%] border-[3px] border-[#a56e4f] bg-[#e9c19d] rotate-[-8deg]" />
          <div className="absolute bottom-[12%] right-[15%] h-[34%] w-[23%] rounded-[48%_48%_28%_28%] bg-[#edd4ae] shadow-[inset_-12px_-8px_0_rgba(147,105,67,.12)] rotate-[12deg]" />
          <div className="absolute bottom-[39%] right-[18%] h-[6%] w-[17%] rounded-full border-[2px] border-[#c7a178] bg-[#f3dfbf] rotate-[12deg]" />
        </>
      )}
      {className === 'art-ribbon' && (
        <>
          <div className="absolute left-[20%] top-[24%] h-[52%] w-[15%] rounded-t-full bg-[#e7bd66] rotate-[-20deg]" />
          <div className="absolute left-[41%] top-[18%] h-[62%] w-[16%] rounded-t-full bg-[#d78868] rotate-[11deg]" />
          <div className="absolute left-[63%] top-[29%] h-[44%] w-[14%] rounded-t-full bg-[#f1df9d] rotate-[31deg]" />
          <div className="absolute bottom-[16%] left-[25%] h-[4px] w-1/2 bg-foreground/20" />
        </>
      )}
      {className === 'art-sun' && (
        <>
          <div className="absolute left-1/2 top-[48%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#df9f74] shadow-[0_0_0_18px_rgba(223,159,116,.16),0_0_0_37px_rgba(223,159,116,.08)]" />
          <div className="absolute bottom-[16%] left-[14%] h-20 w-20 rounded-[45%_45%_9%_9%] bg-[#698c79] rotate-[-14deg]" />
          <div className="absolute bottom-[13%] right-[16%] h-24 w-16 rounded-[50%_50%_12%_12%] bg-[#f0d36e] rotate-[17deg]" />
        </>
      )}
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="top" className="marketly-grain min-h-[100dvh] overflow-hidden bg-background">
      <div className="relative z-10">
        <header className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-primary/75 md:flex" aria-label="Main navigation">
            <a href="#discover" className="transition-colors hover:text-primary" data-testid="link-discover">Discover</a>
            <a href="#sellers" className="transition-colors hover:text-primary" data-testid="link-sellers">For sellers</a>
            <a href="#story" className="transition-colors hover:text-primary" data-testid="link-story">Our point of view</a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSearchOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted" aria-label="Toggle search" data-testid="button-search">
              <Search size={18} strokeWidth={1.8} />
            </button>
             <AuthHeaderActions />
             <a href="#sellers" className="hidden rounded-full bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:block" data-testid="link-start-selling">Start selling</a>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-menu">
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </header>

        {searchOpen && (
          <div className="mx-auto max-w-[1320px] px-5 pb-4 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm reveal-up">
              <Search size={16} className="text-muted-foreground" />
              <input autoFocus type="search" placeholder="Search the coming collection..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" data-testid="input-search" />
              <span className="font-mono text-[10px] text-muted-foreground">SOON</span>
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="mx-5 mb-2 rounded-2xl border border-border bg-card p-3 shadow-lg md:hidden reveal-up">
            <a href="#discover" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted" data-testid="mobile-link-discover">Discover</a>
            <a href="#sellers" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted" data-testid="mobile-link-sellers">For sellers</a>
            <a href="#story" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted" data-testid="mobile-link-story">Our point of view</a>
          </div>
        )}

        <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[.94fr_1.06fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24" aria-labelledby="hero-heading">
          <div className="max-w-[600px]">
            <div className="reveal-up mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-secondary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60">A marketplace with a pulse</span>
            </div>
            <h1 id="hero-heading" className="reveal-up reveal-delay-1 text-balance text-[clamp(3.75rem,8vw,7.7rem)] leading-[.87] tracking-[-.065em] text-primary">
              Find the <span className="font-display italic text-secondary">good</span> stuff.
            </h1>
            <p className="reveal-up reveal-delay-2 mt-8 max-w-[455px] text-[17px] leading-[1.55] text-primary/70 sm:text-[19px]">
              Marketly is where curious people meet independent makers. Thoughtful goods, small-batch finds, and the stories that make them worth keeping.
            </p>
            <div className="reveal-up reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/products" className="group flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-1" data-testid="button-browse-collection">
                Browse the collection
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#story" className="flex items-center gap-2 rounded-full px-4 py-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-muted" data-testid="link-learn-more">
                Why Marketly
                <MoveUpRight size={15} />
              </a>
            </div>
            <div className="mt-10">
              <HealthNote />
            </div>
          </div>

          <div className="relative min-h-[450px] sm:min-h-[540px]">
            <div className="absolute right-0 top-0 h-[88%] w-[78%] rounded-[2rem] bg-primary shadow-[0_24px_60px_rgba(24,63,61,.16)] sm:w-[72%]" />
            <div className="absolute right-[6%] top-[5%] h-[82%] w-[72%] overflow-hidden rounded-[1.8rem] bg-[#df9f74] sm:right-[9%] sm:w-[63%]">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 22% 24%, rgba(245,220,163,.45) 0 1px, transparent 2px), radial-gradient(circle at 74% 72%, rgba(28,67,65,.25) 0 1px, transparent 2px)', backgroundSize: '17px 17px, 23px 23px' }} />
              <div className="absolute left-[16%] top-[22%] h-[48%] w-[49%] rounded-[48%_48%_20%_20%] bg-[#f2d69f] shadow-[inset_-22px_-12px_0_rgba(146,82,58,.13)] rotate-[-9deg]" />
              <div className="absolute left-[25%] top-[17%] h-[11%] w-[32%] rounded-[50%] border-[4px] border-[#b87e60] bg-[#f4deb4] rotate-[-9deg]" />
              <div className="absolute bottom-[14%] right-[10%] h-16 w-16 rounded-full bg-[#f5da73]" />
              <div className="absolute bottom-[13%] left-[12%] h-px w-3/4 bg-primary/40" />
              <span className="absolute bottom-[7%] left-[13%] font-mono text-[9px] uppercase tracking-[.2em] text-primary/70">made slowly / kept forever</span>
            </div>
            <div className="float-slow absolute bottom-[4%] left-0 w-[43%] rotate-[-6deg] rounded-[1.3rem] bg-[#f1dfb8] p-3 shadow-[0_18px_35px_rgba(24,63,61,.13)] sm:left-[4%] sm:w-[36%]">
              <div className="flex aspect-[.9] items-end justify-center overflow-hidden rounded-[.9rem] bg-[#789b8a]">
                <div className="mb-[13%] h-[65%] w-[55%] rounded-[50%_50%_18%_18%] bg-[#e8b079] shadow-[inset_-11px_-7px_0_rgba(115,74,56,.13)]" />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-primary">
                <span className="font-mono text-[9px] uppercase tracking-widest">one of a kind</span>
                <ArrowRight size={13} />
              </div>
            </div>
            <div className="absolute left-[9%] top-[2%] hidden -rotate-12 rounded-full border border-primary/30 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.18em] text-primary/70 sm:block">hand picked</div>
          </div>
        </section>

        <div className="overflow-hidden border-y border-primary/15 bg-secondary py-3.5 text-primary">
          <div className="marquee flex w-max items-center gap-7 whitespace-nowrap font-mono text-[10px] uppercase tracking-[.22em]">
            <span>independent by design</span><span className="text-primary/50">+</span><span>good things take time</span><span className="text-primary/50">+</span><span>made by real people</span><span className="text-primary/50">+</span><span>independent by design</span><span className="text-primary/50">+</span><span>good things take time</span><span className="text-primary/50">+</span><span>made by real people</span><span className="text-primary/50">+</span>
          </div>
        </div>

        <section id="discover" className="mx-auto max-w-[1320px] scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-labelledby="discover-heading">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">01 / Start somewhere</p>
              <h2 id="discover-heading" className="max-w-[520px] text-[clamp(2.7rem,5vw,4.7rem)] leading-[.92] tracking-[-.06em] text-primary">A little bit of <span className="font-display italic text-secondary">wonder</span>, sorted.</h2>
            </div>
            <a href="#sellers" className="group flex items-center gap-2 text-[13px] font-semibold text-primary" data-testid="link-see-all">
              Meet the makers <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {collections.map((collection) => (
              <article key={collection.id} className="group">
                <ProductArt className={collection.className} />
                <div className="flex items-start justify-between gap-4 px-1 pt-5">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[.17em] text-primary/45">{collection.tag}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-.04em] text-primary">{collection.name}</h3>
                    <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-primary/60">{collection.detail}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-all group-hover:-rotate-45 group-hover:bg-accent">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="story" className="scroll-mt-8 bg-primary text-primary-foreground" aria-labelledby="story-heading">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:px-12">
            <div className="flex flex-col justify-between">
              <div>
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[.2em] text-primary-foreground/55">02 / Our point of view</p>
                <h2 id="story-heading" className="text-[clamp(2.8rem,5vw,5.2rem)] leading-[.9] tracking-[-.06em]">The internet is better when it feels a little more <span className="font-display italic text-accent">human.</span></h2>
              </div>
              <p className="mt-10 max-w-[300px] text-sm leading-6 text-primary-foreground/65">Less endless scrolling. More finding the thing you didn&apos;t know you were looking for.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              <div className="rounded-[1.5rem] border border-primary-foreground/15 bg-primary-foreground/[.06] p-5 sm:p-8">
                <Sparkles size={20} className="mb-12 text-accent" strokeWidth={1.5} />
                <p className="font-display text-4xl italic sm:text-5xl">Curated</p>
                <p className="mt-3 max-w-[180px] text-[13px] leading-5 text-primary-foreground/60">A considered edit, not an infinite aisle.</p>
              </div>
              <div className="mt-10 rounded-[1.5rem] bg-secondary p-5 text-primary sm:mt-16 sm:p-8">
                <span className="font-mono text-[10px] uppercase tracking-[.18em] opacity-60">The good measure</span>
                <p className="mt-12 font-display text-4xl italic sm:text-5xl">Made to keep.</p>
                <p className="mt-3 max-w-[180px] text-[13px] leading-5 opacity-70">Objects with a reason to exist.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="sellers" className="mx-auto max-w-[1320px] scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-labelledby="sellers-heading">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[.2em] text-primary/55">03 / For the independent</p>
              <h2 id="sellers-heading" className="max-w-[500px] text-[clamp(2.8rem,5vw,5rem)] leading-[.9] tracking-[-.06em] text-primary">Your first sale should feel like a <span className="font-display italic text-secondary">beginning.</span></h2>
              <p className="mt-7 max-w-[420px] text-[15px] leading-6 text-primary/65">Marketly gives small businesses a welcoming place to start. Bring what you make; we&apos;ll help the right people find it.</p>
              <button type="button" onClick={() => window.alert('Seller invitations are opening soon.')} className="group mt-8 flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-1" data-testid="button-join-sellers">
                Join the seller list
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {sellers.map((seller, index) => (
                <div key={seller.name} className="group flex items-center gap-4 py-5 sm:py-6" data-testid={`seller-row-${index}`}>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-xl italic ${seller.className}`}>{seller.mark}</div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-primary">{seller.name}</h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[.12em] text-primary/50">{seller.place}</p>
                  </div>
                  <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary transition-transform group-hover:-rotate-45">
                    <ArrowRight size={15} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-[#eadfc7]">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:flex-row lg:items-end lg:justify-between lg:px-12">
            <div>
              <Logo />
              <p className="mt-4 max-w-[270px] text-[13px] leading-5 text-primary/60">A softer corner of the internet for good things, good people, and small beginnings.</p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-[12px] font-semibold text-primary/70">
              <a href="#discover" className="hover:text-primary" data-testid="footer-link-discover">Discover</a>
              <a href="#sellers" className="hover:text-primary" data-testid="footer-link-sellers">Sell on Marketly</a>
              <a href="#story" className="hover:text-primary" data-testid="footer-link-story">Our point of view</a>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-primary/45">© 2025 Marketly</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/account" component={Account} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/orders" component={Orders} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;