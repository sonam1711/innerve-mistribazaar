import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, LogOut, User, DollarSign, Box } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">Mistribazar</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-slate-300 hover:text-white transition">
                Jobs
              </Link>
              {user?.role === 'CONSUMER' && (
                <Link to="/create-job" className="text-slate-300 hover:text-white transition">
                  Post Job
                </Link>
              )}
              {(user?.role === 'CONTRACTOR' || user?.role === 'TRADER' || user?.role === 'MISTRI') && (
                <Link to="/bids" className="text-slate-300 hover:text-white transition">
                  {user?.role === 'MISTRI' ? 'My Jobs' : 'My Bids'}
                </Link>
              )}
              <Link to="/budget-estimator" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Budget
              </Link>
              {user?.role === 'CONSUMER' && (
                <Link to="/home-planner" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                  <Box className="w-4 h-4" />
                  Home Planner
                </Link>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-4 border-l border-slate-700 pl-4">
                <LanguageSwitcher />
                <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-white transition">
                  <User className="w-5 h-5" />
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
