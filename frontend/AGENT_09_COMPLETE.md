# AGENT 09 — Panier & Checkout ✅ COMPLETÉ

## Pages livrées

### `/cart` — Panier
- Liste des articles avec miniature, nom, texte perso, quantité (+/-), sous-total
- Suppression via icône rouge `#E94560`
- Récapitulatif total + bouton « Passer la commande »
- État vide avec bouton « Voir les produits »

### `/checkout` — Checkout
- Formulaire invité : nom, email, téléphone, adresse, note
- Préremplissage automatique si utilisateur connecté
- Récapitulatif readonly à droite (sous le formulaire sur mobile)
- Bouton « Payer par carte ou mobile money »
- Flux :
  1. `POST /api/orders/` (multipart avec fichiers perso)
  2. `POST /api/payments/initiate/`
  3. Redirection vers `payment_url`

### `/order-success` — Confirmation
- Affichage du numéro de commande
- Message de confirmation vert
- Vidage automatique du panier au chargement

## API frontend

- `src/api/orders.js` — création commande FormData
- `src/api/payments.js` — initiation FedaPay

## Store panier

- Persistance `localStorage`
- Cache mémoire des fichiers `File` pour l’upload checkout
- Re-upload proposé si fichier perdu après rechargement

## Validation

- `npm run build` — OK

## Prochaine étape

AGENT 10 — Auth Frontend (login, register, mes commandes)
