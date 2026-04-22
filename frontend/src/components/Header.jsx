import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
    </svg>
  );
}

const publicNavItems = [
  { label: 'Startseite', to: '/' },
  { label: 'Produkte', to: '/products' },
  { label: 'Anmelden', to: '/login' },
  { label: 'Konto erstellen', to: '/register' }
];

const authenticatedNavItems = [
  { label: 'Startseite', to: '/' },
  { label: 'Produkte', to: '/products' },
  { label: 'Einstellungen', to: '/settings' }
];

function Header({ feedback = { type: '', message: '' }, title = 'Produktübersicht', description, showHero = false }) {
  const { count, isCartLoading } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const navItems = isAuthenticated
    ? [...authenticatedNavItems, ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : [])]
    : publicNavItems;

  useEffect(() => {
    if (location.pathname === '/products') {
      setSearchInput(searchParams.get('q') ?? '');
      return;
    }

    setSearchInput('');
  }, [location.pathname, searchParams]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = searchInput.trim();
    navigate({
      pathname: '/products',
      search: query ? `?q=${encodeURIComponent(query)}` : ''
    });
  }

  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-extrabold text-white">
              IW
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">IDPA Webshop</p>
              <h1 className="text-xl font-extrabold text-ink">{title}</h1>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:min-w-0 lg:flex-1 lg:items-end">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center lg:justify-end"
            >
              <label htmlFor="global-product-search" className="sr-only">
                Produkte suchen
              </label>
              <input
                id="global-product-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Produkte suchen"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white sm:flex-1"
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Suchen
              </button>
            </form>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-ink ${
                      isActive ? 'bg-slate-100 text-ink' : ''
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to={isAuthenticated ? '/cart' : '/login'}
                className="ml-2 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-ink transition hover:bg-slate-100"
              >
                <CartIcon />
                <span>Warenkorb</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">
                  {isCartLoading ? '...' : count}
                </span>
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
                    {user?.firstname ? `Eingeloggt als ${user.firstname}` : 'Eingeloggt'}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <span className="rounded-full bg-amber-50 px-4 py-2 font-medium text-amber-700">
                  Nicht angemeldet
                </span>
              )}
            </div>
          </div>
        </div>

        {showHero ? (
          <div className="grid gap-4 rounded-3xl bg-gradient-to-r from-ink via-slate-900 to-brand p-5 text-white shadow-card lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-100">Willkommen im Shop</p>
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">Einfach online einkaufen.</h2>
              <p className="max-w-2xl text-sm text-slate-200 sm:text-base">
                {description || 'Sieh dir unsere Produkte an und bestelle direkt im Shop.'}
              </p>
              {feedback.message ? (
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                    feedback.type === 'success' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">Schnell starten</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Du kannst direkt zu den Produkten gehen oder ein Konto erstellen.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/products"
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-ink transition hover:bg-slate-100"
                  >
                    Zu den Produkten
                  </Link>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Abmelden
                    </button>
                  ) : (
                    <Link
                      to="/register"
                      className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Konto erstellen
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
