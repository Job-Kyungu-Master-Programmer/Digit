# Digit - Backend API

API Backend pour l'application Digit (Be-Smart) avec Node.js, Express, MongoDB et JWT.

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` :
```env
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

## 📁 Structure

- `models/` - Modèles MongoDB (User, Company, Employee)
- `routes/` - Routes API (auth, companies, employees, users)
- `middleware/` - Middlewares (auth, error handling, upload)
- `uploads/` - Dossier pour les fichiers uploadés (créé automatiquement)

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
- `PATCH /api/companies/:id/status` - Changer le statut (SuperAdmin)

### Employés
- `GET /api/employees` - Liste des employés
- `GET /api/employees/:id` - Détails d'un employé (PUBLIQUE - pour QR code)
- `GET /api/employees/company/:companyId` - Liste des employés d'une compagnie
- `POST /api/employees` - Créer un employé
- `PUT /api/employees/:id` - Mettre à jour un employé
- `PUT /api/employees/:id/background` - Mettre à jour l'image de fond
- `DELETE /api/employees/:id` - Supprimer un employé

## 👥 Rôles

- `superadmin` - Accès complet
- `company_admin` - Gestion de sa compagnie et ses employés
- `employee` - Accès à son propre profil

## 🔐 Authentification

Les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 📦 Technologies

- Node.js
- Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- multer (upload de fichiers)
- express-validator

## 📄 Licence

ISC
