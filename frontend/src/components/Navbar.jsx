import {
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
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

function getUserLabel(user) {
  if (!user) return 'Mon compte';

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email || 'Mon compte';
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
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
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 leading-none"
            aria-label="Accueil World Design"
          >
            <img
              src="/logo-photo.png"
              alt="World Design"
              className="h-12 w-auto sm:h-14 rounded-[8px] object-cover"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-extrabold text-gray-900 sm:text-lg">WORLD</span>
              <span className="text-base font-extrabold text-accent sm:text-lg">DESIGN</span>
            </div>
          </Link>

          {/* Navigation desktop - centrée */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'px-4 py-2 text-sm font-medium rounded-lg transition',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Barre de recherche desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-40 lg:w-56 rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Icône recherche mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition md:hidden"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Panier */}
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
              aria-label="Panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Compte utilisateur desktop */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to={profileHref}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
                  aria-label={userLabel}
                >
                  <UserRound className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <UserRound className="h-4 w-4" />
                Connexion
              </Link>
            )}

            {/* Menu hamburger mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        {searchOpen && (
          <div className="border-t border-gray-200 px-4 py-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un produit..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </form>
          </div>
        )}
      </header>

      {/* Menu mobile (tiroir latéral) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[85vw] max-w-sm flex-col bg-white shadow-xl">
            {/* En-tête du tiroir */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <Link
                to="/"
                className="flex items-center gap-2 leading-none"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src="/logo-photo.png"
                  alt="World Design"
                  className="h-12 w-auto rounded-[8px] object-cover"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-extrabold text-gray-900">WORLD</span>
                  <span className="text-base font-extrabold text-accent">DESIGN</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Liens de navigation mobile */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'rounded-lg px-4 py-3 text-base font-medium transition',
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100',
                      ].join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 border-t border-gray-200 pt-6">
                {/* Compte */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Mon compte
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{userLabel}</p>
                    </div>

                    <NavLink
                      to="/my-orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Package className="h-5 w-5" />
                      Mes commandes
                    </NavLink>

                    <NavLink
                      to="/cart"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Mon panier
                      {cartCount > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {cartCount}
                        </span>
                      )}
                    </NavLink>

                    {isAdmin ? (
                      <NavLink
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        <span>Administration</span>
                      </NavLink>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-5 w-5" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <NavLink
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-base font-medium text-white hover:bg-gray-800 transition"
                    >
                      <UserRound className="mr-2 h-5 w-5" />
                      Connexion
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Créer un compte
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}