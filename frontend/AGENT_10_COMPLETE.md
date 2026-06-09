# AGENT 10 — Auth Frontend ✅ COMPLETÉ

## Store auth (`authStore.js`)

- State : `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isAdmin`
- Actions : `login`, `register`, `logout`, `setTokens`, `loadFromStorage`
- Persistance `localStorage` au démarrage (`main.jsx`)

## Pages

### `/login`
- Formulaire email + mot de passe
- Bouton connexion `#E94560`
- Lien vers `/register`
- Redirection vers `/` si déjà connecté

### `/register`
- Champs : nom, email, téléphone, mot de passe, confirmation
- Inscription puis connexion automatique
- Lien vers `/login`

### `/my-orders` (protégée)
- Liste des commandes via `GET /api/orders/mine/`
- Numéro, date, montant, badge statut coloré
- Détail des articles par commande
- États : loading, erreur, vide

## Navbar

- Connecté : Mon compte (nom), Mes commandes, Déconnexion, lien Admin si `is_admin_user`
- Non connecté : Connexion
- Menu mobile mis à jour

## Composants

- `AuthFormLayout` — layout formulaires auth
- `OrderStatusBadge` — badges statut (couleurs SECTION 2)

## API

- `src/api/auth.js` — inscription + formatage erreurs
- `src/api/orders.js` — `getMyOrders()`

## Axios

- Intercepteurs JWT + refresh déjà en place (`src/api/axios.js`)

## Validation

- `npm run build` — OK

## Prochaine étape

AGENT 11 — Layout Admin
