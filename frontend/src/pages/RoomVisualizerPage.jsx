import { useState } from 'react'
import api from '../utils/api'
import { Sparkles, Upload, ArrowRight } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const RoomVisualizerPage = () => {
  const [step, setStep] = useState(1)
  const [imageUrl, setImageUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [styles, setStyles] = useState([])
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useState(() => {
    loadStyles()
  }, [])

  const loadStyles = async () => {
    try {
      const response = await api.get('/ai/visualize/styles/')
      setStyles(response.data.styles)
    } catch (error) {
      console.error('Failed to load styles')
    }
  }

  const generateVisualization = async () => {
    if (!imageUrl || !prompt) {
      toast.error('Please provide both image and description')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/ai/visualize/', {
        image_url: imageUrl,
        prompt,
        style
      })
      setResult(response.data)
      setStep(3)
      setIsLoading(false)
      toast.success('Visualization generated!')
    } catch (error) {
      setIsLoading(false)
      toast.error(error.response?.data?.error || 'Failed to generate visualization')
    }
  }

  const reset = () => {
    setStep(1)
    setImageUrl('')
    setPrompt('')
    setStyle('realistic')
    setResult(null)
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Room Visualizer</h1>
          <p className="text-gray-600">Transform your room with AI-powered visualization</p>
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Upload Room Image</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://example.com/your-room-image.jpg"
                />
              </div>

              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Room preview"
                    className="w-full h-64 object-cover rounded-lg"
                    onError={() => toast.error('Failed to load image')}
                  />
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!imageUrl}
                className="btn-primary w-full flex items-center justify-center"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Describe Your Vision</h2>
            <div className="space-y-6">
              <div>
                <label className="label">What changes do you want?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="e.g., Modern kitchen with white cabinets and marble countertops, add pendant lights..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  Be specific about colors, materials, furniture, and style
                </p>
              </div>

              <div>
                <label className="label">Style</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-4 border-2 rounded-lg transition ${
                        style === s.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold">{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 btn-secondary">
                  Back
                </button>
                <button
                  onClick={generateVisualization}
                  disabled={!prompt || isLoading}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">Your Visualization</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Before</p>
                  <img
                    src={result.original_image_url}
                    alt="Before"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">After (AI Generated)</p>
                  <img
                    src={result.generated_image_url}
                    alt="After"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>

              {result.note && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Note:</strong> {result.note}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Disclaimer:</strong> {result.disclaimer}
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Love this design?</h3>
              <p className="text-gray-600 mb-4">
                Create a job posting to find professionals who can bring this vision to life!
              </p>
              <button className="btn-primary w-full" onClick={() => {
                // Navigate to create job with visualization data
                toast.info('Create job from visualization - Coming soon!')
              }}>
                Create Job from This Design
              </button>
            </div>

            <button onClick={reset} className="w-full btn-outline">
              Create New Visualization
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomVisualizerPage
