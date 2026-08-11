import React, { useState } from "react";
import { Code2, PenTool, Mic, MicOff, Video, VideoOff, Users, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import useWebRTCSignaling from "./useWebRTCSignaling";
import PairCodeEditor from "./PairCodeEditor";
import WhiteboardCanvas from "./WhiteboardCanvas";

export default function WebRTCCollaborationHub({
  roomId = "hackathon-team-alpha",
  teamName = "Team Alpha Builders",
  user = null,
}) {
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'whiteboard'

  const {
    peerId,
    connectionStatus,
    activePeers,
    isAudioActive,
    isVideoActive,
    incomingCodeDelta,
    incomingCanvasStroke,
    broadcastCodeChange,
    broadcastCanvasStroke,
    toggleMic,
    toggleCamera,
  } = useWebRTCSignaling(roomId, user);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* Collaboration Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {teamName} Workspace
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3.5 h-3.5" /> WebRTC P2P
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Room Token: <code className="font-mono text-indigo-600 dark:text-indigo-400">{roomId}</code> • Peer ID: <span className="font-mono">{peerId}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Voice Controls */}
        <div className="flex items-center gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "editor"
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Pair Code Editor
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("whiteboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "whiteboard"
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <PenTool className="w-4 h-4" />
              Whiteboard Canvas
            </button>
          </div>

          {/* Media Audio/Video Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl border transition-all ${
                isAudioActive
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200"
              }`}
              title={isAudioActive ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isAudioActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-2 rounded-xl border transition-all ${
                isVideoActive
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200"
              }`}
              title={isVideoActive ? "Turn Off Camera" : "Turn On Camera"}
            >
              {isVideoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {activePeers.length} Teammates
            </span>
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="h-[600px] w-full">
        {activeTab === "editor" ? (
          <PairCodeEditor
            incomingCodeDelta={incomingCodeDelta}
            onCodeChange={broadcastCodeChange}
            activePeers={activePeers}
          />
        ) : (
          <WhiteboardCanvas
            incomingCanvasStroke={incomingCanvasStroke}
            onCanvasStroke={broadcastCanvasStroke}
          />
        )}
      </div>
    </div>
  );
}
