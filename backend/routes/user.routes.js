import express from 'express';
import User from '../models/User.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (SuperAdmin only)
// @access  Private
router.get('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('company', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération des utilisateurs' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Users can only see their own profile unless they're superadmin
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('company', 'name email');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération de l\'utilisateur' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless they're superadmin
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const { firstName, lastName, email, role, company, isActive } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    
    // Only superadmin can change role and company
    if (req.user.role === 'superadmin') {
      if (role !== undefined) user.role = role;
      if (company !== undefined) user.company = company;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('company', 'name email');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' 
    });
  }
});

export default router;


