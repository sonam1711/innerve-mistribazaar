import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Plus, Briefcase, TrendingUp, Sparkles, MapPin, Home } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { jobs, fetchJobs, fetchNearbyJobs, isLoading } = useJobStore()

  // Ensure jobs is always an array
  const jobsList = Array.isArray(jobs) ? jobs : []

  useEffect(() => {
    if (user) {
      if (user.role === 'CONSUMER') {
        fetchMyJobs()
      } else if (user.role === 'MASON' || user.role === 'TRADER') {
        // For masons/traders, fetch nearby jobs based on their location
        if (user.latitude && user.longitude) {
          console.log('Fetching nearby jobs for:', user.role, 'Lat:', user.latitude, 'Lng:', user.longitude)
          fetchNearbyJobs(user.latitude, user.longitude, 50) // 50km radius
        } else {
          console.log('User location not available, fetching all jobs')
          fetchJobs()
        }
      }
    }
  }, [user?.role, user?.latitude, user?.longitude])

  const fetchMyJobs = async () => {
    await fetchJobs({ consumer: user?.id })
  }

  if (isLoading && jobsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-100 mb-2">
            Welcome back, <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">{user?.name}</span>! 👋
          </h1>
          <p className="text-amber-100/70">
            {user?.role === 'CONSUMER' && 'Manage your construction projects'}
            {user?.role === 'MASON' && 'Find new opportunities near you'}
            {user?.role === 'TRADER' && 'Browse material requests'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100/70 text-sm mb-1">Total Jobs</p>
                <p className="text-4xl font-black text-amber-100">{jobsList.length}</p>
              </div>
              <Briefcase className="w-12 h-12 text-amber-400" />
            </div>
          </div>

          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100/70 text-sm mb-1">
                  {user?.role === 'CONSUMER' ? 'Active Bids' : 'My Bids'}
                </p>
                <p className="text-4xl font-black text-amber-100">0</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-400" />
            </div>
          </div>

          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100/70 text-sm mb-1">Rating</p>
                <p className="text-4xl font-black text-amber-100">{user?.rating || '0.0'}/5</p>
              </div>
              <div className="text-5xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-amber-100 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'CONSUMER' && (
              <>
                <Link to="/jobs/create" className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all text-center group">
                  <Plus className="w-12 h-12 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-amber-100">Post New Job</h3>
                </Link>
                <Link to="/house-designer" className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all text-center group">
                  <Home className="w-12 h-12 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-amber-100">AI House Designer</h3>
                </Link>
                <Link to="/budget-estimator" className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all text-center group">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-amber-100">AI Budget Estimator</h3>
                </Link>
                <Link to="/room-visualizer" className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all text-center group">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-amber-100">Room Visualizer</h3>
                </Link>
              </>
            )}
            <Link to="/jobs" className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all text-center group">
              <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-amber-100">
                {user?.role === 'CONSUMER' ? 'View All Jobs' : 'Browse Jobs'}
              </h3>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-100">
              {user?.role === 'CONSUMER' ? 'My Recent Jobs' : 'Available Jobs Nearby'}
            </h2>
            <Link to="/jobs" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              View All →
            </Link>
          </div>

          {jobsList.length === 0 ? (
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-12 text-center">
              <Briefcase className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-100 mb-2">No jobs yet</h3>
              <p className="text-amber-100/70 mb-4">
                {user?.role === 'CONSUMER'
                  ? 'Start by posting your first project'
                  : 'Check back later for new opportunities'}
              </p>
              {user?.role === 'CONSUMER' && (
                <Link to="/jobs/create" className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full transition-all">
                  Post a Job
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsList.slice(0, 6).map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-100 mb-1 group-hover:text-amber-300 transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold">
                        {job.status}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-amber-400/20 text-amber-200 rounded-full text-sm font-medium">
                      {job.job_type}
                    </span>
                  </div>

                  <div className="space-y-2 text-amber-100/70">
                    <div className="flex items-center">
                      <span className="font-medium text-amber-100">
                        ₹{job.budget_min?.toLocaleString()} - ₹{job.budget_max?.toLocaleString()}
                      </span>
                    </div>
                    {job.distance_km && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{job.distance_km} km away</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
