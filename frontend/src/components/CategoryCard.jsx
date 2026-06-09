import { Link } from 'react-router-dom';

import { getCategoryImage } from '../utils/media';

export function CategoryCard({ category }) {
  const image = getCategoryImage(category);

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.slug)}`}
      className="product-card-hover group flex overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white hover:border-accent"
    >
      <div className="h-44 w-16 flex-none overflow-hidden sm:h-52 sm:w-20">
        <img
          src={image}
          alt={category.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-gold">
            Catégorie
          </p>
          <h3 className="break-words font-semibold text-text-dark">{category.name}</h3>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          Voir
        </span>
      </div>
    </Link>
  );
}
