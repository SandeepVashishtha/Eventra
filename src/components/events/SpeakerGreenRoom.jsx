import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Send,
  Play,
  StopCircle,
  User,
  Crown,
  Camera,
  CameraOff,
  Loader2
} from "lucide-react";
import useGreenRoomWebRTC from "./useGreenRoomWebRTC";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../config/roles";
import Guard from "../../components/auth/Guard";

/**
 * Speaker Green Room Component
 * A WebRTC video chat interface for speakers and organizers to coordinate before going live
 */
const SpeakerGreenRoom = ({
  eventId = "default",
  roomId = "green-room",
  onTransitionToStage = null
}) => {
  const { user: authUser } = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("user");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState(null);
  const chatContainerRef = useRef(null);
  
  const {
    peerId,
    connectionStatus,
    activePeers,
    isAudioActive,
    isVideoActive,
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    chatMessages,
    speakersInRoom,
    isOrganizer,
    startSession,
    cleanup,
    toggleAudio,
    toggleVideo,
    sendChatMessage,
    requestStageTransition,
    approveStageTransition
  } = useGreenRoomWebRTC(roomId, authUser);

  // Auto-start session when component mounts
  useEffect(() => {
    startSession();
    return () => {
      cleanup();
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Show notifications
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Handle sending chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && sendChatMessage) {
      sendChatMessage(chatInput.trim());
      setChatInput("");
    }
  };

  // Handle camera selection
  const handleCameraChange = async (facingMode) => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
          });
          
          // Replace video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          localStream.addTrack(newVideoTrack);
          localStream.removeTrack(videoTrack);
          
          // Stop old track
          videoTrack.stop();
          
          setSelectedCamera(facingMode);
          showNotification(`Switched to ${facingMode} camera`);
        } catch (err) {
          console.error("Error switching camera:", err);
          showNotification("Failed to switch camera", "error");
        }
      }
    }
  };

  // Handle transition to stage request
  const handleTransitionRequest = () => {
    if (requestStageTransition) {
      requestStageTransition();
      showNotification("Stage transition requested. Waiting for organizer approval...", "info");
    }
  };

  // Handle approving speaker transition (for organizers)
  const handleApproveTransition = (speakerPeerId) => {
    if (approveStageTransition) {
      approveStageTransition(speakerPeerId);
      showNotification(`Approved transition for ${speakerPeerId}`, "success");
      
      // Notify the callback if provided
      if (onTransitionToStage) {
        const speaker = speakersInRoom.find(s => s.peerId === speakerPeerId);
        onTransitionToStage(speaker);
      }
    }
  };

  // Get display name for a peer
  const getPeerDisplayName = (targetPeerId) => {
    if (targetPeerId === peerId) {
      return authUser?.firstName || authUser?.username || "You";
    }
    const speaker = speakersInRoom.find(s => s.peerId === targetPeerId);
    return speaker?.user?.firstName || speaker?.user?.username || targetPeerId;
  };

  // Get role indicator for a peer
  const getPeerRoleIndicator = (targetPeerId) => {
    if (targetPeerId === peerId) {
      return isOrganizer ? "Organizer" : "Speaker";
    }
    const speaker = speakersInRoom.find(s => s.peerId === targetPeerId);
    return speaker?.isOrganizer ? "Organizer" : "Speaker";
  };

  // Format time for chat messages
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get connection status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-emerald-500";
      case "connecting":
        return "bg-amber-500";
      case "disconnected":
        return "bg-red-500";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Guard requireRoles={[ROLES.SPEAKER, ROLES.ADMIN, ROLES.ORGANIZER, ROLES.OWNER, ROLES.SUPER_ADMIN]}>
      <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-200">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-sm border-b border-neutral-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
                <h1 className="text-xl font-bold text-white">Speaker Green Room</h1>
              </div>
              <span className="text-xs bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full">
                Room: {roomId}
              </span>
              <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
                Peer ID: {peerId}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400">
                  {activePeers.length} speakers online
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isAudioActive && !isMuted ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className={`w-2 h-2 rounded-full ${isVideoActive && !isCameraOff ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg transition"
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        </header>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === "error" ? "bg-red-900/80 text-red-400 border border-red-500/30" :
            notification.type === "success" ? "bg-emerald-900/80 text-emerald-400 border border-emerald-500/30" :
            "bg-neutral-900/80 text-neutral-400 border border-neutral-500/30"
          }`}>
            {notification.message}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-6">
          {/* Video Grid */}
          <div className={`flex-1 ${isFullscreen ? 'hidden' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {/* Local Video */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden relative">
              <div className="absolute top-2 left-2 z-10 bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                <div className="font-semibold">{authUser?.firstName || authUser?.username || "You"}</div>
                <div className="text-neutral-400 text-xs">{isOrganizer ? "Organizer" : "Speaker"}</div>
              </div>
              
              <div className="absolute top-2 right-2 z-10 flex space-x-1">
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg ${isMuted ? 'bg-red-900/50 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}
                  title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg ${isCameraOff ? 'bg-red-900/50 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}
                  title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              <video
                ref={(el) => {
                  if (el && localStream) {
                    el.srcObject = localStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Camera controls for mobile */}
              {isVideoActive && !isCameraOff && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                  <button
                    onClick={() => handleCameraChange(selectedCamera === "user" ? "environment" : "user")}
                    className="bg-neutral-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center space-x-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Switch</span>
                  </button>
                </div>
              )}

              {/* Audio indicator */}
              {!isMuted && isAudioActive && (
                <div className="absolute bottom-2 right-2 z-10">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
              <div key={peerId} className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden relative">
                <div className="absolute top-2 left-2 z-10 bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  <div className="font-semibold">{getPeerDisplayName(peerId)}</div>
                  <div className="text-neutral-400 text-xs">{getPeerRoleIndicator(peerId)}</div>
                </div>

                <video
                  ref={(el) => {
                    if (el && stream) {
                      el.srcObject = stream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Organizer controls for speakers */}
                {isOrganizer && !getPeerDisplayName(peerId).includes("You") && (
                  <div className="absolute bottom-2 right-2 z-10 flex space-x-1">
                    <button
                      onClick={() => handleApproveTransition(peerId)}
                      className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition"
                      title="Transition to Stage"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - Object.keys(remoteStreams).length - 1) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-neutral-900/50 rounded-xl border-2 border-dashed border-neutral-800 flex items-center justify-center">
                <div className="text-neutral-600 flex flex-col items-center">
                  <Users className="w-8 h-8 mb-2" />
                  <span className="text-xs">Waiting for speakers...</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Chat and Controls */}
          <aside className={`w-80 ${isFullscreen ? 'w-full' : ''} bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col`}>
            {/* Chat Section */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Backstage Chat</span>
                </h2>
                <span className="text-xs text-neutral-500">
                  {chatMessages.length} messages
                </span>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-neutral-950 rounded-lg p-4 space-y-4"
              >
                {chatMessages.length === 0 ? (
                  <div className="text-center text-neutral-600 py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Start chatting with other speakers</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.isSystem ? 'justify-center' : msg.sender === peerId ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.isSystem ? (
                        <div className="bg-orange-900/30 text-orange-400 px-3 py-2 rounded-lg text-xs text-center">
                          {msg.message}
                        </div>
                      ) : (
                        <div className={`max-w-xs rounded-xl ${msg.sender === peerId ? 'bg-indigo-900/50' : 'bg-neutral-800'}`}>
                          <div className="p-3">
                            {msg.sender !== peerId && (
                              <div className="text-xs text-neutral-400 mb-1">
                                {getPeerDisplayName(msg.sender)}
                              </div>
                            )}
                            <div className="text-sm text-white">{msg.message}</div>
                            <div className="text-xs text-neutral-500 mt-1 text-right">
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                  disabled={!sendChatMessage}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || !sendChatMessage}
                  className="bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Participants Section */}
            <div className="border-t border-neutral-800 p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Participants ({speakersInRoom.length + 1})</span>
              </h3>
              
              <div className="space-y-3">
                {/* Current user */}
                <div className="flex items-center space-x-3 p-2 bg-orange-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {(authUser?.firstName || authUser?.username || "Y")[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{authUser?.firstName || authUser?.username || "You"}</div>
                    <div className="text-xs text-neutral-400">{isOrganizer ? "Organizer" : "Speaker"}</div>
                  </div>
                  {isOrganizer && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                {/* Other participants */}
                {speakersInRoom.map((speaker) => (
                  <div key={speaker.peerId} className="flex items-center space-x-3 p-2 hover:bg-neutral-800/50 rounded-lg">
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {(speaker.user?.firstName || speaker.user?.username || speaker.peerId)[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{speaker.user?.firstName || speaker.user?.username || speaker.peerId}</div>
                      <div className="text-xs text-neutral-400">{speaker.isOrganizer ? "Organizer" : "Speaker"}</div>
                    </div>
                    {speaker.isOrganizer && (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-neutral-800 p-4 space-y-2">
              {!isOrganizer ? (
                <button
                  onClick={handleTransitionRequest}
                  disabled={!requestStageTransition}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Play className="w-5 h-5" />
                  <span>Request Stage Access</span>
                </button>
              ) : (
                <button
                  onClick={() => handleApproveTransition(activePeers[0])}
                  disabled={activePeers.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Play className="w-5 h-5" />
                  <span>Approve Speaker Transition</span>
                </button>
              )}

              <button
                onClick={cleanup}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <StopCircle className="w-5 h-5" />
                <span>Leave Green Room</span>
              </button>
            </div>
          </aside>
        </main>

        {/* Fullscreen Video View */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 bg-neutral-900/80 hover:bg-neutral-800 text-white p-2 rounded-lg transition z-10"
            >
              <span className="text-sm">Exit Fullscreen</span>
            </button>
            
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full h-full max-w-4xl aspect-video bg-neutral-900 rounded-xl relative">
                <video
                  ref={(el) => {
                    if (el && localStream) {
                      el.srcObject = localStream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Connection Loading Overlay */}
        {connectionStatus === "connecting" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connecting to Green Room...</h3>
              <p className="text-neutral-400">Setting up your audio and video connection</p>
            </div>
          </div>
        )}

        {/* Device Permission Prompt */}
        {connectionStatus === "error" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraOff className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Camera/Microphone Access Denied</h3>
              <p className="text-neutral-400 mb-4">
                Please enable camera and microphone access to use the Green Room.
              </p>
              <button
                onClick={startSession}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </Guard>
  );
};

/**
 * Wrapper component with built-in route protection
 * This can be used directly in routes for cleaner integration
 */
export const ProtectedGreenRoom = (props) => {
  return (
    <Guard requireRoles={[ROLES.SPEAKER, ROLES.ADMIN, ROLES.ORGANIZER, ROLES.OWNER, ROLES.SUPER_ADMIN]}>
      <SpeakerGreenRoom {...props} />
    </Guard>
  );
};

export default SpeakerGreenRoom;