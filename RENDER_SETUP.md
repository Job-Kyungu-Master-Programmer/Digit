# Configuration Render pour Digit Backend (Version 3)

## 📋 Configuration dans Render Dashboard

### Build Command
```
npm install
```

### Start Command
```
npm start
```

### Root Directory
```
/
```
(Laissez vide - tout est à la racine du repository)

## 🔧 Variables d'environnement à configurer

Dans Render Dashboard → Environment Variables, ajoutez :

- `NODE_ENV` = `production`
- `PORT` = `10000` (ou laissez Render le gérer automatiquement)
- `MONGODB_URI` = votre URI MongoDB (ex: `mongodb+srv://...`)
- `JWT_SECRET` = votre secret JWT
- `JWT_EXPIRE` = `7d`

## 📝 Notes importantes

- **Version 3** : Cette version inclut le dossier `build` du frontend React
- Le fichier `render.yaml` est inclus pour une configuration automatique
- Le `package.json` est à la racine et pointe vers `server.js`
- Le dossier `build/` est inclus dans le repository (nécessaire pour Render)
- Plus besoin de build séparé : `cd clients && npm run build` - le build est déjà inclus !

## ✅ Avantages de la Version 3

- ✅ Build frontend inclus - pas besoin de build séparé
- ✅ Structure simplifiée - tout à la racine
- ✅ Prêt pour Render - configuration minimale requise
- ✅ Pas de message "Frontend Build Required"
