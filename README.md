# Backend Be-Smart - Version 3

Backend API pour l'application Be-Smart avec Node.js, Express, MongoDB et JWT.

**Version 3** : Cette version inclut le dossier `build` du frontend React, nécessaire pour le déploiement sur Render.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` à la racine du dossier backend :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/be-smart
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Démarrer MongoDB (assurez-vous que MongoDB est installé et en cours d'exécution)

4. Démarrer le serveur :
```bash
npm start
```

Pour le développement avec rechargement automatique :
```bash
npm run dev
```

## Structure

- `models/` - Modèles MongoDB (User, Company, Employee)
- `routes/` - Routes API (auth, companies, employees, users)
- `middleware/` - Middlewares (auth, error handling, upload)
- `uploads/` - Dossier pour les fichiers uploadés (créé automatiquement)
- `build/` - Dossier build du frontend React (inclus pour le déploiement sur Render)

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir l'utilisateur actuel

### Compagnies
- `GET /api/companies` - Liste des compagnies
- `GET /api/companies/:id` - Détails d'une compagnie
- `POST /api/companies` - Créer une compagnie (SuperAdmin)
- `PUT /api/companies/:id` - Mettre à jour une compagnie
- `DELETE /api/companies/:id` - Supprimer une compagnie (SuperAdmin)
- `PATCH /api/companies/:id/status` - Changer le statut (SuperAdmin)

### Employés
- `GET /api/employees` - Liste des employés
- `GET /api/employees/:id` - Détails d'un employé
- `POST /api/employees` - Créer un employé
- `PUT /api/employees/:id` - Mettre à jour un employé
- `DELETE /api/employees/:id` - Supprimer un employé

## Rôles

- `superadmin` - Accès complet
- `company_admin` - Gestion de sa compagnie et ses employés
- `employee` - Accès à son propre profil

## Authentification

Les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## Déploiement sur Render

Cette version est prête pour le déploiement sur Render car elle inclut le dossier `build` du frontend.

### Configuration Render

- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Root Directory** : `/` (racine du repository)

### Variables d'environnement requises

- `NODE_ENV` = `production`
- `PORT` = (géré automatiquement par Render)
- `MONGODB_URI` = votre URI MongoDB
- `JWT_SECRET` = votre secret JWT
- `JWT_EXPIRE` = `7d`


