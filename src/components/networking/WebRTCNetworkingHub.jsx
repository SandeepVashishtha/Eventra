import React, { useState, useEffect, useRef } from "react";
import { Video, VideoOff, Mic, MicOff, Users, Settings, PhoneOff } from "lucide-react";
import "./WebRTCNetworkingHub.css";

export default function WebRTCNetworkingHub({ roomId = "default-circle", userId = "user-" + Math.floor(Math.random() * 1000) }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    // Fetch video devices
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videos = devices.filter(device => device.kind === "videoinput");
      setVideoDevices(videos);
      if (videos.length > 0) setSelectedVideo(videos[0].deviceId);
    });

    // Start local stream
    startLocalStream();

    return () => {
      stopLocalStream();
    };
  }, []);

  const startLocalStream = async (deviceId = null) => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        audio: true,
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    setSelectedVideo(deviceId);
    startLocalStream(deviceId);
  };

  return (
    <div className="webrtc-hub-container p-6 bg-slate-900 text-white rounded-2xl shadow-xl max-w-5xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Users className="text-indigo-400 w-6 h-6" />
          <h2 className="text-xl font-bold">Networking Circle: {roomId}</h2>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-slate-800 p-4 rounded-xl mb-6 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-300">Device Settings</h3>
          <div className="flex items-center gap-4">
            <label className="text-xs text-slate-400">Camera:</label>
            <select value={selectedVideo} onChange={handleDeviceChange} className="bg-slate-700 text-sm px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none">
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>{device.label || "Camera " + device.deviceId.slice(0, 5)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-h-[300px]">
        <div className="video-card relative bg-slate-950 rounded-xl overflow-hidden aspect-video border border-indigo-500/30">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-xs">You ({userId})</div>
        </div>

        {Object.keys(remoteStreams).map((peerId) => (
          <div key={peerId} className="video-card relative bg-slate-950 rounded-xl overflow-hidden aspect-video border border-slate-800">
            <video
              ref={el => {
                if (el && remoteStreams[peerId]) el.srcObject = remoteStreams[peerId];
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-xs">{peerId}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6 border-t border-slate-800 pt-4">
        <button onClick={toggleMute} className={`p-3 rounded-full transition-colors ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-slate-800 hover:bg-slate-700"}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-slate-800 hover:bg-slate-700"}`}>
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button onClick={stopLocalStream} className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
