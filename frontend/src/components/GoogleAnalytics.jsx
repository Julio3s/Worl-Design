import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let scriptInjected = false;
let analyticsInitialized = false;
let lastTrackedHref = '';
let lastTrackedAt = 0;

function ensureWindowGtag() {
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
    const existingScript = document.getElementById('google-analytics-script');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-analytics-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    scriptInjected = true;
  }

  return true;
}

function initializeAnalytics() {
  if (!ensureWindowGtag() || analyticsInitialized) {
    return;
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
  });

  analyticsInitialized = true;
}

function trackPageView(pathname) {
  if (!ensureWindowGtag()) {
    return;
  }

  initializeAnalytics();

  const href = window.location.href;
  const now = Date.now();
  const isDuplicateStrictModeCall = href === lastTrackedHref && now - lastTrackedAt < 1000;

  if (isDuplicateStrictModeCall) {
    return;
  }

  lastTrackedHref = href;
  lastTrackedAt = now;

  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_location: href,
    page_title: document.title,
  });
}

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}${location.hash}`);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
