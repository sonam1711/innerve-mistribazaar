import { useEffect } from 'react'
import { useBidStore } from '../store/bidStore'
import LoadingSpinner from '../components/LoadingSpinner'
import BidCard from '../components/BidCard'
import { Briefcase } from 'lucide-react'

const BidsPage = () => {
  const { bids, fetchMyBids, withdrawBid, isLoading } = useBidStore()

  useEffect(() => {
    fetchMyBids()
  }, [])

  const handleWithdraw = async (bidId: number) => {
    if (confirm('Are you sure you want to withdraw this bid?')) {
      await withdrawBid(bidId)
    }
  }

  if (isLoading && bids.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading bids..." />
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
        <h1 className="text-4xl font-black text-amber-100 mb-8">My Bids</h1>

        {bids.length === 0 ? (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-16 text-center">
            <Briefcase className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-amber-100 mb-2">No bids yet</h3>
            <p className="text-amber-100/70">
              Start bidding on available jobs to see them here
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bids.map((bid) => (
              <div key={bid.id}>
                <BidCard bid={bid} />
                {bid.job_details && (
                  <div className="mt-2 px-2">
                    <p className="text-sm font-medium text-amber-100/70">
                      Job: <span className="text-amber-300">{bid.job_details.title}</span>
                    </p>
                  </div>
                )}
                {bid.status === 'PENDING' && (
                  <button
                    onClick={() => handleWithdraw(bid.id)}
                    className="mt-3 w-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 px-4 py-3 rounded-full text-red-300 font-semibold transition-all"
                  >
                    Withdraw Bid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BidsPage
