import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserPlus, MapPin } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCurrentLocation } from '../utils/location'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    password2: '',
    role: 'CONSUMER',
    latitude: '',
    longitude: '',
    language: 'English',
  })
  const [profileData, setProfileData] = useState({})
  const [locationDetected, setLocationDetected] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    setDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        language: location.language
      }))
      setLocationDetected(true)
      toast.success(`Location detected: ${location.language} region`)
    } catch (error) {
      console.error('Location detection error:', error)
      toast.error(error.message || 'Could not detect location')
      // Set default to Hindi if detection fails
      setFormData(prev => ({ ...prev, language: 'Hindi' }))
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match')
      return
    }

    // Prepare data based on role
    const submitData = { ...formData }
    
    if (formData.role === 'MASON') {
      submitData.mason_profile = profileData
    } else if (formData.role === 'TRADER') {
      submitData.trader_profile = profileData
    }

    const success = await register(submitData)
    if (success) {
      navigate('/dashboard')
    }
  }

  const renderStep1 = () => (
    <>
      <div>
        <label className="label">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="label">Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="input-field"
          placeholder="+91 1234567890"
          required
        />
      </div>

      <div>
        <label className="label">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="label">Confirm Password</label>
        <input
          type="password"
          value={formData.password2}
          onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="label">I am a...</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="input-field"
        >
          <option value="CONSUMER">Customer (Looking for services)</option>
          <option value="MASON">Mason (Service Provider)</option>
          <option value="TRADER">Material Trader/Supplier</option>
        </select>
      </div>

      {/* Location Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            {detectingLocation ? (
              <p className="text-sm text-blue-700">Detecting your location...</p>
            ) : locationDetected ? (
              <p className="text-sm text-blue-700">
                ✓ Location detected - {formData.language} region
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                Location not detected - using default (Hindi)
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={detectLocation}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            disabled={detectingLocation}
          >
            Retry
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full btn-primary"
      >
        Next
      </button>
    </>
  )

  const renderStep2 = () => (
    <>
      {formData.role === 'MASON' && (
        <>
          <div>
            <label className="label">Skills (comma-separated)</label>
            <input
              type="text"
              value={profileData.skills || ''}
              onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              className="input-field"
              placeholder="e.g., bricklaying, plastering, tiling"
              required
            />
          </div>

          <div>
            <label className="label">Daily Rate (₹)</label>
            <input
              type="number"
              value={profileData.daily_rate || ''}
              onChange={(e) => setProfileData({ ...profileData, daily_rate: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Years of Experience</label>
            <input
              type="number"
              value={profileData.experience_years || ''}
              onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </>
      )}

      {formData.role === 'TRADER' && (
        <>
          <div>
            <label className="label">Business Name</label>
            <input
              type="text"
              value={profileData.business_name || ''}
              onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Materials Supplied (comma-separated)</label>
            <input
              type="text"
              value={profileData.materials || ''}
              onChange={(e) => setProfileData({ ...profileData, materials: e.target.value })}
              className="input-field"
              placeholder="e.g., cement, bricks, sand"
              required
            />
          </div>

          <div>
            <label className="label">Delivery Radius (km)</label>
            <input
              type="number"
              value={profileData.delivery_radius_km || ''}
              onChange={(e) => setProfileData({ ...profileData, delivery_radius_km: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Average Delivery Time</label>
            <input
              type="text"
              value={profileData.avg_delivery_time || ''}
              onChange={(e) => setProfileData({ ...profileData, avg_delivery_time: e.target.value })}
              className="input-field"
              placeholder="e.g., 2-3 days"
              required
            />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary flex items-center justify-center"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="" />
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              Register
            </>
          )}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join Mistribazar today</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                Basic Info
              </span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                Profile Details
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? renderStep1() : renderStep2()}
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
