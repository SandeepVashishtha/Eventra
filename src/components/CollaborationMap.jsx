import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

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

const getTooltipTransform = (city) => {
  if (!city) return "translate(-50%, -90%)";

  if (city.x < 350) return "translate(-10%, 10%)";
  if (city.y < 180) return "translate(-50%, 10%)";
  if (city.x > 800) return "translate(-100%, -120%)";

  return "translate(-50%, -90%)";
};

export default function CollaborationMap() {
  const [hoveredCity, setHoveredCity] = useState(null);
  const mapRef = useRef(null);
  const { isDarkMode } = useTheme();

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
    <section className="py-20 bg-bg text-text transition-colors duration-300 relative overflow-hidden">
      <style>{`
        @keyframes eventra-map-dash {
          to { stroke-dashoffset: -30; }
        }
        @keyframes eventra-map-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0.7; }
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
        {/* Header Block */}
        <div className="text-center space-y-4 mb-12">
          <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
            Global Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Collaboration Hubs
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-text-light/90">
            Connecting developers and event organizers across mock world hubs. Hover over any node to view real-time contributor statistics.
          </p>
        </div>

        {/* Glassmorphic Map Container */}
        <div ref={mapRef} className="relative bg-card-bg border border-border shadow-premium-lg rounded-3xl p-6 md:p-8 overflow-visible transition-colors duration-300">
          
          {/* Legend/Status */}
          <div className="absolute top-6 left-6 z-10 hidden sm:flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur border border-border rounded-2xl px-4 py-2 text-xs text-text-light transition-colors duration-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Active Nodes</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-4 h-0.5 border-t border-dashed border-primary" />
              <span>Network Flow</span>
            </div>
          </div>

          <div className="relative w-full aspect-[2/1]">
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full select-none" aria-label="Global collaboration map" role="img">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="currentColor" className="text-text-light/20 dark:text-text-light/10" />
                </pattern>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--secondary-color, var(--primary-hover))" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Dotted Grid Overlay */}
              <rect width="1000" height="500" fill="url(#grid)" />

              {/* Simplified Continent Outlines */}
              <ellipse cx="230" cy="180" rx="140" ry="70" fill="none" stroke="currentColor" className="text-text-light/10" strokeWidth="1" strokeDasharray="4,4" />
              <ellipse cx="340" cy="350" rx="70" ry="110" fill="none" stroke="currentColor" className="text-text-light/10" strokeWidth="1" strokeDasharray="4,4" />
              <ellipse cx="600" cy="160" rx="220" ry="100" fill="none" stroke="currentColor" className="text-text-light/10" strokeWidth="1" strokeDasharray="4,4" />
              <ellipse cx="530" cy="290" rx="95" ry="105" fill="none" stroke="currentColor" className="text-text-light/10" strokeWidth="1" strokeDasharray="4,4" />
              <ellipse cx="850" cy="360" rx="90" ry="70" fill="none" stroke="currentColor" className="text-text-light/10" strokeWidth="1" strokeDasharray="4,4" />

              {/* Connections */}
              {CONNECTIONS.map((conn, idx) => {
                const fromCity = CITIES.find((c) => c.id === conn.from);
                const toCity = CITIES.find((c) => c.id === conn.to);
                if (!fromCity || !toCity) return null;

                const dx = toCity.x - fromCity.x;
                const dy = toCity.y - fromCity.y;
                const cx = (fromCity.x + toCity.x) / 2 - dy * 0.15;
                const cy = (fromCity.y + toCity.y) / 2 - dx * 0.15;

                return (
                  <g key={`conn-${idx}`}>
                    <path
                      d={`M ${fromCity.x} ${fromCity.y} Q ${cx} ${cy} ${toCity.x} ${toCity.y}`}
                      fill="none"
                      className="stroke-slate-200 dark:stroke-slate-800/80 transition-colors duration-300"
                      strokeWidth="1.5"
                    />
                    <path
                      d={`M ${fromCity.x} ${fromCity.y} Q ${cx} ${cy} ${toCity.x} ${toCity.y}`}
                      fill="none"
                      stroke="url(#line-grad)"
                      strokeWidth="1.5"
                      className="flow-line"
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
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="11"
                      fill="var(--primary-color)"
                      className="glow-pulse"
                    />
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={isHovered ? "6.5" : "4.5"}
                      fill={isHovered ? "var(--secondary-color, var(--primary-hover))" : "var(--primary-color)"}
                      stroke="var(--card-bg-color)"
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>

            {hoveredCity && (
              <div
                className="absolute z-30 pointer-events-none bg-card-bg border border-border shadow-premium-lg transition-colors duration-300"
                style={{
                  left: `${(hoveredCity.x / 1000) * 100}%`,
                  top: `${(hoveredCity.y / 500) * 100}%`,
                  transform: getTooltipTransform(hoveredCity),
                  minWidth: "210px",
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                <div className="bg-primary/10 border-b border-border" style={{ padding: "10px 14px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="font-bold text-text text-[13px]">{hoveredCity.name}</span>
                    <span className="bg-primary/20 text-primary text-[9px] font-bold rounded-md px-2 py-0.5">{hoveredCity.region}</span>
                  </div>
                  <div className="text-text-light/70 text-[9px] mt-0.5">📍 {hoveredCity.x}° N · {hoveredCity.y}° E</div>
                </div>
                <div style={{ padding: "10px 14px 12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-color-light)", opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Hub Stats</div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <div className="border border-border bg-slate-50/50 dark:bg-slate-950/20" style={{ flex: 1, borderRadius: "8px", padding: "5px 8px" }}>
                      <div style={{ fontSize: "9px", color: "var(--text-color-light)", opacity: 0.6, fontWeight: 700, textTransform: "uppercase" }}>Developers</div>
                      <div className="text-text" style={{ fontSize: "15px", fontWeight: 800 }}>{hoveredCity.contributors}</div>
                    </div>
                    <div className="border border-border bg-slate-50/50 dark:bg-slate-950/20" style={{ flex: 1, borderRadius: "8px", padding: "5px 8px" }}>
                      <div style={{ fontSize: "9px", color: "var(--text-color-light)", opacity: 0.6, fontWeight: 700, textTransform: "uppercase" }}>Projects</div>
                      <div className="text-text" style={{ fontSize: "15px", fontWeight: 800 }}>{hoveredCity.projects}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-color-light)", opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>Focus Areas</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
                    {["EdTech", "AgriTech", "HealthTech"].map((tag) => (
                      <span key={tag} className="bg-slate-50 dark:bg-slate-800 border border-border text-text-light text-[10px] font-semibold rounded-lg px-2.5 py-0.5">{tag}</span>
                    ))}
                  </div>
                  <div className="border-t border-border" style={{ paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: "var(--text-color-light)", opacity: 0.7 }}>🌏 {hoveredCity.region} region</span>
                    <span className="text-primary text-[10px] font-bold">View details →</span>
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
