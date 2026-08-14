import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../config/roles";

/**
 * Custom hook for Speaker Green Room WebRTC functionality
 * Manages video chat connections between speakers and admins
 */
export function useGreenRoomWebRTC(roomId = "green-room", user = null) {
  const { user: authUser } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activePeers, setActivePeers] = useState([]);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerConnectionStats, setPeerConnectionStats] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [speakersInRoom, setSpeakersInRoom] = useState([]);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const peerIdRef = useRef(user?.id || authUser?.id || `speaker-${Math.random().toString(36).substr(2, 8)}`);
  const peerConnectionsRef = useRef(new Map());
  const dataChannelsRef = useRef(new Map());
  const signalingChannelRef = useRef(null);

  // Check if current user is organizer/admin
  useEffect(() => {
    const currentUser = user || authUser;
    if (currentUser) {
      const roles = currentUser.roles || [];
      setIsOrganizer(roles.includes(ROLES.ADMIN) || roles.includes(ROLES.ORGANIZER) || roles.includes(ROLES.SUPER_ADMIN));
    }
  }, [user, authUser]);

  // ICE Servers configuration
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // Add TURN servers for better connectivity through firewalls
    {
      urls: "turn:global.relay.metered.ca:80",
      username: " Eventra",
      credential: "password"
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "Eventra",
      credential: "password"
    }
  ];

  // Initialize local media stream
  const initLocalStream = useCallback(async (enableAudio = true, enableVideo = true) => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const constraints = {
          audio: enableAudio ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } : false,
          video: enableVideo ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        setIsAudioActive(enableAudio);
        setIsVideoActive(enableVideo);
        return stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      // Fallback to audio-only or no media
      if (enableVideo) {
        return initLocalStream(enableAudio, false);
      }
    }
    return null;
  }, []);

  // Clean up media stream
  const cleanupStream = useCallback((stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetPeerId, isInitiator = false) => {
    const pc = new RTCPeerConnection({ iceServers });

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to signaling server
        sendSignalingMessage(targetPeerId, {
          type: "candidate",
          candidate: event.candidate,
          sender: peerIdRef.current
        });
      }
    };

    pc.onconnectionstatechange = () => {
      updatePeerStatus(targetPeerId, pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        updatePeerStatus(targetPeerId, "connected");
      } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        updatePeerStatus(targetPeerId, pc.iceConnectionState);
      }
    };

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStreams(prev => ({
          ...prev,
          [targetPeerId]: stream
        }));
      }
    };

    // Set up data channel
    if (isInitiator) {
      const dataChannel = pc.createDataChannel("greenRoomData", {
        ordered: true,
        maxRetries: 0
      });
      setupDataChannel(dataChannel, targetPeerId);
    }

    pc.ondatachannel = (event) => {
      setupDataChannel(event.channel, targetPeerId);
    };

    peerConnectionsRef.current.set(targetPeerId, pc);
    return pc;
  }, [localStream]);

  // Set up data channel
  const setupDataChannel = useCallback((dc, targetPeerId) => {
    dataChannelsRef.current.set(targetPeerId, dc);

    dc.onopen = () => {
      console.log(`Data channel opened with ${targetPeerId}`);
      updatePeerStatus(targetPeerId, "connected");
      
      // Send peer info
      sendDataMessage(targetPeerId, {
        type: "peer_info",
        peerId: peerIdRef.current,
        user: user || authUser,
        isOrganizer
      });
    };

    dc.onclose = () => {
      console.log(`Data channel closed with ${targetPeerId}`);
      dataChannelsRef.current.delete(targetPeerId);
      updatePeerStatus(targetPeerId, "disconnected");
    };

    dc.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleDataMessage(targetPeerId, message);
      } catch (err) {
        console.error("Error parsing data message:", err);
      }
    };
  }, [user, authUser, isOrganizer]);

  // Update peer connection status
  const updatePeerStatus = useCallback((peerId, status) => {
    setActivePeers(prev => {
      const exists = prev.includes(peerId);
      
      if (status === "connected" && !exists) {
        return [...prev, peerId];
      }
      
      if ((status === "disconnected" || status === "failed" || status === "closed") && exists) {
        // Clean up when peer disconnects
        cleanupPeer(peerId);
        return prev.filter(id => id !== peerId);
      }
      
      return prev;
    });

    setConnectionStatus(status === "connected" ? "connected" : prev => {
      if (status === "connected" && prev !== "connected") {
        return "connected";
      }
      if ((status === "disconnected" || status === "failed") && activePeers.length === 0) {
        return "disconnected";
      }
      return prev;
    });
  }, [activePeers.length]);

  // Clean up peer connection
  const cleanupPeer = useCallback((peerId) => {
    const pc = peerConnectionsRef.current.get(peerId);
    const dc = dataChannelsRef.current.get(peerId);

    if (dc) {
      dc.close();
      dataChannelsRef.current.delete(peerId);
    }

    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }

    // Remove remote stream
    setRemoteStreams(prev => {
      const newStreams = {...prev};
      delete newStreams[peerId];
      return newStreams;
    });
  }, []);

  // Send signaling message (simplified - in production this would use WebSocket)
  const sendSignalingMessage = useCallback((targetPeerId, message) => {
    // For now, we'll use BroadcastChannel as signaling
    if (!signalingChannelRef.current) {
      signalingChannelRef.current = new BroadcastChannel(`green-room-${roomId}`);
    }

    const signalingMessage = {
      roomId,
      targetPeerId,
      sender: peerIdRef.current,
      ...message
    };

    signalingChannelRef.current.postMessage(JSON.stringify(signalingMessage));
  }, [roomId]);

  // Send data message through data channel
  const sendDataMessage = useCallback((targetPeerId, message) => {
    const dc = dataChannelsRef.current.get(targetPeerId);
    if (dc && dc.readyState === "open") {
      dc.send(JSON.stringify(message));
    }
  }, []);

  // Handle incoming data messages
  const handleDataMessage = useCallback((senderId, message) => {
    switch (message.type) {
      case "peer_info":
        // Update speaker list with peer info
        setSpeakersInRoom(prev => {
          const exists = prev.some(s => s.peerId === senderId);
          if (!exists) {
            return [...prev, {
              peerId: senderId,
              user: message.user,
              isOrganizer: message.isOrganizer,
              joinedAt: new Date().toISOString()
            }];
          }
          return prev;
        });
        break;

      case "chat_message":
        setChatMessages(prev => [
          ...prev,
          {
            sender: senderId,
            message: message.text,
            timestamp: new Date().toISOString(),
            isSystem: false
          }
        ]);
        break;

      case "system_message":
        setChatMessages(prev => [
          ...prev,
          {
            message: message.text,
            timestamp: new Date().toISOString(),
            isSystem: true
          }
        ]);
        break;

      case "mute_request":
        // Organizer can request speakers to mute
        if (message.target === peerIdRef.current) {
          toggleAudio();
        }
        break;

      case "camera_request":
        // Organizer can request speakers to turn off camera
        if (message.target === peerIdRef.current) {
          toggleVideo();
        }
        break;

      case "transition_to_stage":
        // Handle transition to main stage
        if (message.target === peerIdRef.current) {
          // This would trigger the transition to live stream
          console.log("Transitioning to main stage...");
        }
        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  }, []);

  // Toggle microphone
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setIsAudioActive(audioTrack.enabled);
      }
    }
    return !isMuted;
  }, [localStream, isMuted]);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        setIsVideoActive(videoTrack.enabled);
      }
    }
    return !isCameraOff;
  }, [localStream, isCameraOff]);

  // Send chat message
  const sendChatMessage = useCallback((messageText) => {
    const message = {
      type: "chat_message",
      text: messageText,
      sender: peerIdRef.current,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected peers
    dataChannelsRef.current.forEach((dc, peerId) => {
      if (dc.readyState === "open") {
        dc.send(JSON.stringify(message));
      }
    });

    // Add to local chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: peerIdRef.current,
        message: messageText,
        timestamp: new Date().toISOString(),
        isSystem: false
      }
    ]);
  }, []);

  // Request to transition to main stage
  const requestStageTransition = useCallback(() => {
    // Broadcast to organizers that this speaker wants to go live
    const message = {
      type: "stage_transition_request",
      requester: peerIdRef.current,
      user: user || authUser
    };

    dataChannelsRef.current.forEach((dc, peerId) => {
      if (dc.readyState === "open") {
        dc.send(JSON.stringify(message));
      }
    });
  }, [user, authUser]);

  // Approve transition to main stage (for organizers)
  const approveStageTransition = useCallback((speakerPeerId) => {
    const message = {
      type: "transition_to_stage",
      target: speakerPeerId,
      approvedBy: peerIdRef.current
    };

    const dc = dataChannelsRef.current.get(speakerPeerId);
    if (dc && dc.readyState === "open") {
      dc.send(JSON.stringify(message));
    }
  }, []);

  // Start Green Room session
  const startSession = useCallback(async () => {
    try {
      // Initialize local stream
      await initLocalStream(true, true);
      
      // Set up signaling channel
      if (!signalingChannelRef.current) {
        signalingChannelRef.current = new BroadcastChannel(`green-room-${roomId}`);
        
        signalingChannelRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.roomId === roomId && message.sender !== peerIdRef.current) {
              handleSignalingMessage(message);
            }
          } catch (err) {
            console.error("Error parsing signaling message:", err);
          }
        };
      }

      setConnectionStatus("connected");
    } catch (error) {
      console.error("Error starting Green Room session:", error);
      setConnectionStatus("error");
    }
  }, [roomId, initLocalStream]);

  // Handle signaling messages
  const handleSignalingMessage = useCallback((message) => {
    const { sender, targetPeerId } = message;
    
    // Ignore messages not intended for us
    if (targetPeerId && targetPeerId !== peerIdRef.current) {
      return;
    }

    switch (message.type) {
      case "offer":
        handleOffer(sender, message.offer);
        break;
        
      case "answer":
        handleAnswer(sender, message.answer);
        break;
        
      case "candidate":
        handleICECandidate(sender, message.candidate);
        break;
        
      default:
        console.log("Unhandled signaling message type:", message.type);
    }
  }, []);

  // Handle WebRTC offer
  const handleOffer = useCallback(async (senderId, offer) => {
    try {
      const pc = createPeerConnection(senderId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      sendSignalingMessage(senderId, {
        type: "answer",
        answer: pc.localDescription,
        targetPeerId: senderId
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }, [createPeerConnection, sendSignalingMessage]);

  // Handle WebRTC answer
  const handleAnswer = useCallback(async (senderId, answer) => {
    try {
      const pc = peerConnectionsRef.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }, []);

  // Handle ICE candidate
  const handleICECandidate = useCallback(async (senderId, candidate) => {
    try {
      const pc = peerConnectionsRef.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  }, []);

  // Clean up all connections
  const cleanup = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, peerId) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();

    // Close all data channels
    dataChannelsRef.current.forEach((dc) => {
      dc.close();
    });
    dataChannelsRef.current.clear();

    // Close signaling channel
    if (signalingChannelRef.current) {
      signalingChannelRef.current.close();
      signalingChannelRef.current = null;
    }

    // Clean up local stream
    cleanupStream(localStream);
    setLocalStream(null);
    
    // Reset states
    setConnectionStatus("disconnected");
    setActivePeers([]);
    setRemoteStreams({});
    setSpeakersInRoom([]);
    setIsAudioActive(false);
    setIsVideoActive(false);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [localStream, cleanupStream]);

  // Set up initial connections when session starts
  useEffect(() => {
    if (connectionStatus === "connected" && activePeers.length === 0) {
      // For demo purposes, we'll simulate some peers
      // In production, this would be handled by signaling server
    }
  }, [connectionStatus, activePeers.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    peerId: peerIdRef.current,
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
    peerConnectionStats,
    
    // Methods
    startSession,
    cleanup,
    initLocalStream,
    toggleAudio,
    toggleVideo,
    sendChatMessage,
    sendDataMessage,
    requestStageTransition,
    approveStageTransition,
    
    // Helper functions for UI
    getVideoRef: (peerId) => {
      if (peerId === peerIdRef.current) {
        return localStream;
      }
      return remoteStreams[peerId];
    }
  };
}

export default useGreenRoomWebRTC;