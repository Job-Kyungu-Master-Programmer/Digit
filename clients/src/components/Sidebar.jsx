import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FaUsers } from "react-icons/fa";
import { MdMapsHomeWork } from "react-icons/md";
import { TbHelpTriangleFilled } from "react-icons/tb";
import logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import { getBaseUrlWithoutApi } from '../config/api.config'

const Sidebar = () => {
  const { company } = useAuth();
  const baseUrl = getBaseUrlWithoutApi();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && 
          document.body.classList.contains('sidebar-open') &&
          !e.target.closest('.sidebar') &&
          !e.target.closest('.header__hamburger')) {
        document.body.classList.remove('sidebar-open');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="sidebar__overlay" onClick={() => document.body.classList.remove('sidebar-open')}></div>
      <div className="sidebar">
        <div className="sidebar__container">
          <div className="sidebar__top">
            <div className="sidebar__logo">
              <img src={company?.logo ? `${baseUrl}${company.logo}` : logo} alt="" className="sidebar__logo__img" />
            </div>
          </div>
          <div className="sidebar__menu">
            <NavLink to='/employees' className="sidebar__item" onClick={() => window.innerWidth <= 768 && document.body.classList.remove('sidebar-open')}>
              <span className="sidebar__item__icon"><FaUsers /></span>
              <span className="sidebar__item__content">Employees</span>
            </NavLink>
            <NavLink to='/company' className="sidebar__item" onClick={() => window.innerWidth <= 768 && document.body.classList.remove('sidebar-open')}>
              <span className="sidebar__item__icon"><MdMapsHomeWork /></span>
              <span className="sidebar__item__content">Compagnie</span>
            </NavLink>
            <NavLink to='/createcompanyusers' className="sidebar__item" onClick={() => window.innerWidth <= 768 && document.body.classList.remove('sidebar-open')}>
              <span className="sidebar__item__icon"><TbHelpTriangleFilled /></span>
              <span className="sidebar__item__content">Creer une compagnie</span>
            </NavLink>
            <h2 className="sidebar__section-title">SuperAdmin</h2>
            <NavLink to='/listecompany' className="sidebar__item" onClick={() => window.innerWidth <= 768 && document.body.classList.remove('sidebar-open')}>
              <span className="sidebar__item__icon"><TbHelpTriangleFilled /></span>
              <span className="sidebar__item__content">Liste des Compagnie</span>
            </NavLink>
            <NavLink to='/createcompany' className="sidebar__item" onClick={() => window.innerWidth <= 768 && document.body.classList.remove('sidebar-open')}>
              <span className="sidebar__item__icon"><TbHelpTriangleFilled /></span>
              <span className="sidebar__item__content">Creation de l'entreprise</span>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar