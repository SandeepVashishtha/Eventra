import { useState, useEffect, useRef } from "react";

const CITIES = [
  { id: "nyc", name: "New York", x: 250, y: 180, contributors: "1,250", projects: "340", region: "Americas" },
  { id: "lon", name: "London", x: 480, y: 140, contributors: "940", projects: "210", region: "Europe" },
  { id: "ber", name: "Berlin", x: 520, y: 135, contributors: "720", projects: "180", region: "Europe" },
  { id: "blr", name: "Bangalore", x: 690, y: 260, contributors: "2,100", projects: "550", region: "Asia" },
  { id: "tok", name: "Tokyo", x: 830, y: 170, contributors: "850", projects: "190", region: "Asia" },
  { id: "syd", name: "Sydney", x: 880, y: 380, contributors: "540", projects: "120", region: "Oceania" },
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
  const mapRef = useRef(null);

  // 🔥 FIX: Added click-outside listener to support mobile touch dismissals
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (mapRef.current && !e.target.closest('.city-node')) {
        setHoveredCity(null);
      }
    };
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <section className="py-20 dark:bg-slate-950 dark:text-white bg-white text-slate-900 relative overflow-hidden">
      <style>{`
        /* 🔥 FIX: Namespace prefixed to prevent global CSS pollution */
        @keyframes eventra-map-dash {
          to { stroke-dashoffset: -30; }
        }
        @keyframes eventra-map-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0.8; }
        }
        .flow-line {
          stroke-dasharray: 6, 4;
          animation: eventra-map-dash 1.5s linear infinite;
        }
        .glow-pulse {
          transform-origin: center;
          animation: eventra-map-pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block with fixed responsive spacing */}
        <div className="text-center space-y-6 mb-12">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-indigo-400 font-bold bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Global Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-500 dark:bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text">
            Collaboration Hubs
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400">
            Connecting developers and event organizers across mock world hubs. Hover over any node to view real-time contributor statistics.
          </p>
        </div>

        {/* Glassmorphic Map Container */}
        <div ref={mapRef} className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 dark:border-slate-800/50 shadow-2xl rounded-3xl p-6 md:p-8 overflow-hidden">
          
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

          {/* 🔥 FIX: Wrapped SVG and Tooltip in a strictly proportional inner div. 
              This ensures padding from the parent doesn't corrupt the percentage coordinates. */}
          <div className="relative w-full aspect-[2/1]">
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full select-none" aria-label="Global collaboration map map" role="img">
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
              <ellipse cx="230" cy="180" rx="140" ry="70" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
              <ellipse cx="340" cy="350" rx="70" ry="110" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.15" />
              <ellipse cx="600" cy="160" rx="220" ry="100" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
              <ellipse cx="530" cy="290" rx="95" ry="105" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.15" />
              <ellipse cx="850" cy="360" rx="90" ry="70" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />

              {/* Connections */}
              {CONNECTIONS.map((conn, idx) => {
                const fromCity = CITIES.find((c) => c.id === conn.from);
                const toCity = CITIES.find((c) => c.id === conn.to);
                if (!fromCity || !toCity) return null;

                // Draw beautiful curved lines (quadratic bezier curve)
                const dx = toCity.x - fromCity.x;
                const dy = toCity.y - fromCity.y;
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
                    // 🔥 FIX: Added keyboard/touch handlers and a11y roles
                    className="cursor-pointer city-node outline-none"
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => setHoveredCity(city)}
                    onFocus={() => setHoveredCity(city)}
                    onBlur={() => setHoveredCity(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View stats for ${city.name}`}
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

            {/* Structured Hub Card Popup */}
            {hoveredCity && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${(hoveredCity.x / 1000) * 100}%`,
                  top: `${(hoveredCity.y / 500) * 100}%`,
                  transform: "translate(-50%, -120%)",
                  minWidth: "210px",
                  borderRadius: "14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  border: "1px solid #c7d7fd",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <div style={{ background: "#2563eb", padding: "10px 14px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>{hoveredCity.name}</span>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#e0e7ff", fontSize: "9px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px" }}>{hoveredCity.region}</span>
                  </div>
                  <div style={{ color: "#bfdbfe", fontSize: "9px", marginTop: "3px" }}>📍 {hoveredCity.x}° N · {hoveredCity.y}° E</div>
                </div>
                <div style={{ padding: "10px 14px 12px", background: "#fff" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Hub Stats</div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "8px", padding: "5px 8px" }}>
                      <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Developers</div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>{hoveredCity.contributors}</div>
                    </div>
                    <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "8px", padding: "5px 8px" }}>
                      <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Projects</div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>{hoveredCity.projects}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>Focus Areas</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
                    {["EdTech", "AgriTech", "HealthTech"].map((tag, i) => {
                      const styles = [{ background: "#dbeafe", color: "#2563eb" }, { background: "#dcfce7", color: "#16a34a" }, { background: "#fef9c3", color: "#b45309" }];
                      return <span key={tag} style={{ ...styles[i], fontSize: "10px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px" }}>{tag}</span>;
                    })}
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: "#9ca3af" }}>🌏 {hoveredCity.region} region</span>
                    <span style={{ fontSize: "10px", color: "#2563eb", fontWeight: 700 }}>View details →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}







