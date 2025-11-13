// Fonction pour obtenir l'URL de base dynamiquement
const getBaseUrl = () => {
  // Si REACT_APP_API_URL est défini, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Sinon, utiliser l'URL actuelle (fonctionne avec ngrok)
  // Si on est sur le même domaine, utiliser des URLs relatives
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  // Fallback pour SSR
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

// Fonction pour obtenir l'URL de base sans /api (pour les images, etc.)
export const getBaseUrlWithoutApi = () => {
  if (process.env.REACT_APP_API_URL) {
    // Extraire l'URL de base depuis REACT_APP_API_URL
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:5000';
};

// Helper function to get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Helper function for file uploads
export const apiUpload = async (endpoint, formData) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const apiConfig = {
  API_BASE_URL,
  getToken,
  setToken,
  removeToken,
  apiCall,
  apiUpload
};

export default apiConfig;

