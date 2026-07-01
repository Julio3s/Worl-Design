import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { PageTransition } from './PageTransition';
import { ScrollToTop } from './ScrollToTop';

export function PublicLayout() {
  const location = useLocation();
  const [showFooter, setShowFooter] = useState(true);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      setShowFooter(false);
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!showFooter) {
      const id = requestAnimationFrame(() => setShowFooter(true));
      return () => cancelAnimationFrame(id);
    }
  });

  return (
    <div
      className="flex min-h-screen flex-col bg-cream text-text-dark"
      style={{
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}