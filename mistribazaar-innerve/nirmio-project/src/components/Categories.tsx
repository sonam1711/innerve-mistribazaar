import { Users, Package, Palette, Home } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Categories = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)

  const categories = [
    {
      icon: Users,
      title: 'Workers & Professionals',
      description: 'Find trusted local workers like painters, car painters, electricians, plumbers, and household helpers.',
    },
    {
      icon: Package,
      title: 'Construction Material',
      description: 'Buy quality local materials like tiles, flooring, paints, PVC pipes, electric wires, and fittings.',
    },
    {
      icon: Palette,
      title: 'Design & Planning',
      description: 'Connect with POP designers, interior designers, and architectural experts from your city.',
    },
    {
      icon: Home,
      title: 'Buy & Sell Property',
      description: 'Buy, sell, or list properties locally without middlemen.',
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
      {/* Lighter Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4d3a2a]/40 via-[#5d4a3a]/50 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl lg:text-5xl font-black text-amber-100 mb-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            What are you looking for?
          </h2>
          <p className={`text-xl lg:text-2xl text-amber-100/70 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            📍 Available Near You
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div
                key={category.title}
                className={`group relative bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 py-10 transition-all duration-700 ease-in-out hover:bg-[#2d1a0a]/50 hover:border-amber-500/35 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] cursor-pointer active:scale-[0.98] h-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                {/* Subtle Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-orange-600/5 rounded-2xl transition-all duration-500 -z-10" />
                
                {/* Content Container */}
                <div className="flex items-center justify-between gap-4 h-full">
                  {/* Left Side - Text Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text mb-3">
                      {category.title}
                    </h3>
                    <p className="text-amber-100/60 group-hover:text-amber-100/70 transition-colors duration-500 text-base">
                      {category.description}
                    </p>
                  </div>

                  {/* Right Side - Icon */}
                  <div className="flex-shrink-0 inline-flex p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:bg-amber-500/15 group-hover:border-amber-500/30 transition-all duration-500">
                    <Icon className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition-colors duration-500" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Categories
