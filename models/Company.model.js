import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la compagnie est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email de la compagnie est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: 'France'
  },
  website: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    enum: ['Technologie', 'Santé', 'Éducation', 'Commerce', 'Services', 'Autre'],
    default: 'Autre'
  },
  size: {
    type: String,
    enum: ['1-10 employés', '11-50 employés', '51-200 employés', '201-500 employés', '500+ employés'],
    default: '1-10 employés'
  },
  type: {
    type: String,
    enum: ['SAS', 'SARL', 'Auto-entrepreneur', 'Association', 'Autre'],
    default: 'SARL'
  },
  logo: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  qrColor: {
    type: String,
    default: '#000000'
  },
  creationYear: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);










