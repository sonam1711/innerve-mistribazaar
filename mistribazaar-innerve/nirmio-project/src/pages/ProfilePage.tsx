import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, MapPin, Star, Phone } from 'lucide-react'
import { userAPI } from '../utils/api'
import { getCurrentLocation } from '../utils/location'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    latitude: user?.latitude?.toString() || '',
    longitude: user?.longitude?.toString() || '',
    language: user?.language || 'English',
  })
  
  // Function to detect current location
  const detectCurrentLocation = async () => {
    setDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        language: location.language
      }))
      toast.success(`Location updated: ${location.language} region`)
    } catch (error) {
      console.error('Location detection error:', error)
      toast.error('Could not detect location')
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await userAPI.updateProfile({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      })
      updateUser(response.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
    setIsLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-amber-100 mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 text-center">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <User className="w-12 h-12 text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold text-amber-100 mb-1">{user.name}</h2>
              <p className="text-amber-100/70 mb-4 flex items-center justify-center">
                <Phone className="w-4 h-4 mr-1" />
                {user.phone}
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <span className="text-lg font-semibold text-amber-100">{user.rating || '0.0'} / 5.0</span>
              </div>
              <span className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold border border-amber-500/30">
                {user.role}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-100">Profile Information</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-[#1a120b]/60 border border-amber-500/30 px-6 py-2 rounded-full text-amber-100 hover:border-amber-500/50 hover:bg-[#1a120b]/80 transition-all font-semibold"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: user.name || '',
                          latitude: user.latitude?.toString() || '',
                          longitude: user.longitude?.toString() || '',
                          language: user.language || 'English',
                        })
                      }} 
                      className="bg-[#1a120b]/60 border border-amber-500/30 px-4 py-2 rounded-full text-amber-100 hover:border-amber-500/50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={isLoading} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-2 rounded-full text-[#1a120b] font-bold transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-amber-100 font-medium text-lg">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Phone Number</label>
                  <p className="text-amber-100 font-medium text-lg">{user.phone}</p>
                  <p className="text-sm text-amber-100/50">Phone number cannot be changed</p>
                </div>

                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Role</label>
                  <p className="text-amber-100 font-medium text-lg">{user.role}</p>
                </div>

                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Language</label>
                  {isEditing ? (
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                  ) : (
                    <p className="text-amber-100 font-medium text-lg">{user.language}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-100/70 mb-2 font-medium">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Latitude
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-amber-100 font-medium">{user.latitude || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-amber-100/70 mb-2 font-medium">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Longitude
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-amber-100 font-medium">{user.longitude || 'Not set'}</p>
                    )}
                  </div>
                </div>
                
                {isEditing && (user.role === 'MASON' || user.role === 'TRADER') && (
                  <div>
                    <button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={detectingLocation}
                      className="w-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 px-6 py-3 rounded-lg text-amber-100 hover:border-amber-500/50 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      {detectingLocation ? 'Detecting Location...' : 'Update to Current Location'}
                    </button>
                    <p className="text-sm text-amber-100/50 mt-2">
                      Update your location to match jobs near you and auto-detect language
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Member Since</label>
                  <p className="text-amber-100 font-medium text-lg">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
