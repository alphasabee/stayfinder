import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Navbar from './Navbar'
import Home from './Home'
import Properties from './Properties'
import PropertyDetail from './PropertyDetail'
import Login from './Login'
import Signup from './Signup'
import GuestDashboard from './GuestDashboard'
import HostDashboard from './HostDashboard'
import NewProperty from './NewProperty'

function PrivateRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">Loading…</p></div>
  if (!user) return <Navigate to="/auth/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/guest/dashboard" element={
          <PrivateRoute role="guest"><GuestDashboard /></PrivateRoute>
        } />
        <Route path="/host/dashboard" element={
          <PrivateRoute role="host"><HostDashboard /></PrivateRoute>
        } />
        <Route path="/host/properties/new" element={
          <PrivateRoute role="host"><NewProperty /></PrivateRoute>
        } />
        <Route path="/host/properties/:id/edit" element={
          <PrivateRoute role="host"><NewProperty /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
