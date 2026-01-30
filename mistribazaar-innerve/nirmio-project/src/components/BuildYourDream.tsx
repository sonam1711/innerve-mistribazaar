import { Check } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const BuildYourDream = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)
  const features = [
    {
      title: 'Verified Workers & Contractors',
      description: 'Every worker undergoes thorough background checks and verification. Build trust with certified professionals.'
    },
    {
      title: 'Certified Dealers & Suppliers',
      description: 'Access to registered and licensed dealers offering genuine materials with quality guarantees and warranty support.'
    },
    {
      title: 'Expert Professionals',
      description: 'Architects, engineers, and designers with proven experience and certifications for your projects.'
    },
    {
      title: 'Direct & Fair Pricing',
      description: 'No middlemen, no hidden charges. Connect directly and get honest quotes and fair rates.'
    }
  ]

  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
      {/* Lighter Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4d3a2a]/40 via-[#5d4a3a]/50 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className={`text-4xl lg:text-5xl font-black text-amber-100 mb-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Build Your <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Sapno Ka Ghar</span>
        </h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex gap-4 group transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                {/* Check Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors duration-300">
                    <Check className="w-4 h-4 text-amber-500" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-amber-100/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Start Building Button */}
            <div className="pt-6">
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start Building Now
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className={`relative -mt-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
                alt="Family watching their dream house"
                loading="lazy"
                className="w-full h-[700px] object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b]/60 via-transparent to-transparent" />
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BuildYourDream
