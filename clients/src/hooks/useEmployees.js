// src/hooks/useEmployees.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useEmployees = () => {
  const { token, company, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchEmployees = useCallback(async () => {
    const companyId = company?._id || user?.company?._id;
    if (!token || !companyId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employees/company/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      console.error('Erreur fetchEmployees:', err);
    } finally {
      setLoading(false);
    }
  }, [token, company?._id, user?.company?._id, API_BASE]); // API_BASE ajouté

  const createEmployee = async (formData, avatarFile, backgroundFile) => {
    const companyId = formData.company || company?._id || user?.company?._id;
    if (!companyId) return { success: false, error: 'Compagnie manquante' };

    const employeeData = { ...formData, company: companyId };
    delete employeeData.avatar;
    delete employeeData.background;

    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      const result = await res.json();
      if (!result.success) return result;

      const id = result.data._id;

      if (avatarFile) {
        const f = new FormData(); f.append('avatar', avatarFile);
        await fetch(`${API_BASE}/employees/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: f });
      }
      if (backgroundFile) {
        const f = new FormData(); f.append('background', backgroundFile);
        await fetch(`${API_BASE}/employees/${id}/background`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: f });
      }

      await fetchEmployees();
      return result;
    } catch {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const updateEmployee = async (id, formData, avatarFile, backgroundFile) => {
    const updateData = { ...formData };
    delete updateData.avatar;
    delete updateData.background;

    try {
      await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (avatarFile) {
        const f = new FormData(); f.append('avatar', avatarFile);
        await fetch(`${API_BASE}/employees/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: f });
      }
      if (backgroundFile) {
        const f = new FormData(); f.append('background', backgroundFile);
        await fetch(`${API_BASE}/employees/${id}/background`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: f });
      }

      await fetchEmployees();
      return { success: true };
    } catch {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) await fetchEmployees();
      return data;
    } catch {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const getEmployee = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, createEmployee, updateEmployee, deleteEmployee, getEmployee, fetchEmployees };
};