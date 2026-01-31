import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Search, Filter, MapPin } from 'lucide-react'
import { getCurrentLocation, type Coordinates } from '../utils/location'
import toast from 'react-hot-toast'

export default function JobsPage() {
  const { user } = useAuthStore()
  const { jobs, isLoading, fetchJobs } = useJobStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)

  useEffect(() => {
    loadJobs()
  }, [user])

  const loadJobs = (coords?: Coordinates) => {
    if (user?.role === 'CONSUMER') {
      fetchJobs({ consumer: user.id })
    } else {
      const params: any = { status: 'OPEN' }
      if (coords) {
        params.latitude = coords.latitude
        params.longitude = coords.longitude
        params.radius = 50 // 50km radius
      }
      fetchJobs(params)
    }
  }

  const handleDetectLocation = async () => {
    setDetectingLocation(true)
    try {
      const coords = await getCurrentLocation()
      setUserLocation(coords)
      loadJobs(coords)
      toast.success(`Showing jobs within 50km of your location`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to detect location')
    } finally {
      setDetectingLocation(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    
    // Role-based job type filtering
    let matchesRole = true
    if (user?.role === 'MISTRI') {
      // MISTRI sees only REPAIR type jobs
      matchesRole = job.job_type === 'REPAIR'
    } else if (user?.role === 'CONTRACTOR') {
      // CONTRACTOR sees only CONSTRUCTION type jobs
      matchesRole = job.job_type === 'CONSTRUCTION'
    }
    // TRADER and CONSUMER see all jobs
    
    return matchesSearch && matchesFilter && matchesRole
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {user?.role === 'CONSUMER' ? 'My Jobs' : 'Available Jobs'}
        </h1>
        <p className="text-slate-400">
          {user?.role === 'CONSUMER'
            ? 'Manage your posted construction projects'
            : 'Browse and bid on construction jobs'}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        {(user?.role === 'CONTRACTOR' || user?.role === 'TRADER' || user?.role === 'MISTRI') && (
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <MapPin className="w-5 h-5" />
            {detectingLocation ? 'Detecting...' : userLocation ? 'Update Location' : 'Detect My Location'}
          </button>
        )}
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input pl-10 pr-8"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">No jobs found</p>
          {user?.role === 'CONSUMER' && (
            <Link to="/create-job" className="btn-primary inline-block">
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="card hover:border-blue-600 transition group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition">
                  {job.title}
                </h3>
                <span className={`badge ${
                  job.status === 'OPEN' ? 'badge-open' :
                  job.status === 'IN_PROGRESS' ? 'badge-in-progress' :
                  'badge-completed'
                }`}>
                  {job.status}
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white font-medium">{job.job_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget:</span>
                  <span className="text-green-400 font-medium">
                    ₹{job.budget_min.toLocaleString()} - ₹{job.budget_max.toLocaleString()}
                  </span>
                </div>
                {job.latitude && job.longitude && (
                  <div className="flex items-center text-slate-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Location available</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-500">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
