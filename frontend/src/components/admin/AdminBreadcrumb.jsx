import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { getAdminNavItem } from './adminNav';

export function AdminBreadcrumb() {
  const { pathname } = useLocation();
  const current = getAdminNavItem(pathname);

  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-sm text-text-muted">
      <Link to="/admin/dashboard" className="transition hover:text-accent">
        Admin
      </Link>
      {current ? (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-medium text-text-dark">{current.breadcrumb}</span>
        </>
      ) : null}
    </nav>
  );
}
