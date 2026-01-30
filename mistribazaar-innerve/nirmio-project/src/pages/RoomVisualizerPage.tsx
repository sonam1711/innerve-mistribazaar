import { useState, useRef } from 'react'
import { Sparkles, ArrowRight, Upload, X, Image as ImageIcon } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import axios from 'axios'

interface VisualizationResult {
  status: string
  original_image?: string
  transformed_image?: string
  generated_image?: string
  prompt: string
  style: string
  message?: string
  note?: string
}

const RoomVisualizerPage = () => {
  const [step, setStep] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [result, setResult] = useState<VisualizationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const styles = ['realistic', 'modern', 'traditional', 'luxury', 'minimalist', 'industrial']

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateVisualization = async () => {
    if (!imageFile || !prompt) {
      toast.error('Please provide both image and description')
      return
    }

    if (prompt.length < 10) {
      toast.error('Please provide a more detailed description (at least 10 characters)')
      return
    }

    setIsLoading(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image_file', imageFile)
      formData.append('prompt', prompt)
      formData.append('style', style)

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const token = localStorage.getItem('access_token')

      const response = await axios.post(
        `${API_BASE_URL}/ai/visualize/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setResult(response.data)
      setStep(3)
      toast.success('Visualization generated!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate visualization')
      console.error('Visualization error:', error)
    }
    setIsLoading(false)
  }

  const reset = () => {
    setStep(1)
    removeImage()
    setPrompt('')
    setStyle('realistic')
    setResult(null)
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

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full mb-4 border border-amber-500/30">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-4xl font-black text-amber-100 mb-2">AI Room Visualizer</h1>
          <p className="text-amber-100/70">Transform your room with AI-powered visualization</p>
        </div>

        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-amber-100 mb-6">Upload Room Image</h2>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />

            {!imagePreview ? (
              <label
                htmlFor="image-upload"
                className="block cursor-pointer"
              >
                <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-12 text-center hover:border-amber-500/50 transition-all bg-[#1a120b]/20">
                  <Upload className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-100 font-semibold mb-2">Click to upload room image</p>
                  <p className="text-amber-100/60 text-sm">PNG, JPG, or WEBP (max 10MB)</p>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-amber-500/30">
                  <img src={imagePreview} alt="Room preview" className="w-full h-96 object-contain bg-[#1a120b]/40" />
                  <button
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Describe Changes */}
        {step === 2 && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-amber-100 mb-6">Describe Your Vision</h2>
            
            {/* Image thumbnail */}
            <div className="mb-6 rounded-lg overflow-hidden border border-amber-500/30">
              <img src={imagePreview} alt="Selected room" className="w-full h-48 object-cover" />
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-amber-100/70 mb-2 font-medium">
                  What changes do you want? *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  rows={4}
                  placeholder="e.g., Modern kitchen with white cabinets and marble countertops, stainless steel appliances, pendant lighting"
                  maxLength={500}
                />
                <p className="text-amber-100/50 text-sm mt-1">{prompt.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-amber-100/70 mb-3 font-medium">Style *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all capitalize ${
                        style === s
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#1a120b]'
                          : 'bg-[#1a120b]/60 border border-amber-500/30 text-amber-100 hover:border-amber-500/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 transition-all font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={generateVisualization}
                  disabled={!prompt || prompt.length < 10 || isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner text="" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && step === 2 && (
          <div className="flex flex-col items-center justify-center mt-8 bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-12">
            <LoadingSpinner text="" />
            <p className="text-amber-100 text-lg font-semibold mt-4">Creating your visualization...</p>
            <p className="text-amber-100/70 text-sm mt-2">This may take a moment</p>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-6">
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-amber-100 mb-6 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Your Transformed Room
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Before */}
                <div>
                  <p className="text-amber-100/70 text-sm mb-2 text-center font-semibold">Before</p>
                  <div className="rounded-lg overflow-hidden border border-amber-500/30 bg-[#1a120b]/40">
                    {result.original_image ? (
                      <img 
                        src={result.original_image} 
                        alt="Original room" 
                        className="w-full h-80 object-contain" 
                      />
                    ) : (
                      <div className="w-full h-80 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-amber-400/30" />
                      </div>
                    )}
                  </div>
                </div>

                {/* After */}
                <div>
                  <p className="text-amber-100/70 text-sm mb-2 text-center font-semibold">After (AI Generated)</p>
                  <div className="rounded-lg overflow-hidden border-2 border-amber-500/50 bg-[#1a120b]/40">
                    {result.generated_image || result.transformed_image ? (
                      <img 
                        src={result.generated_image || result.transformed_image} 
                        alt="Transformed room" 
                        className="w-full h-80 object-contain" 
                      />
                    ) : (
                      <div className="w-full h-80 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-amber-400/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-[#1a120b]/40 rounded-xl p-6 mb-6 space-y-3">
                <div>
                  <p className="text-sm text-amber-100/70 mb-1">Applied Changes:</p>
                  <p className="text-amber-100">{result.prompt}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-100/70">
                    Style: <span className="text-amber-300 capitalize font-semibold">{result.style}</span>
                  </p>
                </div>
                {result.note && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-100/80 text-sm">
                      <strong>Note:</strong> {result.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 transition-all font-semibold"
                >
                  Create Another
                </button>
                <button
                  onClick={() => {
                    // Download the result image
                    const link = document.createElement('a')
                    link.href = result.generated_image || result.transformed_image || ''
                    link.download = 'room-visualization.png'
                    link.click()
                    toast.success('Image downloaded!')
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
                >
                  Download Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomVisualizerPage
