import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();

  // Lire les query params au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get('email');
    const registered = params.get('registered');

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    if (registered === 'true') {
      setSuccessMessage('Entreprise créée avec succès ! Connectez-vous avec vos identifiants.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/company');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="login">
      <div className="login__container container">
        <div className="login__abs"></div>

        {/* Message de succès */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login__form">
          <h2 className="login__title">Connectez-vous ici</h2>
          
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

          <fieldset className="login__fieldset">
            <legend className="login__legend">Votre courriel</legend>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="login__input" 
              required
              autoComplete="email"
            />
          </fieldset>
          
          <fieldset className="login__fieldset">
            <legend className="login__legend">Mot de passe</legend>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder='**********' 
                className="login__input" 
                required
                autoComplete="current-password"
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
            type="submit" 
            className="login__button"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers création d'entreprise */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>
            Pas encore d'entreprise ?{' '}
            <Link 
              to="/createcompanyusers" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'underline',
                fontWeight: '500'
              }}
            >
              Créez-en une
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;