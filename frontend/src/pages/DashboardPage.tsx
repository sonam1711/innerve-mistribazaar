import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { useBidStore } from '../store/bidStore'
import { Briefcase, TrendingUp, Clock, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { jobs, fetchJobs } = useJobStore()
  const { bids, fetchBids } = useBidStore()

  useEffect(() => {
    if (user?.role === 'CONSUMER') {
      fetchJobs({ consumer: user.id })
    } else {
      fetchJobs({ status: 'OPEN' })
      fetchBids()
    }
  }, [user])

  const activeJobs = jobs.filter(job => job.status === 'OPEN').length
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-slate-400">
          {user?.role === 'CONSUMER'
            ? 'Manage your construction projects'
            : 'Find and bid on available jobs'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">
                {user?.role === 'CONSUMER' ? 'My Jobs' : 'Available Jobs'}
              </p>
              <p className="text-3xl font-bold text-white">{jobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">
                {user?.role === 'CONSUMER' ? 'Active Jobs' : 'My Bids'}
              </p>
              <p className="text-3xl font-bold text-white">
                {user?.role === 'CONSUMER' ? activeJobs : bids.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-white">{completedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {user?.role === 'CONSUMER' && (
          <Link to="/create-job" className="card hover:bg-slate-700 transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Post a New Job</h3>
                <p className="text-slate-400 text-sm">Start a new construction project</p>
              </div>
            </div>
          </Link>
        )}
        
        <Link to="/jobs" className="card hover:bg-slate-700 transition cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Browse Jobs</h3>
              <p className="text-slate-400 text-sm">
                {user?.role === 'CONSUMER' ? 'View your posted jobs' : 'Find jobs to bid on'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">
          {user?.role === 'CONSUMER' ? 'Your Recent Jobs' : 'Recent Opportunities'}
        </h2>
        
        {jobs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            {user?.role === 'CONSUMER' 
              ? 'No jobs posted yet. Create your first job!'
              : 'No jobs available at the moment.'}
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {job.description ? job.description.slice(0, 100) : 'No description'}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-400">{job.job_type}</span>
                      <span className="text-green-400">
                        ₹{job.budget_min.toLocaleString()} - ₹{job.budget_max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${
                    job.status === 'OPEN' ? 'badge-open' :
                    job.status === 'IN_PROGRESS' ? 'badge-in-progress' :
                    'badge-completed'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
