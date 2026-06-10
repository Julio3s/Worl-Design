# AGENT 08 — Pages Publiques ✅ COMPLETÉ

## Composants livrés

### Navbar
- Fond `#1A1A2E`, logo Playfair Display blanc
- Liens hover gold, bouton Commander `#E94560`
- Icône panier avec badge quantité accent
- Menu hamburger + drawer mobile

### Footer
- Fond bleu nuit, coordonnées WORLD DESIGN Lomé
- Liens utiles (catalogue, panier, connexion)

### Pages

| Route | Statut |
|-------|--------|
| `/` HomePage | Hero, catégories API, 6 produits vedettes |
| `/products` ProductsPage | Grille 2 col mobile / 3 desktop, filtres, pagination 12 |
| `/products/:slug` ProductDetailPage | Personnalisation, stock, SEO, ajout panier |

## Store panier (`cartStore.js`)

- `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotal`, `getCount`
- Persistance `localStorage` (préparation Agent 09)
- Chargement au démarrage via `main.jsx`

## Règles métier UI

- Stock = 0 : label « Rupture de stock », bouton désactivé
- Produit personnalisable : bouton « Personnaliser » sur les cartes (redirige vers le détail)
- Détail : textarea + upload fichier (jpg, png, pdf, ai, svg)
- Feedback visuel après ajout au panier

## Charte graphique

- Couleurs exactes SECTION 2 appliquées
- Polices Playfair Display + Plus Jakarta Sans
- Mobile-first 375px vérifié

## API consommée

- `GET /api/products/categories/`
- `GET /api/products/featured/`
- `GET /api/products/` (filtres + pagination)
- `GET /api/products/:slug/`

## Validation

- `npm run build` — OK
- Données réelles depuis l'API backend

## Fichiers principaux

1. `src/components/Navbar.jsx`
2. `src/components/Footer.jsx`
3. `src/components/ProductCard.jsx`
4. `src/components/CategoryCard.jsx`
5. `src/pages/HomePage.jsx`
6. `src/pages/ProductsPage.jsx`
7. `src/pages/ProductDetailPage.jsx`
8. `src/store/cartStore.js`
9. `src/api/catalog.js`
10. `src/hooks/useSeo.js`

## Prochaine étape

AGENT 09 — Panier & Checkout (pages `/cart`, `/checkout`, `/order-success`, flux FedaPay)
