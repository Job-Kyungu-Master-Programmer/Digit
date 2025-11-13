# Be-Smart Application

Application complète de gestion d'entreprises et d'employés avec React (frontend) et Node.js/Express/MongoDB (backend).

## Structure du projet

```
be-smart/
├── backend/          # API Node.js/Express
├── clients/          # Application React
└── README.md
```

## Installation et démarrage

### Backend

1. Aller dans le dossier backend :
```bash
cd backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/be-smart
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Démarrer MongoDB (si pas déjà démarré)

5. Démarrer le serveur :
```bash
npm start
# ou pour le développement
npm run dev
```

### Frontend

1. Aller dans le dossier clients :
```bash
cd clients
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` (optionnel, les valeurs par défaut fonctionnent) :
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Démarrer l'application :
```bash
npm start
```

## Fonctionnalités

- Authentification (Login/Register) avec JWT
- Gestion des compagnies (CRUD)
- Gestion des employés (CRUD)
- Upload d'images (logos, avatars)
- Rôles utilisateurs (SuperAdmin, Company Admin, Employee)
- Protection des routes avec authentification

## Technologies

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- multer (upload de fichiers)

### Frontend
- React
- React Router
- SCSS
- React Icons


