import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour précharger automatiquement les images secondaires des produits
 * quand ils deviennent visibles dans le viewport.
 * Les images sont mises en cache par le navigateur pour un chargement plus rapide.
 */
export function usePreloadSecondaryImages(product, options = {}) {
  const {
    threshold = 0.1, // Déclencher quand 10% du composant est visible
    rootMargin = '100px', // Précharger 100px avant que l'élément soit visible
    enabled = true,
  } = options;

  const observerRef = useRef(null);
  const hasPreloaded = useRef(false);

  const preloadImages = useCallback((product) => {
    if (!product?.images && !product?.videos || hasPreloaded.current) return;

    hasPreloaded.current = true;

    // Précharger toutes les images secondaires (sauf la première qui est déjà chargée)
    if (product.images) {
      product.images.forEach((img, index) => {
        if (index > 0 && img.image_url) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'image';
          link.href = img.image_url;
          document.head.appendChild(link);

          // Également précharger l'image en mémoire
          const image = new Image();
          image.src = img.image_url;
        }
      });
    }

    // Précharger les vidéos secondaires (sauf la première qui est déjà chargée)
    if (product.videos) {
      product.videos.forEach((video, index) => {
        if (index > 0 && video.video_url) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'video';
          link.href = video.video_url;
          document.head.appendChild(link);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled || !product) return;

    // Si le produit n'a pas d'images secondaires, pas besoin de précharger
    const hasSecondaryMedia = (product.images && product.images.length > 1) || 
                              (product.videos && product.videos.length > 1);
    if (!hasSecondaryMedia) return;

    const element = document.querySelector(`[data-product-id="${product.id}"]`);
    if (!element) return;

    // Créer l'observer pour détecter quand le produit devient visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPreloaded.current) {
            preloadImages(product);
            // Déconnecter l'observer après le préchargement
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [product, enabled, threshold, rootMargin, preloadImages]);

  return {
    hasPreloaded: hasPreloaded.current,
  };
}

/**
 * Hook pour précharger les images d'une liste de produits
 * Utile pour les pages catalogue avec pagination
 */
export function usePreloadProductImages(products, options = {}) {
  const {
    maxPreload = 20, // Nombre max de produits à précharger
    delay = 2000, // Délai avant de commencer le préchargement (ms)
    enabled = true,
  } = options;

  const timeoutRef = useRef(null);
  const preloadedIds = useRef(new Set());

  useEffect(() => {
    if (!enabled || !products || products.length === 0) return;

    // Attendre un peu avant de précharger pour ne pas surcharger au chargement initial
    timeoutRef.current = setTimeout(() => {
      products.slice(0, maxPreload).forEach((product) => {
        // Skip si déjà préchargé ou pas d'images secondaires
        if (preloadedIds.current.has(product.id)) return;
        if (!product.images || product.images.length <= 1) return;

        preloadedIds.current.add(product.id);

        // Précharger les images secondaires
        if (product.images) {
          product.images.forEach((img, index) => {
            if (index > 0 && img.image_url) {
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.as = 'image';
              link.href = img.image_url;
              document.head.appendChild(link);

              const image = new Image();
              image.src = img.image_url;
            }
          });
        }

        // Précharger les vidéos secondaires
        if (product.videos) {
          product.videos.forEach((video, index) => {
            if (index > 0 && video.video_url) {
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.as = 'video';
              link.href = video.video_url;
              document.head.appendChild(link);
            }
          });
        }
      });
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [products, maxPreload, delay, enabled]);
}