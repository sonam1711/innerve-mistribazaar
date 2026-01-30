import { MapPin, TrendingUp, Sparkles } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const ServiceAreas = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)

  return (
    <section ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      {/* Lighter Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4d3a2a]/40 via-[#5d4a3a]/50 to-transparent -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <MapPin className="w-12 h-12 text-amber-400" />
            <h2 className="text-4xl lg:text-6xl font-black text-amber-100">
              Service <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Areas</span>
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Launching in Jaipur */}
          <div className={`mb-16 text-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 rounded-full px-8 py-4 mb-6">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-2xl lg:text-3xl font-black text-transparent bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text">
                Launching in Jaipur
              </span>
            </div>
            <p className="text-amber-100/80 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              We're starting our journey in the <span className="text-amber-300 font-semibold">Pink City</span>, connecting all construction services, skilled professionals, and material suppliers with customers across Jaipur.
            </p>
            
            {/* Features List */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className={`flex items-center gap-2 text-amber-100/70 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-lg">All Major Localities</span>
              </div>
              <div className={`flex items-center gap-2 text-amber-100/70 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-lg">Verified Professionals</span>
              </div>
              <div className={`flex items-center gap-2 text-amber-100/70 transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-lg">Quality Suppliers</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`relative mb-16 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/20"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-[#1a120b] px-6">
                <TrendingUp className="w-8 h-8 text-amber-400/60" />
              </div>
            </div>
          </div>

          {/* Expanding Across India */}
          <div className={`text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-3xl lg:text-4xl font-black text-amber-100 mb-6">
              Expanding Across <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">India</span>
            </h3>
            <p className="text-amber-100/70 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Our vision is to connect every city and town in India, making quality construction services accessible to everyone, everywhere.
            </p>
            
            {/* Coming Soon Items */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className={`px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-100/60 text-sm transition-all duration-500 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Metro Cities - Coming Soon
              </span>
              <span className={`px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-100/60 text-sm transition-all duration-500 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Tier 2 & 3 Cities
              </span>
              <span className={`px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-100/60 text-sm transition-all duration-500 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Pan-India Network
              </span>
            </div>

            {/* CTA */}
            <div className={`inline-block transition-all duration-700 delay-[1100ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-amber-100/70 text-lg mb-3">
                Want Nirmio in your city?
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xl group transition-all duration-300">
                <span className="group-hover:translate-x-1 transition-transform duration-100">Let us know</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceAreas
