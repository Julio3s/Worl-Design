const HERO_FALLBACK = '/images/hero-products.jpg';
const CALENDAR_FALLBACK = '/images/category-calendars.jpg';
const PENCIL_CASE_FALLBACK = '/images/category-penholders.jpg';
const STAND_FALLBACK = '/images/category-stands.jpg';

const CATEGORY_FALLBACKS = {
  calendriers: CALENDAR_FALLBACK,
  'boites-stylos': PENCIL_CASE_FALLBACK,
  supports: STAND_FALLBACK,
};

function appendCacheBuster(url, stamp) {
  if (!url || !stamp) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(stamp)}`;
}

export function getCategoryImage(category) {
  if (!category) {
    return HERO_FALLBACK;
  }

  const image = category.image_url || CATEGORY_FALLBACKS[category.slug] || HERO_FALLBACK;

  return appendCacheBuster(image, category.updated_at);
}

export function getProductImage(product) {
  if (!product) {
    return HERO_FALLBACK;
  }

  const image = product.image_url || CATEGORY_FALLBACKS[product.category?.slug] || HERO_FALLBACK;

  return appendCacheBuster(image, product.updated_at);
}

export function getHeroImage(product) {
  return getProductImage(product);
}

export { HERO_FALLBACK };
