export function ChemistryIcon() {
  return (
    <div className="relative">
      {/* Main beaker */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Left beaker */}
        <path d="M15 25 L15 45 Q15 50 20 50 L30 50 Q35 50 35 45 L35 25 Z" fill="#22d3ee" className="animate-pulse" />
        <rect x="15" y="20" width="20" height="5" rx="2" fill="#0891b2" />

        {/* Middle test tube */}
        <path
          d="M40 15 L40 55 Q40 60 45 60 L50 60 Q55 60 55 55 L55 15 Z"
          fill="#3b82f6"
          className="animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <rect x="40" y="10" width="15" height="5" rx="2" fill="#1d4ed8" />

        {/* Right beaker */}
        <path
          d="M60 30 L60 50 Q60 55 65 55 L70 55 Q75 55 75 50 L75 30 Z"
          fill="#10b981"
          className="animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <rect x="60" y="25" width="15" height="5" rx="2" fill="#059669" />

        {/* Bubbles */}
        <circle cx="25" cy="35" r="2" fill="#ffffff" opacity="0.7" className="animate-bounce" />
        <circle
          cx="47"
          cy="25"
          r="1.5"
          fill="#ffffff"
          opacity="0.7"
          className="animate-bounce"
          style={{ animationDelay: "0.3s" }}
        />
        <circle
          cx="67"
          cy="40"
          r="1"
          fill="#ffffff"
          opacity="0.7"
          className="animate-bounce"
          style={{ animationDelay: "0.7s" }}
        />
      </svg>
    </div>
  )
}
