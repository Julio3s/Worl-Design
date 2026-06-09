import { Outlet } from 'react-router-dom';

import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { PageTransition } from './PageTransition';
import { ScrollToTop } from './ScrollToTop';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-text-dark">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
