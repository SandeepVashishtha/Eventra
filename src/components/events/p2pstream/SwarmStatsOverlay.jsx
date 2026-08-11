import React from "react";
import { Users, HardDriveDownload, Network, Zap } from "lucide-react";

export default function SwarmStatsOverlay({
  stats = {
    activePeers: 18,
    p2pDownloadedMB: 450,
    cdnDownloadedMB: 150,
    savingsPercent: 75,
    isP2pActive: true,
  },
}) {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs shadow-2xl">
      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
        <Zap className="w-4 h-4 fill-current" />
        <span>{stats.savingsPercent}% CDN Saved via P2P Mesh</span>
      </div>

      <div className="h-4 w-px bg-white/20" />

      <div className="flex items-center gap-1 font-mono">
        <Users className="w-3.5 h-3.5 text-indigo-400" />
        <span>{stats.activePeers} Peers</span>
      </div>

      <div className="flex items-center gap-1 font-mono text-gray-400">
        <HardDriveDownload className="w-3.5 h-3.5 text-indigo-400" />
        <span>{stats.p2pDownloadedMB}MB P2P</span>
      </div>
    </div>
  );
}
