// backend/routes/employee.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.model.js';
import Company from '../models/Company.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === GET /api/employees ===
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company_admin' && req.user.company) {
      query.company = req.user.company;
    }
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }
    const employees = await Employee.find(query)
      .populate('company', 'name email')
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
    if (req.user.role === 'company_admin' && req.user.company?.toString() !== companyId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const employees = await Employee.find({ company: companyId })
      .populate('company', 'name email')
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
      .populate('company', 'name email')
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
//       .populate('company', 'name email')
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
router.post('/', protect, authorize('company_admin', 'superadmin'), [
  body('name').notEmpty().withMessage('Prénom requis'),
  body('surname').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('company').notEmpty().withMessage('Compagnie requise')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { company: companyId } = req.body;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Compagnie non trouvée' });
    if (req.user.role === 'company_admin' && req.user.company?.toString() !== companyId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const employee = await Employee.create({ ...req.body, company: companyId });
    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email')
      .populate('user', 'email firstName lastName');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création' });
  }
});

// === PUT /api/employees/:id (texte + avatar) ===
router.put('/:id', protect, upload.single('avatar'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    if (req.user.role === 'company_admin' && req.user.company?.toString() !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (req.user.role === 'employee' && employee.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Avatar
    if (req.file) {
      if (employee.avatar) {
        const oldPath = path.join(__dirname, '../uploads', path.basename(employee.avatar));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      employee.avatar = `/uploads/${req.file.filename}`;
    }

    // Champs texte
    const fields = ['name', 'surname', 'patronymic', 'role', 'agency', 'email', 'phone', 'homePhone', 'workPhone',
      'insuranceAgent', 'personalSite', 'birthDate', 'corporateEmail', 'homeAddress', 'facebook', 'icq', 'title'];
    fields.forEach(f => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });

    if (req.body.company && req.user.role === 'superadmin') {
      const company = await Company.findById(req.body.company);
      if (company) employee.company = req.body.company;
    }

    await employee.save();
    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email')
      .populate('user', 'email firstName lastName');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour' });
  }
});

// === PUT /api/employees/:id/background ===
router.put('/:id/background', protect, upload.single('background'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    if (req.user.role === 'company_admin' && req.user.company?.toString() !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    if (employee.background) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(employee.background));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    employee.background = `/uploads/${req.file.filename}`;
    await employee.save();

    const populated = await Employee.findById(employee._id)
      .populate('company', 'name email')
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
    if (req.user.role === 'company_admin' && req.user.company?.toString() !== employee.company.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (employee.avatar) {
      const avatarPath = path.join(__dirname, '../uploads', path.basename(employee.avatar));
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }
    await employee.deleteOne();
    res.json({ success: true, message: 'Supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression' });
  }
});

export default router;