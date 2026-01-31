import { useState } from 'react'
import toast from 'react-hot-toast'
import { Home, DollarSign, Loader, FileText } from 'lucide-react'

interface RoomPlan {
  name: string
  dimension: string
  area: number
}

interface FloorPlan {
  floor: number
  rooms: RoomPlan[]
  totalArea: number
}

interface PlanResult {
  floorPlans: FloorPlan[]
  totalBuiltupArea: number
  estimatedCost: {
    basic: number
    standard: number
    premium: number
  }
  recommendations: string[]
}

export default function HomePlannerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [planResult, setPlanResult] = useState<PlanResult | null>(null)
  
  const [formData, setFormData] = useState({
    plot_length: '',
    plot_width: '',
    num_floors: '1',
    num_bedrooms: '',
    num_bathrooms: '',
    kitchen_type: 'MODULAR',
    architectural_style: 'MODERN',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const calculateFloorPlan = (): PlanResult => {
    const plotLength = Number(formData.plot_length)
    const plotWidth = Number(formData.plot_width)
    const numFloors = Number(formData.num_floors)
    const numBedrooms = Number(formData.num_bedrooms)
    const numBathrooms = Number(formData.num_bathrooms)
    
    // Calculate plot area
    const plotArea = plotLength * plotWidth
    
    // Generate floor plans
    const floorPlans: FloorPlan[] = []
    let totalBuiltupArea = 0
    
    for (let floor = 1; floor <= numFloors; floor++) {
      const rooms: RoomPlan[] = []
      let floorArea = 0
      
      if (floor === 1) {
        // Ground floor - living spaces
        const livingRoom = { name: 'Living Room', dimension: '20x15', area: 300 }
        const diningRoom = { name: 'Dining Room', dimension: '12x12', area: 144 }
        const kitchen = { name: 'Kitchen', dimension: '12x10', area: 120 }
        
        rooms.push(livingRoom, diningRoom, kitchen)
        floorArea = livingRoom.area + diningRoom.area + kitchen.area
        
        // Add bedrooms/bathrooms on ground floor if single floor
        if (numFloors === 1) {
          for (let i = 1; i <= numBedrooms; i++) {
            const bedroom = { name: `Bedroom ${i}`, dimension: '12x11', area: 132 }
            rooms.push(bedroom)
            floorArea += bedroom.area
          }
          for (let i = 1; i <= numBathrooms; i++) {
            const bathroom = { name: `Bathroom ${i}`, dimension: '8x6', area: 48 }
            rooms.push(bathroom)
            floorArea += bathroom.area
          }
        }
      } else {
        // Upper floors - bedrooms and bathrooms
        const bedroomsThisFloor = Math.ceil(numBedrooms / (numFloors - 1))
        const bathroomsThisFloor = Math.ceil(numBathrooms / (numFloors - 1))
        
        for (let i = 1; i <= bedroomsThisFloor; i++) {
          const bedroom = { name: `Bedroom ${i}`, dimension: '12x11', area: 132 }
          rooms.push(bedroom)
          floorArea += bedroom.area
        }
        
        for (let i = 1; i <= bathroomsThisFloor; i++) {
          const bathroom = { name: `Bathroom ${i}`, dimension: '8x6', area: 48 }
          rooms.push(bathroom)
          floorArea += bathroom.area
        }
        
        // Add hallway
        rooms.push({ name: 'Hallway', dimension: '20x4', area: 80 })
        floorArea += 80
      }
      
      floorPlans.push({
        floor,
        rooms,
        totalArea: floorArea
      })
      
      totalBuiltupArea += floorArea
    }
    
    // Calculate estimated costs (per sq ft rates)
    const basicRate = 1200 // ₹1200 per sq ft
    const standardRate = 1800 // ₹1800 per sq ft
    const premiumRate = 2500 // ₹2500 per sq ft
    
    const estimatedCost = {
      basic: totalBuiltupArea * basicRate,
      standard: totalBuiltupArea * standardRate,
      premium: totalBuiltupArea * premiumRate
    }
    
    // Generate recommendations
    const recommendations = [
      `Total plot area: ${plotArea.toLocaleString()} sq ft`,
      `Built-up area: ${totalBuiltupArea.toLocaleString()} sq ft`,
      `FAR utilized: ${((totalBuiltupArea / plotArea) * 100).toFixed(1)}%`,
      formData.architectural_style === 'MODERN' ? 'Consider large windows for natural light' : 'Traditional designs work well with courtyards',
      formData.kitchen_type === 'OPEN' ? 'Open kitchen enhances space perception' : 'Modular kitchen provides better storage',
      `Recommended setback: ${(plotLength * 0.15).toFixed(1)} ft from road`,
      'Include 20% extra in budget for unforeseen expenses'
    ]
    
    return {
      floorPlans,
      totalBuiltupArea,
      estimatedCost,
      recommendations
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPlanResult(null)

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = calculateFloorPlan()
      setPlanResult(result)
      
      toast.success('Home plan generated successfully!')
    } catch (error: any) {
      console.error('Plan generation failed:', error)
      toast.error('Failed to generate plan. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Home Planner</h1>
        <p className="text-slate-400">Generate floor plans and cost estimates for your dream home</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Home className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">House Specifications</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Plot Length (ft)
                </label>
                <input
                  type="number"
                  name="plot_length"
                  value={formData.plot_length}
                  onChange={handleChange}
                  placeholder="50"
                  className="input"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Plot Width (ft)
                </label>
                <input
                  type="number"
                  name="plot_width"
                  value={formData.plot_width}
                  onChange={handleChange}
                  placeholder="40"
                  className="input"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Floors
              </label>
              <select
                name="num_floors"
                value={formData.num_floors}
                onChange={handleChange}
                className="input"
              >
                <option value="1">1 Floor</option>
                <option value="2">2 Floors</option>
                <option value="3">3 Floors</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="num_bedrooms"
                  value={formData.num_bedrooms}
                  onChange={handleChange}
                  placeholder="3"
                  className="input"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="num_bathrooms"
                  value={formData.num_bathrooms}
                  onChange={handleChange}
                  placeholder="2"
                  className="input"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kitchen Type
              </label>
              <select
                name="kitchen_type"
                value={formData.kitchen_type}
                onChange={handleChange}
                className="input"
              >
                <option value="MODULAR">Modular</option>
                <option value="TRADITIONAL">Traditional</option>
                <option value="OPEN">Open Kitchen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Architectural Style
              </label>
              <select
                name="architectural_style"
                value={formData.architectural_style}
                onChange={handleChange}
                className="input"
              >
                <option value="MODERN">Modern</option>
                <option value="TRADITIONAL">Traditional</option>
                <option value="CONTEMPORARY">Contemporary</option>
                <option value="MINIMALIST">Minimalist</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Generate Floor Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="card">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">Floor Plan & Estimate</h2>
          </div>

          {!planResult ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Fill in the specifications and click Generate to see your floor plan and cost estimate
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cost Estimates */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Estimated Costs</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Basic Quality:</span>
                    <span className="text-white font-semibold">
                      ₹{planResult.estimatedCost.basic.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Standard Quality:</span>
                    <span className="text-white font-semibold">
                      ₹{planResult.estimatedCost.standard.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Premium Quality:</span>
                    <span className="text-white font-semibold">
                      ₹{planResult.estimatedCost.premium.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-600 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Built-up Area:</span>
                      <span className="text-green-400 font-semibold">
                        {planResult.totalBuiltupArea.toLocaleString()} sq ft
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floor Plans */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Floor Layout</h3>
                <div className="space-y-4">
                  {planResult.floorPlans.map((floor) => (
                    <div key={floor.floor} className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">
                        {floor.floor === 1 ? 'Ground Floor' : `Floor ${floor.floor}`}
                      </h4>
                      <div className="space-y-2">
                        {floor.rooms.map((room, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">{room.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">{room.dimension} ft</span>
                              <span className="text-white font-medium">{room.area} sq ft</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-600 mt-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-slate-200">Floor Total:</span>
                            <span className="text-green-400">{floor.totalArea} sq ft</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {planResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
