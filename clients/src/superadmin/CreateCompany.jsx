import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../hooks/useCompany';

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const { createCompany } = useCompany();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const result = await createCompany(formData);
    if (result.success) {
      navigate('/listecompany');
    } else {
      setError(result.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className="createCompany">
      <div className="createCompany__container container">
        <h1 className="createCompany__title">Créez une compagnie</h1>

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

        <form className="createCompany__form" onSubmit={handleSubmit}>
          {/* Company Name */}
          <fieldset className="createCompany__form-group">
            <legend className="createCompany__label">Nom de la compagnie</legend>
            <input
              className="createCompany__input"
              type="text"
              id="companyName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </fieldset>

          {/* Company Email */}
          <fieldset className="createCompany__form-group">
            <legend className="createCompany__label">Courriel de la compagnie</legend>
            <input
              className="createCompany__input"
              type="email"
              id="companyEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </fieldset>

          <button className="createCompany__button" type="submit">
            Créer la compagnie
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;