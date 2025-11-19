// backend/models/Employee.model.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'La compagnie est requise']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  surname: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  patronymic: { type: String, trim: true, default: '' },
  role: { type: String, trim: true, default: '' },
  agency: { type: String, trim: true, default: '' },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: { type: String, trim: true, default: '' },
  homePhone: { type: String, trim: true, default: '' },
  workPhone: { type: String, trim: true, default: '' },
  insuranceAgent: { type: String, default: 'Нет' },
  personalSite: { type: String, trim: true, default: '' },
  birthDate: { type: String, trim: true, default: '' },
  corporateEmail: { type: String, trim: true, default: '' },
  homeAddress: { type: String, trim: true, default: '' },
  facebook: { type: String, trim: true, default: '' },
  x: { type: String, trim: true, default: '' }, // Twitter/X
  linkedin: { type: String, trim: true, default: '' },
  instagram: { type: String, trim: true, default: '' },
  github: { type: String, trim: true, default: '' },
  icq: { type: String, trim: true, default: '' },
  title: { type: String, trim: true, default: '' },
  avatar: { type: String, default: null },
  background: { type: String, default: null }
}, {
  timestamps: true,
  strict: false // Permet d'accepter des champs supplémentaires non définis dans le schéma
});

export default mongoose.model('Employee', employeeSchema);