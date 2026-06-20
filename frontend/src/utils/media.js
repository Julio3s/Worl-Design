const HERO_FALLBACK = '/images/hero-products.jpg';
const CALENDAR_FALLBACK = '/images/category-calendars.jpg';
const PENCIL_CASE_FALLBACK = '/images/category-penholders.jpg';
const STAND_FALLBACK = '/images/category-stands.jpg';

const CATEGORY_FALLBACKS = {
  calendriers: CALENDAR_FALLBACK,
  'boites-stylos': PENCIL_CASE_FALLBACK,
  supports: STAND_FALLBACK,
};

export function getCategoryImage(category) {
  if (!category) {
    return HERO_FALLBACK;
  }

  return category.image_url || CATEGORY_FALLBACKS[category.slug] || HERO_FALLBACK;
}

export function getProductImage(product) {
  if (!product) {
    return HERO_FALLBACK;
  }

  // Priorité : image_url, puis première images[], puis fallback catégorie, puis fallback global
  const primary = product.image_url;
  if (primary) {
    return primary;
  }

  const firstExtra = product.images?.[0]?.image_url;
  if (firstExtra) {
    return firstExtra;
  }

  return CATEGORY_FALLBACKS[product.category?.slug] || HERO_FALLBACK;
}

export function getHeroImage(product) {
  return getProductImage(product);
}

export { HERO_FALLBACK };
