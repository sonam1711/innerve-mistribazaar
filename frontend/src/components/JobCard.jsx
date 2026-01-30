import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const JobCard = ({ job }) => {
  const statusColors = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <Link to={`/jobs/${job.id}`} className="card hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
            {job.status}
          </span>
        </div>
        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
          {job.job_type}
        </span>
      </div>

      <div className="space-y-2 text-gray-600">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-medium">
            ₹{job.budget_min?.toLocaleString()} - ₹{job.budget_max?.toLocaleString()}
          </span>
        </div>

        {job.distance_km && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.distance_km} km away</span>
          </div>
        )}

        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {(job.image_count > 0 || job.bid_count > 0) && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-600">
          {job.image_count > 0 && <span>📷 {job.image_count} images</span>}
          {job.bid_count > 0 && <span>💼 {job.bid_count} bids</span>}
        </div>
      )}
    </Link>
  )
}

export default JobCard
