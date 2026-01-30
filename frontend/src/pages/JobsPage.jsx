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

  useEffect(() => {
    if (user.role === 'CONSUMER') {
      // For consumers, fetch their jobs (backend automatically filters)
      fetchJobs({ my_jobs: true })
    } else {
      fetchNearbyJobs(filters.radius)
    }
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value })
  }

  const applyFilters = () => {
    if (user.role === 'CONSUMER') {
      fetchJobs(filters)
    } else {
      fetchNearbyJobs(filters.radius)
    }
    setShowFilters(false)
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'CONSUMER' ? 'My Jobs' : 'Available Jobs'}
          </h1>
          <p className="text-gray-600 mt-1">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          {user.role === 'CONSUMER' && (
            <Link to="/jobs/create" className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Post Job
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-8">
          <h3 className="font-semibold text-lg mb-4">Filters</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="label">Job Type</label>
              <select
                value={filters.job_type}
                onChange={(e) => handleFilterChange('job_type', e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="REPAIR">Repair</option>
                <option value="CONSTRUCTION">Construction</option>
              </select>
            </div>

            {user.role !== 'CONSUMER' && (
              <div>
                <label className="label">Radius (km)</label>
                <input
                  type="number"
                  value={filters.radius}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                  className="input-field"
                />
              </div>
            )}
          </div>
          <button onClick={applyFilters} className="btn-primary mt-4">
            Apply Filters
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            {user.role === 'CONSUMER'
              ? 'Start by posting your first job'
              : 'Try adjusting your filters or check back later'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobsPage
