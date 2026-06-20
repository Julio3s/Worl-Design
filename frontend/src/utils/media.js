const HERO_FALLBACK = '/images/hero-products.jpg';
const CALENDAR_FALLBACK = '/images/category-calendars.jpg';
const PENCIL_CASE_FALLBACK = '/images/category-penholders.jpg';
const STAND_FALLBACK = '/images/category-stands.jpg';

const CATEGORY_FALLBACKS = {
  calendriers: CALENDAR_FALLBACK,
  'boites-stylos': PENCIL_CASE_FALLBACK,
  supports: STAND_FALLBACK,
};

// Optimise les URLs Cloudinary avec les transformations les plus agressives
function optimizeCloudinaryUrl(url, width = 800) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  // Évite les doubles transformations
  if (url.includes('/upload/c_')) {
    return url;
  }
  return url.replace('/upload/', `/upload/c_fit,w_${width},q_auto,f_auto/`);
}

export function getCategoryImage(category) {
  if (!category) {
    return HERO_FALLBACK;
  }

  return optimizeCloudinaryUrl(category.image_url) || CATEGORY_FALLBACKS[category.slug] || HERO_FALLBACK;
}

export function getProductImage(product) {
  if (!product) {
    return HERO_FALLBACK;
  }

  // Priorité : image_url, puis première images[], puis fallback catégorie, puis fallback global
  const primary = product.image_url;
  if (primary) {
    return optimizeCloudinaryUrl(primary, 600);
  }

  const firstExtra = product.images?.[0]?.image_url;
  if (firstExtra) {
    return optimizeCloudinaryUrl(firstExtra, 600);
  }

  return CATEGORY_FALLBACKS[product.category?.slug] || HERO_FALLBACK;
}

export function getHeroImage(product) {
  return getProductImage(product);
}

export function optimizeImageUrl(url, width = 800) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  if (url.includes('/upload/c_')) {
    return url;
  }
  return url.replace('/upload/', `/upload/c_fit,w_${width},q_auto,f_auto/`);
}

export { HERO_FALLBACK };
