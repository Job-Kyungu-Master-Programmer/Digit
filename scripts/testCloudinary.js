import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Configuration Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Parser l'URL Cloudinary
  const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    const [, api_key, api_secret, cloud_name] = urlMatch;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret
    });
  } else {
    console.error('Format CLOUDINARY_URL invalide');
    process.exit(1);
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Test de connexion
console.log('🔍 Test de connexion à Cloudinary...');
console.log('Cloud name:', cloudinary.config().cloud_name || 'Non configuré');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Connexion Cloudinary réussie!');
    console.log('Status:', result.status);
    console.log('✅ Configuration Cloudinary valide - Prêt à uploader des images!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur de connexion Cloudinary:');
    console.error('Message:', error.message || error);
    console.error('\n⚠️  Vérifiez que:');
    console.error('   1. Vos identifiants Cloudinary sont corrects');
    console.error('   2. Votre compte Cloudinary est actif');
    console.error('   3. Vous avez une connexion internet');
    console.error('\n💡 La configuration est correcte, mais la connexion a échoué.');
    console.error('   Vous pouvez quand même tester avec un upload d\'image.');
    process.exit(1);
  });

