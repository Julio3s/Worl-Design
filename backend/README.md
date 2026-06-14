# WORLD DESIGN - Backend API (Django)

API Django pour le projet WORLD DESIGN - Gestion de goodies personnalisés.

## Structure du Projet

```
backend/
├── config/              # Configuration Django
│   ├── __init__.py
│   ├── settings.py      # Configuration principale
│   ├── urls.py          # Routage URLs
│   ├── asgi.py
│   └── wsgi.py
├── apps/                # Applications Django
│   ├── users/           # Gestion des utilisateurs
│   ├── products/        # Gestion des produits
│   ├── orders/          # Gestion des commandes
│   └── payments/        # Intégration paiements FedaPay
├── venv/                # Environnement virtuel
├── manage.py
├── requirements.txt     # Dépendances
├── .env.example         # Template fichier .env
└── README.md
```

## Installation

### Prérequis

- Python 3.8+
- PostgreSQL (ou SQLite en développement)
- pip

### Étapes

1. **Cloner le dépôt**
```bash
cd backend
```

2. **Créer et activer l'environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

5. **Effectuer les migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Peupler la base de données**
```bash
python seed.py
```

7. **Créer un utilisateur admin (optionnel)**
```bash
python manage.py createsuperuser
```

8. **Lancer le serveur de développement**
```bash
python manage.py runserver
```

Le serveur sera disponible sur `http://localhost:8000`

## Configuration

### Variables d'Environnement

Voir `.env.example` pour toutes les variables disponibles :

- `SECRET_KEY` - Clé secrète Django
- `DEBUG` - Mode debug (True/False)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Connexion PostgreSQL
- `CLOUDINARY_*` - Credentials Cloudinary
- `FEDAPAY_*` - Credentials FedaPay

## API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/profile/` - Profil utilisateur

### Produits
- `GET /api/products/` - Liste produits (pagination, filtres)
- `GET /api/products/<slug>/` - Détail produit
- `GET /api/products/categories/` - Liste catégories
- `GET /api/products/featured/` - Produits vedettes

### Commandes
- `POST /api/orders/` - Créer commande (avec support invité)
- `GET /api/orders/mine/` - Mes commandes (authentifié)
- `GET /api/orders/<id>/` - Détail commande
- `GET /api/orders/search/` - Chercher commande invité

### Paiements
- `POST /api/payments/initiate/` - Initier paiement FedaPay
- `POST /api/payments/webhook/` - Webhook FedaPay (public)

## Technologies

- Django 4.2
- Django REST Framework
- SimpleJWT (Authentication)
- PostgreSQL
- Cloudinary (Stockage fichiers)
- FedaPay (Paiement)

## Notes Importantes

### Checkout Invité
Les clients peuvent commander sans créer de compte. Les champs `user` est nullable dans le modèle Order.

### Stock
- Vérification stock AVANT création commande
- Décrémentation stock APRÈS confirmation paiement (webhook)

### Suppression Produits
- Utiliser `is_active=False` au lieu de supprimer physiquement

### Fichiers Personnalisés
- Upload Cloudinary (max 10MB)
- Formats : jpg, jpeg, png, pdf, ai, svg

## Admin Django

Accès sur `http://localhost:8000/admin/`
Credentials : configurez `SEED_ADMIN_PASSWORD` pour le compte admin de seed

## Déploiement

Pour la production :
1. Configurer PostgreSQL
2. Définir variables d'environnement sécurisées
3. Générer une nouvelle SECRET_KEY
4. Mettre DEBUG=False
5. Utiliser gunicorn : `gunicorn config.wsgi`
