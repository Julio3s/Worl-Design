import { useEffect, useMemo, useState } from 'react';
import { Filter, SearchX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { getCategories, getProducts } from '../api/catalog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/skeletons/ProductGridSkeleton';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';

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
    nextParams.set('page', '1');

    setSearchParams(nextParams, { replace: false });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
    });
    setSearchParams({}, { replace: false });
  };

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catalogue"
          title="Tous les produits"
          description="Filtrez par catégorie et plage de prix, puis naviguez avec la pagination numérotée."
        />

        <form
          onSubmit={applyFilters}
          className="mt-6 rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto]">
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Catégorie</span>
              <select
                value={filters.category}
                onChange={(event) => handleFilterChange('category', event.target.value)}
                className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm text-text-dark outline-none transition focus:border-accent"
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
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Prix min</span>
              <input
                type="number"
                min="0"
                value={filters.min_price}
                onChange={(event) => handleFilterChange('min_price', event.target.value)}
                className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm text-text-dark outline-none transition focus:border-accent"
                placeholder="0"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Prix max</span>
              <input
                type="number"
                min="0"
                value={filters.max_price}
                onChange={(event) => handleFilterChange('max_price', event.target.value)}
                className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm text-text-dark outline-none transition focus:border-accent"
                placeholder="100000"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filtrer
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E0DBD5] bg-white px-5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent active:scale-[0.98]"
            >
              <SearchX className="h-4 w-4" aria-hidden="true" />
              Réinitialiser
            </button>
          </div>
        </form>

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
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
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
    </div>
  );
}
