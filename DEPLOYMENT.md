# Guide de déploiement - Backend Version 3

## ✅ Ce qui est inclus

Cette version du backend inclut **le dossier `build` du frontend React**, ce qui permet de déployer l'application complète (backend + frontend) sur Render sans avoir besoin de construire le frontend séparément.

## 📁 Structure

```
backend-version-3/
├── build/              # ✅ Dossier build du frontend React (INCLUS)
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── ...
├── middleware/
├── models/
├── routes/
├── uploads/
├── server.js           # Serve Express qui sert aussi le build React
├── package.json
└── .gitignore          # ⚠️ Note: build/ n'est PAS exclu (nécessaire pour Render)
```

## 🚀 Déploiement sur Render

### Configuration dans Render Dashboard

1. **Build Command** :
   ```
   npm install
   ```
   (Pas besoin de `cd clients && npm run build` car le build est déjà inclus)

2. **Start Command** :
   ```
   npm start
   ```

3. **Root Directory** :
   ```
   /
   ```
   (Laisser vide ou mettre `/`)

### Variables d'environnement

Ajoutez ces variables dans Render Dashboard → Environment Variables :

- `NODE_ENV` = `production`
- `PORT` = (géré automatiquement par Render, ne pas définir)
- `MONGODB_URI` = votre URI MongoDB (ex: `mongodb+srv://...`)
- `JWT_SECRET` = votre secret JWT (générez-en un fort et sécurisé)
- `JWT_EXPIRE` = `7d`

## 🔍 Vérification

Une fois déployé, le serveur :
- ✅ Servira l'API sur `/api/*`
- ✅ Servira le frontend React sur toutes les autres routes
- ✅ Ne montrera plus le message "Frontend Build Required"

## 📝 Notes importantes

- Le dossier `build/` est **inclus dans le repository** (pas dans `.gitignore`)
- Si vous mettez à jour le frontend, vous devrez :
  1. Rebuild le frontend : `cd clients && npm run build`
  2. Copier le nouveau build : `cp -r clients/build backend-version-3/build`
  3. Commit et push les changements

## 🔄 Mise à jour du build

Si vous modifiez le frontend et voulez mettre à jour le build dans ce repository :

```bash
# Depuis la racine du projet be-smart
cd clients
npm run build
cd ..
cp -r clients/build backend-version-3/build
cd backend-version-3
git add build/
git commit -m "Update frontend build"
git push
```

