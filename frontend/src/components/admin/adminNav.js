import { LayoutDashboard, Package, ShoppingBag, Tags, Users } from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    shortLabel: 'Accueil',
    breadcrumb: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/admin/products',
    label: 'Produits',
    shortLabel: 'Produits',
    breadcrumb: 'Produits',
    icon: Package,
  },
  {
    to: '/admin/categories',
    label: 'Catégories',
    shortLabel: 'Catégories',
    breadcrumb: 'Catégories',
    icon: Tags,
  },
  {
    to: '/admin/orders',
    label: 'Commandes',
    shortLabel: 'Commandes',
    breadcrumb: 'Commandes',
    icon: ShoppingBag,
  },
  {
    to: '/admin/customers',
    label: 'Clients',
    shortLabel: 'Clients',
    breadcrumb: 'Clients',
    icon: Users,
  },
];

export function getAdminNavItem(pathname) {
  return ADMIN_NAV_ITEMS.find((item) => pathname.startsWith(item.to)) || null;
}
