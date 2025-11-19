import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Cloudinary
// Support pour CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
// ou variables séparées
if (process.env.CLOUDINARY_URL) {
  // Parser l'URL Cloudinary
  // Format: cloudinary://api_key:api_secret@cloud_name
  const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    const [, api_key, api_secret, cloud_name] = urlMatch;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret
    });
  } else {
    console.error('Format CLOUDINARY_URL invalide. Format attendu: cloudinary://api_key:api_secret@cloud_name');
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// File filter pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Déterminer le dossier selon le type de fichier
    let folder = 'be-smart';
    
    if (file.fieldname === 'logo') {
      folder = 'be-smart/companies/logos';
    } else if (file.fieldname === 'avatar') {
      folder = 'be-smart/employees/avatars';
    } else if (file.fieldname === 'background') {
      folder = 'be-smart/employees/backgrounds';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limite la taille max
        { quality: 'auto' } // Optimisation automatique
      ],
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  }
});

// Configuration Multer avec Cloudinary
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Fonction utilitaire pour supprimer une image de Cloudinary
export const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;

  // Si l'URL est un chemin local (ancien système), ne rien faire
  if (imageUrl.startsWith('/uploads/')) {
    console.log('URL locale détectée, suppression ignorée:', imageUrl);
    return;
  }

  try {
    // Extraire le public_id de l'URL Cloudinary
    // Format d'URL Cloudinary: 
    // https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    // ou avec transformations: .../upload/{transformations}/{folder}/{public_id}.{format}
    
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.error('URL Cloudinary invalide:', imageUrl);
      return;
    }

    // Tout ce qui suit 'upload' jusqu'au dernier élément (nom du fichier)
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    if (pathAfterUpload.length === 0) {
      console.error('Impossible d\'extraire le public_id de l\'URL:', imageUrl);
      return;
    }

    // Le dernier élément est le nom du fichier avec extension
    const filename = pathAfterUpload[pathAfterUpload.length - 1];
    const publicIdWithoutExt = filename.split('.')[0];
    
    // Les éléments avant le dernier sont le dossier (s'il y en a)
    const folderParts = pathAfterUpload.slice(0, -1);
    
    // Reconstruire le public_id complet
    let fullPublicId = publicIdWithoutExt;
    if (folderParts.length > 0) {
      // Filtrer les transformations (commencent souvent par v ou contiennent des paramètres)
      const folderPath = folderParts
        .filter(part => !part.match(/^v\d+$/) && !part.includes('='))
        .join('/');
      if (folderPath) {
        fullPublicId = `${folderPath}/${publicIdWithoutExt}`;
      }
    }
    
    await cloudinary.uploader.destroy(fullPublicId);
    console.log('Image Cloudinary supprimée:', fullPublicId);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image Cloudinary:', error);
    // Ne pas faire échouer la requête si la suppression échoue
  }
};

// Fonction pour extraire l'URL complète depuis le résultat Cloudinary
export const getCloudinaryUrl = (result) => {
  if (!result) return null;
  
  // multer-storage-cloudinary peut retourner différentes structures
  // Essayer secure_url d'abord (HTTPS), puis url, puis path
  const url = result.secure_url || result.url || result.path;
  
  if (url) {
    console.log('Cloudinary URL extraite:', url);
    return url;
  }
  
  // Si aucune URL n'est trouvée, logger pour debug
  console.error('Impossible d\'extraire l\'URL Cloudinary. Structure:', JSON.stringify(result, null, 2));
  return null;
};

export default cloudinary;

