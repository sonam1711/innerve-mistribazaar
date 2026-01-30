import { useScrollAnimation } from '../hooks/useScrollAnimation'

const ProfessionalRegistration = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)
  const categories = [
    {
      title: 'Register as Labour',
      description: 'Join our platform to find construction and labor work opportunities',
    },
    {
      title: 'Register as House Help',
      description: 'Connect with families looking for trusted household assistance',
    },
    {
      title: 'Register as Professional',
      description: 'Plumber, Electrician, Carpenter, and other skilled professionals',
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
      {/* Lighter Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4d3a2a]/40 via-[#5d4a3a]/50 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-12 text-center">
          <h2 className={`text-4xl lg:text-5xl font-black text-amber-100 mb-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Are you a <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Professional?</span>
          </h2>
        </div>

        {/* Category Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`group bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 py-16 hover:bg-[#2d1a0a]/50 hover:border-amber-500/35 transition-all duration-500 hover:shadow-[0_8px_20px_rgba(245,158,11,0.1)] cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text mb-3">
                {category.title}
              </h3>
              <p className="text-amber-100/70 mb-6 leading-relaxed">
                {category.description}
              </p>
              <div className="inline-flex items-center text-amber-400/60 group-hover:text-amber-400/80 transition-colors duration-100 hover:translate-x-1.5 transition-transform duration-100">
                <span className="text-sm font-semibold mr-1">Register Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProfessionalRegistration
