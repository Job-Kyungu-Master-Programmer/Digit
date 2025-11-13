// src/Home.jsx
import Sidebar from '../components/Sidebar'
import Employees from '../companies/Employees'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import Login from './Login'
import ProfilEmployee from '../companies/ProfilEmployee'  // ← PUBLIC MAINTENANT
import Company from '../companies/Company'
import ListCompany from '../superadmin/ListCompany'
import CreateCompany from '../superadmin/CreateCompany'
import CreateCompanyUser from '../companies/CreateCompany'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

const Layout = ({ children }) => {
  return (
    <div className="home__container container">
      <Sidebar />
      <div className="home__body">
        <Header />
        <div className="app__main">
          {children}
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="home">
      <Routes>
        {/* Routes publiques (sans sidebar/header) */}
        <Route path="/login" element={<Login />} />
        <Route path="/createcompanyusers" element={<CreateCompanyUser />} />
        
        {/* PAGE PROFIL EMPLOYÉ → PUBLIQUE (SANS LOGIN) */}
        <Route path="/profilemployee/:id" element={<ProfilEmployee />} />

        {/* Routes protégées */}
        <Route path="/employees" element={
          <ProtectedRoute>
            <Layout><Employees /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/company' element={
          <ProtectedRoute>
            <Layout><Company /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/listecompany' element={
          <ProtectedRoute>
            <Layout><ListCompany /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/createcompany' element={
          <ProtectedRoute>
            <Layout><CreateCompany /></Layout>
          </ProtectedRoute>
        } />

        {/* Route par défaut */}
        <Route path="/" element={
          user ? <Navigate to="/company" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  )
}

export default Home