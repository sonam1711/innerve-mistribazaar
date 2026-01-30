const OurMission = () => {
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
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-amber-100 mb-8">
            Our <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Mission</span>
          </h2>
          <div className="space-y-6 text-amber-100/80 text-lg lg:text-xl leading-relaxed">
            <p>
              To empower local businesses, skilled professionals, and communities by creating a seamless digital platform that connects service providers with customers, fostering trust, transparency, and growth in the construction and service industry.
            </p>
            <p>
              We're building a comprehensive marketplace where homeowners can discover verified workers, quality materials, and expert professionals—all in one place. Our platform eliminates middlemen, ensures fair pricing, and provides secure escrow payments to protect both customers and service providers.
            </p>
            <p>
              From skilled laborers and house help to material suppliers and design professionals, Nirmio creates opportunities for everyone in the construction ecosystem. We enable businesses to reach more customers across cities through online visibility, while helping households build their dream homes with confidence and complete transparency.
            </p>
            <p className="text-amber-100/90 font-semibold">
              Together, we're transforming how India builds—one connection, one project, one dream home at a time.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Join as Business
            </button>
            <button className="bg-transparent border-2 border-amber-500/60 hover:border-amber-500 text-amber-100 font-bold px-10 py-4 rounded-full hover:bg-amber-500/10 transition-all duration-300 hover:scale-105">
              Join as Individual
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurMission
