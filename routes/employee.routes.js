// backend/routes/employee.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.model.js';
import Company from '../models/Company.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload, deleteCloudinaryImage, getCloudinaryUrl } from '../middleware/cloudinary.middleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Fonction utilitaire pour extraire l'ID de la compagnie de l'utilisateur
const getUserCompanyId = (user) => {
  if (!user || !user.company) return null;
  // Si c'est un objet (populate), utiliser _id
  if (user.company._id) {
    return user.company._id.toString();
  }
  // Sinon c'est un ObjectId
  return user.company.toString();
};

// === GET /api/employees ===
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company_admin') {
      const userCompanyId = getUserCompanyId(req.user);
      if (userCompanyId) {
        query.company = userCompanyId;
      }
    }
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }
    const employees = await Employee.find(query)
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Erreur employés' });
  }
});

// === GET /api/employees/company/:companyId ===
router.get('/company/:companyId', protect, async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Compagnie non trouvée' });
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== companyId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const employees = await Employee.find({ company: companyId })
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// === GET /api/employees/:id ===
// === GET /api/employees/:id → PUBLIQUE (pour NFC/QR) ===
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const employee = await Employee.findById(id)
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Erreur récupération employé:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id)
//       .populate('company', 'name email logo color')
//       .populate('user', 'email firstName lastName');
//     if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
//     if (req.user.role === 'company_admin' && req.user.company?.toString() !== employee.company._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Accès refusé' });
//     }
//     if (req.user.role === 'employee' && employee.user?.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Accès refusé' });
//     }
//     res.json({ success: true, data: employee });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur récupération' });
//   }
// });

// === POST /api/employees ===
router.post('/', protect, authorize('company_admin', 'superadmin'), upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'background', maxCount: 1 }]), [
  body('name').notEmpty().withMessage('Prénom requis'),
  body('surname').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('company').notEmpty().withMessage('Compagnie requise')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    
    // Extraire et normaliser l'ID de la compagnie
    let companyId = req.body.company;
    
    // Si c'est un objet, essayer d'extraire l'_id
    if (typeof companyId === 'object' && companyId !== null) {
      companyId = companyId._id || companyId.id || companyId;
    }
    
    // Convertir en string si nécessaire
    companyId = companyId.toString();
    
    // Valider que c'est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de compagnie invalide' 
      });
    }
    
    // Vérifier que la compagnie existe
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compagnie non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId && userCompanyId !== companyId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé - vous ne pouvez créer des employés que pour votre propre compagnie' 
      });
    }
    
    // Préparer les données de l'employé - Mongoose convertira automatiquement la chaîne en ObjectId
    const employeeData = {
      ...req.body,
      company: companyId // Simple string - Mongoose s'en occupe automatiquement
    };
    
    // Ajouter l'avatar si un fichier a été uploadé
    if (req.files && req.files['avatar'] && req.files['avatar'][0]) {
      console.log('Avatar file reçu:', req.files['avatar'][0]);
      const avatarUrl = getCloudinaryUrl(req.files['avatar'][0]);
      if (avatarUrl) {
        employeeData.avatar = avatarUrl;
        console.log('Avatar URL sauvegardée:', avatarUrl);
      } else {
        console.error('Erreur: Impossible d\'extraire l\'URL de l\'avatar depuis:', req.files['avatar'][0]);
      }
    }
    
    // Ajouter le background si un fichier a été uploadé
    if (req.files && req.files['background'] && req.files['background'][0]) {
      console.log('Background file reçu:', req.files['background'][0]);
      const backgroundUrl = getCloudinaryUrl(req.files['background'][0]);
      if (backgroundUrl) {
        employeeData.background = backgroundUrl;
        console.log('Background URL sauvegardée:', backgroundUrl);
      } else {
        console.error('Erreur: Impossible d\'extraire l\'URL du background depuis:', req.files['background'][0]);
      }
    }
    
    // Nettoyer les champs qui ne doivent pas être dans employeeData
    delete employeeData.avatarFile;
    delete employeeData.backgroundFile;
    
    // Vérifier les champs requis
    if (!employeeData.name || !employeeData.surname || !employeeData.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les champs name, surname et email sont requis' 
      });
    }
    
    console.log('Données employé à créer:', { 
      name: employeeData.name, 
      surname: employeeData.surname, 
      email: employeeData.email, 
      company: employeeData.company,
      companyType: typeof employeeData.company,
      hasAvatar: !!employeeData.avatar,
      hasBackground: !!employeeData.background
    });
    
    // Nettoyer les valeurs vides pour éviter les erreurs de validation
    Object.keys(employeeData).forEach(key => {
      if (employeeData[key] === '' || employeeData[key] === null) {
        delete employeeData[key];
      }
    });
    
    // Ne pas supprimer company même s'il a été nettoyé - Mongoose convertira automatiquement
    employeeData.company = companyId;
    
    const employee = await Employee.create(employeeData);
    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Erreur création employé:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la création de l\'employé' 
    });
  }
});

// === PUT /api/employees/:id (texte + avatar) ===
router.put('/:id', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'background', maxCount: 1 }]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (req.user.role === 'employee' && employee.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Avatar
    if (req.files && req.files['avatar'] && req.files['avatar'][0]) {
      if (employee.avatar) {
        await deleteCloudinaryImage(employee.avatar);
      }
      employee.avatar = getCloudinaryUrl(req.files['avatar'][0]);
    }

    // Background
    if (req.files && req.files['background'] && req.files['background'][0]) {
      if (employee.background) {
        await deleteCloudinaryImage(employee.background);
      }
      employee.background = getCloudinaryUrl(req.files['background'][0]);
    }

    // Champs texte
    const fields = ['name', 'surname', 'patronymic', 'role', 'agency', 'email', 'phone', 'homePhone', 'workPhone',
      'insuranceAgent', 'personalSite', 'birthDate', 'corporateEmail', 'homeAddress', 'facebook', 'x', 'linkedin', 'instagram', 'github', 'icq', 'title'];
    fields.forEach(f => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });

    if (req.body.company && req.user.role === 'superadmin') {
      const company = await Company.findById(req.body.company);
      if (company) employee.company = req.body.company;
    }

    await employee.save();
    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName');
    res.json({ success: true, data: populated });
  } catch (error) {
    console.error('Erreur mise à jour employé:', error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour' });
  }
});

// === PUT /api/employees/:id/background ===
router.put('/:id/background', protect, upload.single('background'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    if (employee.background) {
      await deleteCloudinaryImage(employee.background);
    }
    employee.background = getCloudinaryUrl(req.file);
    await employee.save();

    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email logo color')
      .populate('user', 'email firstName lastName');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur background' });
  }
});

// === DELETE /api/employees/:id ===
router.delete('/:id', protect, authorize('company_admin', 'superadmin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (employee.avatar) {
      await deleteCloudinaryImage(employee.avatar);
    }
    if (employee.background) {
      await deleteCloudinaryImage(employee.background);
    }
    await employee.deleteOne();
    res.json({ success: true, message: 'Supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression' });
  }
});

export default router;