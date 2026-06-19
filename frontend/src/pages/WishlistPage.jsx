import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export default function WishlistPage() {
  usePageTitle('Favoris');

  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product) => {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.image_url,
    });
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream">
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Favoris"
            title="Mes favoris"
            description="Retrouvez ici les produits que vous avez aimés."
          />
          <div className="mt-8">
            <EmptyState
              title="Aucun favori pour le moment"
              description="Cliquez sur le cœur d'un produit pour l'ajouter à vos favoris."
              action={
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Parcourir la boutique
                </Link>
              }
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Favoris"
          title="Mes favoris"
          description={`${items.length} produit(s) dans vos favoris.`}
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <article
              key={product.id}
              className="group relative flex gap-4 overflow-hidden rounded-[18px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
            >
              <Link
                to={`/products/${product.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-[#F1ECE6]"
              >
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-1">
                <Link
                  to={`/products/${product.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-text-dark transition hover:text-accent"
                >
                  {product.name}
                </Link>
                <p className="text-base font-bold text-[#1D4ED8]">
                  {formatCurrency(product.price)}
                </p>

                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-text-muted transition hover:border-accent hover:text-accent"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}