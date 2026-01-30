import { DollarSign, Calendar, User } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Bid {
  id: number
  job: number
  bidder: number
  bid_amount: number
  estimated_days: number
  message: string
  status: string
  created_at: string
  job_details?: any
  bidder_details?: any
}

interface BidCardProps {
  bid: Bid
  onAccept?: () => void
  onReject?: () => void
  showActions?: boolean
}

const BidCard = ({ bid, onAccept, onReject, showActions = false }: BidCardProps) => {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    ACCEPTED: 'bg-green-500/20 text-green-300 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
    WITHDRAWN: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }

  return (
    <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[bid.status] || 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
          {bid.status}
        </span>
        {bid.job_details && (
          <Link 
            to={`/jobs/${bid.job}`}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            View Job
          </Link>
        )}
      </div>

      <div className="space-y-3 text-amber-100/70">
        {bid.bidder_details && (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-amber-400" />
            <span className="font-medium text-amber-100">{bid.bidder_details.name}</span>
            {bid.bidder_details.rating && (
              <span className="ml-2 text-amber-300">⭐ {bid.bidder_details.rating}</span>
            )}
          </div>
        )}

        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-amber-400" />
          <span className="font-semibold text-amber-100">₹{bid.bid_amount.toLocaleString()}</span>
        </div>

        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-amber-400" />
          <span>{bid.estimated_days} days</span>
        </div>

        {bid.message && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-sm text-amber-100/80 italic">"{bid.message}"</p>
          </div>
        )}
      </div>

      {showActions && bid.status === 'PENDING' && (
        <div className="flex gap-2 mt-4">
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-full text-white font-semibold transition-all"
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="flex-1 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 px-4 py-2 rounded-full text-red-300 font-semibold transition-all"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BidCard
