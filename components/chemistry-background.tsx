export function ChemistryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />

      {/* Floating molecules */}
      <div
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-lab-primary/10 floating-animation"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-40 right-20 w-12 h-12 rounded-full bg-lab-secondary/10 floating-animation"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-40 left-20 w-20 h-20 rounded-full bg-lab-accent/10 floating-animation"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-20 right-10 w-14 h-14 rounded-full bg-lab-primary/10 floating-animation"
        style={{ animationDelay: "1s" }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--lab-primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  )
}
