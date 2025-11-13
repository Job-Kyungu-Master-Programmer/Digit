import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import bs from '../assets/bs.jpg';

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.companyName || !formData.companyEmail || !formData.password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/companies/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.companyName,
          email: formData.companyEmail,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      if (data.success) {
        // Redirection vers login avec email pré-rempli
        navigate(
          `/login?email=${encodeURIComponent(formData.companyEmail)}&registered=true`
        );
      }
    } catch (error) {
      setError(error.message || 'Erreur lors de la création de la compagnie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="CreateCompanyuser"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${bs})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div className="CreateCompanyuser__container">
        <div className="CreateCompanyuser__card">
          <h1 className="CreateCompanyuser__title">Créez une compagnie</h1>
          <p className="CreateCompanyuser__subtitle">
            Remplissez les informations pour ajouter une nouvelle entreprise.
            L'email et le mot de passe serviront à vous connecter.
          </p>

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

          <form className="CreateCompanyuser__form" onSubmit={handleSubmit} noValidate>
            <fieldset className="CreateCompanyuser__form-group">
              <legend className="CreateCompanyuser__label">Nom de la compagnie</legend>
              <input
                className="CreateCompanyuser__input"
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Ex: TechNova Inc."
                value={formData.companyName}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </fieldset>

            <fieldset className="CreateCompanyuser__form-group">
              <legend className="CreateCompanyuser__label">Courriel de la compagnie</legend>
              <input
                className="CreateCompanyuser__input"
                type="email"
                id="companyEmail"
                name="companyEmail"
                placeholder="ex: contact@entreprise.com"
                value={formData.companyEmail}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </fieldset>

            <fieldset className="CreateCompanyuser__form-group">
              <legend className="CreateCompanyuser__label">Mot de passe</legend>
              <div style={{ position: 'relative' }}>
                <input
                  className="CreateCompanyuser__input"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="**********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                </button>
              </div>
            </fieldset>

            <button 
              className="CreateCompanyuser__button" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Créer la compagnie'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;