import { useState } from "react";

const CITIES = [
  { id: "nyc", name: "New York", x: 250, y: 180, contributors: "1,250", projects: "340" },
  { id: "lon", name: "London", x: 480, y: 140, contributors: "940", projects: "210" },
  { id: "ber", name: "Berlin", x: 520, y: 135, contributors: "720", projects: "180" },
  { id: "blr", name: "Bangalore", x: 690, y: 260, contributors: "2,100", projects: "550" },
  { id: "tok", name: "Tokyo", x: 830, y: 170, contributors: "850", projects: "190" },
  { id: "syd", name: "Sydney", x: 880, y: 380, contributors: "540", projects: "120" },
];

const CONNECTIONS = [
  { from: "nyc", to: "lon" },
  { from: "lon", to: "ber" },
  { from: "ber", to: "blr" },
  { from: "blr", to: "tok" },
  { from: "tok", to: "syd" },
  { from: "nyc", to: "tok" },
  { from: "blr", to: "syd" },
];

export default function CollaborationMap() {
  const [hoveredCity, setHoveredCity] = useState(null);

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(2.2);
            opacity: 0.8;
          }
        }
        .flow-line {
          stroke-dasharray: 6, 4;
          animation: dash 1.5s linear infinite;
        }
        .glow-pulse {
          transform-origin: center;
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block with fixed responsive spacing */}
        <div className="text-center space-y-6 mb-12">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-indigo-400 font-bold bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Global Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-linear-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Collaboration Hubs
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400">
            Connecting developers and event organizers across mock world hubs. Hover over any node to view real-time contributor statistics.
          </p>
        </div>

        {/* Glassmorphic Map Container */}
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 dark:border-slate-800/50 shadow-2xl rounded-3xl p-6 md:p-8 overflow-hidden">
          
          {/* Legend/Status */}
          <div className="absolute top-6 left-6 z-10 hidden sm:flex items-center gap-4 bg-slate-950/60 backdrop-blur border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Active Nodes</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-indigo-400" />
              <span>Network Flow</span>
            </div>
          </div>

          <svg viewBox="0 0 1000 500" className="w-full h-auto select-none">
            {/* World Stylized Silhouette / Grid (Dotted map styling) */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#334155" opacity="0.35" />
              </pattern>
              <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Dotted Grid Overlay */}
            <rect width="1000" height="500" fill="url(#grid)" />

            {/* Dotted Outline representing Simplified Continent Clusters */}
            {/* North America */}
            <ellipse cx="230" cy="180" rx="140" ry="70" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
            {/* South America */}
            <ellipse cx="340" cy="350" rx="70" ry="110" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.15" />
            {/* Eurasia */}
            <ellipse cx="600" cy="160" rx="220" ry="100" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
            {/* Africa */}
            <ellipse cx="530" cy="290" rx="95" ry="105" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.15" />
            {/* Australia */}
            <ellipse cx="850" cy="360" rx="90" ry="70" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />

            {/* Connections */}
            {CONNECTIONS.map((conn, idx) => {
              const fromCity = CITIES.find((c) => c.id === conn.from);
              const toCity = CITIES.find((c) => c.id === conn.to);
              if (!fromCity || !toCity) return null;

              // Draw beautiful curved lines (quadratic bezier curve)
              const dx = toCity.x - fromCity.x;
              const dy = toCity.y - fromCity.y;
              // Control point curved upwards/sideways
              const cx = (fromCity.x + toCity.x) / 2 - dy * 0.15;
              const cy = (fromCity.y + toCity.y) / 2 - dx * 0.15;

              return (
                <g key={`conn-${idx}`}>
                  {/* Background static curve */}
                  <path
                    d={`M ${fromCity.x} ${fromCity.y} Q ${cx} ${cy} ${toCity.x} ${toCity.y}`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  {/* Animated flow line */}
                  <path
                    d={`M ${fromCity.x} ${fromCity.y} Q ${cx} ${cy} ${toCity.x} ${toCity.y}`}
                    fill="none"
                    stroke="url(#line-grad)"
                    strokeWidth="1.5"
                    className="flow-line"
                    opacity="0.85"
                  />
                </g>
              );
            })}

            {/* Cities/Nodes */}
            {CITIES.map((city) => {
              const isHovered = hoveredCity?.id === city.id;

              return (
                <g
                  key={city.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  {/* Outer pulsating ring */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="12"
                    fill="#6366f1"
                    className="glow-pulse"
                    opacity="0.4"
                  />

                  {/* Inner interactive circle */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isHovered ? "7" : "5"}
                    fill={isHovered ? "#ec4899" : "#6366f1"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </svg>

          {/* Absolute Hover Tooltip */}
          {hoveredCity && (
            <div
              className="absolute bg-slate-950/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-xl text-left min-w-50 transition-all duration-300 pointer-events-none z-30"
              style={{
                left: `${(hoveredCity.x / 1000) * 100}%`,
                top: `${(hoveredCity.y / 500) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-bold text-slate-100 text-sm">{hoveredCity.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Contributors:</span>
                  <span className="font-mono font-bold text-indigo-400">{hoveredCity.contributors}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Projects:</span>
                  <span className="font-mono font-bold text-indigo-400">{hoveredCity.projects}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}