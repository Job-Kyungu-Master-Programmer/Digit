# Configuration Render pour Digit Backend

## 📋 Configuration dans Render Dashboard

### Build Command
```
npm install && cd backend && npm install
```

### Start Command
```
npm start
```

### Root Directory
```
/backend
```

**OU** laissez vide si vous utilisez le `package.json` à la racine (recommandé).

## 🔧 Variables d'environnement à configurer

Dans Render Dashboard → Environment Variables, ajoutez :

- `NODE_ENV` = `production`
- `PORT` = `10000` (ou laissez Render le gérer automatiquement)
- `MONGODB_URI` = votre URI MongoDB (ex: `mongodb+srv://...`)
- `JWT_SECRET` = votre secret JWT
- `JWT_EXPIRE` = `7d`

## 📝 Notes

- Le fichier `render.yaml` est inclus pour une configuration automatique
- Le `package.json` à la racine pointe vers `backend/server.js`
- Les dépendances du backend sont installées automatiquement via `postinstall`

## 🚀 Alternative: Utiliser le dossier backend comme racine

Si vous préférez, vous pouvez configurer Render pour utiliser `/backend` comme Root Directory et utiliser directement le `package.json` du backend.

