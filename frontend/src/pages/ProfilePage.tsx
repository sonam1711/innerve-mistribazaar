import { useAuthStore } from '../store/authStore'
import { User, Phone, Star, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-slate-400">No user data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">View and manage your account information</p>
      </div>

      <div className="card">
        {/* Profile Header */}
        <div className="flex items-center mb-8 pb-6 border-b border-slate-700">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mr-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-400 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </label>
              <p className="text-white text-lg">{user.phone}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-400 mb-2">
                <Star className="w-4 h-4 mr-2" />
                Rating
              </label>
              <div className="flex items-center text-yellow-400 text-lg">
                <span className="mr-1">★</span>
                <span>{user.rating || 0} / 5</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-400 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </label>
              <p className="text-white text-lg">
                {user.latitude && user.longitude
                  ? `${Number(user.latitude).toFixed(4)}, ${Number(user.longitude).toFixed(4)}`
                  : 'Not set'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Language
              </label>
              <p className="text-white text-lg">{user.language || 'English'}</p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">User ID</p>
                <p className="text-white font-medium">#{user.id}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Account Type</p>
                <p className="text-white font-medium">
                  {user.role === 'CONSUMER' ? 'Job Poster' :
                   user.role === 'CONTRACTOR' ? 'Contractor' :
                   user.role === 'MISTRI' ? 'Mistri/Skilled Worker' :
                   'Trader/Supplier'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
