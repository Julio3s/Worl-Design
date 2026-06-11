import { LogOut, Menu, ShoppingCart, User, X, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/products', label: 'Catalogue' },
];

function navLinkClass({ isActive }) {
  return [
    'text-sm font-medium transition',
    isActive ? 'text-gold' : 'text-white hover:text-gold',
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

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-primary text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Logo to="/" size="md" className="sm:h-16" />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <NavLink to="/my-orders" className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {userLabel}
                  </span>
                </NavLink>
                <NavLink to="/my-orders" className={navLinkClass}>
                  Mes commandes
                </NavLink>
                {isAdmin ? (
                  <NavLink to="/admin/dashboard" className={navLinkClass}>
                    Admin
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-accent"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Déconnexion
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Connexion
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-gold hover:text-gold"
              aria-label="Voir le panier"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <Link
              to="/products"
              className="hidden items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] sm:inline-flex"
            >
              Commander
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-gold hover:text-gold lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[88vw] max-w-sm flex-col bg-primary text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Logo to="/" size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between rounded-[8px] border px-4 py-3 text-base font-medium transition',
                      isActive
                        ? 'border-accent bg-accent text-white'
                        : 'border-white/10 bg-white/5 text-white hover:border-gold/60 hover:bg-white/10',
                    ].join(' ')
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-gold">Mon compte</p>
                    <p className="mt-1 text-sm font-medium text-white">{userLabel}</p>
                  </div>

                  <NavLink
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between rounded-[8px] border px-4 py-3 text-base font-medium transition',
                        isActive
                          ? 'border-accent bg-accent text-white'
                          : 'border-white/10 bg-white/5 text-white hover:border-gold/60 hover:bg-white/10',
                      ].join(' ')
                    }
                  >
                    <span>Mes commandes</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </NavLink>

                  {isAdmin ? (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-white transition hover:border-gold/60 hover:bg-white/10"
                    >
                      <span>Admin</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-between rounded-[8px] border border-white/15 px-4 py-3 text-base font-medium text-accent transition hover:bg-white/5"
                  >
                    <span>Déconnexion</span>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-white transition hover:border-gold/60 hover:bg-white/10"
                >
                  <span>Connexion</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              )}

              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-between rounded-[8px] bg-accent px-4 py-3 text-base font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
              >
                <span>Commander maintenant</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-between rounded-[8px] border border-white/15 px-4 py-3 text-base font-medium text-white transition hover:border-gold/60 hover:bg-white/10"
              >
                <span>Panier</span>
                <span className="inline-flex items-center gap-2">
                  {cartCount > 0 ? (
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
