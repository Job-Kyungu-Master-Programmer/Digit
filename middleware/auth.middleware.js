import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Company from '../models/Company.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé, aucun token fourni' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      req.user = await User.findById(decoded.id).select('-password').populate('company');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Compte désactivé' 
        });
      }

      // Vérifier le statut de la compagnie (sauf pour superadmin)
      if (req.user.role !== 'superadmin' && req.user.company) {
        const company = await Company.findById(req.user.company);
        if (company && company.status === 'suspended') {
          return res.status(403).json({ 
            success: false, 
            message: 'Votre compagnie a été suspendue. Veuillez contacter l\'administrateur.' 
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur d\'authentification' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Le rôle ${req.user.role} n'a pas accès à cette ressource` 
      });
    }

    next();
  };
};


