# Configuration Cloudinary

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Comment obtenir vos identifiants Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Connectez-vous à votre tableau de bord
3. Allez dans **Settings** > **Security**
4. Copiez les valeurs suivantes :
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Structure des dossiers Cloudinary

Les images sont organisées dans les dossiers suivants :
- `be-smart/companies/logos` - Logos des entreprises
- `be-smart/employees/avatars` - Avatars des employés
- `be-smart/employees/backgrounds` - Images de fond des employés

## Fonctionnalités

- ✅ Upload automatique vers Cloudinary
- ✅ Suppression automatique des anciennes images lors de la mise à jour
- ✅ Optimisation automatique des images (qualité et taille)
- ✅ Support des formats : JPG, JPEG, PNG, GIF, WEBP
- ✅ Limite de taille : 5MB par fichier

## Migration depuis le stockage local

Les anciennes images stockées localement (`/uploads/...`) continueront de fonctionner.
Les nouvelles images seront automatiquement stockées sur Cloudinary.



