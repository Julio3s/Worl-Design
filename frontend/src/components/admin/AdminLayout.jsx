import { Outlet } from 'react-router-dom';

import { PageTransition } from '../PageTransition';
import { ScrollToTop } from '../ScrollToTop';
import { AdminBottomNav } from './AdminBottomNav';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-cream text-text-dark">
      <ScrollToTop />
      <AdminSidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
