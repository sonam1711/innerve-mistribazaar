import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { useBidStore } from '../store/bidStore'
import { Plus, Briefcase, TrendingUp, MapPin, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import JobCard from '../components/JobCard'
import { translate } from '../utils/translations'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { jobs, fetchJobs, fetchNearbyJobs, isLoading: jobsLoading } = useJobStore()
  const { bids, fetchMyBids, isLoading: bidsLoading } = useBidStore()

  // Get translation function with user's language
  const t = (text) => translate(text, user.language || 'English')

  useEffect(() => {
    if (user.role === 'CONSUMER') {
      fetchJobs({ my_jobs: true })
    } else {
      fetchNearbyJobs()
    }
    fetchMyBids()
  }, [user.role])

  if (jobsLoading && jobs.length === 0) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('Welcome back')}, {user.name}! 👋
        </h1>
        <p className="text-gray-600">
          {user.role === 'CONSUMER' && t('Manage your construction projects')}
          {user.role === 'MASON' && t('Find new opportunities near you')}
          {user.role === 'TRADER' && t('Browse material requests')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('Total Jobs')}</p>
              <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <Briefcase className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {user.role === 'CONSUMER' ? t('Active Bids') : t('My Bids')}
              </p>
              <p className="text-3xl font-bold text-gray-900">{bids.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('Rating')}</p>
              <p className="text-3xl font-bold text-gray-900">{user.rating || '0.0'}/5</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('Quick Actions')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'CONSUMER' && (
            <>
              <Link to="/jobs/create" className="card hover:shadow-xl transition-all text-center">
                <Plus className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold">{t('Post New Job')}</h3>
              </Link>
              <Link to="/budget-estimator" className="card hover:shadow-xl transition-all text-center">
                <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold">{t('AI Budget Estimator')}</h3>
              </Link>
              <Link to="/room-visualizer" className="card hover:shadow-xl transition-all text-center">
                <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold">{t('Room Visualizer')}</h3>
              </Link>
            </>
          )}
          <Link to="/jobs" className="card hover:shadow-xl transition-all text-center">
            <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold">
              {user.role === 'CONSUMER' ? t('View All Jobs') : t('Browse Jobs')}
            </h3>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {user.role === 'CONSUMER' ? t('My Recent Jobs') : t('Available Jobs Nearby')}
          </h2>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-semibold">
            {t('View All')} →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('No jobs yet')}</h3>
            <p className="text-gray-600 mb-4">
              {user.role === 'CONSUMER'
                ? t('Start by posting your first project')
                : t('Check back later for new opportunities')}
            </p>
            {user.role === 'CONSUMER' && (
              <Link to="/jobs/create" className="btn-primary inline-block">
                {t('Post a Job')}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
