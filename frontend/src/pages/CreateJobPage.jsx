import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'
import { Plus, X, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCurrentLocation } from '../utils/location'

const CreateJobPage = () => {
  const navigate = useNavigate()
  const { createJob, isLoading } = useJobStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState({
    job_type: 'REPAIR',
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    latitude: '',
    longitude: '',
    address: '',
    image_urls: [],
  })
  
  const [detectingLocation, setDetectingLocation] = useState(false)
  
  // Auto-detect current location when component mounts
  useEffect(() => {
    detectCurrentLocation()
  }, [])

  const [imageUrl, setImageUrl] = useState('')
  
  // Function to detect current location
  const detectCurrentLocation = async () => {
    setDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
      toast.success('Current location detected for job posting')
    } catch (error) {
      console.error('Location detection error:', error)
      toast.error(error.message || 'Could not detect location. Please enter manually.')
      // Fallback to user's registered location
      if (user.latitude && user.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: user.latitude,
          longitude: user.longitude
        }))
      }
    } finally {
      setDetectingLocation(false)
    }
  }

  const addImage = () => {
    if (imageUrl && !formData.image_urls.includes(imageUrl)) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, imageUrl]
      })
      setImageUrl('')
    }
  }

  const removeImage = (url) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter(u => u !== url)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
      toast.error('Minimum budget cannot be greater than maximum budget')
      return
    }

    try {
      const job = await createJob(formData)
      navigate(`/jobs/${job.id}`)
    } catch (error) {
      // Error handled in store
    }
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Job Type</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="input-field"
              >
                <option value="REPAIR">Repair</option>
                <option value="CONSTRUCTION">Construction</option>
              </select>
            </div>

            <div>
              <label className="label">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Kitchen Renovation"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="5"
                placeholder="Describe your project in detail..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Minimum Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="input-field"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="label">Maximum Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="input-field"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                rows="2"
                placeholder="Full address of the project location"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={detectingLocation}
              className="btn-outline flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              {detectingLocation ? 'Detecting Location...' : 'Use Current Location'}
            </button>

            <div>
              <label className="label">Images (URLs)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {formData.image_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Creating...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateJobPage
