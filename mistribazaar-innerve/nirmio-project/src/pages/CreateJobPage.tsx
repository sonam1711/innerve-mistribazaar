import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'
import { Plus, X, MapPin, Navigation } from 'lucide-react'
import { getCurrentLocation } from '../utils/location'
import toast from 'react-hot-toast'

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
    image_urls: [] as string[],
  })

  const [imageUrl, setImageUrl] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  
  // Auto-detect current location when component mounts
  useEffect(() => {
    detectCurrentLocation()
  }, [])

  const detectCurrentLocation = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      setFormData({
        ...formData,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      })
      toast.success('Current location detected!')
    } catch (error) {
      toast.error('Could not detect location. Please enter manually.')
    } finally {
      setLocationLoading(false)
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

  const removeImage = (url: string) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter(u => u !== url)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
      toast.error('Minimum budget cannot be greater than maximum budget')
      return
    }

    try {
      const job = await createJob({
        ...formData,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      })
      toast.success('Job posted successfully!')
      navigate(`/jobs/${job.id}`)
    } catch (error) {
      // Error handled in store
    }
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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-amber-100 mb-8">Post a New Job</h1>

        <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-amber-100/70 mb-2 font-medium">Job Type</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="REPAIR">Repair</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="RENOVATION">Renovation</option>
                <option value="PAINTING">Painting</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-amber-100/70 mb-2 font-medium">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                placeholder="e.g., Kitchen Renovation"
                required
              />
            </div>

            <div>
              <label className="block text-amber-100/70 mb-2 font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                rows={5}
                placeholder="Describe your project in detail..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Minimum Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">Maximum Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-100/70 mb-2 font-medium">
                <MapPin className="inline w-4 h-4 mr-1" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                rows={2}
                placeholder="Full address of the project location"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-amber-100/70 font-medium">Location Coordinates</label>
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4" />
                  {locationLoading ? 'Detecting...' : 'Use Current Location'}
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="Latitude"
                    className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="Longitude"
                    className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-amber-100/70 mb-2 font-medium">Images (URLs)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-lg text-[#1a120b] font-bold transition-all flex items-center"
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
                        className="w-full h-24 object-cover rounded-lg border border-amber-500/30"
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

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 hover:bg-[#1a120b]/80 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
