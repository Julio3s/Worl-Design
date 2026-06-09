# AGENT 11 — Layout Admin ✅ COMPLETÉ

## Layout global

### Sidebar desktop (240px)
- Fond `#1A1A2E`, texte blanc, icônes lucide-react
- Item actif : fond `#E94560`
- Hover : `rgba(233,69,96,0.15)`
- Logo + lien « Retour au site »

### Bottom navigation mobile
- Barre fixe en bas sur `< lg`
- 4 liens : Dashboard, Produits, Commandes, Clients

### Header admin
- Fond blanc `#FFFFFF`, bordure `#E0DBD5`
- Fil d'Ariane (breadcrumb)
- Nom utilisateur connecté
- Bouton déconnexion rouge `#E94560`

### Zone contenu
- Fond crème `#F8F5F0`
- Padding adapté mobile (espace pour bottom nav)

## Routes

| Route | Page |
|-------|------|
| `/admin` | Redirige vers `/admin/dashboard` |
| `/admin/dashboard` | Placeholder dashboard |
| `/admin/products` | Placeholder produits |
| `/admin/orders` | Placeholder commandes |
| `/admin/customers` | Placeholder clients |

## Protection

- `AdminRoute` : redirige vers `/login` si non auth, vers `/` si non admin

## Composants créés

1. `components/admin/AdminLayout.jsx`
2. `components/admin/AdminSidebar.jsx`
3. `components/admin/AdminHeader.jsx`
4. `components/admin/AdminBottomNav.jsx`
5. `components/admin/AdminBreadcrumb.jsx`
6. `components/admin/AdminPage.jsx`
7. `components/admin/adminNav.js`

## Validation

- `npm run build` — OK

## Prochaine étape

AGENT 12 — Dashboard & Stats Admin
