import {
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

import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/products', label: 'Catalogue' },
];

function getUserLabel(user) {
  if (!user) return 'Mon compte';

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

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.09)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 flex-col items-center leading-none"
            aria-label="Accueil World Design"
          >
            <span className="font-display text-[28px] font-black tracking-tight text-primary">
              <span className="text-[#1A1A2E]">W</span>
              <span className="text-[#E94560]">D</span>
            </span>
            <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#6B6B6B] mt-[-2px]">
              World Design
            </span>
          </Link>

          {/* Bandeau livraison */}
          <div className="wd-delivery flex flex-1 items-center gap-2 rounded-[14px] bg-[#F3F4F6] px-3 py-3 min-w-0 mx-1 sm:gap-3 sm:px-4 sm:py-3 sm:mx-2 lg:mx-4">
            <Truck className="h-6 w-6 shrink-0 text-[#1A56DB] sm:h-7 sm:w-7" strokeWidth={1.7} />
            <div className="min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-[#111827] truncate sm:text-sm">
                Livraison rapide partout
              </p>
              <p className="text-[10px] font-normal text-[#6B7280] truncate sm:text-xs">
                2 à 5 jours ouvrés
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to={profileHref}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB]"
              aria-label={isAuthenticated ? 'Mon compte' : 'Se connecter'}
            >
              <UserRound className="h-6 w-6 text-[#374151]" strokeWidth={1.8} />
            </Link>

            <Link
              to="/cart"
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB]"
              aria-label="Panier"
            >
              <ShoppingBag className="h-6 w-6 text-[#374151]" strokeWidth={1.8} />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#EF4444] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-[#374151]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Navigation desktop (liens visibles) */}
        <nav
          className="hidden border-t border-[#EFEFEF] bg-white px-4 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-2"
          style={{
            width: "100%",
            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[#E94560] text-white'
                      : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/my-orders"
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-[#E94560] text-white'
                        : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
                    ].join(' ')
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {userLabel}
                  </span>
                </NavLink>
                <NavLink
                  to="/my-orders"
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-[#E94560] text-white'
                        : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
                    ].join(' ')
                  }
                >
                  Mes commandes
                </NavLink>
                {isAdmin ? (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      [
                        'rounded-full px-4 py-2 text-sm font-semibold transition',
                        isActive
                          ? 'bg-[#E94560] text-white'
                          : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
                      ].join(' ')
                    }
                  >
                    Admin
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F8F5F0] hover:text-[#E94560]"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[#E94560] text-white'
                      : 'text-[#1A1A2E] hover:bg-[#F8F5F0] hover:text-[#1A1A2E]',
                  ].join(' ')
                }
              >
                Connexion
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* Menu mobile (tiroir latéral) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1A1A2E]/55"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[92vw] max-w-sm flex-col bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EFEFEF] px-4 py-4">
              <Link
                to="/"
                className="flex items-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                <span className="font-display text-[28px] font-black tracking-tight text-primary leading-none">
                  <span className="text-[#1A1A2E]">W</span>
                  <span className="text-[#E94560]">D</span>
                </span>
                <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#6B6B6B] ml-1 mt-0.5">
                  WORLD DESIGN
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EFEFEF] bg-white text-[#374151]"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
              {/* Bandeau livraison mobile */}
              <div className="flex items-center gap-3 rounded-[14px] bg-[#F3F4F6] px-4 py-3">
                <Truck className="h-7 w-7 shrink-0 text-[#1A56DB]" strokeWidth={1.7} />
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Livraison rapide partout</p>
                  <p className="text-xs text-[#6B7280]">2 à 5 jours ouvrés</p>
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
                        : 'border-[#EFEFEF] bg-white text-[#1A1A2E] hover:border-[#E94560]/30 hover:bg-[#F8F5F0]',
                    ].join(' ')
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="rounded-[16px] border border-[#EFEFEF] bg-[#F8F5F0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#E94560]">Mon compte</p>
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
                          : 'border-[#EFEFEF] bg-white text-[#1A1A2E] hover:border-[#E94560]/30 hover:bg-[#F8F5F0]',
                      ].join(' ')
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Mes commandes
                    </span>
                  </NavLink>

                  {isAdmin ? (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-[16px] border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#E94560]/30 hover:bg-[#F8F5F0]"
                    >
                      <span>Admin</span>
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-between rounded-[16px] border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#E94560] transition hover:bg-[#F8F5F0]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-[16px] border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#E94560]/30 hover:bg-[#F8F5F0]"
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Connexion
                  </span>
                </NavLink>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}