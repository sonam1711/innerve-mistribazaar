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
  const { currentJob, fetchJob, updateJobStatus, isLoading } = useJobStore()
  const { jobBids, fetchJobBids, acceptBid, rejectBid, createBid, fetchRecommendations, recommendations } = useBidStore()
  
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidData, setBidData] = useState({
    bid_amount: '',
    estimated_days: '',
    message: '',
  })

  useEffect(() => {
    fetchJob(id)
    if (user.role === 'CONSUMER') {
      fetchJobBids(id)
      fetchRecommendations(id)
    }
  }, [id])

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    try {
      await createBid({ ...bidData, job: id })
      setShowBidForm(false)
      setBidData({ bid_amount: '', estimated_days: '', message: '' })
      toast.success('Bid submitted successfully!')
    } catch (error) {
      // Error handled in store
    }
  }

  const handleAcceptBid = async (bidId) => {
    const success = await acceptBid(bidId)
    if (success) {
      fetchJob(id)
      fetchJobBids(id)
    }
  }

  const handleRejectBid = async (bidId) => {
    const success = await rejectBid(bidId)
    if (success) {
      fetchJobBids(id)
    }
  }

  if (isLoading || !currentJob) {
    return <LoadingSpinner text="Loading job details..." />
  }

  const isOwner = currentJob.consumer_details?.id === user.id
  const canBid = !isOwner && (user.role === 'MASON' || user.role === 'TRADER') && currentJob.status === 'OPEN'

  return (
    <div className="container-custom py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentJob.title}</h1>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {currentJob.job_type}
                </span>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                currentJob.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                currentJob.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                currentJob.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentJob.status}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-700">
                <DollarSign className="w-5 h-5 mr-3" />
                <span className="font-semibold text-lg">
                  ₹{currentJob.budget_min?.toLocaleString()} - ₹{currentJob.budget_max?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3" />
                <span>{currentJob.address}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Posted on {new Date(currentJob.created_at).toLocaleDateString()}</span>
              </div>

              {currentJob.deadline && (
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>Deadline: {new Date(currentJob.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{currentJob.description}</p>
            </div>

            {/* Images */}
            {currentJob.images && currentJob.images.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-3">Images</h2>
                <div className="grid grid-cols-2 gap-4">
                  {currentJob.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.image_url}
                      alt={image.caption || `Job image ${index + 1}`}
                      className="rounded-lg w-full h-48 object-cover"
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
                <h2 className="text-2xl font-bold">Bids Received ({jobBids.length})</h2>
                {recommendations && (
                  <span className="flex items-center text-primary-600">
                    <Sparkles className="w-5 h-5 mr-1" />
                    AI Recommended
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {recommendations?.recommendations?.map((rec) => (
                  <BidCard
                    key={rec.bid.id}
                    bid={{ ...rec.bid, score: rec.score, reason: rec.reason }}
                    showActions={currentJob.status === 'OPEN'}
                    onAccept={handleAcceptBid}
                    onReject={handleRejectBid}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Customer Info */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Posted By</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold">{currentJob.consumer_details?.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span>⭐ {currentJob.consumer_details?.rating || '0.0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canBid && (
            <div className="card mt-6">
              <button
                onClick={() => setShowBidForm(true)}
                className="w-full btn-primary"
              >
                Submit Bid
              </button>
            </div>
          )}

          {isOwner && currentJob.status === 'OPEN' && (
            <div className="card mt-6">
              <button
                onClick={() => updateJobStatus(id, 'CANCELLED')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Cancel Job
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bid Form Modal */}
      {showBidForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Submit Your Bid</h3>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="label">Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidData.bid_amount}
                  onChange={(e) => setBidData({ ...bidData, bid_amount: e.target.value })}
                  className="input-field"
                  required
                  min={currentJob.budget_min}
                  max={currentJob.budget_max}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Budget range: ₹{currentJob.budget_min?.toLocaleString()} - ₹{currentJob.budget_max?.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="label">Estimated Days</label>
                <input
                  type="number"
                  value={bidData.estimated_days}
                  onChange={(e) => setBidData({ ...bidData, estimated_days: e.target.value })}
                  className="input-field"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="label">Message (Optional)</label>
                <textarea
                  value={bidData.message}
                  onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Add any additional details about your proposal..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
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
