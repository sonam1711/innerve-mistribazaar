import { useState, useEffect } from 'react'
import { Wrench, MapPin } from 'lucide-react'

const Hero = () => {
  const services = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'White Washer']
  const [currentService, setCurrentService] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0)
      setTimeout(() => {
        setCurrentService((prev) => (prev + 1) % services.length)
        setOpacity(1)
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Trigger fade-in animation for images
    setTimeout(() => {
      setImagesLoaded(true)
    }, 100)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-24">
      <div className="max-w-7xl w-full mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <span className="text-amber-100">Find a perfect </span>
                <span 
                  className="text-transparent bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text transition-all duration-500"
                  style={{ opacity }}
                >
                  {services[currentService]}
                </span>
                <br />
                <span className="text-amber-100">for your </span>
                <span className="text-transparent bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text">Home</span>
                <span className="text-amber-100"> and </span>
                <span className="text-transparent bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text">Projects</span>
                <span className="text-amber-100">.</span>
              </h1>
              <p className="text-amber-100/70 text-lg">Get service from your locality for your perfect house.</p>
            </div>

            {/* Search Inputs */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g., Plumber, Electrician, Carpenter"
                  className="w-full pl-14 pr-4 py-4 bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl text-amber-100 placeholder:text-amber-100/40 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter Location (City/Pincode)"
                  className="w-full pl-14 pr-4 py-4 bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl text-amber-100 placeholder:text-amber-100/40 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button className="flex-1 px-8 py-4 bg-amber-500 text-[#1a120b] rounded-full font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.5)] shadow-[0_6px_20px_0_rgba(245,158,11,0.4)]">
                  Search
                </button>
                <button className="flex-1 px-8 py-4 border-2 border-amber-500/40 text-amber-200 rounded-full font-bold text-lg transition-all hover:bg-amber-500/10 hover:border-amber-500/60">
                  Post a Project
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[550px]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl blur-3xl -z-10"></div>

              <div className="relative grid grid-cols-2 gap-4 p-4 bg-[#2d1a0a]/40 backdrop-blur-sm border border-amber-500/20 rounded-3xl">
                <div className={`fade-in ${imagesLoaded ? 'loaded' : ''} overflow-hidden rounded-2xl border border-amber-500/30`}>
                  <img 
                    src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=500" 
                    alt="Plumber" 
                    loading="lazy"
                    className="w-full aspect-square object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div 
                  className={`fade-in ${imagesLoaded ? 'loaded' : ''} overflow-hidden rounded-2xl border border-amber-500/30`}
                  style={{ transitionDelay: '150ms' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=500" 
                    alt="Electrician" 
                    loading="lazy"
                    className="w-full aspect-square object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div 
                  className={`fade-in ${imagesLoaded ? 'loaded' : ''} overflow-hidden rounded-2xl border border-amber-500/30`}
                  style={{ transitionDelay: '300ms' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=500" 
                    alt="Carpenter" 
                    loading="lazy"
                    className="w-full aspect-square object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div 
                  className={`fade-in ${imagesLoaded ? 'loaded' : ''} overflow-hidden rounded-2xl border border-amber-500/30`}
                  style={{ transitionDelay: '450ms' }}
                >
                  <img 
                    src="/worker1.png" 
                    alt="Painter" 
                    loading="lazy"
                    className="w-full aspect-square object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Hero
