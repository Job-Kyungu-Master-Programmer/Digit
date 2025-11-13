// src/companies/ProfilEmployee.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TbDownload } from "react-icons/tb";
import { IoQrCode } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import facebook from '../assets/facebook.png';
import x from '../assets/x.png';
import linkedin from '../assets/linkedin.png';
import instagram from '../assets/instagram.png';
import github from '../assets/github.png';
import { SiOrganicmaps } from "react-icons/si";
import { MdOutlineWork, MdClose } from "react-icons/md";
import { MdMarkEmailUnread } from "react-icons/md";
import { FaSquarePhoneFlip } from "react-icons/fa6";
import logo from '../assets/logo.png';
import { getBaseUrlWithoutApi } from '../config/api.config';

// Fonction pour obtenir l'URL de base de l'API
const getApiBase = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Utiliser l'URL actuelle (fonctionne avec ngrok)
  return `${window.location.origin}/api`;
};

const API_BASE = getApiBase();

const ProfilEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`${API_BASE}/employees/${id}`);
        const result = await res.json();
        if (result.success) {
          setEmployee(result.data);
        } else {
          console.error("Erreur API:", result.message);
          setEmployee(null);
        }
      } catch (err) {
        console.error("Erreur chargement employé:", err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [id]);

  const openQRModal = () => setShowQRModal(true);
  const closeQRModal = () => setShowQRModal(false);

  const generateVCard = () => {
    if (!employee) return;

    const fullName = `${employee.name || ''} ${employee.surname || ''}`.trim();
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${fullName}
N:${employee.surname || ''};${employee.name || ''};;;
ORG:${employee.agency || ''}
TITLE:${employee.role || ''}
TEL;TYPE=CELL:${employee.phone || ''}
EMAIL:${employee.email || ''}
ADR;TYPE=HOME:;;${employee.homeAddress || ''}
URL:${window.location.href}
END:VCARD`.trim();

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName.replace(/ /g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const display = {
    name: `${employee?.name || ''} ${employee?.surname || ''}`.trim() || 'Nom non renseigné',
    position: employee?.role || 'Poste non renseigné',
    company: employee?.agency || 'Agence non renseignée',
    email: employee?.email || 'Email non renseigné',
    phone: employee?.phone || 'Téléphone non renseigné',
    address: employee?.homeAddress || 'Adresse non renseignée',
    url: window.location.href
  };

  // Utiliser l'URL de base dynamique (fonctionne avec ngrok)
  const baseUrl = getBaseUrlWithoutApi();
  
  const backgroundImage = employee?.background
    ? `${baseUrl}${employee.background}`
    : 'https://www.a234.fr/wp-content/uploads/2020/05/ateliers234-111102_046_phr_vfillon-54-2500x1667.jpg';

  const avatarImage = employee?.avatar
    ? `${baseUrl}${employee.avatar}`
    : 'https://images.radio-canada.ca/q_auto,w_700/v1/ici-info/16x9/herbert-diess-volkswagen-pdg.jpg';

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement du profil...</div>;
  }

  if (!employee) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Profil non trouvé</div>;
  }

  return (
    <>
      <div className="profilEmployee">
        <div className="profilEmployee__container">
          <div className="profilEmployee__view">

            <header className="profilEmployee__header">
              <div className="profilEmployee__header__logo">
                <img src={logo} alt="Logo" className="profilEmployee__header__log" />
              </div>
            </header>

            <div className="profilEmployee__banner" style={{ backgroundImage: `url('${backgroundImage}')` }}>
              <div className="profilEmployee__banner__image">
                <img src={avatarImage} alt={display.name} className="profilEmployee__banner__image__img" />
              </div>
            </div>

            <div className="profilEmployee__texts">
              <h2 className="profilEmployee__texts__name">{display.name}</h2>
              <p className="profilEmployee__texts__position">{display.position}</p>

              <div className="profilEmployee__btns">
                <button className="profilEmployee__btn" onClick={generateVCard}>
                  <TbDownload className="profilEmployee__btn__icon" />
                  <span>Enregistrer ce contact</span>
                </button>
                <button className="profilEmployee__btn" onClick={openQRModal}>
                  <IoQrCode className="profilEmployee__btn__icon" />
                </button>
              </div>

              <div className="profilEmployee__network">
                {[facebook, x, linkedin, instagram, github].map((icon, i) => (
                  <a key={i} href="#" className="profilEmployee__network__link">
                    <img src={icon} alt="" className="profilEmployee__network__link__img" />
                  </a>
                ))}
              </div>
            </div>

            <section className="profilEmployee__contact">
              <h3 className="profilEmployee__contact__title">Contact</h3>
              <a href={`tel:${display.phone.replace(/\s/g, '')}`} className="profilEmployee__contact__item">
                <FaSquarePhoneFlip className="profilEmployee__contact__item__icon" />
                <span>{display.phone}</span>
              </a>
              <a href={`mailto:${display.email}`} className="profilEmployee__contact__item">
                <MdMarkEmailUnread className="profilEmployee__contact__item__icon" />
                <span>{display.email}</span>
              </a>
              <div className="profilEmployee__contact__item">
                <MdOutlineWork className="profilEmployee__contact__item__icon" />
                <span>{display.company}</span>
              </div>
              {display.address !== 'Adresse non renseignée' && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(display.address)}`} target="_blank" rel="noopener noreferrer" className="profilEmployee__contact__item">
                  <SiOrganicmaps className="profilEmployee__contact__item__icon" />
                  <span>{display.address}</span>
                </a>
              )}
            </section>

          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="qrcode-modal-overlay" onClick={closeQRModal}>
          <div className="qrcode-modal" onClick={(e) => e.stopPropagation()}>
            <button className="qrcode-modal__close" onClick={closeQRModal}>
              <MdClose size={24} />
            </button>
            <div className="qrcode-modal__content">
              <div className="qrcode-modal__qr">
                <QRCodeCanvas value={display.url} size={180} level="H" includeMargin />
              </div>
              <div className="qrcode-modal__info">
                <h3>{display.name}</h3>
                <p className="company"><MdOutlineWork size={16} /> {display.company}</p>
              </div>
              <p className="qrcode-modal__hint">Scannez pour accéder au profil</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilEmployee;