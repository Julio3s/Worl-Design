# AGENT 03 — Auth API (JWT) ✅ COMPLÉTÉ

## Endpoints Implémentés

### 1. **POST /api/auth/register/** (AllowAny)
Crée un nouvel utilisateur avec email, username, password, phone (optional).
- Rate limit: **3/minute** par IP
- Validation: password confirmation requise
- Réponse (201): `{ "detail": "User created successfully" }`

### 2. **POST /api/auth/login/** (AllowAny)
Authentifie un utilisateur et retourne JWT tokens.
- Rate limit: **5/minute** par IP
- Paramètres: `email`, `password`
- Réponse (200):
```json
{
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "is_admin_user": false,
    ...
  }
}
```

### 3. **GET /api/auth/profile/** (IsAuthenticated)
Retourne le profil de l'utilisateur connecté.
- Authentification requise: JWT Bearer token
- Réponse (200): User object with all fields

### 4. **POST /api/auth/logout/** (IsAuthenticated)
Termine la session (client doit jeter le token).
- Authentification requise: JWT Bearer token
- Réponse (200): `{ "detail": "Logged out successfully" }`

### 5. **POST /api/auth/refresh/** (AllowAny)
Renouvelle le access token avec un refresh token.
- Paramètres: `{ "refresh": "token" }`
- Réponse (200): `{ "access": "new_token", "refresh": "token" }`

## Configuration JWT

- **ACCESS_TOKEN_LIFETIME**: 15 minutes
- **REFRESH_TOKEN_LIFETIME**: 7 jours
- **ROTATE_REFRESH_TOKENS**: True (nouveau refresh token généré à chaque utilisation)
- **ALGORITHM**: HS256
- **SIGNING_KEY**: Django SECRET_KEY

## Custom Permission

Fichier: `apps/users/permissions.py`

```python
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """Permission class to check if user is an admin user."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user)
```

Utilisage:
```python
from apps.users.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_only_view(request):
    ...
```

## Rate Limiting

- **Login** (`POST /api/auth/login/`): 5 tentatives par minute par IP
- **Register** (`POST /api/auth/register/`): 3 tentatives par minute par IP
- Cache backend: Database (django_cache_table)
- Exception: Retourne 403 Forbidden (configurable en 429 Too Many Requests)

## Tests

### Fichiers de test créés:
- `test_auth.py` - Teste tous les endpoints (register, login, profile, logout)
- `test_ratelimit.py` - Teste le rate limiting sur login et register

### Exécution:
```bash
python test_auth.py        # Tests complets
python test_ratelimit.py   # Tests rate limiting
```

### Résultats:
- ✅ Registration: 201 Created
- ✅ Login: 200 OK avec JWT tokens
- ✅ Profile (with JWT): 200 OK
- ✅ Profile (without JWT): 401 Unauthorized
- ✅ Logout: 200 OK
- ✅ Rate limiting login: Bloqué après 5 tentatives/min
- ✅ Rate limiting register: Bloqué après 3 tentatives/min

## Fichiers modifiés

1. **apps/users/permissions.py** (NEW) - Custom permission IsAdminUser
2. **apps/users/views.py** - Ajout rate limiting, refresh token endpoint
3. **apps/users/urls.py** - Ajout route refresh token
4. **config/settings.py** - Ajout exception handler pour rate limiting
5. **config/exception_handlers.py** (NEW) - Handler pour Ratelimited exceptions
6. **.env** - Ajout testserver à ALLOWED_HOSTS

## Prochaines étapes

AGENT 04 - API Produits:
- Endpoints publiques: liste, détail (slug), catégories, produits vedettes
- Filtres: ?category=slug&min_price=X&max_price=Y
- Pagination: 12 produits par page
- Endpoints admin: créer, modifier, désactiver produit
- Upload image vers Cloudinary

STATUS: ✅ AGENT 03 COMPLET - Auth API fonctionnelle avec JWT et rate limiting
