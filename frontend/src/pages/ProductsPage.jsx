import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchX, ChevronDown, ShoppingCart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { getCategories, getProducts } from '../api/catalog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/skeletons/ProductGridSkeleton';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';
import { useCartStore } from '../store/cartStore';

const PAGE_SIZE = 12;

function buildPageNumbers(totalPages) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export default function ProductsPage() {
  usePageTitle('Catalogue');

  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [productsData, setProductsData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    search: searchParams.get('search') || '',
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceRef = useRef(null);

  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));
  const searchParamsString = searchParams.toString();
  const totalPages = Math.max(1, Math.ceil(Number(productsData.count || 0) / PAGE_SIZE));
  const pageNumbers = useMemo(() => buildPageNumbers(totalPages), [totalPages]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const nextCategories = await getCategories();
        if (!isMounted) {
          return;
        }
        setCategories(nextCategories);
      } catch {
        if (!isMounted) {
          return;
        }
        setCategories([]);
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      search: searchParams.get('search') || '',
    });
  }, [searchParamsString]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
      };

      if (searchParams.get('category')) {
        params.category = searchParams.get('category');
      }
      if (searchParams.get('min_price')) {
        params.min_price = searchParams.get('min_price');
      }
      if (searchParams.get('max_price')) {
        params.max_price = searchParams.get('max_price');
      }
      if (searchParams.get('search')) {
        params.search = searchParams.get('search');
      }

      try {
        const data = await getProducts(params);
        if (!isMounted) {
          return;
        }
        setProductsData({
          count: Number(data.count || 0),
          next: data.next || null,
          previous: data.previous || null,
          results: Array.isArray(data.results) ? data.results : [],
        });
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }
        setError(caughtError?.message || 'Impossible de charger le catalogue.');
        setProductsData({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchParamsString]);

  const activeCategoryLabel = useMemo(() => {
    if (!filters.category) {
      return 'Toutes les catégories';
    }

    return categories.find((category) => category.slug === filters.category)?.name || filters.category;
  }, [categories, filters.category]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextParams = new URLSearchParams();
      if (value.trim()) {
        nextParams.set('search', value.trim());
      }
      if (filters.category) {
        nextParams.set('category', filters.category);
      }
      if (filters.min_price) {
        nextParams.set('min_price', filters.min_price);
      }
      if (filters.max_price) {
        nextParams.set('max_price', filters.max_price);
      }
      nextParams.set('page', '1');
      setSearchParams(nextParams, { replace: false });
    }, 400);
  };

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();

    if (filters.category) {
      nextParams.set('category', filters.category);
    }
    if (filters.min_price) {
      nextParams.set('min_price', filters.min_price);
    }
    if (filters.max_price) {
      nextParams.set('max_price', filters.max_price);
    }
    if (filters.search) {
      nextParams.set('search', filters.search);
    }
    nextParams.set('page', '1');

    setSearchParams(nextParams, { replace: false });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      search: '',
    });
    setSearchInput('');
    setSearchParams({}, { replace: false });
  };

  const items = useCartStore((state) => state.items);
  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catalogue"
          title="Tous les produits"
          description="Recherchez un produit ou une catégorie, filtrez par prix et catégorie."
        />

        {/* Filtres visibles directement */}
        <div className="mt-6 rounded-[12px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            {/* Catégorie */}
            <div className="w-full sm:w-48 sm:flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(event) => {
                    handleFilterChange('category', event.target.value);
                    const nextParams = new URLSearchParams();
                    if (event.target.value) nextParams.set('category', event.target.value);
                    if (filters.min_price) nextParams.set('min_price', filters.min_price);
                    if (filters.max_price) nextParams.set('max_price', filters.max_price);
                    if (filters.search) nextParams.set('search', filters.search);
                    nextParams.set('page', '1');
                    setSearchParams(nextParams, { replace: false });
                  }}
                  className="h-11 w-full appearance-none rounded-[8px] border border-[#E0DBD5] bg-cream px-3 pr-8 text-sm text-text-dark outline-none transition focus:border-accent"
                >
                  <option value="">Toutes les catégories</option>
                  {loadingCategories ? (
                    <option value="">Chargement...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            {/* Prix Min & Max + Boutons sur la même ligne */}
            <div className="flex flex-1 flex-wrap items-end gap-3 sm:flex-nowrap">
              <div className="flex flex-1 gap-2">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Prix min
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(event) => handleFilterChange('min_price', event.target.value.replace(/[^0-9]/g, ''))}
                    className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-cream px-3 text-[16px] text-text-dark outline-none transition focus:border-accent"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Prix max
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(event) => handleFilterChange('max_price', event.target.value.replace(/[^0-9]/g, ''))}
                    className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-cream px-3 text-[16px] text-text-dark outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              {/* Bouton Filtrer */}
              <button
                type="button"
                onClick={applyFilters}
                className="flex h-11 items-center justify-center rounded-[8px] bg-accent px-5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Filtrer
              </button>

              {/* Bouton reset */}
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[#E0DBD5] bg-cream text-text-muted transition hover:border-accent hover:text-accent"
                title="Réinitialiser les filtres"
              >
                <SearchX className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {loading
              ? 'Chargement des produits...'
              : `${productsData.count} produit(s) dans ${activeCategoryLabel}`}
          </p>
          {!loading && pageNumbers.length > 1 ? (
            <p className="text-sm text-text-muted">
              Page {currentPage} sur {totalPages}
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-6">
            <ProductGridSkeleton count={6} />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState description={error} onRetry={() => window.location.reload()} />
          </div>
        ) : productsData.results.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {productsData.results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('page', String(page));
                  setSearchParams(nextParams, { replace: false });
                }}
              />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Aucun produit pour le moment"
              description="Les produits apparaîtront ici dès qu'ils seront publiés et actifs."
              action={
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Retour à l'accueil
                </Link>
              }
            />
          </div>
        )}
      </section>

      {/* Bouton panier flottant */}
      <Link
        to="/cart"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:opacity-95 active:scale-[0.95]"
        aria-label="Voir le panier"
      >
        <ShoppingCart className="h-6 w-6" strokeWidth={2} />
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[11px] font-bold text-white">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
