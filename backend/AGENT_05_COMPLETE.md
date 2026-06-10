# AGENT 05 — API Commandes ✅ COMPLETÉ

## Endpoints implémentés

### Public
- `POST /api/orders/`
  - Commandes invitées supportées
  - Commandes authentifiées supportées
  - Vérification du stock avant création
  - Statut initial `PENDING`
  - `custom_file` uploadé vers Cloudinary si fourni

- `GET /api/orders/search/?email=X&phone=Y`
  - Recherche d'une commande invitée par email + téléphone

### Authentifié
- `GET /api/orders/mine/`
  - Retourne uniquement les commandes du user connecté

- `GET /api/orders/<id>/`
  - Accessible par le propriétaire ou un admin

## Modèle de données

Le modèle `Order` a été aligné sur le contrat du projet :
- `user` nullable
- `name`
- `email`
- `phone`
- `delivery_address`

Compatibilité conservée via alias de propriétés `guest_*`.

## Règles métier couvertes

- Pas de décrémentation de stock à la création de commande
- Refus si stock insuffisant
- Quantité minimale par item = 1
- Fichiers personnalisés limités à 10 MB
- Formats acceptés : `jpg`, `jpeg`, `png`, `pdf`, `ai`, `svg`
- Commandes invitées invisibles dans `mine`

## Migration ajoutée

- `apps/orders/migrations/0003_rename_guest_fields.py`

## Validation

Script exécuté avec succès :
- `test_agent05_orders.py`

Résultat :
- `11/11 tests passed`

## Fichiers modifiés

1. `apps/orders/models.py`
2. `apps/orders/serializers.py`
3. `apps/orders/views.py`
4. `apps/orders/admin.py`
5. `apps/orders/migrations/0003_rename_guest_fields.py`
6. `test_agent05_orders.py`

## Prochaine étape

AGENT 06 — API Paiement FedaPay
- initiation du paiement
- webhook public
- validation de la transaction FedaPay
- confirmation commande + décrémentation stock
