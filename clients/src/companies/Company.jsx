import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const Company = () => {
  const { company, setCompany, token } = useAuth();

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    creationYear: '',
    address: '',
    website: '',
    phone: '',
    email: '',
    sector: 'Technologie',
    size: '1-10 employés',
    city: '',
    country: '',
    postalCode: '',
    type: 'SAS',
    color: '#3b82f6',
    qrColor: '#000000',
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Charger les données au montage
  useEffect(() => {
    if (company?._id) {
      setFormData({
        name: company.name || '',
        creationYear: company.creationYear || '',
        address: company.address || '',
        website: company.website || '',
        phone: company.phone || '',
        email: company.email || '',
        sector: company.sector || 'Technologie',
        size: company.size || '1-10 employés',
        city: company.city || '',
        country: company.country || '',
        postalCode: company.postalCode || '',
        type: company.type || 'SAS',
        color: company.color || '#3b82f6',
        qrColor: company.qrColor || '#000000',
        logo: null
      });
      setImagePreview(company.logo ? `http://localhost:5000${company.logo}` : null);
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Redimensionnement image (original)
  const resizeImage = (file, callback) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        const MAX_SIZE = 350;
        let { width, height } = img;

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          callback(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.9);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, logo: file }));
      resizeImage(file, (previewUrl) => {
        setImagePreview(previewUrl);
      });
    }
  };

  const handleImageClick = () => fileInputRef.current.click();
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const formDataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      if (key !== 'logo' && formData[key] !== null && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/companies/${company._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
        setSuccess('Compagnie mise à jour avec succès !');
        setImagePreview(data.data.logo ? `http://localhost:5000${data.data.logo}` : null);
      } else {
        setError(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (!company?._id) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
        Chargement de la compagnie...
      </div>
    );
  }

  return (
    <div className="company">
      <div className="company__container container">
        <div className="company__top">
          <button 
            className="company__top__btn" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>

        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '1rem', 
            padding: '0.5rem',
            background: '#ffebee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            color: 'green', 
            marginBottom: '1rem', 
            padding: '0.5rem',
            background: '#d4edda',
            borderRadius: '4px'
          }}>
            {success}
          </div>
        )}

        <form className="company__form">
          {/* === PARTIE HAUT : Image + Infos principales === */}
          <div className="company__form__top">
            <div
              className={`company__form__top__image ${imagePreview ? 'has-image' : ''}`}
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Logo entreprise" />
                  <button
                    className="company__form__top__image__remove"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="company__form__top__image__placeholder">
                  Cliquez pour ajouter une image<br />
                  <small>(max 350px)</small>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="company__form__top__infos">
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                className="company__form__top__infos__input" 
                placeholder="Nom de l'entreprise" 
                required
              />
              <input 
                type="text" 
                name="creationYear"
                value={formData.creationYear} 
                onChange={handleChange}
                className="company__form__top__infos__input" 
                placeholder="Année de création" 
              />
              <input 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleChange}
                className="company__form__top__infos__input" 
                placeholder="Adresse entreprise" 
              />
              <input 
                type="text" 
                name="website"
                value={formData.website} 
                onChange={handleChange}
                className="company__form__top__infos__input" 
                placeholder="Site web" 
              />
            </div>
          </div>

          {/* === PARTIE BAS : Tous les autres champs === */}
          <div className="company__form__bottom">
            {/* Téléphone */}
            <div className="company__form__bottom__group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78" 
              />
            </div>

            {/* Email */}
            <div className="company__form__bottom__group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="contact@entreprise.com" 
              />
            </div>

            {/* Secteur d'activité */}
            <div className="company__form__bottom__group">
              <label>Secteur d'activité</label>
              <select 
                name="sector"
                value={formData.sector} 
                onChange={handleChange}
              >
                <option>Technologie</option>
                <option>Santé</option>
                <option>Éducation</option>
                <option>Commerce</option>
                <option>Services</option>
                <option>Autre</option>
              </select>
            </div>

            {/* Taille entreprise */}
            <div className="company__form__bottom__group">
              <label>Taille de l'entreprise</label>
              <select 
                name="size"
                value={formData.size} 
                onChange={handleChange}
              >
                <option>1-10 employés</option>
                <option>11-50 employés</option>
                <option>51-200 employés</option>
                <option>201-500 employés</option>
                <option>500+ employés</option>
              </select>
            </div>

            {/* Ville */}
            <div className="company__form__bottom__group">
              <label>Ville</label>
              <input 
                type="text" 
                name="city"
                value={formData.city} 
                onChange={handleChange}
                placeholder="Paris" 
              />
            </div>

            {/* Pays */}
            <div className="company__form__bottom__group">
              <label>Pays</label>
              <input 
                type="text" 
                name="country"
                value={formData.country} 
                onChange={handleChange}
                placeholder="France" 
              />
            </div>

            {/* Code postal */}
            <div className="company__form__bottom__group">
              <label>Code postal</label>
              <input 
                type="text" 
                name="postalCode"
                value={formData.postalCode} 
                onChange={handleChange}
                placeholder="75001" 
              />
            </div>

            {/* Type d'entreprise */}
            <div className="company__form__bottom__group">
              <label>Type d'entreprise</label>
              <select 
                name="type"
                value={formData.type} 
                onChange={handleChange}
              >
                <option>SAS</option>
                <option>SARL</option>
                <option>Auto-entrepreneur</option>
                <option>Association</option>
                <option>Autre</option>
              </select>
            </div>

            {/* Couleur de l'entreprise */}
            <div className="company__form__bottom__group">
              <label>Couleur de l'entreprise</label>
              <div className="company__form__bottom__group__color">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <div
                  className="company__form__bottom__group__color__preview"
                  style={{ backgroundColor: formData.color }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{formData.color}</span>
              </div>
            </div>

            {/* Couleur du QR Code */}
            <div className="company__form__bottom__group">
              <label>Couleur du QR Code</label>
              <div className="company__form__bottom__group__color">
                <input
                  type="color"
                  name="qrColor"
                  value={formData.qrColor}
                  onChange={handleChange}
                />
                <div
                  className="company__form__bottom__group__color__preview"
                  style={{ backgroundColor: formData.qrColor }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{formData.qrColor}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Company;