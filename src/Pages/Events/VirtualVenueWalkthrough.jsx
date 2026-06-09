import { useState, useEffect, useRef } from "react";
import {
  Layout, MapPin, Users, Award, Coffee, Eye,
  Maximize2, Volume2, Info, ChevronRight
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion";
import VirtualBoothModal from "../../components/events/VirtualBoothModal";
import { toast } from "react-toastify";
import { safeJsonParse } from "../../utils/safeJsonParse";

// Default premium developer sponsor booths (fallback if none loaded from designer)
const DEFAULT_SPONSORS = [
  {
    id: "sp-1",
    label: "Vercel",
    isSponsorBooth: true,
    sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
    sponsorContact: "careers@vercel.com",
    sponsorDescription: "Vercel provides the developer experience and infrastructure to build, deploy, and scale frontend applications globally with ease.",
    sponsorJobs: "Senior Frontend Engineer (React), Developer Advocate, Staff Infrastructure Engineer"
  },
  {
    id: "sp-2",
    label: "Supabase",
    isSponsorBooth: true,
    sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
    sponsorContact: "hiring@supabase.io",
    sponsorDescription: "Supabase is an open source Firebase alternative. We build developer tools that make starting your database, auth, and storage a breeze.",
    sponsorJobs: "Database Engineer (Postgres), Developer Relations Lead, Backend Engineer (Go)"
  },
  {
    id: "sp-3",
    label: "GitHub",
    isSponsorBooth: true,
    sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
    sponsorContact: "outreach@github.com",
    sponsorDescription: "GitHub is the developer company. Over 100 million developers use GitHub to build, maintain, and ship software collaboratively.",
    sponsorJobs: "Security Engineer, Senior Product Designer, Technical Writer"
  },
  {
    id: "sp-4",
    label: "Google Cloud",
    isSponsorBooth: true,
    sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
    sponsorContact: "gc-hackathons@google.com",
    sponsorDescription: "Accelerate your digital transformation with secure, reliable, and scalable cloud solutions tailored by Google.",
    sponsorJobs: "Cloud Solutions Architect, Developer Advocate (AI/ML), Product Manager"
  }
];

const ROOMS = [
  {
    id: "main-stage",
    label: "Main Stage",
    description: "The main keynote hall. Drop in to watch keynote talks, live hackathon presentations, and technical panel debates.",
    icon: Volume2,
    color: "from-pink-500 to-rose-600",
    glowColor: "rgba(244, 63, 94, 0.4)",
    coordinates: { x: "15%", y: "15%", width: "25%", height: "25%", z: "30px" },
    details: {
      schedule: "10:00 AM - Keynote | 02:00 PM - Tech Panel | 05:00 PM - Final Demos",
      capacity: "500 Virtual Attendees",
      liveSpeaker: "Dr. Elena Rostova (AI Lead)"
    }
  },
  {
    id: "sponsor-exhibition",
    label: "Sponsor Exhibition Hub",
    description: "Connect with industry leaders, browse open job vacancies, and talk directly with technical representatives in real-time.",
    icon: Award,
    color: "from-indigo-500 to-purple-600",
    glowColor: "rgba(99, 102, 241, 0.4)",
    coordinates: { x: "55%", y: "15%", width: "30%", height: "30%", z: "40px" },
    details: {
      activeSponsorsCount: "4 Platinum Sponsors",
      swagAvailability: "Digital Swag Box Active",
      featuredSponsor: "Vercel & Supabase"
    }
  },
  {
    id: "networking-lounge",
    label: "Networking Lounge",
    description: "The social lounge. Engage in direct matchmaking with other engineers, designers, and project managers to build hackathon squads.",
    icon: Users,
    color: "from-emerald-400 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
    coordinates: { x: "15%", y: "55%", width: "25%", height: "30%", z: "25px" },
    details: {
      activeChats: "14 Group Circles",
      topics: "System Design, React 19, UI/UX Trends",
      matchmaking: "Speed Networking Active"
    }
  },
  {
    id: "hackathon-workshop",
    label: "Hackathon Workshop",
    description: "A collaborative sandbox room loaded with guides, API starter kits, and direct mentor Q&A channels for active build help.",
    icon: Layout,
    color: "from-amber-400 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
    coordinates: { x: "50%", y: "55%", width: "20%", height: "20%", z: "20px" },
    details: {
      activeMentors: "6 Mentors Online",
      workshopTopic: "Deploying Next.js to the Edge",
      nextQnA: "Mentor Q&A starts in 15 mins"
    }
  },
  {
    id: "food-court",
    label: "Food & Coffee Court",
    description: "A casual chat-box arena to take a break, share developer memes, play mini terminal games, or chill out with music.",
    icon: Coffee,
    color: "from-sky-400 to-blue-500",
    glowColor: "rgba(56, 189, 248, 0.4)",
    coordinates: { x: "75%", y: "60%", width: "15%", height: "20%", z: "15px" },
    details: {
      currentActivity: "Retro Trivia Game",
      currentTrack: "Lofi Beats for Coding",
      jokeOfTheDay: "Why do programmers wear glasses? Because they can't C#!"
    }
  }
];

const VirtualVenueWalkthrough = () => {
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sponsorBooths, setSponsorBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Load custom sponsor booths from local storage
  useEffect(() => {
    let baseSponsors = [...DEFAULT_SPONSORS];
    const savedLayout = localStorage.getItem("eventra_floorplan_default");
    
    // Check if the floorplan designer has overriding sponsors
    if (savedLayout) {
      try {
        const elements = safeJsonParse(savedLayout, {});
        const sponsors = elements.filter(el => el.isSponsorBooth);
        if (sponsors.length > 0) {
          baseSponsors = sponsors;
        }
      } catch (e) {
        console.error("Failed to parse floorplan", e);
      }
    }
    
    // Check if the Dedicated Sponsor Dashboard has updated the booth
    const dashboardSettings = localStorage.getItem("eventra_sponsor_settings");
    if (dashboardSettings) {
      try {
        const customSponsor = safeJsonParse(dashboardSettings, {});
        // Ensure it's in the array (replace the first sponsor for demo purposes, or push it)
        if (baseSponsors.length > 0) {
          baseSponsors[0] = customSponsor;
        } else {
          baseSponsors.push(customSponsor);
        }
      } catch (e) {
        console.error("Failed to parse sponsor dashboard settings", e);
      }
    }
    
    setSponsorBooths(baseSponsors);
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({
      x: Math.round(x * 12),
      y: Math.round(y * -12)
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleOpenBooth = (booth) => {
    setSelectedBooth(booth);
    setIsBoothModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07070c] text-white p-4 md:p-8 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Title Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Eventra 3D Virtual Venue
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Experience the isometric event layout in realtime. Move your mouse to explore the perspective floor plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-900 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-indigo-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Eye size={14} />
            <span>Interactive Oblique Map</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Side: 3D Interactive Oblique Map Workspace */}
        <div className="lg:col-span-2 flex flex-col min-h-[500px] bg-slate-950/40 border border-indigo-500/10 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-4 left-4 z-10 text-[10px] font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2.5 py-1 uppercase backdrop-blur-md">
            Viewport: Oblique 3D Plane
          </div>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
            <Info size={12} className="text-indigo-400" />
            <span>Hover to rotate, click area to explore</span>
          </div>

          {/* Interactive Tilt Area */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex-1 flex items-center justify-center relative cursor-default overflow-hidden p-6 md:p-12"
            style={{ perspective: "1500px" }}
          >
            {/* Oblique Grid base */}
            <div
              className="relative w-full max-w-[600px] aspect-[4/3] rounded-3xl bg-slate-950/80 border border-white/5 shadow-2xl flex items-center justify-center"
              style={{
                transform: `rotateX(${60 + tilt.y}deg) rotateZ(${-45 + tilt.x}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.85)"
              }}
            >
              {/* Floor grid pattern */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-[0.06]" 
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
                  backgroundSize: "24px 24px"
                }}
              />

              {/* Elevated Border Ring */}
              <div className="absolute inset-2 rounded-[22px] border border-dashed border-indigo-500/10 pointer-events-none" />

              {/* Room Objects in 3D */}
              {ROOMS.map((room) => {
                const IconComponent = room.icon;
                const isSelected = selectedRoom.id === room.id;
                
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="absolute bg-gradient-to-tr text-white p-3 rounded-2xl flex flex-col justify-between border select-none transition-all duration-300 transform active:scale-95 cursor-pointer outline-none group/item"
                    style={{
                      left: room.coordinates.x,
                      top: room.coordinates.y,
                      width: room.coordinates.width,
                      height: room.coordinates.height,
                      transformStyle: "preserve-3d",
                      // Animate height offset on hover or selection
                      transform: isSelected 
                        ? `translateZ(${room.coordinates.z}) scale(1.03)` 
                        : `translateZ(8px) hover:translateZ(20px)`,
                      borderColor: isSelected ? "#818cf8" : "rgba(255,255,255,0.05)",
                      boxShadow: isSelected 
                        ? `0 20px 40px -10px ${room.glowColor}, inset 0 0 16px rgba(255,255,255,0.1)`
                        : "0 10px 25px -10px rgba(0,0,0,0.5)"
                    }}
                  >
                    {/* Shadow layer underneath element */}
                    <div 
                      className="absolute -inset-1 rounded-2xl bg-black/40 blur-md pointer-events-none transition-opacity duration-300"
                      style={{
                        transform: "translateZ(-8px)",
                        opacity: isSelected ? 0.8 : 0.4
                      }}
                    />

                    {/* Room Inner Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Top Row: Icon */}
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 text-indigo-400 group-hover/item:text-white transition-colors`}>
                          <IconComponent size={16} />
                        </div>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        )}
                      </div>

                      {/* Bottom Row: Text */}
                      <div className="mt-2">
                        <div className="text-[10px] font-bold tracking-widest text-indigo-300/80 uppercase">Area</div>
                        <div className="text-xs md:text-sm font-black truncate max-w-full text-white tracking-tight">
                          {room.label}
                        </div>
                      </div>
                    </div>

                    {/* 3D Side Walls (Extrusions) */}
                    <div 
                      className="absolute left-0 right-0 bottom-0 bg-slate-900 border-t border-white/5 opacity-80"
                      style={{
                        height: "10px",
                        transform: "rotateX(-90deg) translateY(5px)",
                        transformOrigin: "bottom center"
                      }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 right-0 bg-slate-950 border-l border-white/5 opacity-80"
                      style={{
                        width: "10px",
                        transform: "rotateY(90deg) translateX(5px)",
                        transformOrigin: "center right"
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footnotes */}
          <div className="p-4 bg-slate-950/60 border-t border-indigo-500/10 flex items-center justify-between text-xs text-gray-500">
            <span>Grid Coordinates: Oblique Matrix [0.8x, 0.6y]</span>
            <span>Status: Connected to local Seating Designer</span>
          </div>
        </div>

        {/* Right Side: Details & Exploring Panel */}
        <div className="flex flex-col bg-slate-950/40 border border-indigo-500/10 rounded-3xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Exploring Card */}
          <div className="space-y-4">
            <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Currently Exploring</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                {selectedRoom.label}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-xl">
                {selectedRoom.description}
              </p>
            </div>
          </div>

          {/* Specific Room Details */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={12} className="text-indigo-400" />
              <span>Technical Coordinates & Meta</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {Object.entries(selectedRoom.details).map(([key, value]) => (
                <div key={key} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-xs font-semibold text-gray-200 text-right truncate max-w-[180px]">{value}</span>
                </div>
              ))}
            </div>

            {/* If Sponsor Hub is selected, render active sponsor booths */}
            {selectedRoom.id === "sponsor-exhibition" && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={14} className="text-indigo-400" />
                  <span>Platinum Partners ({sponsorBooths.length})</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {sponsorBooths.map((booth) => (
                    <button
                      key={booth.id}
                      onClick={() => handleOpenBooth(booth)}
                      className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950/30 hover:to-indigo-950/60 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all duration-300 text-left flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* Mock logo shape */}
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
                          {booth.sponsorLogo ? (
                            <img
                              src={booth.sponsorLogo}
                              alt=""
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=40";
                              }}
                            />
                          ) : (
                            booth.label?.substring(0, 2).toUpperCase() || "SP"
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">{booth.label}</div>
                          <div className="text-[9px] text-gray-500 truncate max-w-[150px]">{booth.sponsorContact || "Sponsor Representative"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold tracking-widest uppercase group-hover:translate-x-1 transition-all">
                        <span>Visit</span>
                        <ChevronRight size={12} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Navigation panel */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-indigo-400 shrink-0" />
              <div>
                <div className="font-bold text-gray-200">Interactive Mode</div>
                <div className="text-[10px] text-gray-500">Coordinate mapping active</div>
              </div>
            </div>
            <button
              onClick={() => toast.info("Full screen expansion would display optimized layout HUD.")}
              className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-indigo-400 transition-colors cursor-pointer"
              title="Full Screen View"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Sponsor Booth Modal */}
      <VirtualBoothModal
        isOpen={isBoothModalOpen}
        onClose={() => setIsBoothModalOpen(false)}
        booth={selectedBooth}
      />
    </div>
  );
};

export default VirtualVenueWalkthrough;
