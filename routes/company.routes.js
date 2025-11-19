import express from 'express';
import { body, validationResult } from 'express-validator';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload, deleteCloudinaryImage, getCloudinaryUrl } from '../middleware/cloudinary.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private (SuperAdmin sees all, Company Admin sees only their company)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Company admin can only see their company
    if (req.user.role === 'company_admin' && req.user.company) {
      query._id = req.user.company;
    }

    // SuperAdmin can see all
    const companies = await Company.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération des compagnies' 
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compagnie non trouvée' 
      });
    }

    // Check if user has access
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== company._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération de la compagnie' 
    });
  }
});

// @route   POST /api/companies/public
// @desc    Create new company with user account (public route)
// @access  Public
router.post('/public', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if company email already exists
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé pour une compagnie' 
      });
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Create company
    const company = await Company.create({
      name,
      email
    });

    // Create user with company_admin role
    const user = await User.create({
      email,
      password,
      role: 'company_admin',
      company: company._id
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        company,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          company: user.company
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la création de la compagnie' 
    });
  }
});

// @route   POST /api/companies
// @desc    Create new company
// @access  Private (SuperAdmin only)
router.post('/', protect, authorize('superadmin'), [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const companyData = {
      ...req.body,
      createdBy: req.user._id
    };

    const company = await Company.create(companyData);

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la création de la compagnie' 
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private
router.put('/:id', protect, upload.single('logo'), async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compagnie non trouvée' 
      });
    }

    // Check permissions
    const userCompanyId = getUserCompanyId(req.user);
    if (req.user.role === 'company_admin' && userCompanyId !== company._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    // Handle logo upload
    if (req.file) {
      console.log('req.file structure:', JSON.stringify(req.file, null, 2));
      
      // Delete old logo from Cloudinary if exists
      if (company.logo) {
        await deleteCloudinaryImage(company.logo);
      }
      
      // Stocker l'URL complète de Cloudinary
      const logoUrl = getCloudinaryUrl(req.file);
      if (logoUrl) {
        company.logo = logoUrl;
        console.log('Logo sauvegardé dans MongoDB:', logoUrl);
      } else {
        console.error('Erreur: Impossible d\'extraire l\'URL du logo depuis req.file');
        console.error('Structure req.file:', req.file);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'upload du logo'
        });
      }
    }

    // Update other fields
    const { name, email, phone, address, city, postalCode, country, website, sector, size, type, color, qrColor, creationYear, status } = req.body;
    
    if (name) company.name = name;
    if (email) company.email = email;
    if (phone !== undefined) company.phone = phone;
    if (address !== undefined) company.address = address;
    if (city !== undefined) company.city = city;
    if (postalCode !== undefined) company.postalCode = postalCode;
    if (country !== undefined) company.country = country;
    if (website !== undefined) company.website = website;
    if (sector) company.sector = sector;
    if (size) company.size = size;
    if (type) company.type = type;
    if (color) company.color = color;
    if (qrColor) company.qrColor = qrColor;
    if (creationYear !== undefined) company.creationYear = creationYear;
    if (status && req.user.role === 'superadmin') company.status = status;

    await company.save();

    // S'assurer que le logo est bien dans la réponse
    const companyResponse = company.toObject();
    console.log('Compagnie retournée avec logo:', companyResponse.logo);

    res.json({
      success: true,
      data: companyResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour de la compagnie' 
    });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Private (SuperAdmin only)
router.delete('/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compagnie non trouvée' 
      });
    }

    // Delete logo from Cloudinary if exists
    if (company.logo) {
      await deleteCloudinaryImage(company.logo);
    }

    await company.deleteOne();

    res.json({
      success: true,
      message: 'Compagnie supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la suppression de la compagnie' 
    });
  }
});

// @route   PATCH /api/companies/:id/status
// @desc    Toggle company status
// @access  Private (SuperAdmin only)
router.patch('/:id/status', protect, authorize('superadmin'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compagnie non trouvée' 
      });
    }

    company.status = company.status === 'active' ? 'suspended' : 'active';
    await company.save();

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour du statut' 
    });
  }
});

export default router;


