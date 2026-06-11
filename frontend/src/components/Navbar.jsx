import {
  ChevronRight,
  House,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/products', label: 'Catalogue' },
];

function navLinkClass({ isActive }, compact = false) {
  return [
    'transition',
    compact ? 'rounded-full px-3 py-2 text-sm font-semibold' : 'text-sm font-medium',
    isActive ? 'bg-[#E94560] text-white shadow-sm' : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
  ].join(' ');
}

function getUserLabel(user) {
  if (!user) {
    return 'Mon compte';
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email || 'Mon compte';
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((state) => state.items);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  const userLabel = getUserLabel(user);
  const profileHref = isAuthenticated ? '/my-orders' : '/login';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-2 z-50 mx-auto w-full max-w-7xl px-2 pt-2 sm:px-4 lg:px-6">
        <div
          className={`rounded-[28px] border border-white/80 px-2.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[16px] transition-all duration-300 sm:px-3 lg:px-4 ${
            scrolled ? 'bg-white/92' : 'bg-white/88'
          }`}
        >
          <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-2 sm:gap-3">
            <div className="min-w-0">
              <Logo to="/" size="sm" className="shrink-0" />
            </div>

            <Link
              to="/products"
              className="flex min-w-0 items-center gap-2 overflow-hidden rounded-[18px] border border-[#F5A623]/25 bg-[#FFF8E6] px-2 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Voir le catalogue"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5A623]/15 text-[#F5A623] sm:h-9 sm:w-9">
                <Truck className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F5A623] sm:text-[11px]">
                  Livraison rapide
                </span>
                <span className="block truncate text-[11px] font-semibold text-[#1A1A1A] sm:text-[12px]">
                  2 à 5 jours ouvrés
                </span>
              </span>
            </Link>

            <Link
              to={profileHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1A1A2E]/10 bg-white text-[#1A1A2E] shadow-sm transition hover:-translate-y-0.5 hover:border-[#E94560]/30 hover:text-[#E94560] sm:h-11 sm:w-11"
              aria-label={isAuthenticated ? 'Voir mon profil' : 'Se connecter'}
            >
              <UserRound className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Link>

            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E94560] text-white shadow-[0_10px_20px_rgba(233,69,96,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(233,69,96,0.32)] sm:h-11 sm:w-11"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border border-white bg-[#F5A623] px-1 text-[10px] font-bold text-[#1A1A1A]">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1A1A2E]/10 bg-white text-[#1A1A2E] shadow-sm transition hover:-translate-y-0.5 hover:border-[#E94560]/30 hover:text-[#E94560] sm:h-11 sm:w-11 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-2 hidden items-center justify-between rounded-[20px] border border-[#1A1A2E]/5 bg-[#F8F5F0]/90 px-3 py-2 lg:flex" aria-label="Navigation principale">
            <div className="flex items-center gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => navLinkClass({ isActive }, true)}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/my-orders" className={({ isActive }) => navLinkClass({ isActive }, true)}>
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      {userLabel}
                    </span>
                  </NavLink>
                  <NavLink to="/my-orders" className={({ isActive }) => navLinkClass({ isActive }, true)}>
                    Mes commandes
                  </NavLink>
                  {isAdmin ? (
                    <NavLink to="/admin/dashboard" className={({ isActive }) => navLinkClass({ isActive }, true)}>
                      Admin
                    </NavLink>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F8F5F0] hover:text-[#E94560]"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={({ isActive }) => navLinkClass({ isActive }, true)}>
                  Connexion
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1A1A2E]/55"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[92vw] max-w-sm flex-col bg-white text-[#1A1A2E] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-[#1A1A2E]/8 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F5F0]">
                  <House className="h-5 w-5 text-[#E94560]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">World Design</p>
                  <p className="text-xs text-[#1A1A2E]/60">Goodies premium</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1A1A2E]/10 bg-white text-[#1A1A2E]"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
              <div className="rounded-[20px] border border-[#F5A623]/25 bg-[#FFF8E6] p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5A623]/15 text-[#F5A623]">
                    <Truck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">Livraison rapide</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">2 à 5 jours ouvrés</p>
                  </div>
                </div>
              </div>

              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between rounded-[16px] border px-4 py-3 text-base font-semibold transition',
                      isActive
                        ? 'border-[#E94560] bg-[#E94560] text-white'
                        : 'border-[#1A1A2E]/8 bg-white text-[#1A1A2E] hover:border-[#E94560]/30 hover:bg-[#F8F5F0]',
                    ].join(' ')
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="rounded-[16px] border border-[#1A1A2E]/8 bg-[#F8F5F0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E94560]">Mon compte</p>
                    <p className="mt-1 text-sm font-semibold text-[#1A1A2E]">{userLabel}</p>
                  </div>

                  <NavLink
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between rounded-[16px] border px-4 py-3 text-base font-semibold transition',
                        isActive
                          ? 'border-[#E94560] bg-[#E94560] text-white'
                          : 'border-[#1A1A2E]/8 bg-white text-[#1A1A2E] hover:border-[#E94560]/30 hover:bg-[#F8F5F0]',
                      ].join(' ')
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4" aria-hidden="true" />
                      Mes commandes
                    </span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </NavLink>

                  {isAdmin ? (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-[16px] border border-[#1A1A2E]/8 bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#E94560]/30 hover:bg-[#F8F5F0]"
                    >
                      <span>Admin</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-between rounded-[16px] border border-[#1A1A2E]/8 bg-white px-4 py-3 text-base font-semibold text-[#E94560] transition hover:bg-[#F8F5F0]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Déconnexion
                    </span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-[16px] border border-[#1A1A2E]/8 bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#E94560]/30 hover:bg-[#F8F5F0]"
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Connexion
                  </span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              )}

              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-between rounded-[16px] bg-[#E94560] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(233,69,96,0.2)] transition hover:opacity-95 active:scale-[0.98]"
              >
                <span>Commander maintenant</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-between rounded-[16px] border border-[#1A1A2E]/8 bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#E94560]/30 hover:bg-[#F8F5F0]"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Panier
                </span>
                <span className="inline-flex items-center gap-2">
                  {cartCount > 0 ? (
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#E94560] px-1 text-[11px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
