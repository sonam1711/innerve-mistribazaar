import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Job {
  id: number
  title: string
  description: string
  job_type: string
  status: string
  budget_min?: number
  budget_max?: number
  location?: string
  latitude?: number
  longitude?: number
  distance_km?: number
  created_at?: string
  consumer?: number
  image_count?: number
  bid_count?: number
}

interface JobCardProps {
  job: Job
}

const JobCard = ({ job }: JobCardProps) => {
  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-500/20 text-green-300 border-green-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    COMPLETED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  return (
    <Link 
      to={`/jobs/${job.id}`} 
      className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-[#2d1a0a]/80 transition-all group block"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-amber-100 mb-2 group-hover:text-amber-300 transition-colors">
            {job.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[job.status] || 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
            {job.status}
          </span>
        </div>
        <span className="px-3 py-1 bg-amber-400/20 text-amber-200 rounded-full text-sm font-medium">
          {job.job_type}
        </span>
      </div>

      <div className="space-y-2 text-amber-100/70">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-amber-400" />
          <span className="font-medium text-amber-100">
            ₹{job.budget_min?.toLocaleString()} - ₹{job.budget_max?.toLocaleString()}
          </span>
        </div>

        {job.distance_km !== undefined && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-amber-400" />
            <span>{job.distance_km} km away</span>
          </div>
        )}

        {job.created_at && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-amber-400" />
            <span>{new Date(job.created_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {((job.image_count && job.image_count > 0) || (job.bid_count && job.bid_count > 0)) && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-amber-500/20 text-sm text-amber-100/70">
          {job.image_count && job.image_count > 0 && <span>📷 {job.image_count} images</span>}
          {job.bid_count && job.bid_count > 0 && <span>💼 {job.bid_count} bids</span>}
        </div>
      )}
    </Link>
  )
}

export default JobCard
