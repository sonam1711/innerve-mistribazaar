import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Users, Hammer, Building2, ShoppingCart, MapPin } from 'lucide-react'
import SupabasePasswordAuth from '../components/auth/SupabasePasswordAuth'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCurrentLocation } from '../utils/location'
import toast from 'react-hot-toast'
import axios from 'axios'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setSession, profile } = useAuthStore()
  const [step, setStep] = useState('registration') // 'registration', 'role-profile'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    latitude: '',
    longitude: '',
    language: 'English',
  })
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(false)
  const [session, setSessionData] = useState(null)

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
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
      console.error('Location detection error:', error)
      toast.error('Could not detect location')
      setFormData(prev => ({ ...prev, language: 'Hindi' }))
    }
  }

  const handleSignupSuccess = async (supabaseSession, userData) => {
    // Store session and user data
    setSessionData(supabaseSession)
    setFormData(prev => ({
      ...prev,
      name: userData.name,
      phone: userData.phone
    }))

    // If user hasn't selected a role yet, they need to
    if (!formData.role) {
      toast.info('Please select your role to continue')
      return
    }

    // Store Supabase session
    await setSession(supabaseSession)

    // If customer, submit profile directly. Otherwise, go to role-specific profile
    if (formData.role === 'CUSTOMER') {
      await submitProfile(supabaseSession)
    } else {
      setStep('role-profile')
    }
  }

  const handleRoleSelection = async (role) => {
    setFormData({ ...formData, role })

    // If we already have a session (user completed signup), proceed
    if (session) {
      await setSession(session)
      if (role === 'CUSTOMER') {
        await submitProfile(session)
      } else {
        setStep('role-profile')
      }
    }
  }

  const submitProfile = async (supabaseSession = session) => {
    setLoading(true)
    try {
      const token = supabaseSession?.access_token

      const payload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        language: formData.language,
      }

      // Add role-specific profile data
      if (formData.role === 'WORKER' && Object.keys(profileData).length > 0) {
        payload.worker_profile = profileData
      } else if (formData.role === 'TRADER' && Object.keys(profileData).length > 0) {
        payload.trader_profile = profileData
      } else if (formData.role === 'CONSTRUCTOR' && Object.keys(profileData).length > 0) {
        payload.constructor_profile = profileData
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/complete-profile/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('Profile completed successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Profile completion error:', error)
      toast.error(error.response?.data?.error || 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleProfileSubmit = async (e) => {
    e.preventDefault()
    await submitProfile()
  }

  // Registration Step - Collect all basic info
  if (step === 'registration') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join Mistribazar today</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a... *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'CUSTOMER', label: 'Customer', icon: Users, desc: 'Looking for services' },
                    { value: 'WORKER', label: 'Worker', icon: Hammer, desc: 'Plumber, Mason, etc.' },
                    { value: 'CONSTRUCTOR', label: 'Constructor', icon: Building2, desc: 'Large projects' },
                    { value: 'TRADER', label: 'Trader', icon: ShoppingCart, desc: 'Material supplier' },
                  ].map((role) => {
                    const Icon = role.icon
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleSelection(role.value)}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${formData.role === role.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${formData.role === role.value ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        <div className="font-semibold text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Location Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-700">
                      {formData.latitude ? `✓ Location detected - ${formData.language} region` : 'Location not detected'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>

              {/* Password-based Signup Form */}
              <SupabasePasswordAuth
                onSignupSuccess={handleSignupSuccess}
              />

              <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Role-Specific Profile Step
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {formData.role} Profile
          </h2>
          <p className="mt-2 text-gray-600">Add your professional details (optional)</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleRoleProfileSubmit} className="space-y-6">
            {formData.role === 'WORKER' && (
              <>
                <div>
                  <label className="label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={profileData.skills || ''}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    className="input-field"
                    placeholder="e.g., plumbing, masonry, electrical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={profileData.hourly_rate || ''}
                      onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Daily Rate (₹)</label>
                    <input
                      type="number"
                      value={profileData.daily_rate || ''}
                      onChange={(e) => setProfileData({ ...profileData, daily_rate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    value={profileData.experience_years || ''}
                    onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })}
                    className="input-field"
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
                  <label className="label">Materials (comma-separated)</label>
                  <input
                    type="text"
                    value={profileData.materials || ''}
                    onChange={(e) => setProfileData({ ...profileData, materials: e.target.value })}
                    className="input-field"
                    placeholder="e.g., cement, bricks, sand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Delivery Radius (km)</label>
                    <input
                      type="number"
                      value={profileData.delivery_radius_km || ''}
                      onChange={(e) => setProfileData({ ...profileData, delivery_radius_km: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Avg Delivery Time</label>
                    <input
                      type="text"
                      value={profileData.avg_delivery_time || ''}
                      onChange={(e) => setProfileData({ ...profileData, avg_delivery_time: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 2-3 days"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.role === 'CONSTRUCTOR' && (
              <>
                <div>
                  <label className="label">Company Name</label>
                  <input
                    type="text"
                    value={profileData.company_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">License Number</label>
                  <input
                    type="text"
                    value={profileData.license_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Specializations (comma-separated)</label>
                  <input
                    type="text"
                    value={profileData.specializations || ''}
                    onChange={(e) => setProfileData({ ...profileData, specializations: e.target.value })}
                    className="input-field"
                    placeholder="e.g., residential, commercial, renovation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Team Size</label>
                    <input
                      type="number"
                      value={profileData.team_size || ''}
                      onChange={(e) => setProfileData({ ...profileData, team_size: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Experience (years)</label>
                    <input
                      type="number"
                      value={profileData.experience_years || ''}
                      onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('profile')}
                className="flex-1 btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => submitProfile()}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
