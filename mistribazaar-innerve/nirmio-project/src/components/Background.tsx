const Background = () => {
  return (
    <>
      {/* The Grid Overlay */}
      <div 
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* The Radial Mask */}
      <div 
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{
          background: `radial-gradient(
            circle at center, 
            var(--glow-center) 0%, 
            var(--bg-dark) 85%
          )`
        }}
      />
    </>
  )
}

export default Background
