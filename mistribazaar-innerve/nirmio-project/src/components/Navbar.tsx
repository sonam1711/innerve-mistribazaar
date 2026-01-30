import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, User, LogOut, Menu, X, Sparkles, Package } from 'lucide-react'
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

  // Don't show navbar on landing/login/signup pages for non-authenticated users
  if (!user && (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/signup')) {
    return null
  }

  return (
    <nav className="bg-[#2d1a0a]/80 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
              <Home className="w-6 h-6 text-[#1a120b]" />
            </div>
            <span className="text-xl font-bold text-amber-100">Mistribazar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/jobs" className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Jobs
                </Link>
                {user.role === 'CONSUMER' && (
                  <>
                    <Link to="/budget-estimator" className="text-amber-100/80 hover:text-amber-100 font-medium flex items-center transition-colors">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Budget
                    </Link>
                    <Link to="/room-visualizer" className="text-amber-100/80 hover:text-amber-100 font-medium flex items-center transition-colors">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Visualizer
                    </Link>
                  </>
                )}
                {(user.role === 'MASON' || user.role === 'TRADER') && (
                  <Link to="/bids" className="text-amber-100/80 hover:text-amber-100 font-medium flex items-center transition-colors">
                    <Package className="w-4 h-4 mr-1" />
                    My Bids
                  </Link>
                )}
                <Link to="/profile" className="text-amber-100/80 hover:text-amber-100 font-medium flex items-center transition-colors">
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-6 py-2 rounded-full transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-amber-500/20 text-amber-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-500/20">
            {user ? (
              <div className="flex flex-col space-y-4">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Jobs
                </Link>
                {user.role === 'CONSUMER' && (
                  <>
                    <Link to="/budget-estimator" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                      AI Budget Estimator
                    </Link>
                    <Link to="/room-visualizer" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                      Room Visualizer
                    </Link>
                  </>
                )}
                {(user.role === 'MASON' || user.role === 'TRADER') && (
                  <Link to="/bids" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                    My Bids
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium text-left transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-amber-100/80 hover:text-amber-100 font-medium transition-colors">
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
