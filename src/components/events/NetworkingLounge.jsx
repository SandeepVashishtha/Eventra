import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoTile = ({ stream, name, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-indigo-500/20 group">
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isLocal} 
          className="w-full h-full object-cover mirror-mode" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold mb-2">
            {name.charAt(0)}
          </div>
          <span className="text-sm font-medium">{name}</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-bold">
        {name} {isLocal && "(You)"}
      </div>
    </div>
  );
};

const NetworkingLounge = () => {
  const { localStream, remoteStreams, isInCall, startCall, endCall, toggleMute } = useWebRTC("lounge_1");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="text-indigo-500" /> Virtual Networking Lounge
            </h1>
            <p className="text-gray-500">Real-time P2P networking with fellow attendees.</p>
          </div>
          <div className="flex gap-3">
            {!isInCall ? (
              <button 
                onClick={startCall}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
              >
                <Video size={20} /> Join Lounge
              </button>
            ) : (
              <button 
                onClick={endCall}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none transition-all flex items-center gap-2"
              >
                <PhoneOff size={20} /> Leave
              </button>
            )}
            <button className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isInCall && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <VideoTile stream={localStream} name="Me" isLocal />
              </motion.div>
            )}
            {remoteStreams.map(peer => (
              <motion.div key={peer.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <VideoTile stream={peer.stream} name={peer.name} />
              </motion.div>
            ))}
          </AnimatePresence>
          {!isInCall && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <Video className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold dark:text-white">Ready to network?</h3>
              <p className="text-gray-500 max-w-sm">Join the lounge to meet other builders, share your projects, and collaborate in real-time.</p>
              <button onClick={startCall} className="text-indigo-600 font-bold hover:underline">Connect Microphone & Camera</button>
            </div>
          )}
        </div>
        
        {/* Controls Overlay */}
        {isInCall && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl z-50">
            <button onClick={toggleMute} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              <Mic size={20} />
            </button>
            <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              <Video size={20} />
            </button>
            <div className="h-6 w-px bg-white/20" />
            <button onClick={endCall} className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all">
              <PhoneOff size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkingLounge;
