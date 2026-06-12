import { Eye, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import ImageViewer from './ImageViewer';

import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export function ProductCard({ product, showAddButton = false, badgeLabel, className = '' }) {
  const image = getProductImage(product);
  const description = product.description || '';
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <article
      className={[
        'group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-white transition-shadow duration-200',
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

      {/* Bouton œil plein écran */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setViewerOpen(true);
        }}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100 focus:outline-none focus-visible:opacity-100"
        aria-label="Voir l'image en plein écran"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* CONTENU — description tronquée + prix */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        {/* Description sur une ligne, coupée par ... */}
        {description ? (
          <p className="line-clamp-1 text-xs font-normal leading-relaxed text-[#6B6B6B] sm:text-sm">
            {description}
          </p>
        ) : null}

        {/* Prix */}
        <p className="mt-auto text-base font-bold text-[#1D4ED8] sm:text-lg">
          {formatCurrency(product.price)}
        </p>
      </div>

      <ImageViewer
        src={image}
        alt={product.name}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </article>
  );
}
