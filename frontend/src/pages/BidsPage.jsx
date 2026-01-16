import { useEffect } from 'react'
import { useBidStore } from '../store/bidStore'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import BidCard from '../components/BidCard'
import { Briefcase } from 'lucide-react'

const BidsPage = () => {
  const { user } = useAuthStore()
  const { bids, fetchMyBids, withdrawBid, isLoading } = useBidStore()

  useEffect(() => {
    fetchMyBids()
  }, [])

  const handleWithdraw = async (bidId) => {
    if (confirm('Are you sure you want to withdraw this bid?')) {
      await withdrawBid(bidId)
    }
  }

  if (isLoading && bids.length === 0) {
    return <LoadingSpinner text="Loading bids..." />
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bids</h1>

      {bids.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids yet</h3>
          <p className="text-gray-600">
            Start bidding on available jobs to see them here
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <div key={bid.id}>
              <BidCard bid={bid} />
              {bid.job_details && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">Job: {bid.job_details.title}</p>
                </div>
              )}
              {bid.status === 'PENDING' && (
                <button
                  onClick={() => handleWithdraw(bid.id)}
                  className="mt-3 w-full text-red-600 border border-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  Withdraw Bid
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BidsPage
