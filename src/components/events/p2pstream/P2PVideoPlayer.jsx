import React, { useState, useEffect } from "react";
import { Play, Pause, Settings, Volume2, ShieldCheck } from "lucide-react";
import SwarmStatsOverlay from "./SwarmStatsOverlay";
import { WebTorrentMeshManager } from "../../utils/p2p/webtorrentMesh";

export default function P2PVideoPlayer({
  streamUrl = "https://cdn.example.com/hls/keynote.m3u8",
  posterImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [meshManager] = useState(() => new WebTorrentMeshManager(streamUrl));
  const [stats, setStats] = useState(meshManager.getSwarmStats());

  useEffect(() => {
    const interval = setInterval(() => {
      meshManager.simulatePeerJoin();
      setStats(meshManager.getSwarmStats());
    }, 5000);
    return () => clearInterval(interval);
  }, [meshManager]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group select-none">
      {/* P2P Swarm Stats Header */}
      <SwarmStatsOverlay stats={stats} />

      {/* Video Viewport / Poster */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center">
        <img
          src={posterImage}
          alt="Keynote Live Stream"
          className="w-full h-full object-cover opacity-60"
        />

        {/* Play Button Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute z-10 p-5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-2xl backdrop-blur-md transform transition-all hover:scale-110"
        >
          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> LIVE KEYNOTE
          </span>
          <span>WebTorrent P2P Mesh Network</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4 text-slate-400" />
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="bg-slate-800 text-white rounded-lg px-2 py-1 text-xs border border-slate-700 focus:outline-none"
            >
              <option value="1080p">1080p (P2P Mesh)</option>
              <option value="720p">720p (P2P Mesh)</option>
              <option value="480p">480p (P2P Mesh)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
