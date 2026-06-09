import { useEffect } from 'react';

function setMetaTag(selector, attributes) {
  const existing = document.querySelector(selector);
  const element = existing || document.createElement('meta');

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }
    element.setAttribute(key, value);
  });

  if (!existing) {
    document.head.appendChild(element);
  }

  return element;
}

export function useSeo({ title, description, image, url }) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousTitle = document.title;
    document.title = title ? `${title} | WORLD DESIGN` : 'WORLD DESIGN';

    const descriptionMeta = setMetaTag('meta[name="description"]', {
      name: 'description',
      content: description || '',
    });
    const ogTitleMeta = setMetaTag('meta[property="og:title"]', {
      property: 'og:title',
      content: title || 'WORLD DESIGN',
    });
    const ogDescriptionMeta = setMetaTag('meta[property="og:description"]', {
      property: 'og:description',
      content: description || '',
    });
    const ogImageMeta = setMetaTag('meta[property="og:image"]', {
      property: 'og:image',
      content: image || '',
    });
    const ogUrlMeta = setMetaTag('meta[property="og:url"]', {
      property: 'og:url',
      content: url || window.location.href,
    });

    return () => {
      document.title = previousTitle;
      if (descriptionMeta?.getAttribute('content') === '') {
        descriptionMeta.remove();
      }
      if (ogTitleMeta?.getAttribute('content') === '') {
        ogTitleMeta.remove();
      }
      if (ogDescriptionMeta?.getAttribute('content') === '') {
        ogDescriptionMeta.remove();
      }
      if (ogImageMeta?.getAttribute('content') === '') {
        ogImageMeta.remove();
      }
      if (ogUrlMeta?.getAttribute('content') === '') {
        ogUrlMeta.remove();
      }
    };
  }, [description, image, title, url]);
}
