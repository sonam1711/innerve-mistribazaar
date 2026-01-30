import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { useBidStore } from '../store/bidStore'
import { MapPin, Calendar, DollarSign, User, ArrowLeft, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import BidCard from '../components/BidCard'
import toast from 'react-hot-toast'

const JobDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentJob, fetchJob, updateJob, isLoading } = useJobStore()
  const { jobBids, fetchJobBids, acceptBid, rejectBid, createBid, fetchRecommendations, recommendations } = useBidStore()
  
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidData, setBidData] = useState({
    bid_amount: '',
    estimated_days: '',
    message: '',
  })

  useEffect(() => {
    if (id) {
      fetchJob(parseInt(id))
      if (user?.role === 'CONSUMER') {
        fetchJobBids(parseInt(id))
        fetchRecommendations(parseInt(id))
      }
    }
  }, [id])

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBid({ 
        ...bidData, 
        job: parseInt(id!),
        bid_amount: parseFloat(bidData.bid_amount),
        estimated_days: parseInt(bidData.estimated_days)
      })
      setShowBidForm(false)
      setBidData({ bid_amount: '', estimated_days: '', message: '' })
    } catch (error) {
      // Error handled in store
    }
  }

  const handleAcceptBid = async (bidId: number) => {
    const success = await acceptBid(bidId)
    if (success && id) {
      fetchJob(parseInt(id))
      fetchJobBids(parseInt(id))
    }
  }

  const handleRejectBid = async (bidId: number) => {
    const success = await rejectBid(bidId)
    if (success && id) {
      fetchJobBids(parseInt(id))
    }
  }

  const handleCancelJob = async () => {
    if (confirm('Are you sure you want to cancel this job?') && id) {
      try {
        await updateJob(parseInt(id), { status: 'CANCELLED' })
        toast.success('Job cancelled')
        fetchJob(parseInt(id))
      } catch (error) {
        toast.error('Failed to cancel job')
      }
    }
  }

  if (isLoading || !currentJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading job details..." />
      </div>
    )
  }

  const isOwner = currentJob.consumer_details?.id === user?.id
  const canBid = !isOwner && (user?.role === 'MASON' || user?.role === 'TRADER') && currentJob.status === 'OPEN'

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
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-amber-100/70 hover:text-amber-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-amber-100 mb-3">{currentJob.title}</h1>
                  <span className="px-4 py-2 bg-amber-400/20 text-amber-200 rounded-full text-sm font-medium">
                    {currentJob.job_type}
                  </span>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  currentJob.status === 'OPEN' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  currentJob.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  currentJob.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {currentJob.status}
                </span>
              </div>

              <div className="space-y-4 mb-6 text-amber-100/70">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-amber-400" />
                  <span className="font-semibold text-lg text-amber-100">
                    ₹{currentJob.budget_min?.toLocaleString()} - ₹{currentJob.budget_max?.toLocaleString()}
                  </span>
                </div>

                {currentJob.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-amber-400" />
                    <span>{currentJob.address}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                  <span>Posted on {new Date(currentJob.created_at!).toLocaleDateString()}</span>
                </div>

                {currentJob.deadline && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                    <span>Deadline: {new Date(currentJob.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-amber-500/20 pt-6">
                <h2 className="text-xl font-semibold text-amber-100 mb-3">Description</h2>
                <p className="text-amber-100/70 whitespace-pre-wrap">{currentJob.description}</p>
              </div>

              {/* Images */}
              {currentJob.images && currentJob.images.length > 0 && (
                <div className="border-t border-amber-500/20 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-amber-100 mb-4">Images</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {currentJob.images.map((image: any, index: number) => (
                      <img
                        key={index}
                        src={image.image_url}
                        alt={image.caption || `Job image ${index + 1}`}
                        className="rounded-lg w-full h-48 object-cover border border-amber-500/30"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bids Section (for job owner) */}
            {isOwner && jobBids.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-amber-100">Bids Received ({jobBids.length})</h2>
                  {recommendations && (
                    <span className="flex items-center text-amber-300">
                      <Sparkles className="w-5 h-5 mr-1" />
                      AI Recommended
                    </span>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {(recommendations?.recommendations || jobBids).map((item: any) => {
                    const bid = item.bid || item
                    return (
                      <BidCard
                        key={bid.id}
                        bid={bid}
                        showActions={currentJob.status === 'OPEN'}
                        onAccept={() => handleAcceptBid(bid.id)}
                        onReject={() => handleRejectBid(bid.id)}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Customer Info */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-amber-100 mb-4">Posted By</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 w-12 h-12 rounded-full flex items-center justify-center border border-amber-500/30">
                  <User className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <p className="font-semibold text-amber-100">{currentJob.consumer_details?.name}</p>
                  <div className="flex items-center text-sm text-amber-100/70">
                    <span>⭐ {currentJob.consumer_details?.rating || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canBid && (
              <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 mt-6">
                <button
                  onClick={() => setShowBidForm(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
                >
                  Submit Bid
                </button>
              </div>
            )}

            {isOwner && currentJob.status === 'OPEN' && (
              <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 mt-6">
                <button
                  onClick={handleCancelJob}
                  className="w-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 px-6 py-3 rounded-full text-red-300 font-semibold transition-all"
                >
                  Cancel Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Form Modal */}
      {showBidForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d1a0a] border border-amber-500/30 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-amber-100 mb-6">Submit Your Bid</h3>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidData.bid_amount}
                  onChange={(e) => setBidData({ ...bidData, bid_amount: e.target.value })}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  required
                  min={currentJob.budget_min}
                  max={currentJob.budget_max}
                />
                <p className="text-sm text-amber-100/50 mt-1">
                  Budget range: ₹{currentJob.budget_min?.toLocaleString()} - ₹{currentJob.budget_max?.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Estimated Days</label>
                <input
                  type="number"
                  value={bidData.estimated_days}
                  onChange={(e) => setBidData({ ...bidData, estimated_days: e.target.value })}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Message (Optional)</label>
                <textarea
                  value={bidData.message}
                  onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  rows={3}
                  placeholder="Add any additional details about your proposal..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetailPage
