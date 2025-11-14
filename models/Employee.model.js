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
  patronymic: { type: String, trim: true },
  role: { type: String, trim: true },
  agency: { type: String, trim: true },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: { type: String, trim: true },
  homePhone: { type: String, trim: true },
  workPhone: { type: String, trim: true },
  insuranceAgent: { type: String, default: 'Нет' },
  personalSite: { type: String, trim: true },
  birthDate: { type: String, trim: true },
  corporateEmail: { type: String, trim: true },
  homeAddress: { type: String, trim: true },
  facebook: { type: String, trim: true },
  icq: { type: String, trim: true },
  title: { type: String, trim: true },
  avatar: { type: String, default: null },
  background: { type: String, default: null } // AJOUTÉ ICI
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);