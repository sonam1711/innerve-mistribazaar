import { Check } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const GrowYourBusiness = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)
  const benefits = [
    'Reach more customers across your city by making your business visible online, helping nearby users easily find and choose your services without relying only on walk-ins.',
    'Enable online booking and order placement so customers can place requests anytime, while you receive all orders digitally without the need to attend every customer in person at the shop.',
    'Sell faster by reducing waiting time, managing orders efficiently, and handling multiple requests smoothly, leading to better productivity and higher overall sales.'
  ]

  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
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
        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - Registration Info */}
          <div>
            <h2 className={`text-4xl lg:text-5xl font-black text-amber-100 mt-8 mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              Dhanda <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Badhana Hai?</span>
            </h2>
            
            

            {/* Benefits */}
            <div className="space-y-10">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={`flex gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-amber-100/70 text-xl leading-loose">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            {/* Registration Button */}
            <div className="pt-16 border-t border-amber-500/20 mt-8">
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Register as Supplier
              </button>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-amber-100 mb-6">
              Send us a message
            </h3>

            <form className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="business" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Business Name
                </label>
                <input
                  type="text"
                  id="business"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Business name"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Business Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Business address"
                />
              </div>

              {/* Products */}
              <div>
                <label htmlFor="products" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Products
                </label>
                <input
                  type="text"
                  id="products"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Products you offer"
                />
              </div>

              {/* Contact */}
              <div>
                <label htmlFor="contact" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="Your contact number"
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GrowYourBusiness
