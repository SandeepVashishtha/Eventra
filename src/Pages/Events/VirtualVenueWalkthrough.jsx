import React, { useState, useEffect } from "react";
import VirtualBoothModal from "../../components/events/VirtualBoothModal";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

// Mock sponsor booth data
const MOCK_BOOTH_DATA = [
  {
    id: "booth-1",
    name: "TechCorp",
    logo: "https://via.placeholder.com/80x80?text=TechCorp",
    media: ["https://via.placeholder.com/300x200?text=TechCorp+Promo"],
    jobs: ["Frontend Engineer", "Product Manager"],
    contact: "mailto:recruit@techcorp.com",
    position: { x: 300, y: 150 }, // base coordinates in virtual space
  },
  {
    id: "booth-2",
    name: "InnovateX",
    logo: "https://via.placeholder.com/80x80?text=InnovateX",
    media: ["https://via.placeholder.com/300x200?text=InnovateX+Demo"],
    jobs: ["Data Scientist"],
    contact: "mailto:hr@innovatex.com",
    position: { x: 600, y: 200 },
  },
];

/**
 * Simple 3D oblique venue map using CSS transforms.
 * The map reacts to mouse movement to adjust perspective.
 */
const VirtualVenueWalkthrough = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [perspective, setPerspective] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Map cursor position to rotation range [-15, 15]
    const rotateY = ((clientX / innerWidth) - 0.5) * 30; // left/right -> Y rotation
    const rotateX = ((clientY / innerHeight) - 0.5) * -30; // top/bottom -> X rotation
    setPerspective({ rotateX, rotateY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const closeModal = () => setSelectedBooth(null);

  return (
    <div className="relative w-full h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Virtual Venue Walkthrough</h2>
        <button
          onClick={() => navigate(`/events/${eventId}/floor-plan`)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-sm rounded transition-colors"
        >
          Back to Floor Planner
        </button>
        <button onClick={() => navigate(-1)} className="p-2 hover:text-indigo-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* 3D map container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          transform: `rotateX(${perspective.rotateX}deg) rotateY(${perspective.rotateY}deg)`,
        }}
      >
        {/* Simple floor representation */}
        <div className="w-[1000px] h-[600px] bg-gray-800/70 border border-gray-600 rounded" />
        {/* Render sponsor booths */}
        {MOCK_BOOTH_DATA.map((booth) => (
          <div
            key={booth.id}
            className="absolute cursor-pointer transition-transform hover:scale-105"
            style={{
              left: booth.position.x,
              top: booth.position.y,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => setSelectedBooth(booth)}
          >
            <img src={booth.logo} alt={booth.name} className="w-20 h-20 rounded-lg shadow-lg" />
            <div className="mt-1 text-sm text-center text-gray-200">{booth.name}</div>
          </div>
        ))}
      </div>

      {/* Booth Modal */}
      {selectedBooth && (
        <VirtualBoothModal booth={selectedBooth} onClose={closeModal} />
      )}
    </div>
  );
};

export default VirtualVenueWalkthrough;
