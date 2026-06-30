import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';
import { useWishlistStore } from '../store/wishlistStore';
import { usePreloadSecondaryImages } from '../hooks/usePreloadSecondaryImages';

export function ProductCard({ product, showAddButton = false, badgeLabel, className = '', linkState }) {
  const image = getProductImage(product);
  const description = product.description || '';
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  
  // Précharger les images secondaires en arrière-plan
  usePreloadSecondaryImages(product, {
    threshold: 0.1,
    rootMargin: '200px',
    enabled: true,
  });

  const handleShare = async () => {
    const url = window.location.origin + `/products/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url,
        });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier');
    }
  };

  return (
    <article
      data-product-id={product.id}
      className={[
        'group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-white transition-shadow duration-200',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]',
        className,
      ].join(' ')}
    >
      {/* IMAGE */}
      <Link to={`/products/${product.slug}`} state={linkState} className="block">
        <div className="relative h-[200px] w-full overflow-hidden bg-[#F1ECE6] sm:h-[220px] lg:h-[240px]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          {badgeLabel ? (
            <span className="absolute left-3 top-3 inline-flex rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Actions rapides */}
      <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white ${
            isWishlisted ? 'text-accent' : ''
          }`}
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-accent' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
          aria-label="Partager"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

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
    </article>
  );
}
