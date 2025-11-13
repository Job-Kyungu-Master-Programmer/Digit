// src/companies/Employees.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // AJOUTÉ POUR LE BOUTON "Voir"
import { TbUserSearch } from "react-icons/tb";
import { VscCloudDownload } from "react-icons/vsc";
import { HiOutlinePlus } from "react-icons/hi2";
import { TbFileImport } from "react-icons/tb";
import { FiMoreVertical, FiX, FiTrash2 } from "react-icons/fi";
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../hooks/useAuth';

const Employees = () => {
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(null); // AJOUTÉ POUR BACKGROUND
  const [backgroundFile, setBackgroundFile] = useState(null); // AJOUTÉ POUR BACKGROUND
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null); // AJOUTÉ POUR BACKGROUND

  // Filter employees based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => 
        `${emp.name} ${emp.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || '',
      surname: emp.surname || '',
      patronymic: emp.patronymic || '',
      role: emp.role || '',
      agency: emp.agency || '',
      email: emp.email || '',
      phone: emp.phone || '',
      homePhone: emp.homePhone || '',
      workPhone: emp.workPhone || '',
      insuranceAgent: emp.insuranceAgent || 'Нет',
      personalSite: emp.personalSite || '',
      birthDate: emp.birthDate || '',
      corporateEmail: emp.corporateEmail || '',
      homeAddress: emp.homeAddress || '',
      facebook: emp.facebook || '',
      icq: emp.icq || '',
      title: emp.title || ''
    });
    setAvatarUrl(emp.avatar ? (emp.avatar.startsWith('http') ? emp.avatar : `http://localhost:5000${emp.avatar}`) : null);
    setBackgroundUrl(emp.background ? (emp.background.startsWith('http') ? emp.background : `http://localhost:5000${emp.background}`) : null); // AJOUTÉ
    setAvatarFile(null);
    setBackgroundFile(null); // AJOUTÉ
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      name: "", surname: "", patronymic: "", role: "", agency: "", email: "", phone: "",
      homePhone: "", workPhone: "", insuranceAgent: "Нет", personalSite: "",
      birthDate: "", corporateEmail: "", homeAddress: "", facebook: "", icq: "", title: "",
      company: user?.company || ''
    });
    setAvatarUrl(null);
    setBackgroundUrl(null); // AJOUTÉ
    setAvatarFile(null);
    setBackgroundFile(null); // AJOUTÉ
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setFormData({});
    setAvatarUrl(null);
    setBackgroundUrl(null); // AJOUTÉ
    setAvatarFile(null);
    setBackgroundFile(null); // AJOUTÉ
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click(); // AJOUTÉ
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e) => { // AJOUTÉ
    const file = e.target.files[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = (e) => {
    e.stopPropagation();
    setAvatarUrl(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteBackground = (e) => { // AJOUTÉ
    e.stopPropagation();
    setBackgroundUrl(null);
    setBackgroundFile(null);
    if (backgroundInputRef.current) backgroundInputRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.surname || !formData.email) {
      alert('Veuillez remplir les champs obligatoires (nom, prénom, email)');
      return;
    }

    setSaving(true);
    const result = await createEmployee(formData, avatarFile, backgroundFile); // AJOUTÉ backgroundFile
    setSaving(false);

    if (result.success) {
      closeModal();
    } else {
      alert(result.error || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.surname || !formData.email) {
      alert('Veuillez remplir les champs obligatoires (nom, prénom, email)');
      return;
    }

    setSaving(true);
    const result = await updateEmployee(selectedEmployee._id, formData, avatarFile, backgroundFile); // AJOUTÉ backgroundFile
    setSaving(false);

    if (result.success) {
      closeModal();
    } else {
      alert(result.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setSaving(true);
    const result = await deleteEmployee(selectedEmployee._id);
    setSaving(false);

    if (result.success) {
      setShowDeleteConfirm(false);
      closeModal();
    } else {
      alert(result.error || 'Erreur lors de la suppression');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="employees">
        <div className="employees__container container">

          {/* === BARRE DU HAUT === */}
          <div className="employees__top">
            <div className="employees__top__left">
              <input 
                type="search" 
                placeholder='Rechercher un(e) employé(e)' 
                className="employees__input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="employees__top__right">
              <button className="employees__top__btn"><TbUserSearch size={20} /></button>
              <button className="employees__top__btn"><VscCloudDownload size={20} /></button>

              <div className="employees__pop">
                <button className="employees__top__btn"><HiOutlinePlus size={20} /></button>
                <div className="employees__pop__menu">
                  <button 
                    className="employees__pop__btn"
                    onClick={openCreateModal}
                  >
                    <HiOutlinePlus size={20} />
                    <span>Créer un employé</span>
                  </button>
                  <button className="employees__pop__btn">
                    <TbFileImport size={20} />
                    <span>Importer depuis CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* === LISTE DES EMPLOYÉS === */}
          <div className="employees__list">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Aucun employé trouvé</div>
            ) : (
              filteredEmployees.map((emp) => (
                <div key={emp._id || emp.id} className="employees__item">
                  <div className="employees__item__avatar">
                    <img 
                      src={emp.avatar ? (emp.avatar.startsWith('http') ? emp.avatar : `http://localhost:5000${emp.avatar}`) : `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`} 
                      alt={`${emp.name} ${emp.surname}`} 
                    />
                  </div>
                  <div className="employees__item__info">
                    <div className="employees__item__name">{emp.name} {emp.surname}</div>
                    <div className="employees__item__role">{emp.role || 'N/A'}</div>
                  </div>
                  <div className="employees__item__agency">{emp.agency || 'N/A'}</div>
                  <button className="employees__item__more" onClick={() => openEditModal(emp)}>
                    <FiMoreVertical size={18} />
                  </button>
                  {/* AJOUTÉ : BOUTON "VOIR CET EMPLOYÉ" */}
                  <Link to={`/profilemployee/${emp._id}`} className="employees__item__view">
                    Voir cet employé
                  </Link>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* === MODAL UNIVERSEL (Création & Édition) === */}
      {isModalOpen && (
        <div className="employees__modal-overlay" onClick={closeModal}>
          <div className="employees__modal" onClick={(e) => e.stopPropagation()}>
            <div className="employees__modal__header">
              <h3>{isCreateMode ? "Создание сотрудника" : "Редактирование сотрудника"}</h3>
              <button className="employees__modal__close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>

            <div className="employees__modal__content">
              {/* === AVATAR === */}
              <div className="employees__modal__avatar">
                <div className="avatar-wrapper" onClick={handleAvatarClick}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>+</span>
                    </div>
                  )}
                  {avatarUrl && (
                    <button className="avatar-delete" onClick={handleDeleteAvatar}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* === BACKGROUND === AJOUTÉ */}
              <div className="employees__modal__background">
                <div className="background-wrapper" onClick={handleBackgroundClick}>
                  {backgroundUrl ? (
                    <img src={backgroundUrl} alt="Background" className="background-preview" />
                  ) : (
                    <div className="background-placeholder">
                      <span>BG</span>
                    </div>
                  )}
                  {backgroundUrl && (
                    <button className="background-delete" onClick={handleDeleteBackground}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <input 
                  ref={backgroundInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleBackgroundChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* === FORM === */}
              <div className="employees__modal__grid">
                {[
                  { label: "Имя *", name: "name", type: "text" },
                  { label: "Фамилия *", name: "surname", type: "text" },
                  { label: "Отчество", name: "patronymic", type: "text" },
                  { label: "Должность", name: "role", type: "text" },
                  { label: "E-mail *", name: "email", type: "email" },
                  { label: "Страховой агент", name: "insuranceAgent", type: "text" },
                  { label: "Звание / ученая степень", name: "title", type: "text" },
                  { label: "Мобильный телефон", name: "phone", type: "tel" },
                  { label: "Домашний телефон", name: "homePhone", type: "tel" },
                  { label: "Личный сайт", name: "personalSite", type: "text" },
                  { label: "Рабочий телефон", name: "workPhone", type: "tel" },
                  { label: "Дата рождения", name: "birthDate", type: "text" },
                  { label: "Компания / подразделение *", name: "agency", type: "select", full: true },
                  { label: "Название визитки *", name: "corporateEmail", type: "text", full: true },
                  { label: "Домашний адрес", name: "homeAddress", type: "text", full: true },
                  { label: "Facebook", name: "facebook", type: "text" },
                  { label: "ICQ", name: "icq", type: "text" },
                ].map((field) => (
                  <div key={field.name} className={`form-group ${field.full ? "full" : ""}`}>
                    <label>{field.label}</label>
                    {field.type === "select" ? (
                      <select 
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Выберите...</option>
                        <option>Агентство недвижимости Realty, Москва</option>
                        <option>Агентство недвижимости Realty, Екатеринбург</option>
                        <option>Агентство недвижимости Realty, Новосибирск</option>
                      </select>
                    ) : (
                      <input 
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        placeholder={field.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="employees__modal__footer">
              <div className="footer-left">
                {!isCreateMode && (
                  <button className="btn-delete" onClick={handleDelete}>
                    <FiTrash2 size={16} /> Supprimer
                  </button>
                )}
              </div>
              <div className="footer-right">
                {isCreateMode ? (
                  <>
                    <button 
                      className="btn-save-close" 
                      onClick={handleCreate}
                      disabled={saving}
                    >
                      {saving ? 'Création...' : 'Créer'}
                    </button>
                    <button className="btn-cancel" onClick={closeModal} disabled={saving}>Annuler</button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn-save-close"
                      onClick={handleUpdate}
                      disabled={saving}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder et fermer'}
                    </button>
                    <button 
                      className="btn-save"
                      onClick={handleUpdate}
                      disabled={saving}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button className="btn-cancel" onClick={closeModal} disabled={saving}>Annuler</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === POPUP DE CONFIRMATION PERSONNALISÉ === */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm">
            <div className="delete-confirm__icon">
              <FiTrash2 size={32} color="#d32f2f" />
            </div>
            <h3>Supprimer cet employé ?</h3>
            <p>
              Êtes-vous sûr de vouloir supprimer <strong>{formData.name} {formData.surname}</strong> ?<br />
              Cette action est irréversible.
            </p>
            <div className="delete-confirm__actions">
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDelete}
                disabled={saving}
              >
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
              <button 
                className="btn-cancel-delete" 
                onClick={cancelDelete}
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Employees;