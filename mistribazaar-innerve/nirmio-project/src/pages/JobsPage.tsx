import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Filter, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import JobCard from '../components/JobCard'

const JobsPage = () => {
  const { user } = useAuthStore()
  const { jobs, fetchJobs, fetchNearbyJobs, isLoading, filters, setFilters } = useJobStore()
  const [showFilters, setShowFilters] = useState(false)

  // Ensure jobs is always an array
  const jobsList = Array.isArray(jobs) ? jobs : []

  useEffect(() => {
    if (user) {
      if (user.role === 'CONSUMER') {
        fetchJobs()
      } else if (user.role === 'MASON' || user.role === 'TRADER') {
        // For masons/traders, fetch nearby jobs based on their location
        if (user.latitude && user.longitude) {
          console.log('Fetching nearby jobs - Lat:', user.latitude, 'Lng:', user.longitude, 'Radius:', filters.radius || 50)
          fetchNearbyJobs(user.latitude, user.longitude, filters.radius || 50)
        } else {
          fetchJobs()
        }
      } else {
        fetchJobs()
      }
    }
  }, [user?.role, user?.latitude, user?.longitude])

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters({ [key]: value })
  }

  const applyFilters = () => {
    if (user) {
      if (user.role === 'CONSUMER') {
        fetchJobs(filters)
      } else if (user.latitude && user.longitude) {
        fetchNearbyJobs(user.latitude, user.longitude, filters.radius || 50)
      }
    }
    setShowFilters(false)
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-amber-100">
              {user?.role === 'CONSUMER' ? 'My Jobs' : 'Available Jobs'}
            </h1>
            <p className="text-amber-100/70 mt-2">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all flex items-center font-semibold"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
            {user?.role === 'CONSUMER' && (
              <Link 
                to="/jobs/create" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post Job
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-lg text-amber-100 mb-4">Filters</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Job Type</label>
                <select
                  value={filters.job_type || ''}
                  onChange={(e) => handleFilterChange('job_type', e.target.value)}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="REPAIR">Repair</option>
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="RENOVATION">Renovation</option>
                  <option value="PAINTING">Painting</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {user?.role !== 'CONSUMER' && (
                <div>
                  <label className="block text-amber-100/70 mb-2 font-medium">Radius (km)</label>
                  <input
                    type="number"
                    value={filters.radius || 50}
                    onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                    min="1"
                    max="500"
                  />
                </div>
              )}
            </div>
            <button 
              onClick={applyFilters} 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all mt-4"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner text="Loading jobs..." />
          </div>
        ) : jobsList.length === 0 ? (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-16 text-center">
            <h3 className="text-2xl font-bold text-amber-100 mb-2">No jobs found</h3>
            <p className="text-amber-100/70 mb-6">
              {user?.role === 'CONSUMER'
                ? 'Start by posting your first job'
                : 'Try adjusting your filters or check back later'}
            </p>
            {user?.role === 'CONSUMER' && (
              <Link 
                to="/jobs/create"
                className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full transition-all"
              >
                Post Your First Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsList.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage
