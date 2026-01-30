import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiAPI } from '../utils/api'
import { Home, ArrowRight, Check, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface Question {
  question: string
  field: string
  input_type: string
  options?: string[]
  placeholder?: string
  next_step: number | string
  total_steps: number
}

interface Design {
  property_type: string
  plot_area_sqft: number
  total_built_area_sqft: number
  bedrooms: number
  bathrooms: number
  floors: string
  style: string
  room_layout: Array<{ room: string; area: number; count: number }>
  floor_distribution: Record<string, string>
  construction_estimate: {
    total_estimated_cost: number
    cost_per_sqft: number
    breakdown: {
      material_cost: number
      labor_cost: number
      other_costs: number
    }
    timeline_months: number
    budget_match: string
  }
  recommendations: string[]
  special_features: string
  floor_plan_image?: string  // Base64 encoded PNG
  visualization_prompt?: string  // AI prompt for 3D visualization
}

const HouseDesignerPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [design, setDesign] = useState<Design | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [nextSteps, setNextSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('')

  const startFlow = async () => {
    setIsLoading(true)
    try {
      const response = await aiAPI.houseDesign()
      setCurrentQuestion(response.data)
      setStep(1)
    } catch (error) {
      toast.error('Failed to start house designer')
    }
    setIsLoading(false)
  }

  const handleAnswer = async () => {
    if (!currentQuestion) return
    
    // Validate answer
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      toast.error('Please provide an answer')
      return
    }

    const newData = { ...data, [currentQuestion.field]: currentAnswer }
    setData(newData)

    setIsLoading(true)
    try {
      const response = await aiAPI.houseDesignConversation({
        step: currentQuestion.next_step,
        data: newData
      })

      if (response.data.success) {
        // Final design generated
        setDesign(response.data.design)
        setSummary(response.data.summary)
        setNextSteps(response.data.next_steps)
        setCurrentQuestion(null)
      } else {
        // Next question
        setCurrentQuestion(response.data)
        setStep(typeof currentQuestion.next_step === 'number' ? currentQuestion.next_step : step + 1)
        setCurrentAnswer('')
      }
    } catch (error) {
      toast.error('Failed to process answer')
    }
    setIsLoading(false)
  }

  const handleMultiChoice = (option: string) => {
    const current = Array.isArray(currentAnswer) ? currentAnswer : []
    if (current.includes(option)) {
      setCurrentAnswer(current.filter(item => item !== option))
    } else {
      setCurrentAnswer([...current, option])
    }
  }

  const createJobFromDesign = () => {
    // Navigate to create job page with design data pre-filled
    navigate('/jobs/create', { state: { designData: design } })
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-2xl">
              <Home className="w-12 h-12 text-[#1a120b]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-amber-100 mb-2">
            AI House Designer
          </h1>
          <p className="text-amber-100/70 text-lg">
            Design your dream home with AI assistance
          </p>
        </div>

        {/* Welcome Screen */}
        {step === 0 && !design && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-amber-100 mb-4">
              Let's Design Your Home
            </h2>
            <p className="text-amber-100/70 mb-6 max-w-2xl mx-auto">
              Answer a few questions about your requirements, and our AI will generate a complete house design with floor plans, room layout, cost estimates, and recommendations.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#1a120b]/40 rounded-xl p-4">
                <div className="text-3xl mb-2">🏠</div>
                <h3 className="font-semibold text-amber-100">Custom Layout</h3>
                <p className="text-sm text-amber-100/60">Room-wise design</p>
              </div>
              <div className="bg-[#1a120b]/40 rounded-xl p-4">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-amber-100">Cost Estimate</h3>
                <p className="text-sm text-amber-100/60">Budget breakdown</p>
              </div>
              <div className="bg-[#1a120b]/40 rounded-xl p-4">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold text-amber-100">Recommendations</h3>
                <p className="text-sm text-amber-100/60">Expert advice</p>
              </div>
            </div>
            <button
              onClick={startFlow}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-4 rounded-full transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isLoading ? 'Starting...' : 'Start Designing'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Question Flow */}
        {currentQuestion && !design && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-amber-100/70">
                  Question {step} of {currentQuestion.total_steps}
                </span>
                <span className="text-sm text-amber-100/70">
                  {Math.round((step / currentQuestion.total_steps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#1a120b]/60 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / currentQuestion.total_steps) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-amber-100 mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer Input */}
            <div className="mb-6">
              {currentQuestion.input_type === 'choice' && (
                <div className="grid md:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCurrentAnswer(option)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        currentAnswer === option
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-amber-500/30 hover:border-amber-500/50'
                      }`}
                    >
                      <span className="text-amber-100 font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.input_type === 'multi_choice' && (
                <div className="grid md:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleMultiChoice(option)}
                      className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                        Array.isArray(currentAnswer) && currentAnswer.includes(option)
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-amber-500/30 hover:border-amber-500/50'
                      }`}
                    >
                      {Array.isArray(currentAnswer) && currentAnswer.includes(option) && (
                        <Check className="w-5 h-5 text-amber-400" />
                      )}
                      <span className="text-amber-100 font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.input_type === 'number' && (
                <input
                  type="number"
                  value={currentAnswer as string}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                />
              )}

              {currentQuestion.input_type === 'text' && (
                <textarea
                  value={currentAnswer as string}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={4}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                />
              )}
            </div>

            <button
              onClick={handleAnswer}
              disabled={isLoading || !currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner text="" /> : 'Continue'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Final Design */}
        {design && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-amber-400" /> Your House Design is Ready!
              </h2>
              <p className="text-amber-100/80 text-lg">{summary}</p>
            </div>

            {/* Basic Info */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Property Overview</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-amber-100/60 text-sm">Property Type</p>
                  <p className="text-amber-100 font-semibold">{design.property_type}</p>
                </div>
                <div>
                  <p className="text-amber-100/60 text-sm">Plot Area</p>
                  <p className="text-amber-100 font-semibold">{design.plot_area_sqft} sq ft</p>
                </div>
                <div>
                  <p className="text-amber-100/60 text-sm">Built-up Area</p>
                  <p className="text-amber-100 font-semibold">{Math.round(design.total_built_area_sqft)} sq ft</p>
                </div>
                <div>
                  <p className="text-amber-100/60 text-sm">Bedrooms</p>
                  <p className="text-amber-100 font-semibold">{design.bedrooms} BHK</p>
                </div>
                <div>
                  <p className="text-amber-100/60 text-sm">Bathrooms</p>
                  <p className="text-amber-100 font-semibold">{design.bathrooms}</p>
                </div>
                <div>
                  <p className="text-amber-100/60 text-sm">Style</p>
                  <p className="text-amber-100 font-semibold">{design.style}</p>
                </div>
              </div>
            </div>

            {/* Room Layout */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Room Layout</h3>
              <div className="space-y-2">
                {design.room_layout.map((room, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#1a120b]/40 rounded-lg p-3">
                    <span className="text-amber-100">{room.room} {room.count > 1 && `(×${room.count})`}</span>
                    <span className="font-semibold text-amber-300">{Math.round(room.area * room.count)} sq ft</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor Distribution */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Floor-wise Distribution</h3>
              {Object.entries(design.floor_distribution).map(([floor, rooms]) => (
                <div key={floor} className="mb-3">
                  <h4 className="text-amber-300 font-semibold mb-1">{floor}</h4>
                  <p className="text-amber-100/70">{rooms}</p>
                </div>
              ))}
            </div>

            {/* Cost Estimate */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Construction Estimate</h3>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl p-6 mb-4 text-center">
                <p className="text-amber-100/70 text-sm mb-2">Total Estimated Cost</p>
                <p className="text-4xl font-black text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">
                  ₹{design.construction_estimate.total_estimated_cost.toLocaleString()}
                </p>
                <p className="text-amber-100/60 text-sm mt-2">
                  @ ₹{design.construction_estimate.cost_per_sqft}/sq ft
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#1a120b]/40 rounded-lg p-4">
                  <p className="text-amber-100/60 text-sm">Material Cost</p>
                  <p className="text-amber-100 font-semibold">₹{design.construction_estimate.breakdown.material_cost.toLocaleString()}</p>
                </div>
                <div className="bg-[#1a120b]/40 rounded-lg p-4">
                  <p className="text-amber-100/60 text-sm">Labor Cost</p>
                  <p className="text-amber-100 font-semibold">₹{design.construction_estimate.breakdown.labor_cost.toLocaleString()}</p>
                </div>
                <div className="bg-[#1a120b]/40 rounded-lg p-4">
                  <p className="text-amber-100/60 text-sm">Other Costs</p>
                  <p className="text-amber-100 font-semibold">₹{design.construction_estimate.breakdown.other_costs.toLocaleString()}</p>
                </div>
              </div>
              
              <p className="text-amber-100/70 text-sm mt-4 text-center">
                Estimated timeline: {design.construction_estimate.timeline_months} months
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {design.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-100/80">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-100 mb-4">Next Steps</h3>
              <ol className="space-y-2">
                {nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-amber-100/80">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Floor Plan Visualization */}
            {design.floor_plan_image && (
              <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-amber-100 mb-4">Floor Plan Visualization</h3>
                <div className="bg-[#1a120b]/40 rounded-lg overflow-hidden border border-amber-500/20">
                  <img 
                    src={`data:image/png;base64,${design.floor_plan_image}`}
                    alt="Floor Plan" 
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `data:image/png;base64,${design.floor_plan_image}`
                    link.download = 'mistribazar-floor-plan.png'
                    link.click()
                    toast.success('Floor plan downloaded!')
                  }}
                  className="mt-4 w-full bg-[#1a120b]/60 border border-amber-500/30 text-amber-100 font-semibold px-6 py-3 rounded-full hover:border-amber-500/50 transition-all"
                >
                  Download Floor Plan
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={createJobFromDesign}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-6 py-3 rounded-full transition-all"
              >
                Post Job for This Design
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#1a120b]/60 border border-amber-500/30 text-amber-100 font-semibold px-6 py-3 rounded-full hover:border-amber-500/50 hover:bg-[#1a120b]/80 transition-all"
              >
                Start New Design
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HouseDesignerPage
