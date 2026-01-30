import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, MapPin, Star } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const ProfilePage = () => {
  const { profile, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || '',
    language: profile?.language || 'English',
  })

  // Fetch latest profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile/')
        updateProfile(response.data)
        // Update local form state with fetched data
        setFormData({
          name: response.data.name || '',
          latitude: response.data.latitude || '',
          longitude: response.data.longitude || '',
          language: response.data.language || 'English',
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await api.put('/users/profile/', formData)
      updateProfile(response.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
    setIsLoading(false)
  }

  if (!profile) {
    return <LoadingSpinner text="Loading profile..." />
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-gray-600 mb-4">{profile.phone}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{profile.rating || '0.0'} / 5.0</span>
              </div>
              <span className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Profile Information</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn-outline">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={isLoading} className="btn-primary">
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <p className="text-gray-900 font-medium">{profile.phone}</p>
                  <p className="text-sm text-gray-500">Phone number cannot be changed</p>
                </div>

                <div>
                  <label className="label">Role</label>
                  <p className="text-gray-900 font-medium">{profile.role}</p>
                </div>

                <div>
                  <label className="label">Language</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.language}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.latitude || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Longitude</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.longitude || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Member Since</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Role-specific profile */}
            {profile.worker_profile && (
              <div className="card mt-6">
                <h3 className="text-xl font-semibold mb-4">Worker Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Skills</label>
                    <p className="text-gray-900">{profile.worker_profile.skills}</p>
                  </div>
                  <div>
                    <label className="label">Hourly Rate</label>
                    <p className="text-gray-900">₹{profile.worker_profile.hourly_rate?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="label">Daily Rate</label>
                    <p className="text-gray-900">₹{profile.worker_profile.daily_rate?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="label">Experience</label>
                    <p className="text-gray-900">{profile.worker_profile.experience_years} years</p>
                  </div>
                  <div>
                    <label className="label">Completed Jobs</label>
                    <p className="text-gray-900">{profile.worker_profile.completed_jobs}</p>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm ${profile.worker_profile.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {profile.worker_profile.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {profile.constructor_profile && (
              <div className="card mt-6">
                <h3 className="text-xl font-semibold mb-4">Constructor Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Company Name</label>
                    <p className="text-gray-900">{profile.constructor_profile.company_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="label">License Number</label>
                    <p className="text-gray-900">{profile.constructor_profile.license_number || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="label">Specializations</label>
                    <p className="text-gray-900">{profile.constructor_profile.specializations}</p>
                  </div>
                  <div>
                    <label className="label">Team Size</label>
                    <p className="text-gray-900">{profile.constructor_profile.team_size}</p>
                  </div>
                  <div>
                    <label className="label">Experience</label>
                    <p className="text-gray-900">{profile.constructor_profile.experience_years} years</p>
                  </div>
                  <div>
                    <label className="label">Completed Projects</label>
                    <p className="text-gray-900">{profile.constructor_profile.completed_projects}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.trader_profile && (
              <div className="card mt-6">
                <h3 className="text-xl font-semibold mb-4">Trader Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Business Name</label>
                    <p className="text-gray-900">{profile.trader_profile.business_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="label">Materials</label>
                    <p className="text-gray-900">{profile.trader_profile.materials}</p>
                  </div>
                  <div>
                    <label className="label">Delivery Radius</label>
                    <p className="text-gray-900">{profile.trader_profile.delivery_radius_km} km</p>
                  </div>
                  <div>
                    <label className="label">Average Delivery Time</label>
                    <p className="text-gray-900">{profile.trader_profile.avg_delivery_time}</p>
                  </div>
                  <div>
                    <label className="label">Completed Orders</label>
                    <p className="text-gray-900">{profile.trader_profile.completed_orders}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
