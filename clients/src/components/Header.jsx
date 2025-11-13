// src/components/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const { company, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    document.body.classList.toggle('sidebar-open', !sidebarOpen);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <button 
            className="header__hamburger"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div>
            <h1 className="header__title">
              {company?.name || 'Ma Compagnie'}
            </h1>
            <p className="header__subtitle">
              Bienvenue, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </p>
          </div>
        </div>
        <div className="header__right">
          <button 
            className="header__logout"
            onClick={logout}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;