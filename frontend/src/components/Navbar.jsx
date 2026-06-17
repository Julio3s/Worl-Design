import {
  BadgeCheck,
  ChevronRight,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/products', label: 'Boutique', end: false },
];

const VALUE_PROPS = [
  { icon: Sparkles, label: 'Sur mesure' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: BadgeCheck, label: 'Qualité premium' },
];

function getUserLabel(user) {
  if (!user) return 'Mon compte';

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email || 'Mon compte';
}

function Brand({ onClick, compact = false }) {
  return (
    <Link
      to="/"
      className="group flex min-w-0 items-center gap-3 leading-none"
      aria-label="Accueil World Design"
      onClick={onClick}
    >
      <img
        src="/logo-wd.png"
        alt="World Design"
        className={compact ? 'h-14 w-auto sm:h-16' : 'h-16 w-auto sm:h-20'}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'flex';
        }}
      />
      <div className="hidden min-w-0 flex-col leading-none xl:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/45">
          Atelier créatif
        </span>
        <span className="mt-1 text-xl font-black text-primary">World Design</span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loadFromStorage = useCartStore((state) => state.loadFromStorage);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  const userLabel = getUserLabel(user);
  const profileHref = isAuthenticated ? '/my-orders' : '/login';

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const updateViewportFlags = () => {
      setIsDesktop(window.innerWidth >= 1100);
    };

    updateViewportFlags();
    window.addEventListener('resize', updateViewportFlags);

    return () => {
      window.removeEventListener('resize', updateViewportFlags);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[linear-gradient(180deg,rgba(248,245,240,0.98),rgba(248,245,240,0.92))] backdrop-blur-xl">
        <div className="border-b border-white/60 bg-[linear-gradient(90deg,#1A1A2E_0%,#23314d_55%,#E94560_100%)] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Studio de marquage sur mesure
            </p>
            {isDesktop ? (
              <div className="hidden items-center gap-2 sm:flex">
                {VALUE_PROPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85"
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-[28px] border border-white/80 bg-white/85 px-3 py-3 shadow-[0_18px_45px_rgba(26,26,46,0.10)] ring-1 ring-black/5 backdrop-blur-xl sm:px-4 lg:gap-4">
            <Brand />

            <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-primary/70 hover:bg-[#F8F5F0] hover:text-primary',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/35" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full rounded-full border border-[#E0DBD5] bg-[#FBFAF7] py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-primary/40 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                </div>
              </form>

              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-primary transition hover:border-accent hover:text-accent xl:hidden"
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>

              <Link
                to="/cart"
                className="relative inline-flex h-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-3 text-sm font-semibold text-primary/70 transition hover:border-accent/30 hover:text-accent hover:shadow-sm"
                aria-label="Panier"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {isDesktop ? (
                <>
                  {isAuthenticated ? (
                    <Link
                      to={profileHref}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-primary/75 transition hover:border-accent hover:text-accent hover:shadow-sm"
                      aria-label={userLabel}
                    >
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-primary/75 transition hover:border-accent hover:text-accent hover:shadow-sm"
                      aria-label="Connexion"
                    >
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}

                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#1A1A2E_0%,#E94560_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
                  >
                    Créer un projet
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              ) : null}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-primary transition hover:border-accent hover:text-accent lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/70 bg-white/95 px-4 py-3 shadow-sm md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative mx-auto max-w-3xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/35" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un produit..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-full border border-[#E0DBD5] bg-[#FBFAF7] py-3 pl-10 pr-4 text-sm text-primary placeholder:text-primary/40 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </form>
          </div>
        )}
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[90vw] max-w-sm flex-col overflow-hidden bg-[#FBFAF7] shadow-2xl">
            <div className="bg-[linear-gradient(135deg,#1A1A2E_0%,#23314d_55%,#E94560_100%)] px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <Brand onClick={() => setMobileOpen(false)} compact />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/82">
                Goodies premium, identité forte et finitions qui donnent envie de commander.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {VALUE_PROPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85"
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-3">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-semibold transition',
                        isActive
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/15'
                          : 'border-[#E0DBD5] bg-white text-primary hover:border-accent/30 hover:text-accent',
                      ].join(' ')
                    }
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </NavLink>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#E0DBD5] bg-white p-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/45">
                        Mon compte
                      </p>
                      <p className="mt-1 text-lg font-bold text-primary">{userLabel}</p>
                    </div>

                    <NavLink
                      to="/my-orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-[#FBFAF7] px-4 py-3 text-sm font-semibold text-primary transition hover:bg-[#F4EFE7]"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" aria-hidden="true" />
                        Mes commandes
                      </span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </NavLink>

                    {isAdmin ? (
                      <NavLink
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-xl bg-[#FBFAF7] px-4 py-3 text-sm font-semibold text-primary transition hover:bg-[#F4EFE7]"
                      >
                        <span className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                          Administration
                        </span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </NavLink>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Déconnexion
                      </span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/45">
                        Votre espace
                      </p>
                      <p className="mt-1 text-lg font-bold text-primary">Connectez-vous</p>
                    </div>

                    <NavLink
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                      <span className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" aria-hidden="true" />
                        Connexion
                      </span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </NavLink>

                    <NavLink
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-[#E0DBD5] bg-[#FBFAF7] px-4 py-3 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
                    >
                      <span>Créer un compte</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </NavLink>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                <Link
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#1A1A2E_0%,#E94560_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5"
                >
                  Créer un projet
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E0DBD5] bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Voir le panier
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
