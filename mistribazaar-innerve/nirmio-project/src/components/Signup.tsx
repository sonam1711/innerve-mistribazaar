import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, User, Phone, MapPin } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getCurrentLocation } from '../utils/location'
import toast, { Toaster } from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CONSUMER',
    latitude: null as number | null,
    longitude: null as number | null,
    language: 'Hindi'
  })

  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        language: location.language
      }))
      toast.success(`Location detected: ${location.language} region`)
    } catch (error) {
      toast.error('Could not detect location. Please try again.')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const formattedPhone = formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`

    // Use default coordinates if location not detected (New Delhi)
    const userData = {
      name: formData.name,
      phone: formattedPhone,
      password: formData.password,
      password2: formData.password, // Backend expects password2 for confirmation
      role: formData.role,
      latitude: formData.latitude || 28.6139,
      longitude: formData.longitude || 77.2090,
      language: formData.language || 'Hindi'
    }

    const result = await register(userData)
    
    if (result.success) {
      toast.success('Registration successful!')
      navigate('/')
    } else {
      toast.error(result.error || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <Toaster position="top-right" />
      
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(
            circle at center, 
            rgba(120, 66, 18, 0.4) 0%, 
            #1a120b 85%
          )`
        }}
      />

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Nirmio Logo" className="w-40 h-auto mx-auto mb-6" />
          <h1 className="text-4xl font-black text-amber-100 mb-2">
            Create <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Account</span>
          </h1>
          <p className="text-amber-100/70">Join Mistribazar today</p>
        </div>

        <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-amber-100/80 mb-2 text-sm font-semibold">
                I am a
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['CONSUMER', 'MASON', 'TRADER'].map((role) => (
                  <label key={role} className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === role 
                      ? 'bg-amber-500/20 border-amber-500/60' 
                      : 'bg-[#1a120b]/60 border-amber-500/30'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-amber-100 text-xs font-semibold">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-amber-100 text-sm font-semibold">
                  {formData.latitude ? `Location: ${formData.language} region` : 'Location: Default (Hindi region)'}
                </span>
              </div>
              {!formData.latitude && (
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                  className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {locationLoading ? 'Detecting...' : '📍 Click to detect your location'}
                </button>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="+91 or 10-digit number"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-12 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Create a password (min 6 chars)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-12 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded border-amber-500/30 bg-[#1a120b]/60 text-amber-500 focus:ring-amber-500/50"
              />
              <span className="text-amber-100/70 text-sm">
                I agree to the{' '}
                <a href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Terms & Conditions
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-amber-100/70">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
