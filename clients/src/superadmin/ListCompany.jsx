import React, { useState, useMemo, useRef } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiChevronLeft, FiChevronRight, FiPause, FiPlay, FiUpload, FiX } from 'react-icons/fi';

const SECTEURS = ['Technologie', 'Santé', 'Éducation', 'Commerce', 'Services', 'Autre'];
const TAILLES = ['1-10 employés', '11-50 employés', '51-200 employés', '201-500 employés', '500+ employés'];
const TYPES = ['SAS', 'SARL', 'Auto-entrepreneur', 'Association', 'Autre'];

const ListCompany = () => {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'TechNova Inc.',
      email: 'contact@technova.com',
      phone: '+1 514 555 1234',
      address: '123 Rue Tech, Montréal',
      city: 'Montréal',
      postalCode: 'H3A 1A1',
      country: 'Canada',
      sector: 'Technologie',
      size: '51-200 employés',
      type: 'SAS',
      color: '#3b82f6',
      qrColor: '#000000',
      logo: null,
      status: 'active'
    },
    {
      id: 2,
      name: 'GreenLeaf SARL',
      email: 'info@greenleaf.ca',
      phone: '+1 418 555 5678',
      address: '456 Av. Verte, Québec',
      city: 'Québec',
      postalCode: 'G1R 2J8',
      country: 'Canada',
      sector: 'Santé',
      size: '11-50 employés',
      type: 'SARL',
      color: '#10b981',
      qrColor: '#1f2937',
      logo: null,
      status: 'suspended'
    },
    // ... autres compagnies (même structure)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 3,
      name: `Compagnie ${i + 3}`,
      email: `contact${i + 3}@example.com`,
      phone: `+1 555 000 ${100 + i}`,
      address: `${i + 100} Rue Exemple`,
      city: 'Ville',
      postalCode: 'A1A 1A1',
      country: 'Canada',
      sector: SECTEURS[i % SECTEURS.length],
      size: TAILLES[i % TAILLES.length],
      type: TYPES[i % TYPES.length],
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      qrColor: '#000000',
      logo: null,
      status: i % 3 === 0 ? 'suspended' : 'active'
    }))
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewCompany, setViewCompany] = useState(null);
  const [editCompany, setEditCompany] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;

  // Filtrage + Tri + Pagination
  const filteredAndSorted = useMemo(() => {
    let filtered = companies.filter(comp =>
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    return filtered;
  }, [companies, searchTerm, sortConfig]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleToggleStatus = (id) => {
    setCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c
    ));
  };

  const handleDelete = (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setShowConfirmDelete(null);
  };

  const handleEdit = (company) => {
    setEditCompany({ ...company });
  };

  const handleSaveEdit = () => {
    if (!editCompany.name || !editCompany.email) {
      alert('Nom et email sont obligatoires');
      return;
    }
    setCompanies(prev => prev.map(c => c.id === editCompany.id ? editCompany : c));
    setEditCompany(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 350;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resized = canvas.toDataURL('image/jpeg', 0.8);
        setEditCompany(prev => ({ ...prev, logo: resized }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? <span className="listCompany__status listCompany__status--active">Actif</span>
      : <span className="listCompany__status listCompany__status--suspended">Suspendu</span>;
  };

  return (
    <div className="listCompany">
      <div className="listCompany__container container">
        <h1 className="listCompany__title">Liste des compagnies</h1>

        {/* Recherche */}
        <div className="listCompany__search">
          <FiSearch className="listCompany__search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="listCompany__search-input"
          />
        </div>

        {/* Tableau */}
        <div className="listCompany__table-wrapper">
          <table className="listCompany__table">
            <thead>
              <tr>
                <th className="listCompany__th" onClick={() => handleSort('name')}>
                  Nom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="listCompany__th" onClick={() => handleSort('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="listCompany__th">Statut</th>
                <th className="listCompany__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="4" className="listCompany__td--empty">Aucune compagnie</td></tr>
              ) : (
                paginated.map(company => (
                  <tr key={company.id}>
                    <td className="listCompany__td">{company.name}</td>
                    <td className="listCompany__td">{company.email}</td>
                    <td className="listCompany__td">{getStatusBadge(company.status)}</td>
                    <td className="listCompany__td listCompany__actions">
                      <button onClick={() => setViewCompany(company)} className="listCompany__btn listCompany__btn--view" title="Voir">
                        <FiEye />
                      </button>
                      <button onClick={() => handleEdit(company)} className="listCompany__btn listCompany__btn--edit" title="Éditer">
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(company.id)}
                        className={`listCompany__btn ${company.status === 'active' ? 'listCompany__btn--suspend' : 'listCompany__btn--reactivate'}`}
                        title={company.status === 'active' ? 'Suspendre' : 'Réactiver'}
                      >
                        {company.status === 'active' ? <FiPause /> : <FiPlay />}
                      </button>
                      <button onClick={() => setShowConfirmDelete(company.id)} className="listCompany__btn listCompany__btn--delete" title="Supprimer">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="listCompany__pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="listCompany__pagination-btn">
              <FiChevronLeft />
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="listCompany__pagination-btn">
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* MODALE VOIR DÉTAILS */}
      {viewCompany && (
        <div className="listCompany__modal-overlay" onClick={() => setViewCompany(null)}>
          <div className="listCompany__modal listCompany__modal--large" onClick={e => e.stopPropagation()}>
            <h2>{viewCompany.name}</h2>
            {viewCompany.logo && <img src={viewCompany.logo} alt="Logo" className="listCompany__logo-preview" />}
            <div className="listCompany__info-grid">
              <p><strong>Email :</strong> {viewCompany.email}</p>
              <p><strong>Téléphone :</strong> {viewCompany.phone}</p>
              <p><strong>Adresse :</strong> {viewCompany.address}</p>
              <p><strong>Ville :</strong> {viewCompany.city}</p>
              <p><strong>Code postal :</strong> {viewCompany.postalCode}</p>
              <p><strong>Pays :</strong> {viewCompany.country}</p>
              <p><strong>Secteur :</strong> {viewCompany.sector}</p>
              <p><strong>Taille :</strong> {viewCompany.size}</p>
              <p><strong>Type :</strong> {viewCompany.type}</p>
              <p><strong>Couleur :</strong> <span style={{ background: viewCompany.color, width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginLeft: 8 }}></span> {viewCompany.color}</p>
              <p><strong>QR Code :</strong> <span style={{ background: viewCompany.qrColor, width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginLeft: 8 }}></span> {viewCompany.qrColor}</p>
              <p><strong>Statut :</strong> {getStatusBadge(viewCompany.status)}</p>
            </div>
            <button onClick={() => setViewCompany(null)} className="listCompany__modal-close">Fermer</button>
          </div>
        </div>
      )}

      {/* MODALE ÉDITER */}
      {editCompany && (
        <div className="listCompany__modal-overlay" onClick={() => setEditCompany(null)}>
          <div className="listCompany__modal listCompany__modal--large" onClick={e => e.stopPropagation()}>
            <h2>Éditer {editCompany.name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="listCompany__form">
              {/* Logo */}
              <div className="listCompany__form-group">
                <label>Logo (max 350px)</label>
                <div className="listCompany__logo-upload">
                  {editCompany.logo ? (
                    <div className="listCompany__logo-preview-wrapper">
                      <img src={editCompany.logo} alt="Logo" className="listCompany__logo-preview" />
                      <button type="button" onClick={() => setEditCompany(p => ({ ...p, logo: null }))} className="listCompany__logo-remove">
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="listCompany__logo-placeholder">
                      <FiUpload /> Cliquez pour ajouter une image
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Nom *</label>
                  <input type="text" value={editCompany.name} onChange={e => setEditCompany(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="listCompany__form-group">
                  <label>Email *</label>
                  <input type="email" value={editCompany.email} onChange={e => setEditCompany(p => ({ ...p, email: e.target.value }))} required />
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Téléphone</label>
                  <input type="tel" value={editCompany.phone} onChange={e => setEditCompany(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="listCompany__form-group">
                  <label>Secteur</label>
                  <select value={editCompany.sector} onChange={e => setEditCompany(p => ({ ...p, sector: e.target.value }))}>
                    {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Taille</label>
                  <select value={editCompany.size} onChange={e => setEditCompany(p => ({ ...p, size: e.target.value }))}>
                    {TAILLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="listCompany__form-group">
                  <label>Type</label>
                  <select value={editCompany.type} onChange={e => setEditCompany(p => ({ ...p, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Ville</label>
                  <input type="text" value={editCompany.city} onChange={e => setEditCompany(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="listCompany__form-group">
                  <label>Pays</label>
                  <input type="text" value={editCompany.country} onChange={e => setEditCompany(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Code postal</label>
                  <input type="text" value={editCompany.postalCode} onChange={e => setEditCompany(p => ({ ...p, postalCode: e.target.value }))} />
                </div>
                <div className="listCompany__form-group">
                  <label>Adresse complète</label>
                  <input type="text" value={editCompany.address} onChange={e => setEditCompany(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>

              <div className="listCompany__form-row">
                <div className="listCompany__form-group">
                  <label>Couleur entreprise</label>
                  <input type="color" value={editCompany.color} onChange={e => setEditCompany(p => ({ ...p, color: e.target.value }))} />
                  <span className="listCompany__color-value">{editCompany.color}</span>
                </div>
                <div className="listCompany__form-group">
                  <label>Couleur QR Code</label>
                  <input type="color" value={editCompany.qrColor} onChange={e => setEditCompany(p => ({ ...p, qrColor: e.target.value }))} />
                  <span className="listCompany__color-value">{editCompany.qrColor}</span>
                </div>
              </div>

              <div className="listCompany__form-actions">
                <button type="submit" className="listCompany__btn listCompany__btn--save">Enregistrer</button>
                <button type="button" onClick={() => setEditCompany(null)} className="listCompany__btn listCompany__btn--cancel">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Suppression */}
      {showConfirmDelete && (
        <div className="listCompany__modal-overlay" onClick={() => setShowConfirmDelete(null)}>
          <div className="listCompany__modal listCompany__modal--confirm" onClick={e => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Cette action est irréversible.</p>
            <div className="listCompany__modal-actions">
              <button onClick={() => handleDelete(showConfirmDelete)} className="listCompany__btn--danger">Supprimer</button>
              <button onClick={() => setShowConfirmDelete(null)} className="listCompany__btn--cancel">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCompany;