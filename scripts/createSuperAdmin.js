import mongoose from 'mongoose';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmin = async () => {
  try {
    // Connexion à MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/be-smart';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connecté');

    // Vérifier si le superadmin existe déjà
    const existingSuperAdmin = await User.findOne({ email: 'admin@superadmin.com', role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('Superadmin existe déjà. Mise à jour du mot de passe...');
      existingSuperAdmin.password = 'sup12@';
      await existingSuperAdmin.save();
      console.log('✅ Mot de passe du superadmin mis à jour avec succès');
    } else {
      // Créer le superadmin
      const superAdmin = await User.create({
        email: 'admin@superadmin.com',
        password: 'sup12@',
        role: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      });
      console.log('✅ Superadmin créé avec succès');
      console.log('Email: admin@superadmin.com');
      console.log('Mot de passe: sup12@');
    }

    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création du superadmin:', error);
    process.exit(1);
  }
};

createSuperAdmin();




