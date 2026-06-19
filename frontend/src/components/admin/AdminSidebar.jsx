import { Link, NavLink } from 'react-router-dom';

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
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 leading-none"
          aria-label="World Design - Accueil admin"
        >
          <img
            src="/logo-photo.png"
            alt="World Design"
            className="h-12 w-12 rounded-[8px] object-cover"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black text-white">WORLD</span>
            <span className="text-base font-black text-accent">DESIGN</span>
          </div>
        </Link>
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
