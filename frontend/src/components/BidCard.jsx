import { Star } from 'lucide-react'

const BidCard = ({ bid, onAccept, onReject, showActions = false }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{bid.bidder_details?.name || bid.bidder_name}</h4>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">
              {bid.bidder_details?.rating || bid.bidder_rating} / 5.0
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
          bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          bid.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {bid.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Bid Amount</p>
          <p className="text-xl font-bold text-primary-600">₹{Number(bid.bid_amount).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Estimated Days</p>
          <p className="text-xl font-bold text-gray-900">{bid.estimated_days}</p>
        </div>
      </div>

      {bid.message && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Message</p>
          <p className="text-gray-800 mt-1">{bid.message}</p>
        </div>
      )}

      {bid.reason && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Recommended: {bid.reason}
          </p>
          {bid.score && (
            <p className="text-xs text-blue-700 mt-1">Match Score: {bid.score}%</p>
          )}
        </div>
      )}

      {showActions && bid.status === 'PENDING' && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onAccept(bid.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(bid.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default BidCard
