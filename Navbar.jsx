import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Compass, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Compass className="w-6 h-6" />SpaceFinder
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/properties" className="text-sm text-gray-600 hover:text-blue-600">Browse</Link>
          {user ? (
            <>
              <Link to={profile?.role === 'host' ? '/host/dashboard' : '/guest/dashboard'}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                <LayoutDashboard className="w-4 h-4" />Dashboard
              </Link>
              {profile?.role === 'host' && (
                <Link to="/host/properties/new" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
                  + List Space
                </Link>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="text-sm text-gray-600 hover:text-blue-600">Log in</Link>
              <Link to="/auth/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
