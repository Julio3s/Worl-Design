# AGENT 14 — Gestion Commandes & Clients Admin ✅ COMPLETÉ

## Backend

### `GET /api/admin/orders/`
- Filtres : `status` (multiple ou CSV), `date_from`, `date_to`, `min_amount`
- Pagination 20/page

### `GET/PATCH /api/admin/orders/:id/`
- Détail complet avec paiement FedaPay
- Mise à jour du statut commande

### `GET /api/admin/customers/`
- Clients compte + invités regroupés
- Nombre de commandes et total dépensé

## Frontend

### `/admin/orders`
- Tableau avec filtres statut/période/montant
- Icône invité, badges statut, lien vers détail

### `/admin/orders/:id`
- Infos client + badge invité
- Articles, personnalisation, fichier Cloudinary
- Bloc paiement FedaPay
- Timeline statut
- Changement de statut + toast

### `/admin/customers`
- Tableau nom, email, téléphone, commandes, total gold
- Distinction Compte / Invité

## Validation

- `npm run build` — OK

## Prochaine étape

AGENT 15 — Responsive & UI Polish
