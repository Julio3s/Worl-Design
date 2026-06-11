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

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect width="32" height="32" rx="4" fill="#0052CC"/>
      <path d="M8 10L16 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="14" r="2" fill="white"/>
    </svg>
  );
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:gap-3 lg:px-8 lg:gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 leading-none"
            aria-label="Accueil World Design"
          >
            <svg width="56" height="48" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              {/* W lettre stylisée */}
              <g>
                {/* Partie gauche du W */}
                <path d="M 20 40 L 50 130 Q 55 140 65 140 L 70 140 Q 75 140 75 130 L 60 50 Q 58 40 50 40 Q 42 40 40 50 L 25 120" fill="#0052CC"/>
                {/* Partie droite du W */}
                <path d="M 135 40 L 165 130 Q 167 140 175 140 L 180 140 Q 185 140 185 130 L 175 50 Q 173 40 165 40 Q 157 40 155 50 L 140 120" fill="#0052CC"/>
                {/* Partie centrale du W */}
                <path d="M 75 50 L 100 120 Q 102 135 115 135 L 135 50" fill="#0052CC"/>
                {/* Courbes décoratives */}
                <path d="M 40 100 Q 100 95 160 100" stroke="#0052CC" strokeWidth="4" fill="none" strokeLinecap="round"/>
                <path d="M 50 120 Q 100 130 150 120" stroke="#0052CC" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </g>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black text-[#0052CC]">World</span>
              <span className="text-xl font-black text-[#0052CC]">Design</span>
            </div>
          </Link>

          {/* Bandeau livraison */}
          <div className="hidden flex-1 items-center gap-2 rounded-full bg-[#F3F4F6] px-4 py-2.5 sm:flex sm:gap-3 md:gap-4">
            <Truck className="h-5 w-5 shrink-0 text-[#0052CC] sm:h-6 sm:w-6" strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate sm:text-base">
                Livraison rapide partout
              </p>
              <p className="text-xs text-[#6B7280] truncate sm:text-sm">
                2 à 5 jours ouvrés
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to={profileHref}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB]"
              aria-label={isAuthenticated ? 'Mon compte' : 'Se connecter'}
            >
              <UserRound className="h-5 w-5 text-[#374151]" strokeWidth={2} />
            </Link>

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB]"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5 text-[#374151]" strokeWidth={2} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#EF4444] text-[10px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] transition hover:bg-[#E5E7EB] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5 text-[#374151]" strokeWidth={2} />
            </button>
          </div>
        </div>
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
                className="flex items-center gap-3 leading-none"
                onClick={() => setMobileOpen(false)}
              >
                <svg width="48" height="42" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* W lettre stylisée */}
                  <g>
                    {/* Partie gauche du W */}
                    <path d="M 20 40 L 50 130 Q 55 140 65 140 L 70 140 Q 75 140 75 130 L 60 50 Q 58 40 50 40 Q 42 40 40 50 L 25 120" fill="#0052CC"/>
                    {/* Partie droite du W */}
                    <path d="M 135 40 L 165 130 Q 167 140 175 140 L 180 140 Q 185 140 185 130 L 175 50 Q 173 40 165 40 Q 157 40 155 50 L 140 120" fill="#0052CC"/>
                    {/* Partie centrale du W */}
                    <path d="M 75 50 L 100 120 Q 102 135 115 135 L 135 50" fill="#0052CC"/>
                    {/* Courbes décoratives */}
                    <path d="M 40 100 Q 100 95 160 100" stroke="#0052CC" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M 50 120 Q 100 130 150 120" stroke="#0052CC" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </g>
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="font-black text-[#0052CC]">World</span>
                  <span className="font-black text-[#0052CC]">Design</span>
                </div>
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
              <div className="flex items-center gap-3 rounded-full bg-[#F3F4F6] px-4 py-3">
                <Truck className="h-6 w-6 shrink-0 text-[#0052CC]" strokeWidth={2} />
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
                      'flex items-center justify-between rounded-full border px-4 py-3 text-base font-semibold transition',
                      isActive
                        ? 'border-[#0052CC] bg-[#0052CC] text-white'
                        : 'border-[#EFEFEF] bg-white text-[#1A1A2E] hover:border-[#0052CC]/30 hover:bg-[#F8F5F0]',
                    ].join(' ')
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="rounded-full border border-[#EFEFEF] bg-[#F8F5F0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0052CC]">Mon compte</p>
                    <p className="mt-1 text-sm font-semibold text-[#1A1A2E]">{userLabel}</p>
                  </div>

                  <NavLink
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between rounded-full border px-4 py-3 text-base font-semibold transition',
                        isActive
                          ? 'border-[#0052CC] bg-[#0052CC] text-white'
                          : 'border-[#EFEFEF] bg-white text-[#1A1A2E] hover:border-[#0052CC]/30 hover:bg-[#F8F5F0]',
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
                      className="flex items-center justify-between rounded-full border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#0052CC]/30 hover:bg-[#F8F5F0]"
                    >
                      <span>Admin</span>
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-between rounded-full border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#0052CC] transition hover:bg-[#F8F5F0]"
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
                  className="flex items-center justify-between rounded-full border border-[#EFEFEF] bg-white px-4 py-3 text-base font-semibold text-[#1A1A2E] transition hover:border-[#0052CC]/30 hover:bg-[#F8F5F0]"
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