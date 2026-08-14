import React, { useEffect, useState } from "react";
import { Users, HardDriveDownload, Network, Zap, Wifi, WifiOff, Activity, Clock } from "lucide-react";

/**
 * SwarmStatsOverlay - Displays real-time P2P mesh network statistics
 * Features:
 * - CDN savings percentage with visual gauge
 * - Active peer count
 * - Bandwidth usage (P2P vs CDN)
 * - Connection health indicator
 * - Dynamic bandwidth tracker
 */
export default function SwarmStatsOverlay({
  stats = {
    activePeers: 18,
    p2pDownloadedMB: 450,
    cdnDownloadedMB: 150,
    p2pUploadedMB: 200,
    savingsPercent: 75,
    isP2pActive: true,
    connectionQuality: 1.0,
    latencyMs: 45,
  },
  showDetailed = false,
  position = "top-right",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  // Determine connection status based on quality
  useEffect(() => {
    if (!stats.isP2pActive) {
      setConnectionStatus("disconnected");
    } else if (stats.connectionQuality > 0.7) {
      setConnectionStatus("excellent");
    } else if (stats.connectionQuality > 0.4) {
      setConnectionStatus("good");
    } else if (stats.connectionQuality > 0.1) {
      setConnectionStatus("fair");
    } else {
      setConnectionStatus("poor");
    }
  }, [stats.isP2pActive, stats.connectionQuality]);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      default:
        return "top-4 right-4";
    }
  };

  // Get connection color based on status
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "excellent":
        return "text-emerald-400";
      case "good":
        return "text-lime-400";
      case "fair":
        return "text-amber-400";
      case "poor":
        return "text-orange-400";
      case "disconnected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Calculate total bandwidth
  const totalBandwidth = stats.p2pDownloadedMB + stats.cdnDownloadedMB;
  const p2pPercentage = totalBandwidth > 0 
    ? Math.round((stats.p2pDownloadedMB / totalBandwidth) * 100) 
    : 0;

  // Format latency
  const formatLatency = (ms) => {
    if (ms < 50) return "Low";
    if (ms < 150) return "Medium";
    if (ms < 300) return "High";
    return "Very High";
  };

  if (!showDetailed) {
    // Compact view
    return (
      <div className={`absolute ${getPositionClasses()} z-20 flex items-center gap-3 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs shadow-2xl`}>
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

  // Expanded view
  return (
    <div className={`absolute ${getPositionClasses()} z-20 w-64 rounded-2xl bg-black/90 backdrop-blur-lg border border-white/10 text-white shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-white/10 cursor-pointer hover:bg-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm">P2P Mesh Network</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${getConnectionColor()}`}>
          {stats.isP2pActive ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span className="capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Stats Grid */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* CDN Savings Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>CDN Bandwidth Saved</span>
              <span>{stats.savingsPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${stats.savingsPercent}%` }}
              />
            </div>
          </div>

          {/* Bandwidth Breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">P2P Down</div>
              <div className="text-lg font-bold text-indigo-400">{stats.p2pDownloadedMB}<span className="text-xs text-gray-500">MB</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">CDN Down</div>
              <div className="text-lg font-bold text-amber-400">{stats.cdnDownloadedMB}<span className="text-xs text-gray-500">MB</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">P2P Up</div>
              <div className="text-lg font-bold text-emerald-400">{stats.p2pUploadedMB}<span className="text-xs text-gray-500">MB</span></div>
            </div>
          </div>

          {/* Connection Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs text-gray-400">Active Peers</div>
                <div className="font-bold">{stats.activePeers}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs text-gray-400">Latency</div>
                <div className="font-bold">{stats.latencyMs}ms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs text-gray-400">Connection Quality</div>
                <div className="font-bold">
                  {((stats.connectionQuality || 1) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${stats.isP2pActive ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
            {stats.isP2pActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm">P2P Mesh Active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm">CDN Only Mode</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
