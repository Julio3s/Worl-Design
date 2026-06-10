import { Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export function ProductCard({ product, showAddButton = true, badgeLabel, className = '' }) {
  const addItem = useCartStore((state) => state.addItem);
  const image = getProductImage(product);
  const outOfStock = Number(product.stock || 0) <= 0;
  const isCustomizable = Boolean(product.is_customizable);

  const handleAdd = () => {
    if (outOfStock) {
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      price: Number(product.price || 0),
      imageUrl: image,
      categorySlug: product.category?.slug || '',
      customText: '',
      customFileName: '',
    });
  };

  return (
    <article
      className={[
        'product-card-hover group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white hover:border-accent',
        className,
      ].join(' ')}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[5/3] overflow-hidden bg-[#F1ECE6]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {badgeLabel ? (
            <span className="absolute left-3 top-3 inline-flex rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            {product.category?.name || 'WORLD DESIGN'}
          </p>
          <h3 className="min-h-[3rem] break-words text-base font-semibold text-text-dark">
            <Link to={`/products/${product.slug}`} className="transition hover:text-accent">
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-text-muted">Prix</p>
            <p className="text-lg font-semibold text-price">
              {formatCurrency(product.price)}
            </p>
          </div>
        </div>

        {showAddButton ? (
          <div className="mt-auto">
            {isCustomizable ? (
              <Link
                to={`/products/${product.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-white px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white active:scale-[0.98]"
              >
                Personnaliser
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
        ) : (
          <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-accent">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Produit vedette
          </div>
        )}
      </div>
    </article>
  );
}
