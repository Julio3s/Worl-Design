un import { Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export function ProductCard({ product, showAddButton = false, badgeLabel, className = '' }) {
  const addItem = useCartStore((state) => state.addItem);
  const image = getProductImage(product);
  const outOfStock = Number(product.stock || 0) <= 0;
  const isCustomizable = Boolean(product.is_customizable);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      price: Number(product.price || 0),
      isCustomizable: Boolean(product.is_customizable),
      imageUrl: image,
      categorySlug: product.category?.slug || '',
      customText: '',
      customFileName: '',
    });
  };

  return (
    <article
      className={[
        'group flex h-full flex-col overflow-hidden rounded-[18px] bg-white transition-shadow duration-200',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]',
        className,
      ].join(' ')}
    >
      {/* IMAGE */}
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative h-[200px] w-full overflow-hidden bg-[#F1ECE6] sm:h-[220px] lg:h-[240px]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {badgeLabel ? (
            <span className="absolute left-3 top-3 inline-flex rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </Link>

      {/* CONTENU */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] sm:text-xs">
          {product.category?.name || 'WORLD DESIGN'}
        </p>

        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1A1A2E] transition-colors hover:text-accent sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        <p className="text-base font-bold text-[#1D4ED8] sm:text-lg">
          {formatCurrency(product.price)}
        </p>

        {/* Bouton Ajouter — seulement sur les vedettes */}
        {showAddButton ? (
          <div className="mt-auto pt-1">
            {isCustomizable ? (
              <Link
                to={`/products/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent bg-white px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white active:scale-[0.98]"
              >
                Personnaliser
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock}
                className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {outOfStock ? (
                  'Indisponible'
                ) : (
                  <>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Ajouter
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}