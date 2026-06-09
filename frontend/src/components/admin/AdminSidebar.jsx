import { Link, NavLink } from 'react-router-dom';

import { Logo } from '../Logo';
import { ADMIN_NAV_ITEMS } from './adminNav';

function sidebarLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-accent text-white'
      : 'text-white hover:bg-[rgba(233,69,96,0.15)]',
  ].join(' ');
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-primary text-white lg:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <Logo to="/admin/dashboard" size="sm" />
        <p className="mt-2 text-xs font-medium uppercase tracking-normal text-white/60">
          Espace admin
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Navigation admin">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={sidebarLinkClass}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <Link
          to="/"
          className="text-sm font-medium text-white/75 transition hover:text-gold"
        >
          Retour au site
        </Link>
      </div>
    </aside>
  );
}
