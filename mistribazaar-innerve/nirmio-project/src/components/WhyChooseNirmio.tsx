import { Shield, UserCheck, Link2, DollarSign, Award } from 'lucide-react'

const WhyChooseNirmio = () => {
  const features = [
    {
      icon: Shield,
      title: 'Escrow-Protected Payments',
      description: 'Your money is safe. Payments are held securely and released only when you approve the completed work.'
    },
    {
      icon: UserCheck,
      title: 'Verified Professionals',
      description: 'Every worker and supplier undergoes thorough background checks and verification before joining our platform.'
    },
    {
      icon: Link2,
      title: 'No Middlemen, Direct Connection',
      description: 'Connect directly with service providers and suppliers. No intermediaries, no unnecessary markups.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Get multiple competitive quotes. Compare prices, read reviews, and make informed decisions with complete transparency.'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'Certified professionals, genuine materials with warranties, and a support team ready to help you throughout your project.'
    }
  ]

  return (
    <section className="py-20 px-4 relative">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Radial Gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(
            circle at center, 
            rgba(120, 66, 18, 0.4) 0%, 
            #1a120b 85%
          )`
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-amber-100 mb-4">
            Why Choose <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Nirmio</span>
          </h2>
          <p className="text-amber-100/70 text-lg max-w-2xl mx-auto">
            Building trust through technology, transparency, and quality service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/35 hover:bg-[#2d1a0a]/50 transition-all duration-500 group"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 group-hover:border-amber-500/30 transition-all duration-500">
                    <Icon className="w-7 h-7 text-amber-400 group-hover:text-amber-300 transition-colors duration-500" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-amber-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-amber-100/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseNirmio
