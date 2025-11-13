# Digit - Be-Smart Application

Application complète de gestion d'entreprises et d'employés avec React (frontend) et Node.js/Express/MongoDB (backend).

## 🚀 Structure du projet

```
Digit/
├── backend/          # API Node.js/Express
├── clients/          # Application React
└── README.md
```

## 📦 Installation et démarrage

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

## ✨ Fonctionnalités

- ✅ Authentification (Login/Register) avec JWT
- ✅ Gestion des compagnies (CRUD)
- ✅ Gestion des employés (CRUD)
- ✅ Upload d'images (logos, avatars)
- ✅ Rôles utilisateurs (SuperAdmin, Company Admin, Employee)
- ✅ Protection des routes avec authentification
- ✅ Profil employé public (accessible via QR code)
- ✅ Design responsive (mobile, tablette, desktop)

## 🛠 Technologies

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

## 📱 Responsive

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (≤ 480px)
- 📱 Tablette (≤ 768px)
- 💻 Desktop (> 768px)

## 🔗 API Endpoints

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

### Employés
- `GET /api/employees` - Liste des employés
- `GET /api/employees/:id` - Détails d'un employé (PUBLIQUE - pour QR code)
- `POST /api/employees` - Créer un employé
- `PUT /api/employees/:id` - Mettre à jour un employé
- `DELETE /api/employees/:id` - Supprimer un employé

## 👥 Rôles

- `superadmin` - Accès complet
- `company_admin` - Gestion de sa compagnie et ses employés
- `employee` - Accès à son propre profil

## 📄 Licence

ISC
