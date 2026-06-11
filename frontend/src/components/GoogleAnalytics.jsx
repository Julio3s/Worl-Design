import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let scriptInjected = false;
let initialized = false;
let lastPageLocation = '';

function ensureGtag() {
  if (typeof window === 'undefined' || !measurementId) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (!scriptInjected && typeof document !== 'undefined') {
    const existingScript = document.getElementById('ga4-gtag-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga4-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    scriptInjected = true;
  }

  return true;
}

function initAnalytics() {
  if (!ensureGtag() || initialized) {
    return;
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
  });

  initialized = true;
}

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!ensureGtag()) {
      return;
    }

    const pageLocation = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    if (pageLocation === lastPageLocation) {
      return;
    }

    initAnalytics();
    lastPageLocation = pageLocation;

    window.gtag('event', 'page_view', {
      page_path: `${location.pathname}${location.search}${location.hash}`,
      page_location: pageLocation,
      page_title: document.title,
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
}
