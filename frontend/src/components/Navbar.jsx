import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, Briefcase, Package, User, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Mistribazar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/jobs" className="text-gray-700 hover:text-primary-600 font-medium">
                  Jobs
                </Link>
                {user.role === 'CONSUMER' && (
                  <>
                    <Link to="/budget-estimator" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Budget
                    </Link>
                    <Link to="/room-visualizer" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Visualizer
                    </Link>
                  </>
                )}
                {(user.role === 'MASON' || user.role === 'TRADER') && (
                  <Link to="/bids" className="text-gray-700 hover:text-primary-600 font-medium">
                    My Bids
                  </Link>
                )}
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="flex flex-col space-y-4">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  Jobs
                </Link>
                {user.role === 'CONSUMER' && (
                  <>
                    <Link to="/budget-estimator" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                      AI Budget Estimator
                    </Link>
                    <Link to="/room-visualizer" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                      Room Visualizer
                    </Link>
                  </>
                )}
                {(user.role === 'MASON' || user.role === 'TRADER') && (
                  <Link to="/bids" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                    My Bids
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium text-left">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
