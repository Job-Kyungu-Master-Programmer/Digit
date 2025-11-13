import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.config';

export const useCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/companies');
      if (response.success) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCompany = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/companies/${id}`);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(companyData)
      });
      if (response.success) {
        await fetchCompanies();
        return { success: true, data: response.data };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id, companyData, logoFile = null) => {
    try {
      setLoading(true);
      setError(null);

      if (logoFile) {
        // Upload with file
        const formData = new FormData();
        formData.append('logo', logoFile);
        Object.keys(companyData).forEach(key => {
          if (companyData[key] !== null && companyData[key] !== undefined) {
            formData.append(key, companyData[key]);
          }
        });

        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/companies/${id}`, {
          method: 'PUT',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Une erreur est survenue');
        }

        if (data.success) {
          await fetchCompanies();
          return { success: true, data: data.data };
        }
      } else {
        // Update without file
        const response = await apiCall(`/companies/${id}`, {
          method: 'PUT',
          body: JSON.stringify(companyData)
        });
        if (response.success) {
          await fetchCompanies();
          return { success: true, data: response.data };
        }
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/companies/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        await fetchCompanies();
        return { success: true };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/companies/${id}/status`, {
        method: 'PATCH'
      });
      if (response.success) {
        await fetchCompanies();
        return { success: true, data: response.data };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyStatus
  };
};

