import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export function ProductCard({ product, showAddButton = true, badgeLabel, className = '' }) {
  const image = getProductImage(product);

  return (
    <article
      className={[
        'group flex h-full flex-col overflow-hidden rounded-[18px] bg-white transition-shadow duration-200',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]',
        className,
      ].join(' ')}
    >
      {/* IMAGE — priorité visuelle maximale */}
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

      {/* CONTENU — minimal */}
      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        {/* Catégorie */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] sm:text-xs">
          {product.category?.name || 'WORLD DESIGN'}
        </p>

        {/* Nom produit — 2 lignes max */}
        <Link
          to={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1A1A2E] transition-colors hover:text-accent sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* Prix */}
        <p className="text-base font-bold text-[#1D4ED8] sm:text-lg">
          {formatCurrency(product.price)}
        </p>
      </div>
    </article>
  );
}