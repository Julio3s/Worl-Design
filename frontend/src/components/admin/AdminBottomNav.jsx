import { NavLink } from 'react-router-dom';

import { ADMIN_NAV_ITEMS } from './adminNav';

function bottomLinkClass({ isActive }) {
  return [
    'flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition',
    isActive ? 'text-accent' : 'text-text-muted hover:text-accent',
  ].join(' ');
}

export function AdminBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E0DBD5] bg-white lg:hidden"
      aria-label="Navigation admin mobile"
    >
      <div className="mx-auto flex max-w-7xl">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={bottomLinkClass}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
