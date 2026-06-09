# AGENT 07 — Setup React ✅ COMPLETÉ

## Stack installée

- Vite + React 18
- Tailwind CSS (palette SECTION 2)
- react-router-dom@6
- zustand, axios, lucide-react

## Configuration

- `tailwind.config.js` — couleurs, polices, breakpoints 768px / 1280px
- `index.html` — Google Fonts Playfair Display + Plus Jakarta Sans
- `.env.example` — `VITE_API_BASE_URL`

## Structure créée

```
src/
  api/axios.js, catalog.js
  components/ (Navbar, Footer, ProtectedRoute, AdminRoute, ...)
  pages/ + pages/admin/
  store/authStore.js, cartStore.js
  hooks/, utils/
```

## Routing

- React Router avec `React.lazy()` sur toutes les pages
- `ProtectedRoute` — redirige vers `/login`
- `AdminRoute` — redirige vers `/` si non admin
- Pages placeholder pour cart, checkout, auth, admin (agents suivants)

## Axios

- `baseURL` depuis `VITE_API_BASE_URL`
- Intercepteur request : injection JWT depuis `authStore`
- Intercepteur response : refresh token sur 401, logout + redirect si échec

## Validation

- `npm run dev` — OK
- `npm run build` — OK sans erreur

## Prochaine étape

AGENT 08 — Pages publiques (Home, Catalogue, Détail produit, store panier)
